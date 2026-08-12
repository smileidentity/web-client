const POPUP_NAME = 'smileid-oidc';
const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 720;

function getPopupFeatures() {
  const left = (window.screen.width - POPUP_WIDTH) / 2;
  const top = (window.screen.height - POPUP_HEIGHT) / 2;
  return [
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
    'toolbar=no',
    'menubar=no',
    'location=no',
  ].join(',');
}

/**
 * Opens a sized, centered popup pointed at `url`. Returns the popup handle,
 * or `null` if the browser blocked it. `window.open` is only guaranteed to
 * succeed inside a user gesture, so callers must handle the null case —
 * typically by showing a retry button whose click handler re-opens the popup
 * with the already-acquired authorize URL.
 */
export function openOidcPopup(url) {
  const popup = window.open(url, POPUP_NAME, getPopupFeatures());
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    return null;
  }

  try {
    popup.focus();
  } catch (_) {
    /* focus is best-effort */
  }
  return popup;
}

/**
 * Synchronously opens a blank popup with the same window features/name as
 * `openOidcPopup`, before the authorize URL is known. This is the key to
 * defeating popup blockers: `window.open` must run inside the user gesture,
 * but the authorize URL is fetched asynchronously. We open a placeholder in
 * the gesture and point it at the real URL later via `navigatePopup`.
 *
 * Returns the popup handle, or `null` if the browser blocked it even inside
 * the gesture (rare — surface the popup-blocked retry panel in that case).
 */
export function openPendingPopup() {
  const popup = window.open('about:blank', POPUP_NAME, getPopupFeatures());
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    return null;
  }

  try {
    popup.focus();
  } catch (_) {
    /* focus is best-effort */
  }
  return popup;
}

/**
 * Points an already-open popup (from `openPendingPopup`) at the authorize URL
 * once it has been acquired. Navigating a window we hold a handle to is
 * allowed even cross-origin (reading it is not). Returns `false` if the popup
 * was closed before the URL resolved, so the caller can surface an error.
 */
export function navigatePopup(popup, url) {
  if (!popup || popup.closed) {
    return false;
  }
  try {
    popup.location.href = url;
  } catch (_) {
    // A cross-origin popup can throw on property access in some browsers even
    // though the navigation itself is permitted; fall back to a re-open of the
    // same named window, which reuses the existing popup rather than spawning
    // a second one.
    window.open(url, POPUP_NAME);
  }
  try {
    popup.focus();
  } catch (_) {
    /* focus is best-effort */
  }
  return true;
}
