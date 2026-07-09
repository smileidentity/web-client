import { requestOidcAuthorizeUrl } from '../request';
import {
  openOidcPopup,
  openPendingPopup,
  navigatePopup,
} from './popupLauncher.js';
import waitForOidcCallback from './callbackListener.js';

// Treat a prefetched authorize session as stale a little before its real
// `expires_in`, so a session that passes the check here doesn't expire between
// the click and the IdP loading the URL.
const SESSION_EXPIRY_MARGIN_MS = 30 * 1000;

/**
 * Coordinates the OIDC popup handshake so the popup opens **synchronously**
 * inside the user's click, which is the only reliable way past popup blockers.
 *
 * The authorize URL is fetched asynchronously (`prefetch`) as soon as the
 * screen renders. On click (`launch`):
 *   - if the prefetch has resolved and is still fresh, open the popup pointed
 *     straight at the authorize URL;
 *   - otherwise open a blank popup in the gesture and navigate it once the
 *     prefetch resolves.
 *
 * `launch` returns a Promise that resolves with `{ state }` on a successful
 * callback, or rejects with one of the shapes produced by `waitForOidcCallback`
 * plus `{ message: 'popup_blocked' }` when `window.open` is blocked even inside
 * the gesture.
 *
 * @param {object} config  the SDK config bag.
 * @param {object} opts
 * @param {string} opts.country
 * @param {string} opts.product  'enhanced_kyc' | 'biometric_kyc'
 */
export default function createOidcRedirect(config, { country, product }) {
  let sessionPromise = null;
  let session = null;
  let sessionFetchedAt = 0;

  function isSessionFresh() {
    if (!session) return false;
    const ttlMs = (session.expires_in || 0) * 1000;
    // No / non-positive expiry → treat as fresh (server didn't advertise one).
    if (ttlMs <= 0) return true;
    return Date.now() - sessionFetchedAt < ttlMs - SESSION_EXPIRY_MARGIN_MS;
  }

  /**
   * Kick off (or refresh) the authorize-URL fetch. Safe to call repeatedly:
   * an in-flight or still-fresh fetch is reused. Returns the promise so the
   * caller can surface prefetch failures (error panel) before any click.
   */
  function prefetch() {
    if (sessionPromise && (session ? isSessionFresh() : true)) {
      return sessionPromise;
    }
    session = null;
    sessionPromise = requestOidcAuthorizeUrl(config, { country, product })
      .then((res) => {
        session = res;
        sessionFetchedAt = Date.now();
        return res;
      })
      .catch((err) => {
        // Drop the rejected promise so a later prefetch/launch retries the
        // fetch rather than re-throwing the cached failure.
        sessionPromise = null;
        throw err;
      });
    return sessionPromise;
  }

  /**
   * Open the popup and wait for the callback. MUST be called synchronously
   * inside a user gesture so `window.open` is honoured.
   *
   * @returns {Promise<{ state: string }>}
   */
  function launch() {
    // Make sure a fetch is in flight (or a fresh session is cached) before we
    // decide how to open the popup.
    if (!sessionPromise || (session && !isSessionFresh())) {
      prefetch();
    }

    const haveFreshSession = session && isSessionFresh();
    const popup = haveFreshSession
      ? openOidcPopup(session.authorize_url)
      : openPendingPopup();

    if (!popup) {
      return Promise.reject(new Error('popup_blocked'));
    }

    if (haveFreshSession) {
      return waitForOidcCallback({ state: session.state, popup });
    }

    return sessionPromise.then(
      (res) => {
        navigatePopup(popup, res.authorize_url);
        return waitForOidcCallback({ state: res.state, popup });
      },
      (err) => {
        try {
          if (popup && !popup.closed) popup.close();
        } catch (_) {
          /* cross-origin close is best-effort */
        }
        throw err;
      },
    );
  }

  return { prefetch, launch };
}
