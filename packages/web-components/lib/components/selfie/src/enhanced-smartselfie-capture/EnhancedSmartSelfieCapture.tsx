import { useRef, useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { t } from '../../../../domain/localisation';
import { useFaceCapture, useCamera } from './hooks';
import { getMediapipeInstance } from './utils/mediapipeManager';
import { CameraPreview } from './components/CameraPreview';
import { AlertDisplay } from './components/AlertDisplay';
import { CaptureControls } from './components/CaptureControls';
import { ActiveLivenessOverlay } from './components/ActiveLivenessOverlay';
import { CaptureGuidelines } from './components/CaptureGuidelines';
import { SubmissionView } from './components/SubmissionView';

import '../../../navigation/src';
import '../../../attribution/PoweredBySmileId';
// Side-effect imports: register the standalone consent and submission
// custom elements so partners can mount them independently of ESS
// (`<enhanced-smart-selfie-consent>` / `<enhanced-smart-selfie-submission>`).
import './EnhancedSmartSelfieConsent';
import './EnhancedSmartSelfieSubmission';

// ESS owns the in-flow capture experience: a pre-capture guidelines screen
// (the "Capture Guidelines" tiles + active-liveness hero animation), the
// active-liveness capture itself, and the post-capture review screen. Consent
// and post-confirm submission UI are deliberately not part of this element —
// they're shipped as separate custom elements (`<enhanced-smart-selfie-
// consent>`, `<enhanced-smart-selfie-submission>`) that callers mount
// around ESS as their product flow requires.
type View = 'guidelines' | 'capture' | 'review';

interface Props {
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
  /** When true, skip the guidelines screen and go straight to capture. */
  'hide-instructions'?: string | boolean;
  /**
   * Render the back button on the guidelines screen. Off by default because
   * guidelines is the first ESS view, so there is nothing within ESS to
   * navigate back to. Hosts that mount ESS after their own prior screen
   * (e.g. a consent step in a KYC / DocV flow) opt in by setting this so
   * the back button surfaces and `selfie-capture.cancelled` fires for the
   * host to handle navigation back to the previous view.
   */
  'show-back-on-guidelines'?: string | boolean;
}

const EnhancedSmartSelfieCapture: FunctionComponent<Props> = ({
  interval = 350,
  duration = 2800,
  'theme-color': themeColor = '#001096',
  'show-navigation': showNavigationProp = false,
  'allow-agent-mode': allowAgentModeProp = false,
  'show-agent-mode-for-tests': showAgentModeForTestsProp = false,
  'hide-attribution': hideAttributionProp = false,
  'hide-instructions': hideInstructionsProp = false,
  'show-back-on-guidelines': showBackOnGuidelinesProp = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showNavigation = getBoolProp(showNavigationProp);
  const allowAgentMode = getBoolProp(allowAgentModeProp);
  const showAgentModeForTests = getBoolProp(showAgentModeForTestsProp);
  const hideAttribution = getBoolProp(hideAttributionProp);
  const hideInstructions = getBoolProp(hideInstructionsProp);
  const showBackOnGuidelines = getBoolProp(showBackOnGuidelinesProp);

  // This component is always strict-mode (Active Liveness).
  const useStrictMode = true;

  const smileCooldown = 300;
  const smileThreshold = 0.25;
  const mouthOpenThreshold = 0.05;
  // Slightly tighter range than the legacy SmartSelfie defaults so the
  // "too far / too close" edge cases actually trigger when the face fills
  // significantly less / more of the oval than expected. The band is wider
  // than 0.34–0.55 because hysteresis combined with the 0.34 floor caused
  // typical webcam framing to lock into a "too far" state, masking every
  // other check downstream of it.
  const minFaceSize = 0.35;
  const maxFaceSize = 0.62;

  // Agent mode is opt-in: the partner enables the toggle via `allow-agent-mode`,
  // but the user-facing camera is always the default. The toggle button lets
  // an operator switch to the rear (environment) camera mid-session.
  const initialFacingMode = 'user';
  const camera = useCamera(initialFacingMode);

  // Three-view flow: guidelines → capture → review. `hide-instructions`
  // skips the guidelines screen and jumps straight to capture. On confirm,
  // ESS emits `selfie-capture.publish` and hands off to the caller — the
  // screens router (`<selfie-capture-screens>`) or, in the SmartSelfie Auth
  // case, the host product script — which decides what to render next.
  const initialView: View = hideInstructions ? 'capture' : 'guidelines';
  const viewSignal = useRef(signal<View>(initialView)).current;
  const pendingPayload = useRef<any>(null);

  const faceCapture = useFaceCapture({
    videoRef: camera.videoRef,
    canvasRef,
    interval,
    duration,
    smileThreshold,
    mouthOpenThreshold,
    minFaceSize,
    maxFaceSize,
    smileCooldown,
    getFacingMode: () => camera.facingMode,
    useStrictMode,
    onCaptureComplete: (detail) => {
      // Stash the payload and show the review screen. The user can retake
      // or confirm; only on confirm do we emit `selfie-capture.publish`.
      //
      // Forced-failure completions (e.g. the 120s active-liveness
      // inactivity timeout from the hosted-web page) publish immediately
      // with `detail.forceFailureReason` set so the caller can route to
      // its own failure UI without going through review.
      pendingPayload.current = detail;
      if (detail.forceFailureReason) {
        // Tear down the camera + detection loop explicitly. We're skipping
        // review, so the view stays on 'capture' and the mount effect's
        // cleanup never runs on its own — without this, MediaPipe and the
        // camera stream would keep running silently while the host shows
        // its post-publish UI.
        faceCapture.stopDetectionLoop();
        camera.stopCamera();
        faceCapture.cleanup();
        // Dedicated forced-failure signal for the host. The intermediate
        // `<selfie-capture-screens>` / `<smart-camera-web>` chain only
        // forwards `images` in their re-dispatched `*.publish` events, so
        // `forceFailureReason` would otherwise be invisible at the host
        // layer. We fire this synchronously *before* `selfie-capture.publish`
        // so any host listener can flip its "this is a forced failure" flag
        // in time for the publish handler that follows.
        window.dispatchEvent(
          new CustomEvent('enhanced-smartselfie.force-fail-published', {
            detail: { reason: detail.forceFailureReason },
          }),
        );
        window.dispatchEvent(
          new CustomEvent('selfie-capture.publish', { detail }),
        );
        return;
      }
      viewSignal.value = 'review';
    },
  });

  useEffect(() => {
    if (viewSignal.value !== 'capture') return undefined;

    const initializeCamera = async () => {
      await camera.startCamera(initialFacingMode, (cameraName) => {
        const smartCameraWeb = document.querySelector('smart-camera-web');
        smartCameraWeb?.dispatchEvent(
          new CustomEvent('metadata.camera-name', {
            detail: { cameraName },
          }),
        );
      });
      await camera.checkAgentSupport();
      await faceCapture.initializeFaceLandmarker();

      setTimeout(() => {
        faceCapture.setupCanvas();
        faceCapture.startDetectionLoop();
      }, 500);
    };

    camera.registerCameraSwitchCallback(() => {
      try {
        faceCapture.resetFaceDetectionState();
        faceCapture.setupCanvas();
        faceCapture.stopDetectionLoop();
        faceCapture.startDetectionLoop();
      } catch (error) {
        console.error('Error during camera switch callback:', error);
      }
    });

    initializeCamera();

    return () => {
      faceCapture.stopDetectionLoop();
      camera.stopCamera();
      faceCapture.cleanup();
    };
  }, [viewSignal.value]);

  // Reset scroll-to-top whenever the active view changes. Without this the
  // host page (which now drives scrolling, since each ESS view uses natural
  // document flow) would land on whatever scroll offset the previous view
  // left behind \u2014 e.g. switching from a long Consent page to Instructions
  // would render Instructions already scrolled to the bottom.
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [viewSignal.value]);

  useEffect(() => {
    if (faceCapture.hasFinishedCapture.value) {
      const smartCameraWeb = document.querySelector('smart-camera-web');
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );
    }
  }, [faceCapture.hasFinishedCapture.value]);

  // Brief "hold still" period at the start of capture: the reference selfie
  // is taken in this window and the active-liveness animation/prompts only
  // appear after it elapses.
  const HOLD_STILL_MS = 1800;
  const [holdStillElapsed, setHoldStillElapsed] = useState(false);
  // Tracks whether the Mediapipe model itself has finished downloading. We
  // pre-warm it as soon as ESS mounts so by the time the user finishes
  // reading the guidelines the heavy network work is already done and
  // Continue can be enabled immediately.
  const [isMediapipeReady, setIsMediapipeReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getMediapipeInstance()
      .then(() => {
        if (!cancelled) setIsMediapipeReady(true);
      })
      .catch(() => {
        // Swallow — the capture screen will retry and surface any error there.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!faceCapture.isCapturing.value) {
      setHoldStillElapsed(false);
      return undefined;
    }
    setHoldStillElapsed(false);
    const id = window.setTimeout(
      () => setHoldStillElapsed(true),
      HOLD_STILL_MS,
    );
    return () => window.clearTimeout(id);
  }, [faceCapture.isCapturing.value]);

  // Pre-capture fallback: enable Start Capture after 5s even if the user
  // hasn't centred their head yet. Quality checks (lighting / blur /
  // distance) only run during active capture, so we don't want partners to
  // get stuck on a permanently-disabled button.
  const PRE_CAPTURE_FALLBACK_MS = 5000;
  const [preCaptureFallbackElapsed, setPreCaptureFallbackElapsed] =
    useState(false);
  useEffect(() => {
    if (viewSignal.value !== 'capture') return undefined;
    if (faceCapture.isCapturing.value) return undefined;
    if (faceCapture.hasFinishedCapture.value) return undefined;
    setPreCaptureFallbackElapsed(false);
    const id = window.setTimeout(
      () => setPreCaptureFallbackElapsed(true),
      PRE_CAPTURE_FALLBACK_MS,
    );
    return () => window.clearTimeout(id);
  }, [
    viewSignal.value,
    faceCapture.isCapturing.value,
    faceCapture.hasFinishedCapture.value,
  ]);

  // Track device orientation. Active-liveness expects the user to hold the
  // device upright — landscape framing puts the face sideways inside the
  // oval, breaks the bounds/pose checks, and produces unusable selfies.
  // We detect both rotated screens (matchMedia) and rotated mobile devices
  // that report orientation through the Screen Orientation API.
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    // Only enforce the orientation edge case on touch / mobile-class devices.
    // Desktop/laptop browsers can be resized into a "landscape <" wrapper
    // ratio without the camera or user actually being sideways, and there's
    // no rotate gesture available to recover from the prompt.
    const isMobileDevice =
      // matchMedia hover/pointer hints — most reliable cross-browser way to
      // tell apart a touch-only device from a mouse-driven one.
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      // Touch capability fallback for browsers that don't expose the hover
      // media query (older Android WebView, embedded browsers).
      (typeof navigator !== 'undefined' &&
        ((navigator as any).maxTouchPoints > 0 ||
          /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent || '',
          )));
    if (!isMobileDevice) return undefined;

    const mql = window.matchMedia('(orientation: landscape)');
    const update = () => setIsLandscape(mql.matches);
    update();
    // Older Safari only supports addListener/removeListener.
    if (mql.addEventListener) mql.addEventListener('change', update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', update);
      else mql.removeListener(update);
    };
  }, []);

  // If the device flips to landscape mid-capture, pause the capture interval
  // immediately so we don't accumulate liveness frames while the user's face
  // is sideways inside the oval. Resume once the device returns to portrait —
  // the capture sequence picks up from where it left off and continues
  // forward without forcing the user to restart.
  useEffect(() => {
    if (!faceCapture.isCapturing.value) return;
    if (isLandscape) {
      faceCapture.pauseCapture();
    } else if (faceCapture.isPaused.value) {
      faceCapture.resumeCapture();
    }
  }, [isLandscape, faceCapture.isCapturing.value]);

  // Host-driven forced-failure path (e.g. the hosted-web 120s active-liveness
  // inactivity timer). The host dispatches `enhanced-smartselfie.force-fail`
  // with a `{ reason }` detail; the hook packages whatever frames have been
  // captured so far and fires `onCaptureComplete` with `forceFailureReason`
  // set, which publishes immediately so the caller can surface its own
  // failure UI.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ reason?: string }>;
      const reason = ce.detail?.reason ?? 'active_liveness_timed_out';
      // Only react while the user is actively in the capture flow; ignore
      // the event if we've already moved on to review/submitting/etc.
      if (viewSignal.value !== 'capture') return;
      faceCapture.forceFailCapture(reason);
    };
    window.addEventListener('enhanced-smartselfie.force-fail', handler);
    return () => {
      window.removeEventListener('enhanced-smartselfie.force-fail', handler);
    };
  }, []);

  const handleConfirm = () => {
    const payload = pendingPayload.current;
    if (payload) {
      // Publish and stay on the review screen. The caller — the screens
      // router for KYC/DV/EDV flows, or the SmartSelfie Auth host page —
      // decides what to render next (next form, submitting card, etc.).
      window.dispatchEvent(
        new CustomEvent('selfie-capture.publish', { detail: payload }),
      );
    }
  };

  const handleRetake = () => {
    pendingPayload.current = null;
    faceCapture.hasFinishedCapture.value = false;
    faceCapture.capturesTaken.value = 0;
    viewSignal.value = 'capture';
  };

  // Back-button navigation: review → retake; capture → guidelines (or
  // cancel when guidelines are hidden); guidelines → cancel. "Cancel"
  // surfaces `selfie-capture.cancelled` so the caller can decide what to do.
  const handleBack = () => {
    const current = viewSignal.value;
    if (current === 'review') {
      handleRetake();
      return;
    }
    if (current === 'capture') {
      // Stop the camera/detection loop before leaving the capture view so
      // we don't leak resources while sitting on the guidelines screen.
      faceCapture.stopDetectionLoop();
      camera.stopCamera();
      faceCapture.resetFaceDetectionState();
      // Wipe the in-flight capture session so re-entering capture starts
      // fresh (new pose sequence, prompt 1, empty image buffer).
      faceCapture.stopCapture();
      faceCapture.capturedImages.value = [];
      faceCapture.referencePhoto.value = '';
      faceCapture.poseSequence.value = [];
      faceCapture.currentPoseIndex.value = 0;
      faceCapture.hasFinishedCapture.value = false;
      faceCapture.capturesTaken.value = 0;
      if (!hideInstructions) {
        viewSignal.value = 'guidelines';
        return;
      }
      faceCapture.handleCancel();
      return;
    }
    // Guidelines or anything else: cancel.
    faceCapture.handleCancel();
  };

  if (viewSignal.value === 'guidelines') {
    return (
      <CaptureGuidelines
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        isReady={isMediapipeReady}
        onContinue={() => {
          viewSignal.value = 'capture';
        }}
        onBack={showNavigation && showBackOnGuidelines ? handleBack : undefined}
      />
    );
  }

  if (viewSignal.value === 'review') {
    const detail = pendingPayload.current;
    const src = detail?.referenceImage || '';
    const mirror = detail?.facingMode === 'user';
    return (
      <SubmissionView
        imageSrc={src}
        mirror={mirror}
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        mode="review"
        onConfirm={handleConfirm}
        onRetake={handleRetake}
        onBack={showNavigation ? handleBack : undefined}
      />
    );
  }

  // Centralised quality-check evaluation: pick the dominant problem and
  // derive both the prompt copy and which side of the oval to colour red.
  // Pre-capture (idle) only nudges the user to centre their head — every
  // other quality check (lighting / blur / proximity) is deferred until
  // active capture begins. During capture, framing/centering is no longer
  // re-evaluated since the head is already locked in.
  const isIdle =
    !faceCapture.isCapturing.value && !faceCapture.hasFinishedCapture.value;
  const isHoldingStill = faceCapture.isCapturing.value && !holdStillElapsed;

  const isFaceCentered =
    faceCapture.faceDetected.value &&
    faceCapture.faceInBounds.value &&
    !faceCapture.faceClippingOval.value;

  // Default to the pre-capture instruction. We deliberately ignore the
  // hook's transient alertTitle here so the prompt never blanks out as
  // detection signals fluctuate — it stays put until capture begins.
  let alertTitle = isIdle
    ? t('selfie.ess.alert.centerFace')
    : faceCapture.alertTitle.value;
  let errorSide: 'top' | 'right' | 'bottom' | 'left' | 'all' | null = null;
  // Whether any active-capture quality check is currently failing. Used to
  // suppress the active-liveness pose animation so the user isn't shown a
  // "turn your head" cue while we still need them to fix lighting/blur/etc.
  let captureCheckFailing = false;

  if (isLandscape) {
    alertTitle = '';
    errorSide = 'all';
    captureCheckFailing = true;
  } else if (isIdle) {
    // Pre-capture: keep the static "Centre your face within the oval frame"
    // instruction. No directional / lighting / blur / distance prompts run
    // until the user taps Start Capture — quality checks are deferred to
    // the active-capture phase.
  } else if (isHoldingStill) {
    alertTitle = t('selfie.ess.alert.holdStill');
  } else if (faceCapture.isCapturing.value) {
    // Active capture: run quality checks. Centering is no longer evaluated
    // here — once capture has started, head turns are expected.
    if (faceCapture.isTooDark.value) {
      alertTitle = t('selfie.ess.alert.tooDark');
      errorSide = 'all';
      captureCheckFailing = true;
    } else if (faceCapture.isTooBlurry.value) {
      errorSide = 'all';
      captureCheckFailing = true;
    } else if (faceCapture.faceProximity.value === 'too-close') {
      alertTitle = t('selfie.ess.alert.tooClose');
      errorSide = 'all';
      captureCheckFailing = true;
    } else if (faceCapture.faceProximity.value === 'too-far') {
      alertTitle = t('selfie.ess.alert.tooFar');
      errorSide = 'all';
      captureCheckFailing = true;
    } else if (faceCapture.faceOffsetDirection.value) {
      // Directional nudges: face is detected but offset from the oval
      // centre by more than the hook's small threshold. Surfaced during
      // capture so the user re-frames before we evaluate pose prompts.
      const dir = faceCapture.faceOffsetDirection.value;
      if (dir === 'top') alertTitle = t('selfie.ess.alert.moveDeviceUp');
      else if (dir === 'bottom')
        alertTitle = t('selfie.ess.alert.moveDeviceDown');
      else if (dir === 'left')
        alertTitle = t('selfie.ess.alert.moveDeviceLeft');
      else if (dir === 'right')
        alertTitle = t('selfie.ess.alert.moveDeviceRight');
      errorSide = dir;
      captureCheckFailing = true;
    } else {
      // Active-liveness pose prompts: override the localised hook copy with
      // the design-spec wording.
      const pose =
        faceCapture.poseSequence.value[faceCapture.currentPoseIndex.value];
      if (pose === 'left') alertTitle = t('selfie.ess.alert.turnHeadLeft');
      else if (pose === 'right')
        alertTitle = t('selfie.ess.alert.turnHeadRight');
      else if (pose === 'up') alertTitle = t('selfie.ess.alert.tiltHeadUp');
    }
  }

  return (
    <div className="smartselfie-capture">
      {showNavigation && (
        <button
          type="button"
          className="back-button"
          aria-label={t('selfie.ess.back')}
          onClick={handleBack}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      )}

      <CameraPreview
        videoRef={camera.videoRef}
        canvasRef={canvasRef}
        facingMode={camera.facingMode}
        themeColor={themeColor}
        errorSide={errorSide}
        overlay={(() => {
          if (isLandscape) {
            return (
              <ActiveLivenessOverlay
                pose={null}
                currentPose={null}
                isTooDark={false}
                isLandscape
              />
            );
          }
          if (faceCapture.isTooDark.value) {
            // Show the too-dark animation as soon as the scene is too dark,
            // even before active capture starts, so the user gets visual
            // guidance matching the alert text.
            return (
              <ActiveLivenessOverlay pose={null} currentPose={null} isTooDark />
            );
          }
          if (
            faceCapture.isCapturing.value &&
            holdStillElapsed &&
            !captureCheckFailing
          ) {
            return (
              <ActiveLivenessOverlay
                pose={
                  faceCapture.poseSequence.value[
                    faceCapture.currentPoseIndex.value
                  ] ?? null
                }
                currentPose={faceCapture.currentPose.value}
                isTooDark={faceCapture.isTooDark.value}
              />
            );
          }
          return null;
        })()}
      />

      {/* Alert text + controls + attribution sit naturally below the
          camera preview, matching the SmartSelfieCapture layout. */}
      <AlertDisplay alertTitle={alertTitle} themeColor={themeColor} />

      {!faceCapture.isCapturing.value &&
        !faceCapture.hasFinishedCapture.value && (
          <CaptureControls
            isCapturing={faceCapture.isCapturing.value}
            hasFinishedCapture={faceCapture.hasFinishedCapture.value}
            // Pre-capture readiness: face must be centered, OR the 5-second
            // fallback has elapsed. Quality checks no longer gate the Start
            // Capture button — they only run after capture begins.
            isReadyToCapture={
              (isFaceCentered || preCaptureFallbackElapsed) && !isLandscape
            }
            // ESS strict-mode: never bypass the readiness check. The legacy
            // fallback timer enables the button after 10s even when the
            // face isn't centered, but we want capture to only start once
            // the user is properly framed inside the oval.
            captureButtonFallbackEnabled={false}
            allowAgentMode={allowAgentMode}
            agentSupported={camera.agentSupported}
            showAgentModeForTests={showAgentModeForTests}
            facingMode={camera.facingMode}
            themeColor={themeColor}
            onStartCapture={faceCapture.startCapture}
            onSwitchCamera={camera.switchCamera}
          />
        )}

      {!hideAttribution && (
        // @ts-expect-error preact-custom-element types
        <powered-by-smile-id />
      )}

      <style>{`
        * { box-sizing: border-box; }
        :host { display: block; height: 100%; }
        .smartselfie-capture {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 6.5rem 1rem 0.5rem;
          font-family: "DM Sans", system-ui, sans-serif;
          background: #F5F7FA;
          overflow: hidden;
        }
        .smartselfie-capture > .back-button {
          position: absolute;
          top: 2rem;
          left: 1rem;
          background: #1f1f1f;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          z-index: 2;
        }
        .smartselfie-capture > powered-by-smile-id {
          display: block;
          width: 100%;
          margin-top: clamp(0.75rem, 2dvh, 1.25rem);
          padding-top: clamp(0.4rem, 1dvh, 0.6rem);
          background: #F5F7FA;
          flex-shrink: 0;
        }
        button {
          padding: 10px 20px;
          background: ${themeColor || '#001096'};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:disabled { background: #ccc; cursor: not-allowed; }
        button.btn-primary {
          background-color: ${themeColor || '#001096'};
          border-radius: 2.5rem;
          color: white;
          border: none;
          height: 3.125rem;
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        button.btn-primary:hover { background-color: #2d2b2a; }
        button.btn-primary:disabled { background-color: #666; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

if (!customElements.get('enhanced-smartselfie-capture')) {
  register(
    EnhancedSmartSelfieCapture,
    'enhanced-smartselfie-capture',
    [
      'interval',
      'duration',
      'theme-color',
      'show-navigation',
      'allow-agent-mode',
      'show-agent-mode-for-tests',
      'hide-attribution',
      'disable-image-tests',
      'hide-instructions',
      'show-back-on-guidelines',
    ],
    { shadow: true },
  );
}

export default EnhancedSmartSelfieCapture;
