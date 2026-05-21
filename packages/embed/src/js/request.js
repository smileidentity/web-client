import * as Sentry from '@sentry/browser';

const WASM_PATH = 'https://secure.smileidentity.com/web_client_guard_bg.wasm';
const JS_PATH = 'https://secure.smileidentity.com/web_client_guard.js';
const INTEGRITY_PATH = 'https://secure.smileidentity.com/integrity.json';
let wasmModule = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const GRACE_PERIOD = 5 * 60 * 1000; // 5 mins

const isStale = () => Date.now() - lastFetchTime > CACHE_DURATION;

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY = 500;

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function withRetry(fn, label, attempt = 0) {
  try {
    return await fn(attempt);
  } catch (e) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(
        `${label} failed after ${MAX_RETRIES + 1} attempts: ${
          e && e.message ? e.message : e
        }`,
        { cause: e },
      );
    }
    await wait(RETRY_BASE_DELAY * 2 ** attempt);
    return withRetry(fn, label, attempt + 1);
  }
}

// Probe whether secure.smileidentity.com is reachable at all from this
// client, independent of the wasm path that just failed. Helps distinguish
// "origin unreachable" (DNS / Private Relay / content blocker) from
// "specific asset / connection-level failure".
async function collectFailureDiagnostics() {
  const connection =
    typeof navigator !== 'undefined' &&
    (navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection);

  let secureOriginReachable = 'unknown';
  let probeError = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    // HEAD on integrity.json: smallest known-good asset on the same origin.
    // no-store + a fresh query param to bypass any pinned/poisoned cache entry.
    const probe = await fetch(`${INTEGRITY_PATH}?probe=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    secureOriginReachable = probe.ok ? 'yes' : `status_${probe.status}`;
  } catch (err) {
    secureOriginReachable = 'no';
    probeError = err && err.message ? err.message : String(err);
  }

  return {
    secureOriginReachable,
    probeError,
    effectiveType: connection?.effectiveType ?? 'unknown',
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
    saveData: connection?.saveData ?? null,
    online: typeof navigator !== 'undefined' ? navigator.onLine : null,
  };
}

let wasmInitPromise = null;

async function initWasm(forceRefetch = false) {
  const now = Date.now();

  if (wasmInitPromise) {
    return wasmInitPromise;
  }

  if (!wasmModule || isStale() || forceRefetch) {
    wasmInitPromise = (async () => {
      // Track which step we're in so the Sentry tag below points at the
      // specific failure mode (fetch failure vs integrity mismatch vs
      // instantiate / compile error).
      let step = 'fetch';
      try {
        const cacheBuster = `?v=${now}`;

        // Retry each fetch independently so a transient failure on one
        // resource doesn't force a re-download of the other (WASM can be
        // a large payload). fetch() resolves on non-2xx, so check .ok
        // and throw so withRetry can treat HTTP errors as retryable.
        const [wasmResponse, integrityResponse] = await Promise.all([
          withRetry(async () => {
            const wasm = await fetch(`${WASM_PATH}${cacheBuster}`);
            if (!wasm.ok) {
              throw new Error(`WASM fetch failed (status=${wasm.status})`);
            }
            return wasm;
          }, 'wasm fetch'),
          withRetry(async () => {
            const integrity = await fetch(`${INTEGRITY_PATH}${cacheBuster}`);
            if (!integrity.ok) {
              throw new Error(
                `Integrity fetch failed (status=${integrity.status})`,
              );
            }
            return integrity;
          }, 'integrity fetch'),
        ]);

        step = 'integrity';
        const { hash: expectedHash } = await integrityResponse.json();
        const wasmBuffer = await wasmResponse.arrayBuffer();

        // verify integrity
        const actualHash = await crypto.subtle.digest('SHA-256', wasmBuffer);
        const actualHex = Array.from(new Uint8Array(actualHash))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        if (actualHex !== expectedHash) {
          throw new Error('WASM integrity check failed');
        }

        step = 'instantiate';
        const newModule = await withRetry(
          // Use Date.now() on each call so every retry gets a distinct URL.
          // ES module loaders memoize failures by specifier, so reusing the
          // same URL would cause retries to reject from the module map cache
          // rather than issuing a new network request.
          () => import(`${JS_PATH}?v=${Date.now()}`),
          'web_client_guard.js dynamic import',
        );

        await newModule.default(wasmBuffer);

        wasmModule = newModule;
        lastFetchTime = now;
      } catch (e) {
        // Report WASM init failures so we can attribute them. Without this,
        // every signed API call downstream fails opaquely and the user-facing
        // error is something generic like "Failed to get supported ID types".
        const diagnostics = await collectFailureDiagnostics();
        Sentry.captureException(e, {
          tags: {
            area: 'wasm_init',
            wasmStep: step,
            effectiveType: diagnostics.effectiveType,
            secureOriginReachable: diagnostics.secureOriginReachable,
          },
          extra: diagnostics,
        });
        throw e;
      } finally {
        wasmInitPromise = null;
      }
    })();

    return wasmInitPromise;
  }
}

async function getHeaders(payload, partnerId, isBinary = false) {
  // always check for WASM updates before signing
  await initWasm();

  const encoder = new TextEncoder();
  const timestamp = new Date().toISOString();
  const headers = {
    'smileid-request-timestamp': timestamp,
    'smileid-partner-id': partnerId,
  };

  const { signature } = wasmModule.signPayload(
    isBinary
      ? new Uint8Array(payload)
      : encoder.encode(JSON.stringify(payload)),
    encoder.encode(JSON.stringify(headers)),
  );

  return {
    'SmileID-Request-Mac': signature,
    'SmileID-Request-Timestamp': timestamp,
    'SmileID-Partner-ID': partnerId,
  };
}

async function getZipSignature(fileDataForMac, partnerId) {
  await initWasm();

  const encoder = new TextEncoder();
  const timestamp = new Date().toISOString();

  const dataToSign = fileDataForMac.join('');
  const payload = { data: dataToSign };

  const headers = {
    'smileid-request-timestamp': timestamp,
    'smileid-partner-id': partnerId,
  };

  const { signature, timestamp: wasmTimestamp } = wasmModule.signDataPayload(
    encoder.encode(JSON.stringify(payload)),
    encoder.encode(JSON.stringify(headers)),
  );

  return {
    timestamp: wasmTimestamp,
    mac: signature,
  };
}

// make the first call to initialize the WASM module
initWasm();

// periodically check for expired WASM module
setInterval(async () => {
  if (wasmModule && isStale()) {
    await initWasm(true);
  }
}, GRACE_PERIOD);

export { getHeaders, getZipSignature };
