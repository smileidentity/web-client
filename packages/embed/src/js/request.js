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

async function withRetry(fn, label) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === MAX_RETRIES) break;
      // eslint-disable-next-line no-await-in-loop
      await wait(RETRY_BASE_DELAY * 2 ** attempt);
    }
  }
  throw new Error(
    `${label} failed after ${MAX_RETRIES + 1} attempts: ${
      lastError && lastError.message ? lastError.message : lastError
    }`,
    { cause: lastError },
  );
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

        const [wasmResponse, integrityResponse] = await withRetry(async () => {
          const responses = await Promise.all([
            fetch(`${WASM_PATH}${cacheBuster}`),
            fetch(`${INTEGRITY_PATH}${cacheBuster}`),
          ]);
          const [wasm, integrity] = responses;
          if (!wasm.ok || !integrity.ok) {
            // Throw so transient HTTP errors (e.g. 5xx) get retried;
            // fetch() resolves on non-2xx, so this is the only place we
            // can convert them into retryable failures.
            throw new Error(
              `Failed to fetch required wasm and integrity resources (wasm=${wasm.status}, integrity=${integrity.status})`,
            );
          }
          return responses;
        }, 'wasm/integrity fetch');

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
          () => import(`${JS_PATH}${cacheBuster}`),
          'web_client_guard.js dynamic import',
        );

        await newModule.default(wasmBuffer);

        wasmModule = newModule;
        lastFetchTime = now;
      } catch (e) {
        // Report WASM init failures so we can attribute them. Without this,
        // every signed API call downstream fails opaquely and the user-facing
        // error is something generic like "Failed to get supported ID types".
        Sentry.captureException(e, {
          tags: { area: 'wasm_init', wasmStep: step },
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
