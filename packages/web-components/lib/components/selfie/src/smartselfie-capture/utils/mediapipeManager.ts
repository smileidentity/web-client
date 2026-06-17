import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const EXCLUDED_GPUS = [
  'adreno-830',
  'adreno-8xx',
  'adreno-9xx',
  'adreno-840',
  'adreno-810',
];

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
      supportsWasmReftypes?: boolean;
    };
  }
}

/**
 * @description Detects whether the current runtime supports the WebAssembly
 * reference-types proposal (the `externref` value type). MediaPipe Tasks
 * Vision ships a .wasm that uses `externref`; on older engines (e.g. Chrome
 * < 96, Safari < 15, Firefox < 79) `WebAssembly.instantiate` throws
 * `CompileError: invalid value type 'externref'`. We probe support once with
 * `WebAssembly.validate` against a tiny module whose only feature is an
 * `externref`-typed global so callers can short-circuit and fall back to the
 * legacy selfie capture flow instead of triggering an unhandled rejection.
 * @returns {boolean} True if the runtime accepts reftypes / externref.
 */
const supportsWasmReftypes = (): boolean => {
  if (typeof WebAssembly === 'undefined' || !WebAssembly.validate) {
    return false;
  }

  try {
    // Minimal module: magic + version + global section with one externref
    // global (value type 0x6f) initialized to ref.null extern (0xd0 0x6f 0x0b).
    const bytes = new Uint8Array([
      0x00,
      0x61,
      0x73,
      0x6d, // \0asm magic
      0x01,
      0x00,
      0x00,
      0x00, // version 1
      0x06,
      0x06,
      0x01, // global section, 6 bytes, 1 global
      0x6f,
      0x00, // externref, immutable
      0xd0,
      0x6f,
      0x0b, // ref.null extern; end
    ]);
    return WebAssembly.validate(bytes);
  } catch {
    return false;
  }
};

export class UnsupportedMediapipeEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedMediapipeEnvironmentError';
  }
}

/**
 * @description Thrown when `FaceLandmarker.createFromOptions` does not settle
 * within {@link MEDIAPIPE_INIT_TIMEOUT_MS}. The WASM and model assets download
 * over the network, but the subsequent WASM compile + GPU/CPU graph
 * initialization runs on-device and can stall indefinitely on some drivers.
 * Without a timeout the cached `loading` promise never resolves nor rejects,
 * which (a) keeps the loading UI spinning until the wrapper's hard deadline and
 * (b) poisons the singleton so retries/remounts await the same stuck promise.
 * Treated as a transient failure by callers so the bounded retry can re-run.
 */
export class MediapipeInitTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediapipeInitTimeoutError';
  }
}

// Last-resort hang guard for `createFromOptions`. This call also downloads the
// ~3MB model, so the budget must cover a slow/uncached fetch as well as the
// on-device init — hence it is deliberately generous. It exists only so a truly
// wedged init eventually rejects (letting the wrapper's bounded retry / hard
// deadline take over) rather than hanging forever; it is NOT used to decide the
// GPU→CPU fallback (that keys off real init errors — see getMediapipeInstance).
const MEDIAPIPE_INIT_TIMEOUT_MS = 45000;

