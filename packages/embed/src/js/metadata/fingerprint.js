import FingerprintJS from '@fingerprintjs/fingerprintjs';

const fpPromise = FingerprintJS.load();

/**
 * Retrieves a unique identifier for the user's browser, using FingerprintJS.
 * @returns {Promise<string>} A promise that resolves with the visitor ID.
 */
export const getFingerprint = async () => {
  const fp = await fpPromise;
  const result = await fp.get();
  console.log(result);
  return result.visitorId;
};
