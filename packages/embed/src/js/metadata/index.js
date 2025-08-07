import { UAParser } from 'ua-parser-js';
import dayjs from 'dayjs';

import { getFingerprint } from './fingerprint';
import proxyCheck from './proxycheck';

let capturing = null;
let activeCameraName = null;
let metadata = [];
let captureStartTimestamp = null;
let orientationListenerAdded = false;
let ipPollInterval = null;
let initializationTimeout = null;
let isInitializing = false;

/**
 * Keys that should only have a single entry in metadata
 */
const SINGLE_ENTRY_KEYS = [
  'active_liveness_type',
  'active_liveness_version',
  'browser_name',
  'browser_version',
  'device_model',
  'device_os',
  'document_back_capture_duration_ms',
  'document_back_capture_retries',
  'document_front_capture_duration_ms',
  'document_front_capture_retries',
  'fingerprint',
  'host_application',
  'local_time_of_enrolment',
  'locale',
  'memory_info',
  'number_of_cameras',
  'proximity_sensor',
  'screen_resolution',
  'sdk',
  'sdk_version',
  'security_policy_version',
  'selfie_capture_duration_ms',
  'selfie_retries',
  'system_architecture',
  'timezone',
  'user_agent',
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

const getOrientationString = () => {
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.startsWith('landscape')
      ? 'landscape'
      : 'portrait';
  }
  if (window.innerWidth && window.innerHeight) {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  return null;
};

const handleDeviceOrientationChange = () => {
  const newOrientation = getOrientationString();
  const lastOrientation = getLastMetadataValue('device_orientation');

  if (newOrientation !== lastOrientation) {
    addMetadataEntry('device_orientation', newOrientation);
  }
};

const getLocalIP = () => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  pc.createDataChannel('');

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        pc.onicecandidate = null;
        pc.close();
      }
    };

    pc.onicecandidate = (evt) => {
      if (resolved) return;

      if (!evt.candidate) {
        cleanup();
        resolve(null);
        return;
      }

      const match = /([0-9]{1,3}(?:\.[0-9]{1,3}){3})/.exec(
        evt.candidate.candidate,
      );
      if (match) {
        const ip = match[1];
        cleanup();
        resolve(ip);
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        cleanup();
        resolve(null);
      });

    setTimeout(() => {
      cleanup();
      resolve(null);
    }, 1500);
  });
};

export const initializeMetadata = async () => {
  metadata = [];
  const hostApplication = `${window.location.protocol}//${window.location.hostname}`;
  addMetadataEntry('host_application', hostApplication);

  // Add proximity_sensor: true if present, nothing if not present
  if (
    'ondeviceproximity' in window ||
    'onuserproximity' in window ||
    'ProximitySensor' in window
  ) {
    addMetadataEntry('proximity_sensor', true);
  }

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
  addMetadataEntry('security_policy_version', '0.3.0');
  addMetadataEntry(
    'timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  addMetadataEntry('locale', navigator.language);
  const localTimeOfEnrolment = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS');
  addMetadataEntry('local_time_of_enrolment', localTimeOfEnrolment);
  addMetadataEntry(
    'screen_resolution',
    `${window.screen.width}x${window.screen.height}`,
  );
  // Memory in bytes
  addMetadataEntry(
    'memory_info',
    navigator.deviceMemory ? navigator.deviceMemory * 1024 ** 3 : null,
  );
  addMetadataEntry('system_architecture', parsedUserAgent.cpu.architecture);

  // Device orientation
  console.log('setting initial orientation');

  const orientation = getOrientationString();
  addMetadataEntry('device_orientation', orientation);
  if (
    window.screen?.orientation &&
    typeof window.screen.orientation.addEventListener === 'function' &&
    !orientationListenerAdded
  ) {
    try {
      window.screen.orientation.addEventListener(
        'change',
        handleDeviceOrientationChange,
      );
      orientationListenerAdded = true;
    } catch (e) {
      // Some browsers may throw if not allowed
    }
  }

  const getNetworkInfo = async () => {
    addMetadataEntry('network_connection', navigator.connection?.effectiveType);
    const ip = await getLocalIP();
    const lastIp = getLastMetadataValue('ip');
    if (!ip || ip === lastIp) {
      return;
    }

    addMetadataEntry('ip', ip);
    const networkInfo = await proxyCheck(ip);
    addMetadataEntry(
      'proxy',
      networkInfo?.proxy ? networkInfo.proxy === 'yes' : null,
    );
    addMetadataEntry(
      'vpn',
      networkInfo?.vpn ? networkInfo.vpn === 'yes' : null,
    );
    addMetadataEntry('carrier_info', networkInfo?.provider || null);
  };

  await getNetworkInfo();
  // If metadata was initialized previously, clear the interval
  if (ipPollInterval) {
    clearInterval(ipPollInterval);
  }
  ipPollInterval = setInterval(getNetworkInfo, 60 * 1000);
};

const getNumberOfCameras = async () => {
  let numberOfCameras = null;
  if (navigator.mediaDevices?.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      numberOfCameras = devices.filter(
        (device) => device.kind === 'videoinput',
      ).length;
    } catch (e) {
      numberOfCameras = null;
    }
  }
  addMetadataEntry('number_of_cameras', numberOfCameras);
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

// debounced initialization to handle multiple rapid initialize events
const debouncedInitializeMetadata = () => {
  if (initializationTimeout) {
    clearTimeout(initializationTimeout);
  }

  if (isInitializing) {
    return;
  }

  initializationTimeout = setTimeout(async () => {
    // check again in case of rapid calls
    if (isInitializing) return;

    isInitializing = true;

    try {
      await initializeMetadata();
    } catch (error) {
      console.error('Failed to initialize metadata:', error);
    } finally {
      isInitializing = false;
      initializationTimeout = null;
    }
  }, 50); // 50ms delay to debounce rapid calls
};

eventTarget.addEventListener(
  'metadata.initialize',
  debouncedInitializeMetadata,
);
eventTarget.addEventListener(
  'metadata.document-front-capture-start',
  beginTrackDocumentFrontCapture,
);
eventTarget.addEventListener(
  'metadata.camera-name',
  ({ detail: { cameraName } }) => {
    getNumberOfCameras();
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
eventTarget.addEventListener('metadata.active-liveness-version', (event) => {
  addMetadataEntry('active_liveness_version', event.detail.version);
});

/**
 * Cleans up all resources including intervals and event listeners
 */
export const cleanupMetadata = () => {
  if (ipPollInterval) {
    clearInterval(ipPollInterval);
    ipPollInterval = null;
  }

  if (orientationListenerAdded && window.screen?.orientation) {
    try {
      window.screen.orientation.removeEventListener(
        'change',
        handleDeviceOrientationChange,
      );
      orientationListenerAdded = false;
    } catch (e) {
      // do nothing
    }
  }

  // reset state variables
  capturing = null;
  activeCameraName = null;
  captureStartTimestamp = null;
  metadata = [];

  // reset initialization tracking
  if (initializationTimeout) {
    clearTimeout(initializationTimeout);
    initializationTimeout = null;
  }
  isInitializing = false;
};

eventTarget.addEventListener('metadata.cleanup', cleanupMetadata);
