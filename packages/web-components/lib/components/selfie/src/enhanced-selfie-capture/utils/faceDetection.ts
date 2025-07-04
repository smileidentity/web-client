/**
 * Calculate the size of a face relative to the video frame
 */
export const calculateFaceSize = (landmarks: any): number => {
  if (!landmarks || landmarks.length === 0) return 0;

  const face = landmarks[0];

  if (!face || face.length === 0) return 0;

  // Get bounding box of face landmarks
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  face.forEach((landmark: any) => {
    if (
      landmark &&
      typeof landmark.x === 'number' &&
      typeof landmark.y === 'number'
    ) {
      minX = Math.min(minX, landmark.x);
      maxX = Math.max(maxX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
    }
  });

  // Calculate face size as percentage of video area
  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  const faceSize = Math.max(faceWidth, faceHeight);

  return faceSize;
};

/**
 * Check if a face is positioned within the oval bounds
 */
export const isFaceInBounds = (landmarks: any, videoAspectRatio: number): boolean => {
  if (!landmarks || landmarks.length === 0) return false;

  const face = landmarks[0];

  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;
  face.forEach((landmark: any) => {
    minX = Math.min(minX, landmark.x);
    maxX = Math.max(maxX, landmark.x);
    minY = Math.min(minY, landmark.y);
    maxY = Math.max(maxY, landmark.y);
  });

  const ovalCenterX = 0.5;
  const ovalCenterY = 0.6;

  const isLandscape = videoAspectRatio > 1;
  let ovalWidth;
  let ovalHeight;
  if (isLandscape) {
    ovalWidth = 0.4;
    ovalHeight = 0.3;
  } else {
    ovalWidth = 0.35;
    ovalHeight = 0.5;
  }

  const faceCenterX = (minX + maxX) / 2;
  const faceCenterY = (minY + maxY) / 2;

  const centerTolerance = 0.2;
  const centerOvalWidth = ovalWidth * (1 + centerTolerance);
  const centerOvalHeight = ovalHeight * (1 + centerTolerance);

  const checkPointInCenterOval = (x: number, y: number) => {
    const dx = (x - ovalCenterX) / centerOvalWidth;
    const dy = (y - ovalCenterY) / centerOvalHeight;
    return dx * dx + dy * dy <= 1;
  };
  const centerInBounds = checkPointInCenterOval(faceCenterX, faceCenterY);

  const toleranceX = 0.2;
  const toleranceY = 0.1;
  const adjustedOvalWidth = ovalWidth * (1 + toleranceX);
  const adjustedOvalHeight = ovalHeight * (1 + toleranceY);

  const checkPointInExpandedOval = (x: number, y: number) => {
    const dx = (x - ovalCenterX) / adjustedOvalWidth;
    const dy = (y - ovalCenterY) / adjustedOvalHeight;
    return dx * dx + dy * dy <= 1;
  };

  const topLeft = checkPointInExpandedOval(minX, minY);
  const topRight = checkPointInExpandedOval(maxX, minY);
  const bottomLeft = checkPointInExpandedOval(minX, maxY);
  const bottomRight = checkPointInExpandedOval(maxX, maxY);

  return centerInBounds && topLeft && topRight && bottomLeft && bottomRight;
};

/**
 * Calculate mouth opening using face landmarks
 */
export const calculateMouthOpening = (landmarks: any): number => {
  if (!landmarks || landmarks.length === 0) return 0;

  const face = landmarks[0];
  if (!face || face.length === 0) return 0;

  // MediaPipe face landmark indices for mouth
  const upperLipCenter = face[13]; // Upper lip center
  const lowerLipCenter = face[14]; // Lower lip center

  if (!upperLipCenter || !lowerLipCenter) return 0;

  const mouthHeight = Math.abs(lowerLipCenter.y - upperLipCenter.y);

  const faceTop = Math.min(...face.map((p: any) => p.y));
  const faceBottom = Math.max(...face.map((p: any) => p.y));
  const faceHeight = faceBottom - faceTop;

  return faceHeight > 0 ? mouthHeight / faceHeight : 0;
};
