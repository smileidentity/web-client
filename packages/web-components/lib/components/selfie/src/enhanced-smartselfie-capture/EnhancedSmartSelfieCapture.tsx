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
import { ConsentView } from './components/ConsentView';
import { InstructionsView } from './components/InstructionsView';
import { SubmissionView } from './components/SubmissionView';

import '../../../navigation/src';
import '../../../attribution/PoweredBySmileId';

type View =
  | 'consent'
  | 'instructions'
  | 'capture'
  | 'review'
  | 'submitting'
  | 'success'
  | 'error';

/**
 * Convert an internal forced-failure reason code into the message we
 * render under the "Submission Failed" title. Returns `undefined` for
 * unknown / absent reasons so callers can fall back to whatever the host
 * supplied.
 */
const forcedFailureReasonToMessage = (
  reason: string | null,
): string | undefined => {
  switch (reason) {
    case 'active_liveness_timed_out':
      return t('selfie.ess.failure.sessionTimedOut');
    default:
      return undefined;
  }
};

interface Props {
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
  'hide-instructions'?: string | boolean;
  /** When true, skip the consent screen entirely. */
  'hide-consent'?: string | boolean;
  /** Partner name shown on the consent screen (defaults to "Smile ID"). */
  'partner-name'?: string;
  /** URL of the partner logo shown on the consent screen. */
  'partner-logo'?: string;
  /** Privacy policy URL shown in the consent body. */
  'policy-url'?: string;
  /**
   * Drives the post-confirm view. Set by the host page once it knows whether
   * the submission succeeded or failed:
   *   - 'submitting' (default after Confirm)
   *   - 'success'    → renders the "Submission Complete" screen
   *   - 'error'      → renders the "Submission Failed" screen
   */
  'submission-state'?: 'submitting' | 'success' | 'error';
  /** Optional message shown under the title on the success/error screens. */
  'submission-message'?: string;
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
  'hide-consent': hideConsentProp = false,
  'partner-name': partnerName,
  'partner-logo': partnerLogo,
  'policy-url': policyUrl,
  'submission-state': submissionState,
  'submission-message': submissionMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showNavigation = getBoolProp(showNavigationProp);
  const allowAgentMode = getBoolProp(allowAgentModeProp);
  const showAgentModeForTests = getBoolProp(showAgentModeForTestsProp);
  const hideAttribution = getBoolProp(hideAttributionProp);
  const hideInstructions = getBoolProp(hideInstructionsProp);
  const hideConsent = getBoolProp(hideConsentProp);

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

  // Four-view state machine: consent → instructions → capture → review.
  // Either of the first two steps can be skipped by setting `hide-consent` /
  // `hide-instructions`. We capture the publish detail in `pendingPayload` so
  // we can show the review screen before re-emitting it to the host page.
  const initialView: View = (() => {
    if (!hideConsent) return 'consent';
    if (!hideInstructions) return 'instructions';
    return 'capture';
  })();

