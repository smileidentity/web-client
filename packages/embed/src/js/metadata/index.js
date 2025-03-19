import { UAParser } from 'ua-parser-js';

import { getFingerprint } from './fingerprint';

const defaultMetadata = {
  device_model: null, // string
  device_os: null, // string
  browser_name: null, // string
  browser_version: null, // string
  document_back_capture_duration_ms: null, // number
  document_back_capture_retries: null, // number
  document_back_image_origin: null, // gallery | camera_manual_capture | camera_auto_capture
  document_back_capture_camera_name: null, // string
  document_front_capture_duration_ms: null, // number
  document_front_capture_retries: null, // number
  document_front_image_origin: null, // gallery | camera_manual_capture | camera_auto_capture
  document_front_capture_camera_name: null, // string
  selfie_capture_duration_ms: null, // number
  selfie_image_origin: null, // gallery | camera_manual_capture | camera_auto_capture
  camera_name: null, // string - for selfies
  active_liveness_type: null, // headpose | smile
  active_liveness_version: null, // string
  fingerprint: null, // string
  user_agent: null, // string
};

let capturing = null;
let activeCameraName = null;
let metadata = { ...defaultMetadata };
let captureStartTimestamp = null;

/**
 * Initialize the metadata object with some default values and data that
 * can be collected from the browser. This function should be called once
 * when the script is loaded.
 *
 * @returns {Promise<void>}
 */
export const initializeMetadata = async () => {
  metadata = { ...defaultMetadata };
  metadata.user_agent = navigator.userAgent;
  const parsedUserAgent = await UAParser(navigator.userAgent).withClientHints();
  metadata.device_model =
    `${parsedUserAgent.device.vendor || ''} ${parsedUserAgent.device.model || ''}`.trim() ||
    null;
  metadata.device_os =
    `${parsedUserAgent.os.name} ${parsedUserAgent.os.version}`.trim() || null;
  metadata.browser_name = parsedUserAgent.browser.name;
  metadata.browser_version = parsedUserAgent.browser.version;
  metadata.fingerprint = await getFingerprint();
  metadata.active_liveness_type = 'smile';
  metadata.active_liveness_version = '0.0.1';
};

export const getMetadata = () =>
  Object.entries(metadata)
    .filter(([_name, value]) => value != null)
    .map(([name, value]) => ({ name, value: value.toString() }));

/**
 * Set a specific key in the metadata object to a specific value.
 *
 * @param {string} key The key to update in the metadata object.
 * @param {any} value The value to assign to the key.
 */
export const setMetadata = (key, value) => {
  metadata[key] = value;
};

/**
 * Start tracking the document front capture process. This function should be
 * called once the user starts the document front capture process. It sets the
 * document_front_capture_retries to 0 and document_front_image_origin to
 * 'camera'.
 */
export const beginTrackDocumentFrontCapture = () => {
  captureStartTimestamp = Date.now();
  if (metadata.document_front_capture_retries === null) {
    metadata.document_front_capture_retries = 0;
  }
  metadata.document_front_image_origin = 'camera_manual_capture';
  capturing = 'document_front';

  if (activeCameraName) {
    metadata.document_front_capture_camera_name = activeCameraName;
  }
};

const retryDocumentFrontCapture = () => {
  metadata.document_front_capture_retries += 1;
  captureStartTimestamp = Date.now();
};

/**
 * End tracking the document front capture process. This function should be
 * called once the document front capture process is finished. It logs an
 * event to mark the end of the process, calculates the duration of the
 * process, and stores the duration in the metadata object.
 */
export const endTrackDocumentFrontCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  metadata.document_front_capture_duration_ms =
    Date.now() - captureStartTimestamp;
  captureStartTimestamp = null;
  capturing = null;
};

/**
 * Start tracking the document back capture process. This function should be
 * called once the user starts the document back capture process. It sets the
 * document_back_capture_retries to 0 and document_back_image_origin to
 * 'camera'.
 */
export const beginTrackDocumentBackCapture = () => {
  if (metadata.document_back_capture_retries === null) {
    metadata.document_back_capture_retries = 0;
  }
  metadata.document_back_image_origin = 'camera_manual_capture';
  capturing = 'document_back';
  if (activeCameraName) {
    metadata.document_back_capture_camera_name = activeCameraName;
  }
  captureStartTimestamp = Date.now();
};

const retryDocumentBackCapture = () => {
  metadata.document_back_capture_retries += 1;
};

/**
 * End tracking the document back capture process. This function should be
 * called once the document back capture process is finished. It logs an
 * event to mark the end of the process, calculates the duration of the
 * process, and stores the duration in the metadata object.
 */
export const endTrackDocumentBackCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  metadata.document_back_capture_duration_ms =
    Date.now() - captureStartTimestamp;
  captureStartTimestamp = null;
  capturing = null;
};

/**
 * Start tracking the selfie capture process. This function should be called
 * once the user starts the selfie capture process. It sets the
 * selfie_image_origin to 'camera'.
 */
export const beginTrackSelfieCapture = () => {
  metadata.selfie_image_origin = 'camera_manual_capture';
  capturing = 'selfie';
  if (activeCameraName) {
    metadata.camera_name = activeCameraName;
  }
  captureStartTimestamp = Date.now();
};

/**
 * End tracking the selfie capture process. This function should be called
 * once the selfie capture process is finished. It logs an event to mark
 * the end of the process, calculates the duration of the process, and
 * stores the duration in the metadata object.
 */
export const endTrackSelfieCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  metadata.selfie_capture_duration_ms = Date.now() - captureStartTimestamp;
  captureStartTimestamp = null;
  capturing = null;
};

const eventTarget = document.querySelector('smart-camera-web');

eventTarget.addEventListener('metadata.initialize', initializeMetadata);
// Document Front
eventTarget.addEventListener(
  'metadata.document-front-capture-start',
  beginTrackDocumentFrontCapture,
);
eventTarget.addEventListener(
  'metadata.camera-name',
  ({ detail: { cameraName } }) => {
    activeCameraName = cameraName;

    if (capturing === 'selfie') {
      metadata.camera_name = cameraName;
    } else if (capturing === 'document_front') {
      metadata.document_front_capture_camera_name = cameraName;
    } else if (capturing === 'document_back') {
      metadata.document_back_capture_camera_name = cameraName;
    }
  },
);

eventTarget.addEventListener(
  'metadata.document-front-origin',
  ({ detail: { imageOrigin } }) => {
    metadata.document_front_image_origin = imageOrigin;
  },
);
eventTarget.addEventListener(
  'metadata.document-front-capture-end',
  endTrackDocumentFrontCapture,
);
eventTarget.addEventListener(
  'metadata.document-front-capture-retry',
  retryDocumentFrontCapture,
);

// Document Back
eventTarget.addEventListener(
  'metadata.document-back-capture-start',
  beginTrackDocumentBackCapture,
);
eventTarget.addEventListener(
  'metadata.document-back-capture-end',
  endTrackDocumentBackCapture,
);

eventTarget.addEventListener(
  'metadata.document-back-capture-retry',
  retryDocumentBackCapture,
);
eventTarget.addEventListener('metadata.document-back-origin', (event) => {
  metadata.document_back_image_origin = event.detail.imageOrigin;
});

// Selfie
eventTarget.addEventListener('metadata.selfie-capture-start', () => {
  beginTrackSelfieCapture();
});
eventTarget.addEventListener(
  'metadata.selfie-capture-end',
  endTrackSelfieCapture,
);
