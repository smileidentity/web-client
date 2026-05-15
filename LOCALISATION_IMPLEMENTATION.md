# Localisation Implementation Documentation

## Overview

This document outlines the minimal runtime internationalisation (i18n) system implemented for SmileID web components. The system enables runtime locale switching with RTL/LTR support and requires no build-time changes.

---

## Files Created

### 1. `packages/web-components/lib/i18n.js`

**Purpose**: Minimal runtime i18n module providing locale registration, loading, and translation lookup.

**Exports**:

- `registerLocale(lang, data)` – Register a locale object in-memory
- `registerLocaleUrl(lang, url)` – Fetch and cache locale JSON from URL
- `loadLocale(lang, url?)` – Load or register a locale (supports both inline and URL sources)
- `t(key)` – Get translation for a dot-notation key (e.g., `'camera.permission.description'`); returns key as fallback if not found
- `setCurrentLocale(lang)` – Switch active locale and apply RTL/LTR direction to `document.documentElement.dir`
- `getCurrentLocale()` – Get the current active locale code
- `setDocumentDir(lang)` – Apply RTL/LTR direction based on locale's `direction` property

**Behavior**:

- Supports nested keys with dot notation (e.g., `'selfie.instructions.tips.goodLight.header'`)
- Falls back to key itself if translation not found (console warning logged)
- Applies `document.documentElement.dir = 'rtl'` or `'ltr'` when locale is set (if locale data includes `direction` property)
- No external dependencies

---

### 2. `packages/web-components/locales/en.json`

**Purpose**: English locale file containing all user-facing strings for web components.

**Structure**:

```json
{
  "direction": "ltr",
  "camera": {
    "permission": {
      "description": "We need access to your camera so that we can capture your details.",
      "requestButton": "Request Camera Access"
    }
  },
  "selfie": {
    "instructions": {
      "title": "Next, we'll take a quick selfie",
      "allowButton": "Allow",
      "tips": {
        "goodLight": { "header": "Good Light", "body": "..." },
        "clearImage": { "header": "Clear Image", "body": "..." },
        "removeObstructions": {
          "header": "Remove Obstructions",
          "body": "..."
        },
        "wideSmile": { "header": "Wide Smile", "body": "..." }
      }
    },
    "review": {
      "question": "Is your whole face clear?",
      "acceptButton": "Yes, use this",
      "retakeButton": "No, Retake Selfie"
    }
  },
  "document": {
    "instructions": {
      "description": "We'll use it to verify your identity.",
      "followInstructions": "Please follow the instructions below."
    }
  }
}
```

---

### 3. `packages/web-components/locales/ar.json`

**Purpose**: Arabic locale file with RTL support.

**Key Features**:

- `"direction": "rtl"` – Applied to `document.documentElement` when locale is set
- Complete Arabic translations of all English strings
- Maintains identical key structure for programmatic consistency

---

## Files Modified

### 1. `packages/web-components/lib/components/camera-permission/CameraPermission.js`

**Changes**:

1. Added import: `import { t, loadLocale } from '../../i18n.js';`
2. Replaced hardcoded strings in `templateString()`:
   - `"We need access to your camera so that we can capture your details."` → `${t('camera.permission.description')}`
   - `"Request Camera Access"` → `${t('camera.permission.requestButton')}`
3. Added locale loading in `connectedCallback()`:
   ```javascript
   if (!window.SmileI18n || !window.SmileI18n.locales) {
     loadLocale('en', null).catch(() => {});
   }
   ```

---

### 2. `packages/web-components/lib/components/selfie/src/selfie-capture-instructions/SelfieCaptureInstructions.js`

**Changes**:

1. Added import: `import { t, loadLocale } from '../../../../i18n.js';`
2. Replaced hardcoded strings in `templateString()`:
   - Title: `"Next, we'll take a quick selfie"` → `${t('selfie.instructions.title')}`
   - Tip 1 (Good Light): Header and body → `${t('selfie.instructions.tips.goodLight.header/body')}`
   - Tip 2 (Clear Image): Header and body → `${t('selfie.instructions.tips.clearImage.header/body')}`
   - Tip 3 (Remove Obstructions): Header and body → `${t('selfie.instructions.tips.removeObstructions.header/body')}`
   - Tip 4 (Wide Smile): Header and body → `${t('selfie.instructions.tips.wideSmile.header/body')}`
   - Button: `"Allow"` → `${t('selfie.instructions.allowButton')}`
3. Added locale loading in `connectedCallback()` (same pattern as CameraPermission)

---

### 3. `packages/web-components/lib/components/selfie/src/selfie-capture-review/SelfieCaptureReview.js`

**Changes**:

1. Added import: `import { t, loadLocale } from '../../../../i18n.js';`
2. Replaced hardcoded strings in `templateString()`:
   - Title: `"Is your whole face clear?"` → `${t('selfie.review.question')}`
   - Accept button: `"Yes, use this"` → `${t('selfie.review.acceptButton')}`
   - Retake button: `"No, Retake Selfie"` → `${t('selfie.review.retakeButton')}`
