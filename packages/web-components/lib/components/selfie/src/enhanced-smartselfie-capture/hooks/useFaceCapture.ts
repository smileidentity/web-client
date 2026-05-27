import { useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import type { RefObject } from 'preact';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import throttle from 'lodash/throttle';
import {
  calculateFaceSize,
  isFaceInBounds,
  computeFaceClippingOval,
  computeFaceClippingSide,
  calculateMouthOpening,
  calculateHeadPose,
  classifyHeadPose,
  buildRandomPoseSequence,
  type HeadPoseDirection,
} from '../utils/faceDetection';
import {
  calculateLuminance,
  calculateBlurScore,
  DEFAULT_LUMINANCE_MIN,
  DEFAULT_BLUR_MIN,
} from '../utils/imageQuality';
import {
  createCroppedVideoFrame,
  drawFaceMesh,
  clearCanvas,
} from '../utils/canvas';
import { captureImageFromVideo } from '../utils/imageCapture';
import { ImageType } from '../constants';
import { MESSAGES, type MessageKey } from '../utils/alertMessages';
import { getMediapipeInstance } from '../utils/mediapipeManager';
import { t } from '../../../../../domain/localisation';
import packageJson from '../../../../../../package.json';

const COMPONENTS_VERSION = packageJson.version;

interface UseFaceCaptureProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  interval: number;
  duration: number;
  smileThreshold: number;
  mouthOpenThreshold: number;
  minFaceSize: number;
  maxFaceSize: number;
  smileCooldown: number;
  getFacingMode: () => CameraFacingMode;
  /**
   * Enhanced SmartSelfie / Active Liveness mode. When enabled, the smile-based
   * capture flow is replaced with a randomised head-pose sequence and stricter
   * frame-quality checks (lighting/blur/centering).
   */
  useStrictMode?: boolean;
  /**
   * Optional callback invoked when capture completes. When provided, the hook
   * will NOT broadcast the legacy `selfie-capture.publish` window event — the
   * caller takes full ownership of the payload (e.g. to show its own review
   * screen and re-emit the event only on user confirmation).
   */
  onCaptureComplete?: (detail: {
    images: { image: string; image_type_id: number }[];
    referenceImage: string;
    previewImage: string;
    facingMode: CameraFacingMode;
    forceFailureReason?: string;
    meta: { libraryVersion: string };
  }) => void;
}

