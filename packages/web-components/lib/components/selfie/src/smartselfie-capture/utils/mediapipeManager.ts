import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const EXCLUDED_DEVICES = ['sm-s911b', 'sm-s918b'];

declare global {
  interface Window {
    __smileIdentityMediapipe?: {
      instance: FaceLandmarker | null;
      loading: Promise<FaceLandmarker> | null;
      loaded: boolean;
    };
  }
}

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

/**
 * Detects if the user is on a an excluded device eg Samsung Galaxy S25 or S25 Ultra device.
 * This uses the User-Agent string for identification.
 * The reason for this is tied to the mediapipe (see here bug https://github.com/google-ai-edge/mediapipe/issues/5908)
 */
const isExcludedDevice = (): boolean => {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
  const ua = navigator.userAgent.toLowerCase();
  return EXCLUDED_DEVICES.some((device) => ua.includes(device));
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

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
          delegate: isExcludedDevice() || !hasFP16Support() ? 'CPU' : 'GPU',
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
