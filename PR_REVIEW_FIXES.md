# PR #549 Review Fixes Plan

Tracking fixes for review feedback on `feat/prefilled-id-inputs`.

---

## 1. Fix empty FormData overwriting id_info on skip path

**Status:** [x] Done  
**Files:** `basic-kyc.js`, `biometric-kyc.js`, `ekyc.js`

**Problem:**  
When `handleFormSubmit()` is called without an event (the skip path), `new FormData(form)` reads empty values from unpopulated DOM form fields. The spread `{ ...id_info, ...Object.fromEntries(formData.entries()) }` overwrites pre-filled `id_info` values with empty strings.

**Key UX insight:** The fix must be **path-dependent**:
- **Skip path** (user never saw the form): Don't read the form at all — `id_info` already has everything we need
- **Non-skip path** (user saw the form): Trust `FormData` as-is, including empty strings — if the user intentionally cleared a field, that's their intent, and validation should catch it

Simply filtering out empty strings globally would be deceptive: if a user clears a pre-filled `"John"` from `first_name` and submits, we'd silently re-inject the old value.

**Fix:**  
On the skip path, bypass `FormData` entirely and use `id_info` directly as the payload:

```js
async function handleFormSubmit(event) {
  if (event && event.target) event.target.disabled = true;

  if (event) {
    event.preventDefault();
    resetForm();
  }

  const form = IDInfoForm.querySelector('form');
  let payload;

  if (skipInputScreen) {
    // Skip path: form was never shown, use id_info directly
    payload = { ...id_info };
  } else {
    // Non-skip path: merge form data over id_info (user may have edited fields)
    const formData = new FormData(form);
    payload = { ...id_info, ...Object.fromEntries(formData.entries()) };
  }

  // ... rest of handleFormSubmit
}
```

---

## 2. Scope validation bypass to id_info path only

**Status:** [ ] Not started  
**Reviewer:** prfectionist (importance: 7) + beaglebets  
**Files:** `basic-kyc.js`, `biometric-kyc.js`, `ekyc.js`

**Problem:**  
`if (isInvalid && isStrictMode(config))` disables form validation globally — even when a user manually fills the form without `id_info`. A partner could set `id_info: { strict: false }` with no country data and bypass all validation.

**Fix:**  
Only bypass validation when the input screen was actually skipped:

```js
// Before (broken):
if (isInvalid && isStrictMode(config)) {

// After (fixed):
if (isInvalid && (!skipInputScreen || isStrictMode(config))) {
```

This means:
- If user saw the form (`skipInputScreen = false`): validation always applies
- If form was skipped (`skipInputScreen = true`): validation only applies in strict mode

---

## 3. Extract duplicated prefill/lock/skip logic into shared utils

**Status:** [x] Done  
**Reviewer:** beaglebets + prfectionist  
**Files:** `id-info-utils.js`, `basic-kyc.js`, `biometric-kyc.js`, `ekyc.js`

**Problem:**  
~90 lines of identical prefill/lock/skip code + `prefillFormFields()` + `mergePrefilledIntoIdInfo()` are copy-pasted across all 3 KYC files.

**Fix:**  
Added `applyIdInfoPrefill()` to `id-info-utils.js`. This single function handles: extracting prefilled data, expanding DOB, validating fields, locking valid fields, marking invalid fields, focusing first editable field, and determining skip vs show.

Each KYC file simplified to:

```js
if (hasIdInfo(config)) {
  const { action, mergedFields } = applyIdInfoPrefill({
    config, country, idType, formElement: IDInfoForm,
    requiredFields, idTypeConstraints,
  });
  if (action === 'skip') {
    Object.assign(id_info, mergedFields);
    skipInputScreen = true;
    handleFormSubmit();
    return;
  }
}
```

This replaces:
- The `if (hasIdInfo(config)) { ... }` block in `setFormInputs()` (~50 lines)
- The `prefillFormFields()` function
- The `mergePrefilledIntoIdInfo()` function

---

## Secondary items (lower priority, address if time permits)

| Priority | Issue | File |
|----------|-------|------|
| Medium | Double DOB parsing (callers + `validatePrefilledFields` both parse) | `id-info-utils.js` |
| Low | Add basic validation to `parseDOB` (numeric check, range check) | `id-info-utils.js` |
| Low | Wrap `RegExp` construction in try-catch | `id-info-utils.js` |
| Nitpick | DOB field checker consistency | `id-info-utils.js` |
| Nitpick | Example script placeholder not useful | `example/script.js` |
