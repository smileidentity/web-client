import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

declare global {
  interface Window {
    __smileIdentityMediapipe?: {
      instance: FaceLandmarker | null;
      loading: Promise<FaceLandmarker> | null;
      loaded: boolean;
    };
  }
}

const hasFP16Support = () => {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return false;

  const hasHalfFloatExt = gl.getExtension('OES_texture_half_float');
  const hasHalfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
  const hasColorBufferHalfFloat = gl.getExtension(
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

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
          delegate: hasFP16Support() ? 'GPU' : 'CPU',
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
