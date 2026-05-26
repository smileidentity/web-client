/**
 * Calculate the size of a face relative to the video frame.
 *
 * @param landmarks  MediaPipe face-landmark result
 * @param options.rotationStable  When true, also factors in the inter-eye
 *   distance (landmarks 33 and 263) and returns the largest of the three
 *   measures. Use this for active-liveness mode where the bounding-box
 *   height shrinks as the user pitches their head up and width shrinks as
 *   they yaw, both of which would otherwise trigger a false "too far".
 */
export const calculateFaceSize = (
  landmarks: any,
  options: { rotationStable?: boolean } = {},
): number => {
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
  let faceSize = Math.max(faceWidth, faceHeight);

  if (options.rotationStable) {
    const leftEye = face[33];
    const rightEye = face[263];
    if (leftEye && rightEye) {
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const eyeSpan = Math.sqrt(dx * dx + dy * dy);
      // Eye-corner span is ≈ 0.45 of face width on a frontal face. Scale up
      // so the value is comparable to the bbox-derived size and use the max
      // of the three measures — that way pitch (shrinks height) and yaw
      // (shrinks width) don't push the user into a "too far" state.
      faceSize = Math.max(faceSize, eyeSpan / 0.45);
    }
  }

  return faceSize;
};

/**
 * Check if a face is positioned within the oval bounds
 */
/**
 * Check if a face is positioned within the oval bounds.
 *
 * @param landmarks         MediaPipe face landmarks
 * @param videoAspectRatio  width / height of the source video
 * @param options.centerOnly  When true, only the face centre needs to fall
 *   inside the oval. Use this for active-liveness mode, where head rotation
 *   legitimately widens the bounding box and would otherwise fail the
 *   four-corner check.
 */
