// Shared submission-error UI helpers used by the iframe product entry points.
//
// These consolidate two behaviours that were previously duplicated (and
// subtly inconsistent) across every entry point:
//   - a single, reusable on-page error banner so repeated failed submissions
//     update the message in place instead of stacking a new element per click;
//   - network-aware copy so a connection drop shows an actionable "check your
//     connection" message rather than the generic "something went wrong".

// Walk the `cause` chain to find the network flag set by `fetchWithTimeout`.
// getUploadURL/createZip wrap the underlying fetch rejection in a higher-level
// Error, so the flag can live one or more `cause` levels down. The depth is
// capped so a pathological circular `cause` chain (e.g. `error.cause === error`)
// can never spin forever.
export function isNetworkFailure(error) {
  let current = error;
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current.isNetworkError === true) return true;
    current = current.cause;
  }
  return false;
}

// Pick the user-facing message for a failed submission: an actionable
// connection message for network-level failures (fetch drop/timeout, or the
// browser reporting itself offline), otherwise the generic fallback.
// `translate` is passed in so each entry point uses its own localisation
// binding.
export function submissionErrorMessage(error, translate) {
  return isNetworkFailure(error) ||
    (typeof navigator !== 'undefined' && navigator.onLine === false)
    ? translate('pages.error.checkInternet')
    : translate('pages.error.generic');
}

// Show a submission error on the page, reusing a single element so repeated
// failures update the message in place instead of stacking a new one on every
// click. Keeps the `validation-message` class (so existing resetForm cleanup
// still removes it) but disables the class's text-transform so full-sentence
// messages read naturally. No-ops if there is no <main> to attach to, so it
// never masks the original error inside a catch handler.
export function displayErrorMessage(message) {
  const main = document.querySelector('main');
  if (!main) return;

  let p = main.querySelector('#submission-error-message');
  if (!p) {
    p = document.createElement('p');
    p.id = 'submission-error-message';
    p.classList.add('validation-message');
    p.style.fontSize = '1.5rem';
    p.style.textAlign = 'center';
    p.style.textTransform = 'none';
    main.prepend(p);
  }

  p.textContent = message;
}
