/**
 * Lazy-load the OpenCV.js runtime exactly once. Resolves when `cv.Mat` is
 * available (the runtime initialises asynchronously after the script loads).
 *
 * Hosts that already include opencv.js via a <script> tag will short-circuit
 * — calling this function is a no-op once `window.cv.Mat` is defined.
 */
const OPENCV_SRC = 'https://docs.opencv.org/4.8.0/opencv.js';
// SRI hash pinned to the 4.8.0 build. If the CDN serves a different payload
// the browser will refuse to execute it. Recompute when upgrading:
//   curl -sL https://docs.opencv.org/4.8.0/opencv.js | openssl dgst -sha384 -binary | openssl base64 -A
const OPENCV_INTEGRITY =
  'sha384-kEC+2KaGZ4b+M4g8HgCNH9N+2TfOMWcNR6Ttw3mclO4ppnH1tX4Xgl9jwfowxoxM';

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

  const pending = new Promise<void>((resolve, reject) => {
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
        // Matches the 20s readiness window in useCardDetection (cvLoadFailed)
        // and the documented behaviour — past this point the component has
        // already surfaced the manual-capture fallback, so waiting longer is
        // pointless.
        if (Date.now() - start > 20_000) {
          reject(new Error('OpenCV runtime did not initialise within 20s'));
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
    script.crossOrigin = 'anonymous';
    if (OPENCV_INTEGRITY) script.integrity = OPENCV_INTEGRITY;
    script.dataset.opencvLoader = 'document-auto-capture';
    script.onload = waitForRuntime;
    script.onerror = () => reject(new Error('Failed to load opencv.js'));
    document.head.appendChild(script);
  });

  // Clear the cached promise on failure (load error / init timeout) so a later
  // call can retry instead of getting the same rejected promise forever.
  pending.catch(() => {
    if (inflight === pending) inflight = null;
  });

  inflight = pending;
  return pending;
}