  const viewSignal = useRef(signal<View>(initialView)).current;
  const pendingPayload = useRef<any>(null);
  // Set when a forced-failure completion has fired (e.g. the 120s
  // active-liveness inactivity timeout). Used to short-circuit any later
  // `submission-state` events from the host so the user lands on — and stays
  // on — the failure card regardless of what the backend ultimately returned
  // for the partial upload.
  const forcedFailureRef = useRef<string | null>(null);

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
      // ESS owns the post-capture flow: stash the payload, show our review
      // screen, and only re-emit `selfie-capture.publish` once the user
      // confirms. This keeps ESS independent of SelfieCaptureScreens.
      //
      // Exception: forced-failure completions (e.g. the 120s active-liveness
      // inactivity timeout) skip review entirely. We still publish so the
      // host can submit the partial frames tagged with the failure reason
      // in metadata, but the user lands directly on the error card —
      // bypassing the submitting view — because the outcome is known
      // upfront. Any `submission-state` event the host dispatches after the
      // upload completes is ignored so the success card can't replace the
      // failure card.
      pendingPayload.current = detail;
      if (detail.forceFailureReason) {
        forcedFailureRef.current = detail.forceFailureReason;
        window.dispatchEvent(
          new CustomEvent('selfie-capture.publish', { detail }),
        );
        viewSignal.value = 'error';
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
  // pre-warm it as soon as ESS mounts so by the time the user finishes the
  // consent + instructions flow the heavy network work is already done.
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

  // React to submission-state changes driven by the host page. Once we are
  // in the post-confirm flow (submitting / success / error), the host can
  // flip this attribute to navigate to the result screens. Forced-failure
  // sessions (e.g. liveness timeout) opt out — their outcome is decided
  // locally and must not be overwritten by whatever the backend returns.
  useEffect(() => {
    if (forcedFailureRef.current) return;
    const current = viewSignal.value;
    const isPostConfirm =
      current === 'submitting' || current === 'success' || current === 'error';
    if (!isPostConfirm) return;
    if (submissionState === 'success') viewSignal.value = 'success';
    else if (submissionState === 'error') viewSignal.value = 'error';
    else if (submissionState === 'submitting') viewSignal.value = 'submitting';
  }, [submissionState]);

  // Allow the host page to drive the submission flow via a window event
  // (easier than threading attributes through nested shadow DOMs). Detail:
  //   { state: 'submitting' | 'success' | 'error', message?: string }
  const [eventMessage, setEventMessage] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{
        state: 'submitting' | 'success' | 'error';
        message?: string;
      }>;
      // Forced-failure sessions stay on the error card regardless of what
      // the host dispatches — the outcome is already decided.
      if (forcedFailureRef.current) return;
      const current = viewSignal.value;
      const isPostConfirm =
        current === 'submitting' ||
        current === 'success' ||
        current === 'error';
      if (!isPostConfirm) return;
      if (ce.detail?.state) viewSignal.value = ce.detail.state;
      if (ce.detail?.message !== undefined) setEventMessage(ce.detail.message);
    };
    window.addEventListener('enhanced-smartselfie.submission-state', handler);
    return () => {
      window.removeEventListener(
        'enhanced-smartselfie.submission-state',
        handler,
      );
    };
  }, []);

  // Host-driven forced-failure path (e.g. the hosted-web 120s active-liveness
  // inactivity timer). The host dispatches `enhanced-smartselfie.force-fail`
  // with a `{ reason }` detail; the hook packages whatever frames have been
  // captured so far, fires `onCaptureComplete` with `forceFailureReason`
  // set, which routes the payload through the normal publish pipeline and
  // jumps straight to the submitting view (skipping review).
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
      // Switch to the "Submitting…" view first so the user gets immediate
      // feedback while the host page processes the upload. Keep the payload
      // around so SubmittingView can keep showing the captured selfie.
      viewSignal.value = 'submitting';
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

  // Back-button navigation: step back one view at a time through the
  // capture flow (review → capture → instructions → consent). Only when the
  // user is already on the first available view do we fall through to
  // `handleCancel` so the host page receives `selfie-capture.cancelled`.
  const handleBack = () => {
    const current = viewSignal.value;
    if (current === 'review') {
      // Going back from review = retake (drops the pending payload and
      // re-enters capture). Mirrors the explicit Retake button.
      handleRetake();
      return;
    }
    if (current === 'capture') {
      // Stop the camera/detection loop before leaving so we don't leak
      // resources while sitting on instructions/consent.
      faceCapture.stopDetectionLoop();
      camera.stopCamera();
      faceCapture.resetFaceDetectionState();
      faceCapture.capturesTaken.value = 0;
      if (!hideInstructions) {
        viewSignal.value = 'instructions';
        return;
      }
      if (!hideConsent) {
        viewSignal.value = 'consent';
        return;
      }
      faceCapture.handleCancel();
      return;
    }
    if (current === 'instructions') {
      if (!hideConsent) {
        viewSignal.value = 'consent';
        return;
      }
      faceCapture.handleCancel();
      return;
    }
    // Consent / submitting / success / error: nothing to navigate back to
    // within ESS, so emit cancel and let the host decide what to do.
    faceCapture.handleCancel();
  };

  if (viewSignal.value === 'consent') {
    return (
      <ConsentView
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        partnerName={partnerName}
        partnerLogo={partnerLogo}
        policyUrl={policyUrl}
        onGranted={() => {
          viewSignal.value = hideInstructions ? 'capture' : 'instructions';
        }}
        onDenied={() => faceCapture.handleCancel()}
      />
    );
  }

  if (viewSignal.value === 'instructions') {
    return (
      <InstructionsView
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        isReady={isMediapipeReady}
        onContinue={() => {
          viewSignal.value = 'capture';
        }}
        onBack={showNavigation ? handleBack : undefined}
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

  if (viewSignal.value === 'submitting') {
    const detail = pendingPayload.current;
    const src = detail?.referenceImage || '';
    const mirror = detail?.facingMode === 'user';
    return (
      <SubmissionView
        imageSrc={src}
        mirror={mirror}
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        mode="submitting"
      />
    );
  }

  if (viewSignal.value === 'success' || viewSignal.value === 'error') {
    const detail = pendingPayload.current;
    const src = detail?.referenceImage || '';
    const mirror = detail?.facingMode === 'user';
    const success = viewSignal.value === 'success';
    // When the failure was forced locally (e.g. liveness inactivity
    // timeout), surface a clear reason on the Submission Failed card
    // instead of relying on whatever generic copy the host backend sent.
    const forcedMessage = !success
      ? forcedFailureReasonToMessage(forcedFailureRef.current)
      : undefined;
    return (
      <SubmissionView
        imageSrc={src}
        mirror={mirror}
        themeColor={themeColor}
        hideAttribution={hideAttribution}
        mode={success ? 'success' : 'error'}
        message={forcedMessage ?? eventMessage ?? submissionMessage}
        onContinue={() => {
          window.dispatchEvent(
            new CustomEvent('enhanced-smartselfie.continue', {
              detail: { success },
            }),
          );
        }}
        onExit={
          success
            ? undefined
            : () => {
                window.dispatchEvent(
                  new CustomEvent('enhanced-smartselfie.exit'),
                );
              }
        }
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
      'hide-consent',
      'partner-name',
      'partner-logo',
      'policy-url',
      'submission-state',
      'submission-message',
    ],
    { shadow: true },
  );
}

export default EnhancedSmartSelfieCapture;
