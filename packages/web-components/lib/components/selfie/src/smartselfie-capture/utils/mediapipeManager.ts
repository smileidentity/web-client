import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const EXCLUDED_GPUS = ['Adreno 830'];
//  SM-S931 (for the standard S25), SM-S936 (for the S25+), and SM-S938 (for the S25 Ultra)
const EXCLUDED_DEVICES = [''];

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
 * @description Reads system architecture hints from User-Agent Client Hints.
 * @returns {Promise<string | null>} Lower-cased hint string or null when hints are unavailable.
 */
const getSystemArchitectureHints = async (): Promise<string | null> => {
  if (typeof navigator === 'undefined' || !navigator.userAgentData) {
    return null;
  }

  try {
    const hints = await navigator.userAgentData.getHighEntropyValues([
      'architecture',
      'model',
      'platform',
      'platformVersion',
      'fullVersionList',
    ]);

    return JSON.stringify(hints).toLowerCase();
  } catch (error) {
    console.warn('UA-CH architecture hints fetch failed.', error);
    return null;
  }
};

/**
 * @description Determines the MediaPipe delegate based on architecture hints and excluded GPUs.
 * @returns {Promise<'CPU' | 'GPU'>} CPU when hints are unavailable or excluded GPU is detected; otherwise GPU.
 */
const getDelegateFromArchitectureHints = async (): Promise<'CPU' | 'GPU'> => {
  const hintString = await getSystemArchitectureHints();

  if (!hintString) {
    return 'CPU';
  }

  const hasExcludedGpu = EXCLUDED_GPUS.some((gpu) =>
    hintString.includes(gpu.toLowerCase()),
  );

  return hasExcludedGpu ? 'CPU' : 'GPU';
};

/**
 * @description Detects if the current device model is excluded using UA-CH model hints.
 * @returns {Promise<boolean>} True when the model matches one of the excluded devices.
 */
const isExcludedDeviceUsingHints = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.userAgentData) {
    return false;
  }

  try {
    const { model } = await navigator.userAgentData.getHighEntropyValues([
      'model',
    ]);

    if (!model) {
      return false;
    }

    const lowerModel = model.toLowerCase();

    return EXCLUDED_DEVICES.some((prefix) => lowerModel.includes(prefix));
  } catch (error) {
    console.warn('UA-CH model fetch failed for excluded device check.', error);
    return false;
  }
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

      const architectureDelegate = await getDelegateFromArchitectureHints();
      const isExcludedDevice = await isExcludedDeviceUsingHints();
      const delegate =
        architectureDelegate === 'CPU' || isExcludedDevice || !hasFP16Support()
          ? 'CPU'
          : 'GPU';

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
          delegate,
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
