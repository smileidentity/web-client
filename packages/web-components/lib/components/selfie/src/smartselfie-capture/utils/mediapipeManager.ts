import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

//  SM-S931 (for the standard S25), SM-S936 (for the S25+), and SM-S938 (for the S25 Ultra)
const EXCLUDED_DEVICES = ['sm-s936', 'sm-s931', 'sm-s938'];

declare global {
  interface Window {
    __smileIdentityMediapipe?: {
      instance: FaceLandmarker | null;
      loading: Promise<FaceLandmarker> | null;
      loaded: boolean;
    };
  }
}

/**
 * @description Detects if the user is on an excluded device using the modern and more accurate
 * User-Agent Client Hints (UA-CH) API to get the device model.
 * @returns {Promise<boolean>} - True if the device model is in the exclusion list.
 */
const isExcludedDeviceUsingHints = async (): Promise<boolean> => {
  // Check for User-Agent Client Hints API support
  if (typeof navigator !== 'undefined' && navigator.userAgentData) {
    try {
      // Request the 'model' high-entropy value and destructure it directly
      const { model } = await navigator.userAgentData.getHighEntropyValues([
        'model',
      ]);

      if (!model) {
        return false;
      }

      const lowerModel = model.toLowerCase();

      // Check if the extracted model string matches any of the excluded prefixes
      return EXCLUDED_DEVICES.some((prefix) => lowerModel.includes(prefix));
    } catch (error) {
      // Log the error but fail safe (return false)
      console.warn(
        'UA-CH model fetch failed, falling back to UA string check.',
        error,
      );
      return false;
    }
  }
  // If API is not supported, return false (rely on synchronous isExcludedDevice)
  return false;
};

// this was added because devices (mostly older) that do not support FP16 will fail to load the model.
const hasFP16Support = () => {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return false;

  const hasHalfFloatExt = (gl as any).getExtension('OES_texture_half_float');
  const hasHalfFloatLinear = (gl as any).getExtension(
    'OES_texture_half_float_linear',
  );
  const hasColorBufferHalfFloat = (gl as any).getExtension(
    'EXT_color_buffer_half_float',
  );

  return !!(hasHalfFloatExt && hasColorBufferHalfFloat && hasHalfFloatLinear);
};

export const getMediapipeInstance = async (): Promise<FaceLandmarker> => {
  if (!window.__smileIdentityMediapipe) {
    window.__smileIdentityMediapipe = {
      instance: null,
      loading: null,
      loaded: false,
    };
  }

  const mediapipeGlobal = window.__smileIdentityMediapipe;

  if (mediapipeGlobal.loaded && mediapipeGlobal.instance) {
    return mediapipeGlobal.instance;
  }

  if (mediapipeGlobal.loading) {
    return mediapipeGlobal.loading;
  }

  mediapipeGlobal.loading = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://web-models.smileidentity.com/mediapipe-tasks-vision-wasm',
      );

      const isExcluded = await isExcludedDeviceUsingHints();

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
          delegate: isExcluded() || !hasFP16Support() ? 'CPU' : 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 2,
      });

      mediapipeGlobal.instance = faceLandmarker;
      mediapipeGlobal.loaded = true;
      mediapipeGlobal.loading = null;

      return faceLandmarker;
    } catch (error) {
      mediapipeGlobal.loading = null;
      throw error;
    }
  })();

  return mediapipeGlobal.loading;
};