/**
 * @description Races a promise against a timeout. On timeout, rejects with a
 * {@link MediapipeInitTimeoutError}. The underlying promise is not (and cannot
 * be) aborted — we just stop awaiting it so callers can recover.
 * @param {Promise<T>} promise The work to bound.
 * @param {number} ms Timeout in milliseconds.
 * @param {string} message Message for the timeout error.
 * @returns {Promise<T>} Resolves/rejects with the promise, or rejects on timeout.
 */
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new MediapipeInitTimeoutError(message));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });

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
  const hasWebGlRendererInfo = !!renderer;

  // Primary check: WebGL renderer info (most reliable for GPU detection)
  if (isExcludedGpuFromWebGL(renderer)) {
    console.info(`[SmileID] Excluded GPU via WebGL: ${renderer}. Using CPU.`);
    return 'CPU';
  }

  // Secondary check: UA-CH hints (may contain GPU info in some browsers)
  const hintString = await getSystemArchitectureHints();
  const hasUaHints = !!hintString;

  if (hintString) {
    const hasExcludedGpuInHints = matchesExcludedGpu(hintString);

    if (hasExcludedGpuInHints) {
      console.info(`[SmileID] Excluded GPU via UA-CH hints. Using CPU.`);
      return 'CPU';
    }
  }

  if (!hasWebGlRendererInfo && !hasUaHints) {
    console.info(
      '[SmileID] No WebGL renderer or UA-CH hints available. Using CPU.',
    );
    return 'CPU';
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

/**
 * @description Creates a FaceLandmarker with the given compute delegate.
 * Extracted so the init can be retried with a different delegate without
 * duplicating the options.
 * @param {Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>} vision Resolved WASM fileset.
 * @param {'CPU' | 'GPU'} delegate Compute delegate to use.
 * @returns {Promise<FaceLandmarker>} The created FaceLandmarker.
 */
const createLandmarker = (
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: 'CPU' | 'GPU',
): Promise<FaceLandmarker> =>
  FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
      delegate,
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 2,
  });

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

  // Fail fast on engines that don't support WebAssembly reftypes/externref.
  // The MediaPipe Tasks Vision .wasm uses externref globals; instantiating it
  // on older browsers throws an unhandled `CompileError`. We detect once and
  // cache the result so callers fall back to the legacy capture flow.
  if (mediapipeGlobal.supportsWasmReftypes === undefined) {
    mediapipeGlobal.supportsWasmReftypes = supportsWasmReftypes();
  }
  // TEMP: force unsupported-environment path to test Sentry + fallback —
  // remove before merge
  mediapipeGlobal.supportsWasmReftypes = false;
  if (!mediapipeGlobal.supportsWasmReftypes) {
    throw new UnsupportedMediapipeEnvironmentError(
      'WebAssembly reference types (externref) are not supported in this browser; MediaPipe Tasks Vision cannot be loaded.',
    );
  }

  mediapipeGlobal.loading = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://web-models.smileidentity.com/mediapipe-tasks-vision-wasm',
      );

      const gpuDelegate = await getDelegateFromGpuDetection();
      const delegate =
        gpuDelegate === 'CPU' || !hasFP16Support() ? 'CPU' : 'GPU';

      // A GPU-delegate init can throw on some drivers (WebGL context/shader
      // failures) even though the model already downloaded; on a genuine GPU
      // *error* we retry once on CPU before giving up. We deliberately do NOT
      // fall back on a timeout: the timeout also covers the model download, so
      // a slow fetch could trip it while a healthy GPU init is still in
      // progress — abandoning it to start a redundant CPU init only makes
      // things worse. A timeout therefore propagates as a transient failure for
      // the wrapper's bounded retry / hard deadline to handle.
      //
      // Orphan handling: when `withTimeout` fires, the underlying
      // `createLandmarker` promise is still in flight (it cannot be aborted).
      // If it eventually resolves, the resulting `FaceLandmarker` would leak a
      // GPU/WebGL context, so we attach a best-effort `.close()` cleanup to the
      // original promise reference for both the GPU and CPU init paths.
      const closeOrphan = (orphan: FaceLandmarker) => {
        try {
          orphan.close();
        } catch {
          /* best effort */
        }
      };

      let faceLandmarker: FaceLandmarker;
      const initPromise = createLandmarker(vision, delegate);
      try {
        faceLandmarker = await withTimeout(
          initPromise,
          MEDIAPIPE_INIT_TIMEOUT_MS,
          `MediaPipe initialization timed out after ${MEDIAPIPE_INIT_TIMEOUT_MS}ms (delegate: ${delegate}).`,
        );
      } catch (error) {
        const isTimeout = error instanceof MediapipeInitTimeoutError;
        if (isTimeout) {
          // Stop awaiting the in-flight init, but if it eventually resolves,
          // close the orphaned instance to avoid leaking a GPU/WebGL context.
          initPromise.then(closeOrphan, () => {
            /* already failed; nothing to clean up */
          });
        }
        if (delegate === 'GPU' && !isTimeout) {
          console.warn(
            '[SmileID] GPU MediaPipe init failed; retrying with CPU delegate.',
            error,
          );
          const cpuInitPromise = createLandmarker(vision, 'CPU');
          try {
            faceLandmarker = await withTimeout(
              cpuInitPromise,
              MEDIAPIPE_INIT_TIMEOUT_MS,
              `MediaPipe CPU initialization timed out after ${MEDIAPIPE_INIT_TIMEOUT_MS}ms.`,
            );
          } catch (cpuError) {
            if (cpuError instanceof MediapipeInitTimeoutError) {
              cpuInitPromise.then(closeOrphan, () => {
                /* already failed; nothing to clean up */
              });
            }
            throw cpuError;
          }
        } else {
          throw error;
        }
      }

      mediapipeGlobal.instance = faceLandmarker;
      mediapipeGlobal.loaded = true;
      mediapipeGlobal.loading = null;

      return faceLandmarker;
    } catch (error) {
      // Always clear the poisoned promise so the wrapper's bounded retry — and
      // any later remount — can re-attempt instead of awaiting a dead promise.
      mediapipeGlobal.loading = null;
      throw error;
    }
  })();

  return mediapipeGlobal.loading;
};

export const __testUtils = {
  matchesExcludedGpu,
  getDelegateFromGpuDetection,
  supportsWasmReftypes,
  withTimeout,
  MEDIAPIPE_INIT_TIMEOUT_MS,
};