export const useFaceCapture = ({
  videoRef,
  canvasRef,
  interval,
  duration,
  smileThreshold,
  mouthOpenThreshold,
  minFaceSize,
  maxFaceSize,
  smileCooldown,
  getFacingMode,
  useStrictMode = false,
  onCaptureComplete,
}: UseFaceCaptureProps) => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeCaptureRef = useRef<(() => void) | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const faceDetected = useSignal(false);
  const faceInBounds = useSignal(false);
  // True when any landmark falls outside the visible egg-shaped clip mask.
  // Computed from runtime DOM rects so it always matches what the user sees,
  // independent of the camera's intrinsic resolution. Only used as a gating
  // edge case when idle — during the active-liveness pose phase head turns
  // legitimately push landmarks past the oval edge.
  const faceClippingOval = useSignal(false);
  const faceProximity = useSignal<'too-close' | 'too-far' | 'good'>('good');
  const videoAspectRatio = useSignal(16 / 9);
  const faceLandmarks = useSignal<any[]>([]);
  const currentSmileScore = useSignal(0);
  const currentFaceSize = useSignal(0);
  const currentMouthOpen = useSignal(0);
  const lastSmileTime = useSignal(0);
  const alertTitle = useSignal('');
  const isInitializing = useSignal(true);
  const captureButtonFallbackEnabled = useSignal(false);

  const isCapturing = useSignal(false);
  const isPaused = useSignal(false);
  const countdown = useSignal(0);
  const capturedImages = useSignal<string[]>([]);
  const referencePhoto = useSignal<string | null>(null);
  const totalCaptures = useSignal(1);
  const capturesTaken = useSignal(0);
  const hasFinishedCapture = useSignal(false);

  // Active-liveness (Enhanced SmartSelfie) signals — only meaningful when
  // useStrictMode is true.
  const poseSequence = useSignal<HeadPoseDirection[]>([]);
  const currentPoseIndex = useSignal(0);
  const currentPose = useSignal<HeadPoseDirection | null>(null);
  const isTooDark = useSignal(false);
  const isTooBlurry = useSignal(false);
  // Direction the face is offset from the oval centre when out of bounds.
  // Used by the UI to colour the offending side of the oval and pick a
  // directional prompt ("Move your device higher/lower/left/right").
  const faceOffsetDirection = useSignal<
    'top' | 'bottom' | 'left' | 'right' | null
  >(null);
  let qualityFrameCounter = 0;

  const smileCheckpoint = useComputed(() =>
    Math.floor(totalCaptures.value * 0.4),
  );
  const neutralZone = useComputed(() => Math.floor(totalCaptures.value * 0.2));

  const isReadyToCapture = useComputed(
    () =>
      faceDetected.value &&
      faceInBounds.value &&
      faceProximity.value === 'good',
  );

  const updateAlertImmediate = (messageKey: MessageKey | null) => {
    if (messageKey && MESSAGES[messageKey]) {
      alertTitle.value = MESSAGES[messageKey]?.();
    } else {
      alertTitle.value = '';
    }
  };

  const updateAlert = useRef(
    throttle((messageKey: MessageKey | null) => {
      updateAlertImmediate(messageKey);
    }, 600),
  ).current;

  const CAPTURE_FALLBACK_TIMEOUT_MS = 10000;

  const startFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    fallbackTimerRef.current = setTimeout(() => {
      if (!isReadyToCapture.value) {
        captureButtonFallbackEnabled.value = true;
      }
    }, CAPTURE_FALLBACK_TIMEOUT_MS);
  };

  const initializeFaceLandmarker = async () => {
    try {
      const isAlreadyLoaded =
        window.__smileIdentityMediapipe?.loaded &&
        window.__smileIdentityMediapipe?.instance;

      if (!isAlreadyLoaded) {
        isInitializing.value = true;
        updateAlertImmediate('initializing');
      }

      faceLandmarkerRef.current = await getMediapipeInstance();
      isInitializing.value = false;
      startFallbackTimer();
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      isInitializing.value = false;
      // MediaPipe failed — start the fallback timer so the button eventually
      // enables and the user isn't permanently stuck.
      startFallbackTimer();
    }
  };

  const setupCanvas = () => {
    if (videoRef.current && canvasRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;

      videoAspectRatio.value = videoWidth / videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const container = videoRef.current.parentElement;
      if (container) {
        canvasRef.current.style.left = '50%';
        canvasRef.current.style.top = '50%';
      }
    }
  };

  const updateCaptureAlerts = () => {
    if (useStrictMode) {
      // Strict-mode capture alerts are driven by head-pose prompts. The active
      // pose label is derived from the randomised sequence; we don't fall back
      // to the smile-zone messaging at all.
      const pose = poseSequence.value[currentPoseIndex.value];
      if (!pose) {
        alertTitle.value = t('selfie.smart.status.capturing');
        return;
      }
      const poseToMessage: Record<typeof pose, MessageKey> = {
        left: 'turn-head-left',
        right: 'turn-head-right',
        up: 'tilt-head-up',
      };
      updateAlert(poseToMessage[pose]);
      return;
    }

    const isInNeutralZone = capturesTaken.value < neutralZone.value;
    const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

    if (isInNeutralZone) {
      alertTitle.value = t('selfie.smart.status.capturing');
    } else if (isInSmileZone) {
      const timeSinceSmile = Date.now() - lastSmileTime.value;
      if (timeSinceSmile > smileCooldown) {
        if (
          currentSmileScore.value >= smileThreshold &&
          currentMouthOpen.value < mouthOpenThreshold
        ) {
          updateAlert('open-mouth-smile');
        } else {
          updateAlert('smile-required');
        }
      } else {
        alertTitle.value = t('selfie.smart.status.keepSmiling');
      }
    } else {
      updateAlert(null);
    }
  };

  const updateAlerts = () => {
    if (isInitializing.value) {
      updateAlertImmediate('initializing');
    } else if (!faceDetected.value) {
      updateAlert('no-face');
    } else if (useStrictMode && isTooDark.value) {
      updateAlert('too-dark');
    } else if (useStrictMode && isTooBlurry.value) {
      updateAlert('too-blurry');
    } else if (faceProximity.value === 'too-close') {
      updateAlert('too-close');
    } else if (faceProximity.value === 'too-far') {
      updateAlert('too-far');
    } else if (!faceInBounds.value) {
      updateAlert(useStrictMode ? 'face-not-centered' : 'out-of-bounds');
    } else if (isCapturing.value) {
      updateCaptureAlerts();
    } else {
      alertTitle.value = t('selfie.smart.status.readyToCapture');
    }
  };

  const stopDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const detectFace = async () => {
    if (!faceLandmarkerRef.current || !videoRef.current) {
      stopDetectionLoop();
      return;
    }

    // ensure video has valid dimensions before processing
    if (
      videoRef.current.videoWidth <= 0 ||
      videoRef.current.videoHeight <= 0 ||
      videoRef.current.readyState < 2
    ) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    try {
      if (isInitializing.value) {
        isInitializing.value = false;
      }

      const croppedCanvas = createCroppedVideoFrame(videoRef.current);
      const detectionSource = croppedCanvas || videoRef.current;

      const results = faceLandmarkerRef.current.detectForVideo(
        detectionSource,
        performance.now(),
      );

      faceLandmarks.value = results.faceLandmarks || [];

      if (results.faceLandmarks && canvasRef.current && videoRef.current) {
        // we run detection on a cropped video frame
        // adjust landmark coordinates back to full video space
        if (croppedCanvas) {
          const sourceWidth = videoRef.current.videoWidth;
          const sourceHeight = videoRef.current.videoHeight;
          const squareSize = Math.min(sourceWidth, sourceHeight);
          const offsetX = (sourceWidth - squareSize) / (2 * sourceWidth);
          const offsetY = (sourceHeight - squareSize) / (2 * sourceHeight);
          const scaleFactor = squareSize / sourceWidth;
          const scaleFactorY = squareSize / sourceHeight;

          const adjustedLandmarks = results.faceLandmarks.map((face) =>
            face.map((landmark: any) => ({
              x: landmark.x * scaleFactor + offsetX,
              y: landmark.y * scaleFactorY + offsetY,
              z: landmark.z,
            })),
          );

          drawFaceMesh(
            canvasRef.current,
            adjustedLandmarks,
            capturesTaken.value,
            smileCheckpoint.value,
            useStrictMode,
          );
        } else {
          drawFaceMesh(
            canvasRef.current,
            results.faceLandmarks,
            capturesTaken.value,
            smileCheckpoint.value,
            useStrictMode,
          );
        }
      } else if (canvasRef.current) {
        clearCanvas(canvasRef.current);
      }

      // Check number of faces
      const numFaces = results.faceLandmarks ? results.faceLandmarks.length : 0;

      // Check if face is detected
      const hasFace =
        results.faceBlendshapes &&
        results.faceBlendshapes.length > 0 &&
        numFaces >= 1;
      faceDetected.value = hasFace;

      if (hasFace && results.faceLandmarks) {
        // Calculate face size and position
        const faceSize = calculateFaceSize(results.faceLandmarks, {
          rotationStable: useStrictMode,
        });
        currentFaceSize.value = faceSize;

        // Proximity check with hysteresis: once the face is in the "good"
        // band, the reading has to drift past the threshold before we flip
        // back to too-close/too-far. Keep the margin small so legitimate
        // edge cases are caught quickly.
        const proximityMargin = 0.02;
        const min = minFaceSize;
        const max = maxFaceSize;
        const current = faceProximity.value;
        if (current === 'good') {
          if (faceSize > max + proximityMargin) {
            faceProximity.value = 'too-close';
          } else if (faceSize < min - proximityMargin) {
            faceProximity.value = 'too-far';
          }
        } else if (current === 'too-close') {
          if (faceSize <= max) faceProximity.value = 'good';
        } else if (current === 'too-far') {
          if (faceSize >= min) faceProximity.value = 'good';
        }

        // Check face position. In strict mode the head will rotate, which
        // legitimately widens the bounding box, so only the face centre is
        // required to stay inside the oval.
        faceInBounds.value = isFaceInBounds(
          results.faceLandmarks,
          videoAspectRatio.value,
          { centerOnly: useStrictMode },
        );

        // Independent clipping check: project every landmark into the
        // visible wrapper using runtime element rects, then test against
        // the visible egg (approximated as a centred ellipse). If any
        // landmark falls outside, the oval boundary is clipping the face.
        // Used as an idle-only gating signal so head turns during capture
        // don't trip it.
        faceClippingOval.value = computeFaceClippingOval(
          results.faceLandmarks[0],
          videoRef.current,
        );

        // Directional nudge: only fire when the face is actually clipping
        // (touching/crossing) the visible oval edge. The clipping side is
        // derived from the single most-clipped landmark and its dominant
        // axis. A face fully inside the oval gets `null` here — no nudge.
        // (Mirror correction is handled inside computeFaceClippingSide.)
        faceOffsetDirection.value = computeFaceClippingSide(
          results.faceLandmarks[0],
          videoRef.current,
        );

        // Get smile and mouth open data
        const blendshapes = results.faceBlendshapes[0].categories;
        const smileLeft =
          blendshapes.find((b) => b.categoryName === 'mouthSmileLeft')?.score ||
          0;
        const smileRight =
          blendshapes.find((b) => b.categoryName === 'mouthSmileRight')
            ?.score || 0;
        const mouthOpen = calculateMouthOpening(results.faceLandmarks);
        const smileScore = (smileLeft + smileRight) / 2;

        currentSmileScore.value = smileScore;
        currentMouthOpen.value = mouthOpen;

        if (useStrictMode) {
          // Pose detection requires landmarks, so it stays gated on face
          // detection. Lighting/blur are now sampled outside this block —
          // they need to keep running when the face is undetected (e.g.
          // because the scene is too dark / motion-blurred to find a face).
          const pose = calculateHeadPose(results.faceLandmarks);
          currentPose.value = classifyHeadPose(pose);
        }

        if (smileScore >= smileThreshold && mouthOpen >= mouthOpenThreshold) {
          lastSmileTime.value = Date.now();

          if (isPaused.value && isCapturing.value && resumeCaptureRef.current) {
            // defer execution
            setTimeout(() => {
              const stillSmiling = Date.now() - lastSmileTime.value <= 100;
              if (
                stillSmiling &&
                isPaused.value &&
                isCapturing.value &&
                resumeCaptureRef.current
              ) {
                resumeCaptureRef.current();
              }
            }, 0);
          }
        }
      } else {
        // No face detected - reset face-derived values. Lighting/blur are
        // intentionally NOT reset here: those checks are useful precisely
        // when the face has gone undetected (dark room / motion blur) and
        // are sampled separately below from the raw video frame.
        currentSmileScore.value = 0;
        currentFaceSize.value = 0;
        currentMouthOpen.value = 0;
        faceInBounds.value = false;
        faceClippingOval.value = false;
        faceProximity.value = 'good';
        faceOffsetDirection.value = null;
        if (useStrictMode) {
          currentPose.value = null;
        }
      }

      // Lighting/blur sampling — runs every frame regardless of face
      // detection so the alert can fire even when the scene is too dark or
      // shaky for the landmarker to find a face. Throttled with a frame
      // counter so the canvas readback stays cheap.
      if (useStrictMode && videoRef.current) {
        qualityFrameCounter += 1;
        if (qualityFrameCounter % 6 === 0) {
          const luma = calculateLuminance(videoRef.current);
          isTooDark.value = luma > 0 && luma < DEFAULT_LUMINANCE_MIN;
          const blur = calculateBlurScore(videoRef.current);
          isTooBlurry.value = blur > 0 && blur < DEFAULT_BLUR_MIN;
        }
      }

      updateAlerts();
    } catch {
      faceDetected.value = false;
      faceInBounds.value = false;
      faceClippingOval.value = false;
      faceProximity.value = 'good';
      currentMouthOpen.value = 0;

      if (isCapturing.value) {
        updateAlert('no-face');
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  const startDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  // Notify hosted-web inactivity timeout that the user is making progress.
  // Fired on every successful capture so the 120s timer resets continuously
  // as long as frames are being collected.
  const dispatchProgress = () => {
    document
      .querySelector('smart-camera-web')
      ?.dispatchEvent(new CustomEvent('metadata.active-liveness-progress'));
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    // In strict (Active Liveness) mode the reference selfie is captured up-front
    // in startCapture() while the user is still neutral. The per-pose captures
    // here only ever populate the liveness array.
    const isReference =
      !useStrictMode && capturesTaken.value === totalCaptures.value - 1;
    const imageData = captureImageFromVideo(videoRef.current, isReference);

    if (!imageData) return;

    if (isReference) {
      referencePhoto.value = imageData;
    } else {
      capturedImages.value = [...capturedImages.value, imageData];
    }

    capturesTaken.value++;
    countdown.value = totalCaptures.value - capturesTaken.value;
  };

  const stopCapture = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    isCapturing.value = false;
    isPaused.value = false;

    if (capturesTaken.value >= totalCaptures.value && referencePhoto.value) {
      const livenessImages = capturedImages.value.map((img) => ({
        image: img.split(',')[1],
        image_type_id: ImageType.LIVENESS_IMAGE_BASE64,
      }));

      const referenceImage = {
        image: referencePhoto.value.split(',')[1],
        image_type_id: ImageType.SELFIE_IMAGE_BASE64,
      };

      const eventDetail = {
        images: [...livenessImages, referenceImage],
        referenceImage: referencePhoto.value,
        previewImage: referencePhoto.value,
        facingMode: getFacingMode(),
        meta: { libraryVersion: COMPONENTS_VERSION },
      };

      if (onCaptureComplete) {
        // Caller owns the payload — defer publish until they decide to emit.
        onCaptureComplete(eventDetail);
      } else {
        window.dispatchEvent(
          new CustomEvent('selfie-capture.publish', { detail: eventDetail }),
        );
      }

      hasFinishedCapture.value = true;
    }
  };

  const pauseCapture = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    isPaused.value = true;

    if (
      faceDetected.value &&
      faceInBounds.value &&
      faceProximity.value === 'good'
    ) {
      updateAlert('smile-required');
    }
  };

  const startCaptureInterval = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
    }

    captureTimerRef.current = setInterval(() => {
      if (capturesTaken.value >= totalCaptures.value) {
        stopCapture();
        return;
      }

      if (!faceDetected.value) {
        return;
      }

      if (!faceInBounds.value) {
        // Strict mode has no smile-based resume path — calling pauseCapture
        // here would clear the interval and leave the user stuck even after
        // they recentre. Just skip this tick instead so the next frame
        // re-evaluates once they're back in bounds.
        if (useStrictMode) return;
        pauseCapture();
        return;
      }

      if (faceProximity.value !== 'good') {
        if (useStrictMode) return;
        pauseCapture();
        return;
      }

      if (useStrictMode) {
        // Strict mode: gate captures on (a) sufficient lighting/sharpness and
        // (b) the user matching the currently-required head pose. The pose
        // sequence advances once enough frames per pose have been collected.
        if (isTooDark.value || isTooBlurry.value) {
          // Same reason as above — skip rather than pause so the loop keeps
          // ticking and resumes automatically once lighting/blur clears.
          return;
        }

        // Distribute the capture window evenly across the pose sequence:
        // each pose gets `framesPerPose = floor(totalCaptures / poseCount)`
        // frames. Any leftover frames (e.g. 8 captures across 3 poses → 2
        // leftover) are taken silently up-front while the user is still
        // neutral, giving the backend forward-facing liveness samples
        // without burdening the user with an extra "look straight" prompt.
        const poseCount = poseSequence.value.length;
        const framesPerPose = Math.max(
          1,
          Math.floor(totalCaptures.value / poseCount),
        );
        const silentNeutralFrames = Math.max(
          0,
          totalCaptures.value - framesPerPose * poseCount,
        );

        if (capturesTaken.value < silentNeutralFrames) {
          // Pre-pose neutral phase: snap whatever the user is showing now
          // (they're already centred from the hold-still period). No pose
          // gate, no prompt change — these frames feed liveness silently.
          captureImage();
          dispatchProgress();
          return;
        }

        const requiredPose = poseSequence.value[currentPoseIndex.value];
        if (!requiredPose) {
          stopCapture();
          return;
        }
        if (currentPose.value !== requiredPose) {
          // Don't pause — we want the prompt to stay visible while the user
          // adjusts. Just skip this tick.
          return;
        }

        captureImage();
        // Any successful capture counts as activity for the hosted-web
        // inactivity timeout — even if the user is still on pose 1 and
        // hasn't advanced the index yet.
        dispatchProgress();

        // Frames captured *within* the pose phase only (the leading neutral
        // frames don't belong to any pose). Advance once we've collected
        // enough for the current pose.
        const poseFramesTaken = capturesTaken.value - silentNeutralFrames;
        if (
          poseFramesTaken > 0 &&
          poseFramesTaken % framesPerPose === 0 &&
          currentPoseIndex.value < poseCount - 1
        ) {
          currentPoseIndex.value += 1;
        }
        return;
      }

      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

      if (isInSmileZone) {
        const timeSinceSmile = Date.now() - lastSmileTime.value;
        if (timeSinceSmile > smileCooldown) {
          pauseCapture();
          return;
        }
      }

      captureImage();
    }, interval);
  };

  const resumeCapture = () => {
    if (
      faceDetected.value &&
      faceProximity.value === 'good' &&
      faceInBounds.value
    ) {
      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;
      if (isInSmileZone) {
        const timeSinceSmile = Date.now() - lastSmileTime.value;
        if (timeSinceSmile > smileCooldown) {
          return;
        }
      }

      isPaused.value = false;
      updateAlert(null);
      startCaptureInterval();
    }
  };

  resumeCaptureRef.current = resumeCapture;

  const startCapture = async () => {
    capturedImages.value = [];
    isCapturing.value = true;
    isPaused.value = false;
    totalCaptures.value = Math.ceil(duration / interval);
    capturesTaken.value = 0;
    countdown.value = totalCaptures.value;

    if (useStrictMode) {
      poseSequence.value = buildRandomPoseSequence();
      currentPoseIndex.value = 0;

      // Snap the neutral selfie up-front so the result preview shows the
      // user facing the camera, not whichever direction the last pose
      // prompted them to turn.
      if (videoRef.current) {
        const neutralReference = captureImageFromVideo(videoRef.current, true);
        if (neutralReference) {
          referencePhoto.value = neutralReference;
        }
      }
    }

    const smartCameraWeb = document.querySelector('smart-camera-web');
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.selfie-capture-start'),
    );
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.active-liveness-type', {
        detail: { type: useStrictMode ? 'head_pose' : 'smile_detection' },
      }),
    );
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.selfie-origin', {
        detail: {
          imageOrigin: { environment: 'back_camera', user: 'front_camera' }[
            getFacingMode()
          ],
        },
      }),
    );

    startCaptureInterval();
  };

  const handleCancel = () => {
    stopCapture();
    window.dispatchEvent(
      new CustomEvent('selfie-capture.cancelled', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );

    // TODO: remove - for backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.cancelled', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  /**
   * Force-finalise the capture session with a failure reason. Used by the
   * hosted-web active-liveness inactivity timer (and any other host-driven
   * fail-fast path) to submit whatever frames have been captured so far
   * tagged with a reason the backend can use to record the failure.
   *
   * The payload mirrors the normal completion shape so the existing publish
   * path doesn't need to special-case it; the only extra field is
   * `forceFailureReason`, which downstream submission handlers forward as
   * a structured `failure_reason` metadata entry (e.g.
   * `{ mobile_active_liveness_timed_out: true }`).
   */
  const forceFailCapture = (reason: string) => {
    // Stop the capture interval and detection loop; we're not going to take
    // any more frames after this point.
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    isCapturing.value = false;
    isPaused.value = false;

    const livenessImages = capturedImages.value.map((img) => ({
      image: img.split(',')[1],
      image_type_id: ImageType.LIVENESS_IMAGE_BASE64,
    }));

    const reference = referencePhoto.value;
    const referenceImage = reference
      ? {
          image: reference.split(',')[1],
          image_type_id: ImageType.SELFIE_IMAGE_BASE64,
        }
      : null;

    const eventDetail = {
      images: referenceImage
        ? [...livenessImages, referenceImage]
        : livenessImages,
      referenceImage: reference ?? '',
      previewImage: reference ?? '',
      facingMode: getFacingMode(),
      forceFailureReason: reason,
      meta: { libraryVersion: COMPONENTS_VERSION },
    };

    if (onCaptureComplete) {
      onCaptureComplete(eventDetail);
    } else {
      window.dispatchEvent(
        new CustomEvent('selfie-capture.publish', { detail: eventDetail }),
      );
    }

    hasFinishedCapture.value = true;
  };

  const handleClose = () => {
    stopCapture();

    window.dispatchEvent(
      new CustomEvent('selfie-capture.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );

    // TODO: remove - backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  const cleanup = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    stopDetectionLoop();
    updateAlert.cancel();
  };

  const resetFaceDetectionState = () => {
    faceDetected.value = false;
    faceInBounds.value = false;
    faceClippingOval.value = false;
    faceProximity.value = 'good';
    faceLandmarks.value = [];
    currentSmileScore.value = 0;
    currentFaceSize.value = 0;
    currentMouthOpen.value = 0;
    lastSmileTime.value = 0;
    captureButtonFallbackEnabled.value = false;
    currentPose.value = null;
    isTooDark.value = false;
    isTooBlurry.value = false;
    qualityFrameCounter = 0;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  };

  return {
    faceDetected,
    faceInBounds,
    faceClippingOval,
    faceProximity,
    videoAspectRatio,
    faceLandmarks,
    currentSmileScore,
    currentFaceSize,
    currentMouthOpen,
    lastSmileTime,
    alertTitle,
    isInitializing,
    isReadyToCapture,
    captureButtonFallbackEnabled,

    isCapturing,
    isPaused,
    countdown,
    capturedImages,
    referencePhoto,
    totalCaptures,
    capturesTaken,
    hasFinishedCapture,
    smileCheckpoint,
    neutralZone,
    poseSequence,
    currentPoseIndex,
    currentPose,
    isTooDark,
    isTooBlurry,
    faceOffsetDirection,

    initializeFaceLandmarker,
    setupCanvas,
    startDetectionLoop,
    stopDetectionLoop,
    updateAlert,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    handleCancel,
    forceFailCapture,
    handleClose,
    cleanup,
    resetFaceDetectionState,
  };
};
