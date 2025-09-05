const WASM_PATH = 'https://secure.smileidentity.com/web_client_guard_bg.wasm';
const JS_PATH = 'https://secure.smileidentity.com/web_client_guard.js';
const INTEGRITY_PATH = 'https://secure.smileidentity.com/integrity.json';
let wasmModule = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const GRACE_PERIOD = 5 * 60 * 1000; // 5 mins

const isStale = () => Date.now() - lastFetchTime > CACHE_DURATION;

let wasmInitPromise = null;

async function initWasm(forceRefetch = false) {
  const now = Date.now();

  if (wasmInitPromise) {
    return wasmInitPromise;
  }

  if (!wasmModule || isStale() || forceRefetch) {
    wasmInitPromise = (async () => {
      try {
        const cacheBuster = `?v=${now}`;

        const [wasmResponse, integrityResponse] = await Promise.all([
          fetch(`${WASM_PATH}${cacheBuster}`),
          fetch(`${INTEGRITY_PATH}${cacheBuster}`),
        ]);

        if (!wasmResponse.ok || !integrityResponse.ok) {
          throw new Error(
            'Failed to fetch required wasm and integrity resources',
          );
        }

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

        const newModule = await import(`${JS_PATH}${cacheBuster}`);

        newModule.initSync({ module: wasmBuffer });

        wasmModule = newModule;
        lastFetchTime = now;
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
