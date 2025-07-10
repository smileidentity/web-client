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

export const getMediapipeInstance = async (): Promise<FaceLandmarker> => {
  // eslint-disable-next-line no-console
  console.log('[MediaPipe] getMediapipeInstance called');

  if (!window.__smileIdentityMediapipe) {
    // eslint-disable-next-line no-console
    console.log('[MediaPipe] Initializing global MediaPipe object');
    window.__smileIdentityMediapipe = {
      instance: null,
      loading: null,
      loaded: false,
    };
  }

  const mediapipeGlobal = window.__smileIdentityMediapipe;
  // eslint-disable-next-line no-console
  console.log('[MediaPipe] Global state:', {
    loaded: mediapipeGlobal.loaded,
    hasInstance: !!mediapipeGlobal.instance,
    isLoading: !!mediapipeGlobal.loading,
  });

  if (mediapipeGlobal.loaded && mediapipeGlobal.instance) {
    // eslint-disable-next-line no-console
    console.log('[MediaPipe] ✅ Returning existing instance');
    return mediapipeGlobal.instance;
  }

  if (mediapipeGlobal.loading) {
    // eslint-disable-next-line no-console
    console.log('[MediaPipe] Waiting for existing loading promise');
    return mediapipeGlobal.loading;
  }

  // eslint-disable-next-line no-console
  console.log('[MediaPipe] Starting new initialization');
  mediapipeGlobal.loading = (async () => {
    try {
      // Check for iOS-specific issues
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      // eslint-disable-next-line no-console
      console.log('[MediaPipe] iOS device detected:', isIOS);

      if (isIOS) {
        // eslint-disable-next-line no-console
        console.log('[MediaPipe] Checking iOS-specific capabilities...');

        // Check if WebGL is available and working
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const gl2 = canvas.getContext('webgl2');

        // eslint-disable-next-line no-console
        console.log('[MediaPipe] WebGL context:', !!gl);
        // eslint-disable-next-line no-console
        console.log('[MediaPipe] WebGL2 context:', !!gl2);

        if (gl && 'getParameter' in gl) {
          const webGLContext = gl as WebGLRenderingContext;
          // eslint-disable-next-line no-console
          console.log(
            '[MediaPipe] WebGL vendor:',
            webGLContext.getParameter(webGLContext.VENDOR),
          );
          // eslint-disable-next-line no-console
          console.log(
            '[MediaPipe] WebGL renderer:',
            webGLContext.getParameter(webGLContext.RENDERER),
          );
        }

        // Check WebAssembly
        // eslint-disable-next-line no-console
        console.log('[MediaPipe] WebAssembly support:', !!window.WebAssembly);

        if (window.WebAssembly) {
          try {
            // Test WebAssembly instantiation
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            const wasmTest = new WebAssembly.Module(
              new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]),
            );
            // eslint-disable-next-line no-console
            console.log('[MediaPipe] WebAssembly module creation test: passed');
          } catch (wasmError) {
            console.error('[MediaPipe] WebAssembly test failed:', wasmError);
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log('[MediaPipe] Creating FilesetResolver for vision tasks...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://web-models.smileidentity.com/mediapipe-tasks-vision-wasm',
      );
      // eslint-disable-next-line no-console
      console.log('[MediaPipe] ✅ FilesetResolver created successfully');

      // eslint-disable-next-line no-console
      console.log('[MediaPipe] Creating FaceLandmarker...');

      // Try GPU delegate first, fallback to CPU for iOS if needed
      let faceLandmarker;
      try {
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 2,
        });
        // eslint-disable-next-line no-console
        console.log('[MediaPipe] ✅ FaceLandmarker created with GPU delegate');
      } catch (gpuError) {
        console.error('[MediaPipe] GPU delegate failed, trying CPU:', gpuError);

        // Fallback to CPU delegate
        try {
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
              delegate: 'CPU',
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 2,
          });
          // eslint-disable-next-line no-console
          console.log(
            '[MediaPipe] ✅ FaceLandmarker created with CPU delegate (fallback)',
          );
        } catch (cpuError) {
          console.error(
            '[MediaPipe] Both GPU and CPU delegates failed:',
            cpuError,
          );
          throw cpuError;
        }
      }

      // eslint-disable-next-line no-console
      console.log('[MediaPipe] ✅ FaceLandmarker created successfully');

      mediapipeGlobal.instance = faceLandmarker;
      mediapipeGlobal.loaded = true;
      mediapipeGlobal.loading = null;

      // eslint-disable-next-line no-console
      console.log('[MediaPipe] ✅ Full MediaPipe initialization completed');
      return faceLandmarker;
    } catch (error) {
      console.error('[MediaPipe] ❌ Initialization failed:', error);
      console.error('[MediaPipe] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      mediapipeGlobal.loading = null;
      throw error;
    }
  })();

  return mediapipeGlobal.loading;
};