export const isFaceInBounds = (
  landmarks: any,
  videoAspectRatio: number,
  options: { centerOnly?: boolean } = {},
): boolean => {
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

  // In strict (Active Liveness) mode the bounding-box centre drifts as the
  // user yaws/pitches their head, which can falsely fail this check. Prefer
  // the nose tip (landmark 1) — it's anatomically stable. Keep the
  // tolerance tight so that obvious off-centre framing (face partly off the
  // oval edge) is still flagged.
  const noseTip = options.centerOnly ? face[1] : null;
  const centerX = noseTip ? noseTip.x : faceCenterX;
  const centerY = noseTip ? noseTip.y : faceCenterY;

  const centerTolerance = options.centerOnly ? 0.15 : 0.2;
  const centerOvalWidth = ovalWidth * (1 + centerTolerance);
  const centerOvalHeight = ovalHeight * (1 + centerTolerance);

  const checkPointInCenterOval = (x: number, y: number) => {
    const dx = (x - ovalCenterX) / centerOvalWidth;
    const dy = (y - ovalCenterY) / centerOvalHeight;
    return dx * dx + dy * dy <= 1;
  };
  const centerInBounds = checkPointInCenterOval(centerX, centerY);

  if (options.centerOnly) {
    // Strict mode: nose-tip must be centred AND the face bounding box must
    // not clip the oval edges. The four-corner check uses a slightly looser
    // tolerance than the non-strict case because head rotation legitimately
    // widens the bounding box, but we still want to reject framings where
    // a chunk of the face is outside the oval (e.g. ear or chin clipped).
    const strictBoundsToleranceX = 0.25;
    const strictBoundsToleranceY = 0.15;
    const strictOvalWidth = ovalWidth * (1 + strictBoundsToleranceX);
    const strictOvalHeight = ovalHeight * (1 + strictBoundsToleranceY);
    const checkPointInStrictOval = (x: number, y: number) => {
      const dx = (x - ovalCenterX) / strictOvalWidth;
      const dy = (y - ovalCenterY) / strictOvalHeight;
      return dx * dx + dy * dy <= 1;
    };
    const tl = checkPointInStrictOval(minX, minY);
    const tr = checkPointInStrictOval(maxX, minY);
    const bl = checkPointInStrictOval(minX, maxY);
    const br = checkPointInStrictOval(maxX, maxY);

    // Frame-edge clipping guard: if any side of the bounding box is hard
    // against the camera frame edge, part of the face is almost certainly
    // cut off (e.g. chin or forehead outside the visible video). The oval
    // check alone misses this because the oval extends most of the frame
    // height, so a face that fills the frame also fills the oval.
    const FRAME_EDGE_MARGIN = 0.03;
    const notClipped =
      minX > FRAME_EDGE_MARGIN &&
      minY > FRAME_EDGE_MARGIN &&
      maxX < 1 - FRAME_EDGE_MARGIN &&
      maxY < 1 - FRAME_EDGE_MARGIN;

    return centerInBounds && tl && tr && bl && br && notClipped;
  }

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
 * Detect whether the visible egg-shaped oval mask is clipping any part of
 * the face. Uses the actual rendered DOM rects of the <video> element and
 * its wrapper, so the result is always aligned with what the user sees,
 * regardless of the camera's intrinsic resolution or how the video is
 * cropped/positioned by CSS.
 *
 * The visible oval is approximated as a centred ellipse matching the SVG
 * ellipse drawn by OvalProgress (cx=155.5/311, cy=209/418, rx=153.5/311,
 * ry=207/418 — i.e. essentially fills the wrapper, inset by the 2px stroke).
 *
 * @returns true if any landmark falls outside the visible oval (i.e. the
 *          oval boundary is clipping the face), false otherwise.
 */
// Visible-oval geometry in wrapper-normalised coordinates. Kept in one place
// so the boolean check and the directional check below can't drift apart.
// Matches OvalProgress.tsx (rx≈0.494, ry≈0.495). A small inward inset gives
// us a hair of tolerance for landmark jitter so a face flush against the
// border doesn't flicker between clipping/not.
const OVAL_CX = 0.5;
const OVAL_CY = 0.5;
const OVAL_HALF_W = 0.49;
const OVAL_HALF_H = 0.49;

interface ProjectedOval {
  videoRect: DOMRect;
  wrapperRect: DOMRect;
  /** Top-left of the centre-cropped square within wrapper-pixel coords. */
  cropLeftInWrapper: number;
  cropTopInWrapper: number;
  /** Side length of the centre-cropped square in wrapper-pixel coords. */
  cropSize: number;
}

const projectOval = (videoEl: HTMLVideoElement): ProjectedOval | null => {
  const wrapper = videoEl.parentElement?.parentElement;
  if (!wrapper) return null;
  const videoRect = videoEl.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();
  if (
    videoRect.width <= 0 ||
    videoRect.height <= 0 ||
    wrapperRect.width <= 0 ||
    wrapperRect.height <= 0
  ) {
    return null;
  }
  // Detection runs on a centre-cropped SQUARE of the source video (see
  // createCroppedVideoFrame). Landmark coords are normalised to that
  // square's [0,1]² space, NOT the full video — so we need the crop's
  // rendered position and size to project them onto the wrapper.
  const cropSize = Math.min(videoRect.width, videoRect.height);
  const cropLeftInWrapper =
    videoRect.left - wrapperRect.left + (videoRect.width - cropSize) / 2;
  const cropTopInWrapper =
    videoRect.top - wrapperRect.top + (videoRect.height - cropSize) / 2;
  return {
    videoRect,
    wrapperRect,
    cropLeftInWrapper,
    cropTopInWrapper,
    cropSize,
  };
};

export const computeFaceClippingOval = (
  face: any,
  videoEl: HTMLVideoElement | null,
): boolean => {
  if (!face || face.length === 0 || !videoEl) return false;
  const proj = projectOval(videoEl);
  if (!proj) return false;

  for (let i = 0; i < face.length; i += 1) {
    const lm = face[i];
    const renderedX = proj.cropLeftInWrapper + lm.x * proj.cropSize;
    const renderedY = proj.cropTopInWrapper + lm.y * proj.cropSize;
    const nx = renderedX / proj.wrapperRect.width;
    const ny = renderedY / proj.wrapperRect.height;
    const dx = (nx - OVAL_CX) / OVAL_HALF_W;
    const dy = (ny - OVAL_CY) / OVAL_HALF_H;
    if (dx * dx + dy * dy > 1) {
      return true;
    }
  }
  return false;
};

/**
 * Like {@link computeFaceClippingOval} but returns which side of the visible
 * oval is being clipped (or null when the face is fully inside).
 *
 * Side is derived from the FACE BOUNDING-BOX CENTRE relative to the oval
 * centre — using the worst single landmark flips between left/right ear on
 * symmetric clips (the user sees the prompt ping-pong every frame). The
 * bbox centre moves slowly and points consistently in one direction.
 *
 * Mirroring: the preview is CSS-mirrored (scaleX(-1)). A face whose source
 * centre has x<0.5 appears on screen-RIGHT, so we report 'right' to nudge
 * the device in the correct direction in the mirrored preview.
 */
export const computeFaceClippingSide = (
  face: any,
  videoEl: HTMLVideoElement | null,
): 'top' | 'right' | 'bottom' | 'left' | null => {
  if (!face || face.length === 0 || !videoEl) return null;
  const proj = projectOval(videoEl);
  if (!proj) return null;

  // First pass: are we actually clipping? Same test as
  // computeFaceClippingOval — keep it inline to avoid two DOM reads.
  let clipping = false;
  let minNx = Infinity;
  let maxNx = -Infinity;
  let minNy = Infinity;
  let maxNy = -Infinity;
  for (let i = 0; i < face.length; i += 1) {
    const lm = face[i];
    const renderedX = proj.cropLeftInWrapper + lm.x * proj.cropSize;
    const renderedY = proj.cropTopInWrapper + lm.y * proj.cropSize;
    const nx = renderedX / proj.wrapperRect.width;
    const ny = renderedY / proj.wrapperRect.height;
    if (nx < minNx) minNx = nx;
    if (nx > maxNx) maxNx = nx;
    if (ny < minNy) minNy = ny;
    if (ny > maxNy) maxNy = ny;
    if (!clipping) {
      const dx = (nx - OVAL_CX) / OVAL_HALF_W;
      const dy = (ny - OVAL_CY) / OVAL_HALF_H;
      if (dx * dx + dy * dy > 1) clipping = true;
    }
  }
  if (!clipping) return null;

  // Direction from bbox centre to oval centre, ellipse-normalised so the
  // dominant axis comparison is fair (the oval isn't quite a circle).
  const centreNx = (minNx + maxNx) / 2;
  const centreNy = (minNy + maxNy) / 2;
  const dx = (centreNx - OVAL_CX) / OVAL_HALF_W;
  const dy = (centreNy - OVAL_CY) / OVAL_HALF_H;

  // Hysteresis-friendly axis pick: require horizontal lead over vertical
  // by a clear margin before reporting left/right. Prevents axis flicker
  // when |dx| ≈ |dy| (e.g. face nudged into a corner).
  const AXIS_MARGIN = 1.2;
  const horizontalDominant = Math.abs(dx) > Math.abs(dy) * AXIS_MARGIN;
  const verticalDominant = Math.abs(dy) > Math.abs(dx) * AXIS_MARGIN;

  if (horizontalDominant) {
    // Mirror: source-left (dx<0) appears on screen-right.
    return dx < 0 ? 'right' : 'left';
  }
  if (verticalDominant) {
    return dy < 0 ? 'top' : 'bottom';
  }
  // Mixed corner clip — pick by raw magnitude as a tiebreak.
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx < 0 ? 'right' : 'left';
  }
  return dy < 0 ? 'top' : 'bottom';
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

/**
 * Discrete head-pose direction used by the active liveness state machine.
 */
export type HeadPoseDirection = 'left' | 'right' | 'up';

export interface HeadPoseAngles {
  /** Left/right rotation in degrees. Negative = subject's left, positive = subject's right. */
  yaw: number;
  /**
   * Vertical tilt as a signed ratio (×100 so it reads like degrees).
   * Positive = looking up, negative = looking down, ~0 = neutral.
   *
   * Derived from the nose tip's vertical position between the forehead and
   * chin landmarks, which is a stable 2D measure independent of z noise.
   */
  pitch: number;
  /** Side-to-side tilt in degrees. */
  roll: number;
}

/**
 * Estimate head pose (yaw/pitch/roll) from MediaPipe face landmarks.
 *
 * Uses a small set of stable landmarks rather than full PnP solving so it
 * stays cheap enough to run every detection frame on the main thread.
 *
 * Landmark indices (MediaPipe FaceLandmarker, 478-point model):
 *   1   - nose tip
 *   10  - forehead (top of face oval)
 *   33  - left eye outer corner
 *   152 - chin (bottom of face oval)
 *   263 - right eye outer corner
 *   207 - left cheek
 *   426 - right cheek
 */
export const calculateHeadPose = (landmarks: any): HeadPoseAngles | null => {
  if (!landmarks || landmarks.length === 0) return null;
  const face = landmarks[0];
  if (!face || face.length < 427) return null;

  const noseTip = face[1];
  const leftEye = face[33];
  const rightEye = face[263];
  const leftCheek = face[207];
  const rightCheek = face[426];
  const forehead = face[10];
  const chin = face[152];

  if (
    !noseTip ||
    !leftEye ||
    !rightEye ||
    !leftCheek ||
    !rightCheek ||
    !forehead ||
    !chin
  ) {
    return null;
  }

  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  // Yaw: relative depth of cheeks. When facing forward, both cheeks have
  // similar z; turning right pushes the right cheek away (more positive z in
  // MediaPipe's coordinate system) while the left cheek comes forward.
  const yaw = toDeg(
    Math.atan2(rightCheek.z - leftCheek.z, rightCheek.x - leftCheek.x),
  );

  // Pitch: where the nose sits vertically between the forehead (top) and chin
  // (bottom). Neutral ≈ 0.5; tilting up pushes the nose toward the forehead
  // (ratio < 0.5) so we negate to make "up" positive. Multiplied by 100 to
  // keep numbers in a similar order of magnitude as yaw/roll degrees.
  const faceHeight = chin.y - forehead.y;
  let pitch = 0;
  if (faceHeight > 0) {
    const ratio = (noseTip.y - forehead.y) / faceHeight;
    pitch = (0.5 - ratio) * 100;
  }

  // Roll: in-plane tilt between the two eye corners.
  const roll = toDeg(
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
  );

  return { yaw, pitch, roll };
};

/**
 * Classify head-pose angles into a discrete required-pose direction.
 *
 * Strict-mode prompts the user for one of: turn left, turn right, tilt slightly
 * up. Yaw thresholds favour deliberate rotation (~25°); pitch threshold (~6)
 * corresponds to roughly the nose moving 6% of face-height toward the
 * forehead, which is a noticeable but comfortable upward tilt.
 *
 * The "up" classification only fires when yaw is small, so a sideways turn
 * doesn't accidentally satisfy the up prompt.
 */
export const classifyHeadPose = (
  pose: HeadPoseAngles | null,
  thresholds: { yawSide?: number; yawNeutral?: number; pitchUp?: number } = {},
): HeadPoseDirection | null => {
  if (!pose) return null;

  const yawSide = thresholds.yawSide ?? 25;
  const yawNeutral = thresholds.yawNeutral ?? 20;
  // Raised from 3 → 7 so the "up" match requires a deliberate tilt rather
  // than the ~3% nose-shift that resting posture/breathing produces. At 3
  // the prompt was registering as matched almost instantly, making the
  // gesture feel abrupt; 7 lines its perceived effort up with the yaw side
  // turns (which require a clearly intentional movement).
  const pitchUp = thresholds.pitchUp ?? 7;

  if (pose.yaw <= -yawSide) return 'right';
  if (pose.yaw >= yawSide) return 'left';
  if (Math.abs(pose.yaw) <= yawNeutral && pose.pitch >= pitchUp) return 'up';
  return null;
};

/**
 * Build the pose sequence for an active-liveness session.
 *
 * Randomised order across {left, right, up} to mirror the mobile SDKs and
 * make the active-liveness challenge harder to pre-record. Any leftover
 * frames in the capture window are taken silently while the user is neutral
 * before the first pose prompt — see `useFaceCapture` for that logic.
 */
export const buildRandomPoseSequence = (): HeadPoseDirection[] => {
  const poses: HeadPoseDirection[] = ['left', 'right', 'up'];
  // Fisher–Yates shuffle.
  for (let i = poses.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [poses[i], poses[j]] = [poses[j], poses[i]];
  }
  return poses;
};
