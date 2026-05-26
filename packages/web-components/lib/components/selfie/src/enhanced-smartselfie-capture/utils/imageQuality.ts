/**
 * Lightweight image quality checks used by the Enhanced SmartSelfie active
 * liveness flow. Both routines work on small ROIs so they can run inside the
 * face detection loop without noticeable cost.
 */

const SAMPLE_STEP = 4; // Sample every 4th pixel — keeps work to ~6% of full ROI.

/**
 * Average BT.601 luma (0–255) over a region of the video frame.
 *
 * @param video        live video element
 * @param region       optional normalised ROI (defaults to centre 60%)
 */
export const calculateLuminance = (
  video: HTMLVideoElement,
  region?: { x: number; y: number; width: number; height: number },
): number => {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return 0;

  const w = video.videoWidth;
  const h = video.videoHeight;
  const r = region ?? { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };

  const sx = Math.max(0, Math.floor(r.x * w));
  const sy = Math.max(0, Math.floor(r.y * h));
  const sw = Math.min(w - sx, Math.floor(r.width * w));
  const sh = Math.min(h - sy, Math.floor(r.height * h));
  if (sw <= 0 || sh <= 0) return 0;

  // Downsample heavily — 64x64 max — to keep this near-free.
  const targetSize = 64;
  const scale = Math.min(1, targetSize / Math.max(sw, sh));
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
  const { data } = ctx.getImageData(0, 0, dw, dh);

  let total = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4 * SAMPLE_STEP) {
    // BT.601 luma — same approximation OpenCV uses for cvtColor RGB→GRAY.
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    count += 1;
  }
  return count === 0 ? 0 : total / count;
};

/**
 * Estimate sharpness as the variance of a 3x3 Laplacian filter applied to the
 * grayscaled ROI. Higher = sharper. Empirically values < ~30 indicate
 * meaningful motion blur for a downsampled webcam frame.
 */
export const calculateBlurScore = (
  video: HTMLVideoElement,
  region?: { x: number; y: number; width: number; height: number },
): number => {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return 0;

  const w = video.videoWidth;
  const h = video.videoHeight;
  const r = region ?? { x: 0.25, y: 0.25, width: 0.5, height: 0.5 };

  const sx = Math.max(0, Math.floor(r.x * w));
  const sy = Math.max(0, Math.floor(r.y * h));
  const sw = Math.min(w - sx, Math.floor(r.width * w));
  const sh = Math.min(h - sy, Math.floor(r.height * h));
  if (sw <= 0 || sh <= 0) return 0;

  const targetSize = 96;
  const scale = Math.min(1, targetSize / Math.max(sw, sh));
  const dw = Math.max(3, Math.round(sw * scale));
  const dh = Math.max(3, Math.round(sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
  const { data } = ctx.getImageData(0, 0, dw, dh);

  // Convert to grayscale once.
  const gray = new Float32Array(dw * dh);
  for (let i = 0; i < gray.length; i += 1) {
    const o = i * 4;
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }

  // Variance of 3x3 Laplacian (skip 1-px border).
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < dh - 1; y += 1) {
    for (let x = 1; x < dw - 1; x += 1) {
      const i = y * dw + x;
      const lap =
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - dw] - gray[i + dw];
      sum += lap;
      sumSq += lap * lap;
      n += 1;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
};

export const DEFAULT_LUMINANCE_MIN = 85; // average luma below this = "too dark"
export const DEFAULT_BLUR_MIN = 80; // Laplacian variance below this = "too blurry"
