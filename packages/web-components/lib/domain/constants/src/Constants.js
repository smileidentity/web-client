/**
 * The type of image submitted in the job request
 * @readonly
 * @enum {number}
 */
export const IMAGE_TYPE = {
  /** ID_CARD_BACK_IMAGE_BASE64 Base64 encoded back of ID card image (.jpg or .png) */
  ID_CARD_BACK_IMAGE_BASE64: 7,
  /** ID_CARD_BACK_IMAGE_FILE Back of ID card image in .png or .jpg file format */
  ID_CARD_BACK_IMAGE_FILE: 5,
  /** ID_CARD_IMAGE_BASE64 Base64 encoded ID card image (.png or .jpg) */
  ID_CARD_IMAGE_BASE64: 3,
  /** ID_CARD_IMAGE_FILE ID card image in .png or .jpg file format */
  ID_CARD_IMAGE_FILE: 1,
  /** LIVENESS_IMAGE_BASE64 Base64 encoded liveness image (.jpg or .png) */
  LIVENESS_IMAGE_BASE64: 6,
  /** LIVENESS_IMAGE_FILE Liveness image in .png or .jpg file format */
  LIVENESS_IMAGE_FILE: 4,
  /** SELFIE_IMAGE_BASE64 Base64 encoded selfie image (.png or .jpg) */
  SELFIE_IMAGE_BASE64: 2,
  /** SELFIE_IMAGE_FILE Selfie image in .png or .jpg file format */
  SELFIE_IMAGE_FILE: 0,
};

export const DEFAULT_NO_OF_LIVENESS_FRAMES = 8;

/**
 * JPEG compression quality for captured images (selfies, liveness frames, ID documents).
 *
 * Value: 0.92 (92% quality)
 *
 * This value is optimized for identity verification and biometric matching:
 * - Preserves fine facial details needed for accurate facial recognition
 * - Maintains skin tone gradients without JPEG blocking artifacts
 * - Ensures ID document text remains readable for OCR processing
 * - Provides minimal compression artifacts that could affect liveness detection
 *
 * Quality comparison:
 * - 1.0:  No compression, very large files
 * - 0.95: Virtually lossless, larger files
 * - 0.92: Good quality, reasonable file size
 * - 0.85: Visible artifacts in gradients and skin tones
 * - 0.80: Noticeable blocking artifacts that hurt matching accuracy
 *
 * WARNING: DO NOT LOWER THIS VALUE BELOW 0.92
 * Reducing JPEG quality can negatively impact downstream systems:
 * - Facial recognition matching accuracy may decrease
 * - Liveness detection anti-spoofing checks may fail
 * - ID document OCR text extraction may produce errors
 * - Overall verification success rates may drop
 *
 */
export const JPEG_QUALITY = 0.92;
export const PORTRAIT_ID_PREVIEW_WIDTH = 396;
export const PORTRAIT_ID_PREVIEW_HEIGHT = 527;
