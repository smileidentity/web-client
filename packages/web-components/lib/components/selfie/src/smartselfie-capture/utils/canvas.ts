import { DrawingUtils, FaceLandmarker } from '@mediapipe/tasks-vision';

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
  const drawingUtils = new DrawingUtils(ctx);

  // use this if scaling is needed
  // const scaleFactor = Math.sqrt(canvasWidth * canvasHeight) / 500;

  landmarks.forEach((landmark) => {
    if (!landmark || landmark.length === 0) return;

    const outlineColor = 'rgba(162, 155, 254,0.4)';
    const lineWidth = 2; // Math.max(1, scaleFactor * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawingUtils.drawLandmarks(landmark, {
      color: 'rgba(9, 132, 227,0.7)',
      lineWidth: 0.5,
      radius: 0.5,
    });
    drawingUtils.drawConnectors(
      landmark,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      {
        color: outlineColor,
        lineWidth,
      },
    );

    const isInSmileZone = capturesTaken > 0 && capturesTaken >= smileCheckpoint;
    if (isInSmileZone) {
      drawingUtils.drawConnectors(
        landmark,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        {
          color: outlineColor,
          lineWidth,
        },
      );
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
