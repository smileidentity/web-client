/**
 * Wait for a postMessage from `/v2/oidc/callback`.
 *
 * The callback page posts:
 *   { message: 'SmileIdentity::OidcCallback::Success' | 'SmileIdentity::OidcCallback::Error',
 *     state:   '<original state>',
 *     error?:  '<issuer error code>' }
 *
 * Returns a Promise that:
 *   - resolves with the payload when a matching Success arrives,
 *   - rejects with the payload when a matching Error arrives,
 *   - rejects with { message: 'timeout', state } if `timeoutMs` elapses,
 *   - rejects with { message: 'closed',  state } if the popup handle is
 *     closed before a message arrives.
 *
 * Only messages whose `state` matches the one we started are accepted —
 * defense against stray postMessages from other tabs / extensions, and
 * against stale popups from prior attempts firing after a retry.
 */
export default function waitForOidcCallback({
  state,
  popup,
  timeoutMs = 10 * 60 * 1000,
}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let closedCheck;
    let timer;

    function cleanup() {
      window.removeEventListener('message', onMessage);
      if (closedCheck) clearInterval(closedCheck);
      if (timer) clearTimeout(timer);
    }

    function onMessage(event) {
      const data = event && event.data;
      if (!data || typeof data !== 'object') return;
      if (data.state !== state) return;
      if (
        data.message !== 'SmileIdentity::OidcCallback::Success' &&
        data.message !== 'SmileIdentity::OidcCallback::Error'
      ) {
        return;
      }

      settled = true;
      cleanup();
      try {
        if (popup && !popup.closed) popup.close();
      } catch (_) {
        /* cross-origin close is best-effort */
      }

      if (data.message === 'SmileIdentity::OidcCallback::Success') {
        resolve(data);
      } else {
        reject(data);
      }
    }

    window.addEventListener('message', onMessage);

    // If the user manually closes the popup we can't recover a code from it.
    if (popup) {
      closedCheck = setInterval(() => {
        if (settled) return;
        if (popup.closed) {
          settled = true;
          cleanup();
          reject(Object.assign(new Error('closed'), { state }));
        }
      }, 1000);
    }

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        if (popup && !popup.closed) popup.close();
      } catch (_) {
        /* cross-origin close is best-effort */
      }
      reject(Object.assign(new Error('timeout'), { state }));
    }, timeoutMs);
  });
}
