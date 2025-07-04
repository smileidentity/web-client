// Face mesh landmark indices for key features
const FACE_OUTLINE = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

const MOUTH_OUTER = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37,
  39, 40, 185,
];

const MOUTH_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87,
  178, 88, 95,
];

/**
 * Create a cropped square canvas from video for face detection
 */
export const createCroppedVideoFrame = (
  videoElement: HTMLVideoElement,
): HTMLCanvasElement | null => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const sourceWidth = videoElement.videoWidth;
  const sourceHeight = videoElement.videoHeight;

  const squareSize = Math.min(sourceWidth, sourceHeight);
  const cropX = (sourceWidth - squareSize) / 2;
  const cropY = (sourceHeight - squareSize) / 2;

  canvas.width = squareSize;
  canvas.height = squareSize;

  ctx.drawImage(
    videoElement,
    cropX,
    cropY,
    squareSize,
    squareSize,
    0,
    0,
    squareSize,
    squareSize,
  );

  return canvas;
};

/**
 * Draw face mesh overlay on canvas
 */
export const drawFaceMesh = (
  canvas: HTMLCanvasElement,
  landmarks: any[],
  capturesTaken: number,
  smileCheckpoint: number,
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const scaleFactor = Math.sqrt(canvasWidth * canvasHeight) / 500;

  landmarks.forEach((landmark) => {
    if (!landmark || landmark.length === 0) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = Math.max(1, 2 * scaleFactor);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawConnectedPoints = (points: number[], closed: boolean = false) => {
      if (points.length < 2) return;

      ctx.beginPath();
      const firstPoint = landmark[points[0]];
      if (!firstPoint) return;

      ctx.moveTo(firstPoint.x * canvasWidth, firstPoint.y * canvasHeight);

      for (let i = 1; i < points.length; i++) {
        const point = landmark[points[i]];
        if (point) {
          ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight);
        }
      }

      if (closed && points.length > 2) {
        ctx.closePath();
      }

      ctx.stroke();
    };

    drawConnectedPoints(FACE_OUTLINE, true);

    const isInSmileZone = capturesTaken > 0 && capturesTaken >= smileCheckpoint;
    if (isInSmileZone) {
      drawConnectedPoints(MOUTH_OUTER, true);
      drawConnectedPoints(MOUTH_INNER, true);
    }
  });
};

/**
 * Clear canvas completely
 */
export const clearCanvas = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
