/**
 * Lazy-load the OpenCV.js runtime exactly once. Resolves when `cv.Mat` is
 * available (the runtime initialises asynchronously after the script loads).
 *
 * Hosts that already include opencv.js via a <script> tag will short-circuit
 * — calling this function is a no-op once `window.cv.Mat` is defined.
 */
const OPENCV_SRC =
  'https://web-models.smileidentity.com/open-cv/4.8.0-opencv.min.js';

declare global {
  interface Window {
    cv?: { Mat?: unknown } & Record<string, unknown>;
  }
}

let inflight: Promise<void> | null = null;

// `typeof window === 'undefined'` covers server-side rendering hosts
// (React + Next.js, Remix, Astro, etc.) that import the bundle on the
// server during page generation. There's nothing to load there — the
// browser will run this again on hydration.
function isReady(): boolean {
  return typeof window !== 'undefined' && !!window.cv && !!window.cv.Mat;
}

export function ensureOpenCv(): Promise<void> {
  // SSR no-op (see isReady above).
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
