import { useEffect, useRef } from 'preact/hooks';
import type { FunctionComponent } from 'preact';
// dotLottie-web renders .lottie packages onto a <canvas>. The animation
// payloads are base64-inlined at build time (see vite.config.ts) so the
// distributable bundle remains a single file and no sibling asset hosting
// is required of consumers.
import { DotLottie } from '@lottiefiles/dotlottie-web';
import type { HeadPoseDirection } from '../utils/faceDetection';
import activeLivenessSrc from '../assets/active_liveness_animation.lottie';
import tooDarkSrc from '../assets/too_dark_animation.lottie';
import deviceOrientationSrc from '../assets/device_orientation.lottie';

interface ActiveLivenessOverlayProps {
  /** Currently required pose (drives which segment plays). */
  pose: HeadPoseDirection | null;
  /**
   * The user's currently classified head pose. When this matches the
   * required `pose`, the overlay tints green to confirm the turn was
   * successful. The animation itself keeps playing as normal.
   */
  currentPose?: HeadPoseDirection | null;
  /** When true, swap to the "too dark" animation to prompt better lighting. */
  isTooDark?: boolean;
  /**
   * When true, swap to the "rotate device" animation. Takes precedence over
   * `isTooDark` and `pose` because the user can't make progress on any other
   * check until they rotate the device back to portrait.
   */
  isLandscape?: boolean;
}

/**
 * Per-pose frame ranges split by match state. The bundled .lottie was
 * authored with two sibling layers for each direction — `arrow N` (gray)
 * and `arrow - green N` — staggered so the green takes over later in the
 * segment. We exploit that by scrubbing to the gray-only sub-range while
 * the user is still being prompted (`pending`) and jumping to the
 * green-only sub-range the moment the user's head pose matches the
 * required direction (`matched`). This keeps the head/circle base art in
 * its native colours and avoids tinting the whole canvas via CSS filters.
 *
 * Source ranges (layer ip/op from the lottie JSON):
 *   left  – gray  1-112 | green  42-106
 *   right – gray 139-183 | green 180-241
 *   up    – gray 277-321 | green 318-380
 *
 * The user-facing selfie preview is mirrored, so the on-screen arrows
 * automatically appear flipped relative to the prompt label — no extra
 * direction mapping needed here.
 */
const POSE_FRAME_RANGES: Record<
  HeadPoseDirection,
  { pending: [number, number]; matched: [number, number] }
> = {
  left: { pending: [1, 41], matched: [42, 106] },
  right: { pending: [139, 179], matched: [180, 241] },
  up: { pending: [277, 317], matched: [318, 380] },
};

/**
 * Translucent face overlay shown during Enhanced SmartSelfie capture.
 *
 * - Anchored to the centre of the camera oval.
 * - 75% opacity so the user's actual face remains visible underneath.
 * - Plays the segment matching the currently-required head pose; segments
 *   loop until the pose changes.
 */
export const ActiveLivenessOverlay: FunctionComponent<
  ActiveLivenessOverlayProps
> = ({ pose, currentPose = null, isTooDark = false, isLandscape = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<DotLottie | null>(null);
  // Track which .lottie source is currently loaded so we only rebuild the
  // player when actually switching between the pose and too-dark variants.
  const loadedVariantRef = useRef<'pose' | 'too-dark' | 'orientation' | null>(
    null,
  );

  // Green tint applies only when the user's live head pose matches the
  // required prompt — reserved for an actual successful turn, not for the
  // canned guidance loop.
  const matched = !!pose && !!currentPose && pose === currentPose;

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const variant: 'pose' | 'too-dark' | 'orientation' = (() => {
      if (isLandscape) return 'orientation';
      if (isTooDark) return 'too-dark';
      return 'pose';
    })();
    if (loadedVariantRef.current === variant && animRef.current) {
      return undefined;
    }

    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
    }

    // Initial segment for the freshly-built player. `pose` uses the prompt
    // range (gray sub-range, since a fresh build can't yet be `matched`);
    // `too-dark` and `orientation` play their full timeline as a single
    // looping animation.
    const initialSegment = (() => {
      if (variant === 'pose' && pose) return POSE_FRAME_RANGES[pose].pending;
      return undefined;
    })();
    const src = (() => {
      if (variant === 'orientation') return deviceOrientationSrc;
      if (variant === 'too-dark') return tooDarkSrc;
      return activeLivenessSrc;
    })();
    const anim = new DotLottie({
      canvas: canvasRef.current,
      src,
      loop: true,
      autoplay: true,
      ...(initialSegment ? { segment: initialSegment } : {}),
      renderConfig: { autoResize: true },
    });
    animRef.current = anim;
    loadedVariantRef.current = variant;

    return () => {
      anim.destroy();
      animRef.current = null;
      loadedVariantRef.current = null;
    };
  }, [isTooDark, isLandscape]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim || isTooDark || isLandscape) return;

    if (pose) {
      const ranges = POSE_FRAME_RANGES[pose];
      const [start, end] = matched ? ranges.matched : ranges.pending;
      // setSegment scopes playback to the new range; play() ensures the
      // animation resumes if it had completed/stopped between transitions.
      anim.setSegment(start, end);
      anim.play();
    } else {
      anim.resetSegment();
      anim.play();
    }
  }, [pose, matched, isTooDark]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="active-liveness-overlay"
        aria-hidden="true"
      />
      <style>{`
        .active-liveness-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          aspect-ratio: 1;
          pointer-events: none;
          opacity: 0.75;
          z-index: 2;
          /* Canvas elements default to inline; force block so width/height
             driven by CSS apply cleanly. */
          display: block;
          /* No colour filters: the lottie asset already paints arrows in
             their correct colours (gray during the pending sub-range,
             green during the matched sub-range). The face/circle base art
             keeps its native palette. */
        }
      `}</style>
    </>
  );
};

export default ActiveLivenessOverlay;
