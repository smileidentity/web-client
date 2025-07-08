export const captureImageFromVideo = (
  videoElement: HTMLVideoElement,
  isReference: boolean = false,
): string | null => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isPortrait = videoElement.videoHeight > videoElement.videoWidth;

  if (isReference) {
    if (isPortrait) {
      canvas.width = 480;
      canvas.height = Math.max(
        640,
        (canvas.width * videoElement.videoHeight) / videoElement.videoWidth,
      );
    } else {
      canvas.width = 640;
      canvas.height = Math.max(
        480,
        (canvas.width * videoElement.videoHeight) / videoElement.videoWidth,
      );
    }
  } else if (isPortrait) {
    canvas.width = 240;
    canvas.height = Math.max(
      320,
      (canvas.width * videoElement.videoHeight) / videoElement.videoWidth,
    );
  } else {
    canvas.width = 320;
    canvas.height = Math.max(
      240,
      (canvas.width * videoElement.videoHeight) / videoElement.videoWidth,
    );
  }

  // capture more of the user's head and avoid clipping
  // zoom out only for high resolution (>720p) webcams
  const zoomOutFactor = videoElement.videoHeight > 720 ? 1.3 : 1.0;
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
