import { UAParser } from 'ua-parser-js';

import { getFingerprint } from './fingerprint';

let capturing = null;
let activeCameraName = null;
let metadata = [];
let captureStartTimestamp = null;

/**
 * Keys that should only have a single entry in metadata
 */
const SINGLE_ENTRY_KEYS = [
  'user_agent',
  'device_model',
  'device_os',
  'browser_name',
  'browser_version',
  'fingerprint',
  'active_liveness_type',
  'active_liveness_version',
  'camera_name',
  'document_front_capture_camera_name',
  'document_back_capture_camera_name',
  'selfie_image_origin',
  'document_front_image_origin',
  'document_back_image_origin',
];

/**
 * Adds a metadata entry to the metadata array. If the key is in SINGLE_ENTRY_KEYS, upsert it.
 * @param {string} name - The name of the metadata field.
 * @param {any} value - The value of the metadata field. Null/undefined values are ignored.
 */
export const addMetadataEntry = (name, value) => {
  if (value === null || value === undefined) return;
  if (SINGLE_ENTRY_KEYS.includes(name)) {
    // Upsert: replace the last entry for this key, or add if not present
    for (let i = metadata.length - 1; i >= 0; i -= 1) {
      if (metadata[i].name === name) {
        metadata[i] = { name, value, timestamp: new Date().toISOString() };
        return;
      }
    }
  }
  metadata.push({
    name,
    value,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper to get the last value for a metadata name.
 */
const getLastMetadataValue = (name) => {
  for (let i = metadata.length - 1; i >= 0; i -= 1) {
    if (metadata[i].name === name) return metadata[i].value;
  }
  return undefined;
};

export const initializeMetadata = async () => {
  metadata = [];
  addMetadataEntry('user_agent', navigator.userAgent);
  const parsedUserAgent = await UAParser(navigator.userAgent).withClientHints();
  addMetadataEntry(
    'device_model',
    `${parsedUserAgent.device.vendor || ''} ${parsedUserAgent.device.model || ''}`.trim() ||
      null,
  );
  addMetadataEntry(
    'device_os',
    `${parsedUserAgent.os.name} ${parsedUserAgent.os.version}`.trim() || null,
  );
  addMetadataEntry('browser_name', parsedUserAgent.browser.name);
  addMetadataEntry('browser_version', parsedUserAgent.browser.version);
  addMetadataEntry('fingerprint', await getFingerprint());
  addMetadataEntry('active_liveness_type', 'smile');
  addMetadataEntry('active_liveness_version', '0.0.1');
};

export const getMetadata = () => metadata.map((entry) => ({ ...entry }));

export const setMetadata = (key, value) => {
  addMetadataEntry(key, value);
};

export const beginTrackDocumentFrontCapture = () => {
  captureStartTimestamp = Date.now();
  addMetadataEntry('document_front_capture_retries', 0);
  addMetadataEntry('document_front_image_origin', 'camera_manual_capture');
  capturing = 'document_front';
  if (activeCameraName) {
    addMetadataEntry('document_front_capture_camera_name', activeCameraName);
  }
};

const retryDocumentFrontCapture = () => {
  const prev = getLastMetadataValue('document_front_capture_retries') || 0;
  addMetadataEntry('document_front_capture_retries', prev + 1);
  captureStartTimestamp = Date.now();
};

export const endTrackDocumentFrontCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  addMetadataEntry(
    'document_front_capture_duration_ms',
    Date.now() - captureStartTimestamp,
  );
  captureStartTimestamp = null;
  capturing = null;
};

export const beginTrackDocumentBackCapture = () => {
  addMetadataEntry('document_back_capture_retries', 0);
  addMetadataEntry('document_back_image_origin', 'camera_manual_capture');
  capturing = 'document_back';
  if (activeCameraName) {
    addMetadataEntry('document_back_capture_camera_name', activeCameraName);
  }
  captureStartTimestamp = Date.now();
};

const retryDocumentBackCapture = () => {
  const prev = getLastMetadataValue('document_back_capture_retries') || 0;
  addMetadataEntry('document_back_capture_retries', prev + 1);
};

export const endTrackDocumentBackCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  addMetadataEntry(
    'document_back_capture_duration_ms',
    Date.now() - captureStartTimestamp,
  );
  captureStartTimestamp = null;
  capturing = null;
};

export const beginTrackSelfieCapture = () => {
  capturing = 'selfie';
  if (activeCameraName) {
    addMetadataEntry('camera_name', activeCameraName);
  }
  captureStartTimestamp = Date.now();
};

export const endTrackSelfieCapture = () => {
  if (!captureStartTimestamp) {
    return;
  }
  addMetadataEntry(
    'selfie_capture_duration_ms',
    Date.now() - captureStartTimestamp,
  );
  captureStartTimestamp = null;
  capturing = null;
};

const eventTarget = document.querySelector('smart-camera-web');

eventTarget.addEventListener('metadata.initialize', initializeMetadata);
eventTarget.addEventListener(
  'metadata.document-front-capture-start',
  beginTrackDocumentFrontCapture,
);
eventTarget.addEventListener(
  'metadata.camera-name',
  ({ detail: { cameraName } }) => {
    activeCameraName = cameraName;
    if (capturing === 'selfie') {
      addMetadataEntry('camera_name', cameraName);
    } else if (capturing === 'document_front') {
      addMetadataEntry('document_front_capture_camera_name', cameraName);
    } else if (capturing === 'document_back') {
      addMetadataEntry('document_back_capture_camera_name', cameraName);
    }
  },
);
eventTarget.addEventListener(
  'metadata.document-front-origin',
  ({ detail: { imageOrigin } }) => {
    addMetadataEntry('document_front_image_origin', imageOrigin);
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
  addMetadataEntry('document_back_image_origin', event.detail.imageOrigin);
});
eventTarget.addEventListener('metadata.selfie-origin', (event) => {
  addMetadataEntry('selfie_image_origin', event.detail.imageOrigin);
});
eventTarget.addEventListener('metadata.selfie-capture-start', () => {
  beginTrackSelfieCapture();
});
eventTarget.addEventListener(
  'metadata.selfie-capture-end',
  endTrackSelfieCapture,
);
