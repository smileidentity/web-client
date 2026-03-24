import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const EXCLUDED_GPUS = ['adreno-830', 'adreno-8xx', 'adreno-9xx'];

const normalizeGpuText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\(tm\)|\btm\b/g, '')
    .replace(/[^a-z0-9]/g, '');

const matchesExcludedGpu = (value: string): boolean => {
  const normalizedValue = normalizeGpuText(value);

  return EXCLUDED_GPUS.some((gpuPattern) => {
    const normalizedPattern = normalizeGpuText(gpuPattern);

    if (normalizedPattern.endsWith('xx')) {
      const familyPrefix = normalizedPattern.slice(0, -2);
      return new RegExp(`${familyPrefix}\\d{2}`).test(normalizedValue);
    }

    return normalizedValue.includes(normalizedPattern);
  });
};

/**
 * @description Gets the GPU renderer string using WebGL debug info extension.
 * @returns {string | null} The GPU renderer string or null if unavailable.
 */
const getGpuRenderer = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return null;

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return null;

    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string | null;
  } catch {
    return null;
  }
};

/**
 * @description Checks if the GPU renderer matches any excluded GPU.
 * @param {string | null} [renderer] Optional GPU renderer string to use. If not provided, it will be fetched via WebGL.
 * @returns {boolean} True if the GPU is excluded.
 */
const isExcludedGpuFromWebGL = (renderer?: string | null): boolean => {
  const rendererString = (renderer ?? getGpuRenderer())?.toLowerCase() ?? '';
  if (!rendererString) return false;

  return matchesExcludedGpu(rendererString);
};

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
  if (typeof navigator === 'undefined' || !(navigator as any).userAgentData) {
    return null;
  }

  try {
    const hints = await (navigator as any).userAgentData.getHighEntropyValues([
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
 * @description Determines the MediaPipe delegate based on WebGL renderer info and UA-CH hints.
 * Uses WebGL renderer as primary detection, UA-CH hints as secondary.
 * @returns {Promise<'CPU' | 'GPU'>} CPU when excluded GPU is detected; otherwise GPU.
 */
const getDelegateFromGpuDetection = async (): Promise<'CPU' | 'GPU'> => {
  const renderer = getGpuRenderer();

  // Primary check: WebGL renderer info (most reliable for GPU detection)
  if (isExcludedGpuFromWebGL(renderer)) {
    console.info(`[SmileID] Excluded GPU via WebGL: ${renderer}. Using CPU.`);
    return 'CPU';
  }

  // Secondary check: UA-CH hints (may contain GPU info in some browsers)
  const hintString = await getSystemArchitectureHints();

  if (hintString) {
    const hasExcludedGpuInHints = matchesExcludedGpu(hintString);

    if (hasExcludedGpuInHints) {
      console.info(
        `[SmileID] Excluded GPU via UA-CH hints. Using CPU.`,
      );
      return 'CPU';
    }
  }

  // Default to GPU when no exclusion is detected
  console.info(
    `[SmileID] No excluded GPU detected. WebGL renderer: ${renderer ?? 'unavailable'}. Using GPU.`,
  );
  return 'GPU';
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

      const gpuDelegate = await getDelegateFromGpuDetection();
      const delegate =
        gpuDelegate === 'CPU' || !hasFP16Support() ? 'CPU' : 'GPU';

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