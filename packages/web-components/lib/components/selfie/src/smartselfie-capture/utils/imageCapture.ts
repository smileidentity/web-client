export const captureImageFromVideo = (
  videoElement: HTMLVideoElement,
  isReference: boolean = false,
): string | null => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (isReference) {
    canvas.width = 640;
    canvas.height = 480;
  } else {
    canvas.width = 320;
    canvas.height = 240;
  }

  // capture more of the user's head and avoid clipping
  const zoomOutFactor = 1.3;
  const sourceWidth = videoElement.videoWidth * zoomOutFactor;
  const sourceHeight = videoElement.videoHeight * zoomOutFactor;

  // center the zoomed out area
  const offsetX = (sourceWidth - videoElement.videoWidth) / 2;
  const offsetY = (sourceHeight - videoElement.videoHeight) / 2;

  // vertical offset to shift up and capture full head
  const verticalOffset = videoElement.videoHeight * 0.05;

  ctx.drawImage(
    videoElement,
    -offsetX,
    -offsetY - verticalOffset,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas.toDataURL('image/jpeg');
};
