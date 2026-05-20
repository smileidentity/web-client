import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;
try {
  fpPromise = FingerprintJS.load();
} catch (error) {
  console.warn('FingerprintJS failed to load:', error);
  fpPromise = null;
}

/**
 * Retrieves a unique identifier for the user's browser, using FingerprintJS.
 * Returns null if fingerprinting fails (e.g., blocked by browser security settings).
 * @returns {Promise<string|null>} A promise that resolves with the visitor ID, or null on failure.
 */
export const getFingerprint = async () => {
  try {
    if (!fpPromise) return null;
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.warn('Failed to get fingerprint:', error);
    return null;
  }
};
