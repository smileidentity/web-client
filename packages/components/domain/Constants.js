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
export const PORTRAIT_ID_PREVIEW_WIDTH = 396;
export const PORTRAIT_ID_PREVIEW_HEIGHT = 527;
