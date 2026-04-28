/**
 * Lazy-load the OpenCV.js runtime exactly once. Resolves when `cv.Mat` is
 * available (the runtime initialises asynchronously after the script loads).
 *
 * Hosts that already include opencv.js via a <script> tag will short-circuit
 * — calling this function is a no-op once `window.cv.Mat` is defined.
 */
const OPENCV_SRC = 'https://docs.opencv.org/4.8.0/opencv.js';

declare global {
  interface Window {
    cv?: { Mat?: unknown } & Record<string, unknown>;
  }
}

let inflight: Promise<void> | null = null;

function isReady(): boolean {
  return typeof window !== 'undefined' && !!window.cv && !!window.cv.Mat;
}

export function ensureOpenCv(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (isReady()) return Promise.resolve();
  if (inflight) return inflight;

  inflight = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[data-opencv-loader], script[src="${OPENCV_SRC}"]`,
    );

    const waitForRuntime = () => {
      if (isReady()) {
        resolve();
        return;
      }
      // opencv.js sets a `Module.onRuntimeInitialized` hook; fall back to polling
      // because some hosts replace the global Module object before we can patch it.
      const start = Date.now();
      const poll = () => {
        if (isReady()) {
          resolve();
          return;
        }
        if (Date.now() - start > 30_000) {
          reject(new Error('OpenCV runtime did not initialise within 30s'));
          return;
        }
        setTimeout(poll, 100);
      };
      poll();
    };

    if (existing) {
      waitForRuntime();
      return;
    }

    const script = document.createElement('script');
    script.src = OPENCV_SRC;
    script.async = true;
    script.dataset.opencvLoader = 'document-auto-capture';
    script.onload = waitForRuntime;
    script.onerror = () => reject(new Error('Failed to load opencv.js'));
    document.head.appendChild(script);
  });

  return inflight;
}