3. Added locale loading in `connectedCallback()`

---

### 4. `packages/web-components/lib/components/document/src/document-capture-instructions/DocumentCaptureInstructions.js`

**Changes**:

1. Added import: `import { t, loadLocale } from '../../../../i18n.js';`
2. Replaced hardcoded strings in `templateString()`:
   - Description: `"We'll use it to verify your identity."` → `${t('document.instructions.description')}`
   - Instructions: `"Please follow the instructions below."` → `${t('document.instructions.followInstructions')}`
3. Added locale loading in `connectedCallback()`

---

### 5. `packages/web-components/lib/components/end-user-consent/src/EndUserConsent.js`

**Changes**:

1. Added import: `import { t, loadLocale } from '../../../i18n.js';`
2. Added locale loading in `connectedCallback()` for future string translations
3. Component strings not yet replaced (reserved for future updates)

---

## Usage

### Basic Setup (App Initialization)

```javascript
import {
  registerLocale,
  setCurrentLocale,
} from '@smileid/web-components/lib/i18n.js';
import en from '@smileid/web-components/locales/en.json';
import ar from '@smileid/web-components/locales/ar.json';

// Register available locales
registerLocale('en', en);
registerLocale('ar', ar);

// Set default or user-selected locale
setCurrentLocale('en'); // English (LTR)
// or
setCurrentLocale('ar'); // Arabic (RTL) – also applies dir="rtl" to document element
```

### Adding Translations to a Component

```javascript
import { t, loadLocale } from '@smileid/web-components/lib/i18n.js';

// In component template:
function templateString() {
  return `<p>${t('camera.permission.description')}</p>`;
}

// In connectedCallback:
connectedCallback() {
  if (!window.SmileI18n || !window.SmileI18n.locales) {
    loadLocale('en', null).catch(() => {});
  }
  // ... render component
}
```

### Fetching Locales from Server

```javascript
import {
  registerLocaleUrl,
  setCurrentLocale,
} from '@smileid/web-components/lib/i18n.js';

// Load from URL
await registerLocaleUrl('es', 'https://example.com/locales/es.json');
setCurrentLocale('es');
```

---

## Key Design Decisions

1. **Runtime Loading**: Locales are loaded and cached at runtime, no build-time compilation required.

2. **Fallback Strategy**: If a translation key is missing, the key itself is returned (visible in UI with warning logged), allowing graceful degradation.

3. **RTL/LTR Support**: Setting a locale automatically applies the `direction` property from locale JSON to `document.documentElement`, enabling CSS-based RTL styling.

4. **Minimal Footprint**: i18n module is ~2KB unminified, zero external dependencies.

5. **Component-Level Loading**: Each component loads the default locale (`en`) on mount if not already present, preventing load failures in isolated component usage.

6. **Dot-Notation Keys**: Supports nested JSON structures with dot notation (e.g., `'selfie.instructions.tips.goodLight.header'`), improving maintainability and organization.

---

## Testing & Validation

### Manual Testing Steps

1. **Default Locale**: Components should render with English strings on page load.

2. **Locale Switching**: Call `setCurrentLocale('ar')` in browser console; verify:
   - UI text changes to Arabic
   - `document.documentElement.dir` becomes `"rtl"`
   - CSS responds to `:dir(rtl)` pseudo-class if used

3. **Missing Translations**: Add a key reference that doesn't exist in locale (e.g., `t('missing.key')`); verify console warning and key fallback display.

4. **Offline Components**: Mount a component without pre-registering locales; verify component loads with English default.

---

## Future Enhancements

- [ ] Add more locales (Spanish, French, Mandarin, etc.)
- [ ] Integrate with i18next or similar for advanced pluralization/interpolation if needed
- [ ] Add language auto-detection based on `navigator.language`
- [ ] Create locale management UI in example app
- [ ] Add locale caching to LocalStorage to persist user preference
- [ ] Translate EndUserConsent and other remaining UI components
- [ ] Create translation editing/management interface for partners

---

## Files Summary

| File                             | Type     | Lines    | Purpose                 |
| -------------------------------- | -------- | -------- | ----------------------- |
| `lib/i18n.js`                    | New      | ~110     | i18n runtime module     |
| `locales/en.json`                | New      | ~30      | English translations    |
| `locales/ar.json`                | New      | ~30      | Arabic translations     |
| `CameraPermission.js`            | Modified | +3, -0   | Uses i18n for 2 strings |
| `SelfieCaptureInstructions.js`   | Modified | +10, -10 | Uses i18n for 9 strings |
| `SelfieCaptureReview.js`         | Modified | +6, -6   | Uses i18n for 3 strings |
| `DocumentCaptureInstructions.js` | Modified | +3, -2   | Uses i18n for 2 strings |
| `EndUserConsent.js`              | Modified | +3, -0   | Locale loading added    |

---

## Migration Path (Existing Apps)

1. No breaking changes – all components default to English if i18n not initialized
2. App can opt-in to localisation by calling `registerLocale()` and `setCurrentLocale()`
3. Existing hardcoded strings continue to work until components are updated to use `t()`
