import { useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { useCamera } from './hooks/useCamera';
import { useCardDetection, COMPLIANCE_STATES } from './hooks/useCardDetection';
import { Overlay } from './components/Overlay';
import { CaptureButton } from './components/CaptureButton';
import { TuningPanel } from './components/TuningPanel';
import { ensureOpenCv } from './utils/opencvLoader';
import { theme } from './theme';

// Registers the <smileid-navigation> custom element (back/close buttons,
// localised labels, RTL handling) reused across the SDK's capture screens.
import '../../../navigation/src';

import { getBoolProp } from '../../../../utils/props';
import { JPEG_QUALITY } from '../../../../domain/constants/src/Constants';

interface Props {
  'document-type'?: string;
  'auto-capture'?: 'autoCapture' | 'autoCaptureOnly' | 'manualCaptureOnly';
  'auto-capture-timeout'?: string | number;
  'side-of-id'?: 'Front' | 'Back' | string;
  'show-navigation'?: string | boolean;
  'allow-gallery-upload'?: string | boolean;
  'document-capture-modes'?: string;
  'sync-roi-to-guide'?: string | boolean;
  title?: string;
}

type CaptureMode = 'autoCapture' | 'autoCaptureOnly' | 'manualCaptureOnly';
const CAPTURE_MODES: CaptureMode[] = [
  'autoCapture',
  'autoCaptureOnly',
  'manualCaptureOnly',
];

const getOptimalDefaults = () => {
  const ua =
    navigator.userAgent ||
    navigator.vendor ||
    (window as unknown as { opera?: string }).opera ||
    '';
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return isMobile
    ? {
        deviceType: 'Mobile',
        useDynamicBorder: true,
        edgeDensityThreshold: 6,
        gridCellRatio: 0.5,
        blurThreshold: 150,
        glareThreshold: 5.0,
        stabilityThreshold: 5,
        cropToCard: true,
        cropToContour: true,
        cropPadding: 10,
        previewCropPadding: 2,
        minFillPercent: 75,
        maxFillPercent: 95,
      }
    : {
        deviceType: 'Desktop',
        useDynamicBorder: false,
        edgeDensityThreshold: 6,
        gridCellRatio: 0.6,
        blurThreshold: 60,
        glareThreshold: 18.0,
        stabilityThreshold: 3,
        cropToCard: true,
        cropToContour: true,
        cropPadding: 10,
        previewCropPadding: 2,
        // Desktop ROI == the visible video box (see useCardDetection's
        // skipGridCheck branch), so these percentages are measured against what
        // the user actually sees. Require the card to fill ~70% of the box
        // area (~84% linear — still ~990px of card width on a 720p webcam)
        // before quality checks run; allow up to 98% before asking to back
        // off. The lower floor lets fixed-focus webcams sit at a sharper
        // distance instead of being forced right up to the lens.
        minFillPercent: 70,
        maxFillPercent: 98,
      };
};

const galleryButtonStyle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: 'none',
  padding: 0,
};

const FEEDBACK_MIN_DISPLAY_MS = 500;

function GalleryIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask id="gallery-btn-inside" fill="white">
        <path d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z" />
      </mask>
      <path
        d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z"
        fill="#151F72"
      />
      <path
        d="M0 28M56 28M56 28M0 28M28 0M56 28M28 56M0 28M28 56V55C13.0883 55 1 42.9117 1 28H0H-1C-1 44.0163 11.9837 57 28 57V56ZM56 28H55C55 42.9117 42.9117 55 28 55V56V57C44.0163 57 57 44.0163 57 28H56ZM28 0V1C42.9117 1 55 13.0883 55 28H56H57C57 11.9837 44.0163 -1 28 -1V0ZM28 0V-1C11.9837 -1 -1 11.9837 -1 28H0H1C1 13.0883 13.0883 1 28 1V0Z"
        fill="white"
        fillOpacity="0.1"
        mask="url(#gallery-btn-inside)"
      />
      <path
        d="M35 19H21C19.8954 19 19 19.8954 19 21V35C19 36.1046 19.8954 37 21 37H35C36.1046 37 37 36.1046 37 35V21C37 19.8954 36.1046 19 35 19Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 27C26.1046 27 27 26.1046 27 25C27 23.8954 26.1046 23 25 23C23.8954 23 23 23.8954 23 25C23 26.1046 23.8954 27 25 27Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37 30.9999L33.914 27.9139C33.5389 27.539 33.0303 27.3284 32.5 27.3284C31.9697 27.3284 31.4611 27.539 31.086 27.9139L22 36.9999"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GalleryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={galleryButtonStyle}
      aria-label="Select image from gallery"
    >
      <GalleryIcon />
    </button>
  );
}

/**
 * Inner implementation that owns the camera + detection loop. Only mounted
 * when the host element is actually visible (see `DocumentAutoCapture`
 * wrapper below) so that two sibling instances — front + back — don't both
 * fight for `getUserMedia` and run rAF/OpenCV detection while one is
 * `hidden`. That collision was causing the page to freeze when the element
 * was used inside `<document-capture-screens>`.
 */
function DesktopCaptureButton({
  progress = 0,
  themeColor = '#001096',
  disabled = false,
  onClick,
}: {
  progress: number;
  themeColor: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const size = 70;
  const strokeWidth = 4;
  const ringRadius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const offset = circumference - (progress / 100) * circumference;
  const isActive = progress > 0 && progress < 100;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}
      aria-label="Capture photo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 70 70"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM61 35C61 49.3594 49.3594 61 35 61C20.6406 61 9 49.3594 9 35C9 20.6406 20.6406 9 35 9C49.3594 9 61 20.6406 61 35ZM65 35C65 51.5685 51.5685 65 35 65C18.4315 65 5 51.5685 5 35C5 18.4315 18.4315 5 35 5C51.5685 5 65 18.4315 65 35Z"
          fill={themeColor}
        />
      </svg>
      {isActive && (
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke="#2CC05C"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
      )}
    </button>
  );
}

const DocumentAutoCaptureInner: FunctionComponent<Props> = ({
  'document-type': documentTypeProp = '',
  'auto-capture': captureModeProp = 'autoCapture',
  'auto-capture-timeout': autoCaptureTimeoutProp = '20000',
  'side-of-id': sideOfId = 'Front',
  'theme-color': themeColor = '#001096',
  title = '',
  'show-navigation': showNavigationProp = false,
  'allow-gallery-upload': allowGalleryUploadProp = true,
  'document-capture-modes': documentCaptureModesProp,
  'sync-roi-to-guide': syncRoiToGuideProp = true,
}) => {
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const captureFiredRef = useRef(false);

  const showNavigation = getBoolProp(showNavigationProp);
  // Honour `document-capture-modes`: when explicitly set to a value that
  // does not include `upload` (e.g. just `camera`), the gallery upload
  // affordance must be hidden regardless of the `allow-gallery-upload`
  // default. This mirrors how <document-capture-instructions> gates its
  // upload button on the same attribute.
  const captureModesAllowUpload = (() => {
    if (
      documentCaptureModesProp === undefined ||
      documentCaptureModesProp === null
    ) {
      return true;
    }
    const modes = String(documentCaptureModesProp)
      .toLowerCase()
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    if (modes.length === 0) return true;
    return modes.includes('upload');
  })();
  const allowGalleryUpload =
    getBoolProp(allowGalleryUploadProp, true) && captureModesAllowUpload;
  const syncRoiToGuide = getBoolProp(syncRoiToGuideProp, true);

  const captureMode: CaptureMode = CAPTURE_MODES.includes(
    captureModeProp as CaptureMode,
  )
    ? (captureModeProp as CaptureMode)
    : 'autoCapture';
  // Clamp to the documented 3000–30000ms range. Values outside this band
  // tend to either fire the manual fallback before the user has a chance
  // to align the document (too low) or never surface it at all (too high).
  const AUTO_CAPTURE_TIMEOUT_MIN_MS = 3_000;
  const AUTO_CAPTURE_TIMEOUT_MAX_MS = 30_000;
  const AUTO_CAPTURE_TIMEOUT_DEFAULT_MS = 20_000;
  const autoCaptureTimeout = (() => {
    const n = Number(autoCaptureTimeoutProp);
    if (!Number.isFinite(n) || n <= 0) return AUTO_CAPTURE_TIMEOUT_DEFAULT_MS;
    return Math.min(
      AUTO_CAPTURE_TIMEOUT_MAX_MS,
      Math.max(AUTO_CAPTURE_TIMEOUT_MIN_MS, n),
    );
  })();

  // Map upper-case enum values used elsewhere in web-components (GREEN_BOOK,
  // ID_CARD, PASSPORT) to the lower-case keys used by useCardDetection.
  const documentType = ((): 'greenbook' | 'id-card' | 'passport' | null => {
    if (!documentTypeProp) return null;
    const v = String(documentTypeProp).toLowerCase();
    if (v === 'green_book' || v === 'greenbook') return 'greenbook';
    if (v === 'id_card' || v === 'id-card') return 'id-card';
    if (v === 'passport') return 'passport';
    return 'id-card';
  })();

  const [settings, setSettings] = useState(getOptimalDefaults());
  // Track the camera-viewport box (the absolute-positioned div that fills the
  // host) rather than the page viewport, so the component fills its parent
  // even when embedded inside another layout (e.g. <document-capture-screens>).
  const cameraViewportRef = useRef<HTMLDivElement>(null);
  // The shared <smileid-navigation> element (only one layout mounts at a time).
  const navigationRef = useRef<HTMLElement | null>(null);
  const [viewportBox, setViewportBox] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const isTallViewport = viewportBox.h > viewportBox.w;
  const updateSetting = (key: string, value: unknown) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const showDebug = true;

  console.log('[DocumentAutoCapture] settings', { settings, window });
  // Lazy-load OpenCV on mount; the detection hook polls for `cv.Mat`.
  useEffect(() => {
    ensureOpenCv().catch((err: unknown) => {
      console.warn('[document-auto-capture] OpenCV load failed:', err);
    });
  }, []);

  // Observe the camera viewport's box for orientation + rotation sizing.
  useEffect(() => {
    const el = cameraViewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      setViewportBox({ w: el.clientWidth, h: el.clientHeight });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isLandscapeDocumentType =
    documentType === 'id-card' || documentType === 'passport';
  const useLandscapeUi = isLandscapeDocumentType;
  // Rotate the UI 90 degrees only on touch devices (mobile / tablet) where
  // the user is expected to be holding the phone in portrait. On desktop /
  // laptop with a portrait-shaped parent box (e.g. the dev playground
  // 360px column) we keep the un-rotated layout because the user can't
  // rotate their monitor.
  const isMobileDevice = settings.deviceType === 'Mobile';
  const shouldRotateUi = useLandscapeUi && isTallViewport && isMobileDevice;
  const effectiveCaptureOrientation = isLandscapeDocumentType
    ? 'landscape'
    : 'portrait';

  const { videoRef, error } = useCamera();
  const {
    feedback,
    captureProgress,
    capturedImage,
    previewImage,
    captureOrigin,
    complianceState,
    debugInfo,
    debugPath,
    debugRoi,
    detectedDocType,
    guideAspectRatio,
    manualFallbackActive,
    cvLoadFailed,
    triggerManualCapture,
  } = useCardDetection(videoRef, settings, {
    variant: 'fullscreen',
    documentType,
    captureMode,
    autoCaptureTimeout,
    captureOrientation: effectiveCaptureOrientation,
    shouldRotateUi,
    syncRoiToGuide,
    skipGridCheck: settings.deviceType !== 'Mobile',
  });

  const [visibleFeedback, setVisibleFeedback] = useState<string>(feedback);
  const feedbackHoldUntilRef = useRef(0);
  const pendingFeedbackRef = useRef<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const immediateState =
      complianceState === COMPLIANCE_STATES.CAPTURING ||
      complianceState === COMPLIANCE_STATES.SUCCESS;

    if (immediateState || !visibleFeedback) {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      pendingFeedbackRef.current = null;
      setVisibleFeedback(feedback);
      feedbackHoldUntilRef.current = Date.now() + FEEDBACK_MIN_DISPLAY_MS;
      return;
    }

    if (feedback === visibleFeedback) {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      pendingFeedbackRef.current = null;
      return;
    }

    const now = Date.now();
    const remaining = feedbackHoldUntilRef.current - now;

    if (remaining <= 0) {
      setVisibleFeedback(feedback);
      feedbackHoldUntilRef.current = now + FEEDBACK_MIN_DISPLAY_MS;
      return;
    }

    pendingFeedbackRef.current = feedback;
    if (feedbackTimerRef.current) return;

    feedbackTimerRef.current = setTimeout(() => {
      feedbackTimerRef.current = null;
      if (pendingFeedbackRef.current) {
        setVisibleFeedback(pendingFeedbackRef.current);
        pendingFeedbackRef.current = null;
        feedbackHoldUntilRef.current = Date.now() + FEEDBACK_MIN_DISPLAY_MS;
      }
    }, remaining);
  }, [feedback, complianceState, visibleFeedback]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    },
    [],
  );

  // Debounced compliance state for visual output.
  // The raw complianceState updates every detection frame (~60fps). Feeding it
  // directly to the Overlay and spinner causes rapid color/mount oscillation
  // when detection quality is borderline. A 150ms trailing debounce smooths
  // this; CAPTURING/SUCCESS bypass it so the final confirmation is immediate.
  const COMPLIANCE_DEBOUNCE_MS = 150;
  const [visibleComplianceState, setVisibleComplianceState] =
    useState(complianceState);
  useEffect(() => {
    const isImmediate =
      complianceState === COMPLIANCE_STATES.CAPTURING ||
      complianceState === COMPLIANCE_STATES.SUCCESS;
    const t = setTimeout(
      () => setVisibleComplianceState(complianceState),
      isImmediate ? 0 : COMPLIANCE_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [complianceState]);

  // Notify smart-camera-web when the capture session begins.
  useEffect(() => {
    const smartCameraWeb = document.querySelector('smart-camera-web');
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.document-capture-start', {
        detail: { side: sideOfId },
      }),
    );
    return () => {
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.document-capture-end', {
          detail: { side: sideOfId },
        }),
      );
    };
  }, [sideOfId]);

  // Resolve THIS instance's host element (not the first match in the
  // document) by walking up from a node inside the shadow root. Using
  // `document.querySelector('document-auto-capture')` here is wrong when
  // there are sibling instances (front + back), because it always returns
  // the front and the back's events would never reach its listener.
  const getHost = (): Element | null => {
    const node =
      cameraViewportRef.current || videoRef.current || galleryInputRef.current;
    const root = node?.getRootNode();
    if (root && root instanceof ShadowRoot) return root.host;
    return document.querySelector('document-auto-capture');
  };

  // Re-encode at JPEG_QUALITY before publishing so output matches the legacy
  // `<document-capture>` element exactly. The detection hook captures at 0.95
  // quality for internal use; we round-trip via an Image to set the package's
  // canonical JPEG_QUALITY.
  const reencodeJpeg = (
    dataUrl: string,
  ): Promise<{ data: string; width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        resolve({
          data: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });

  const publishImage = (
    dataUrl: string,
    origin: string,
    preview: string | null,
  ) => {
    if (!dataUrl || captureFiredRef.current) return;
    captureFiredRef.current = true;

    const fullPromise = reencodeJpeg(dataUrl);
    const previewPromise = preview
      ? reencodeJpeg(preview)
      : Promise.resolve(null);

    Promise.all([fullPromise, previewPromise])
      .then(([full, prev]) => {
        const finalImage = full.data;
        const previewOut = prev ? prev.data : finalImage;

        // Use the same event surface as the legacy element for drop-in parity.
        const host = getHost();
        const target = host || document;
        target.dispatchEvent(
          new CustomEvent('document-capture.publish', {
            bubbles: true,
            composed: true,
            detail: {
              image: finalImage,
              originalHeight: full.height,
              originalWidth: full.width,
              previewImage: previewOut,
              side: sideOfId,
              captureOrigin: origin,
            },
          }),
        );
      })
      .catch(() => {
        console.error('[document-auto-capture] failed to decode capture');
      });
  };

  useEffect(() => {
    if (capturedImage) {
      publishImage(
        capturedImage,
        captureOrigin || 'camera_auto_capture',
        previewImage,
      );
    }
  }, [capturedImage]);

  // Wire up navigation back/close events.
  const dispatchHostEvent = (name: string) => {
    const host = getHost();
    (host || document).dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  };

  // `document-capture.*` is the canonical event name: it matches the legacy
  // <document-capture> element (so this stays a drop-in replacement), the
  // README, and the listener DocumentCaptureScreens binds for "cancelled".
  // The `document-auto-capture.*` variant is also emitted so the screens
  // wrapper's dynamic `${nodeName}.close` listener still fires.
  const onBack = () => {
    dispatchHostEvent('document-capture.cancelled');
    dispatchHostEvent('document-auto-capture.cancelled');
  };
  const onClose = () => {
    dispatchHostEvent('document-capture.close');
    dispatchHostEvent('document-auto-capture.close');
  };

  // Bridge the <smileid-navigation> element's custom events to the same
  // back/close handlers. Mirrors SmartSelfieCapture's wiring; only one layout
  // (and thus one navigation element) is mounted at a time, so a single ref
  // suffices.
  useEffect(() => {
    const navigation = navigationRef.current;
    if (!navigation || !showNavigation) return undefined;
    const handleBack = () => onBack();
    const handleClose = () => onClose();
    navigation.addEventListener('navigation.back', handleBack);
    navigation.addEventListener('navigation.close', handleClose);
    return () => {
      navigation.removeEventListener('navigation.back', handleBack);
      navigation.removeEventListener('navigation.close', handleClose);
    };
  }, [showNavigation]);

  // Capture-button ring progress. `captureProgress` (0–100) already reflects
  // the stability count vs the threshold; the previous `debugInfo.stability`
  // lookup was always undefined (the hook never sets that field), so the ring
  // stayed at 0.
  const progress =
    visibleComplianceState === COMPLIANCE_STATES.STABLE ? captureProgress : 0;

  // Whether to show the manual capture button.
  //   manualCaptureOnly  — always show
  //   autoCapture        — show after timeout fallback or if OpenCV failed to load
  //   autoCaptureOnly    — never show (error UI handles cv load failure)
  const showManualButton =
    captureMode === 'manualCaptureOnly' ||
    (captureMode === 'autoCapture' && (manualFallbackActive || cvLoadFailed));

  if (error) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
          textAlign: 'center',
          color: theme.colors.error,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p style={{ marginTop: theme.spacing.md, fontSize: '1rem' }}>
          Camera access denied or unavailable
        </p>
        <p
          style={{
            fontSize: '0.85rem',
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.sm,
          }}
        >
          Please allow camera access and reload the page.
        </p>
      </div>
    );
  }

  /* ---- Fullscreen layout ---- */
  const baseShowSideSpinner = [
    COMPLIANCE_STATES.DETECTING,
    COMPLIANCE_STATES.STABLE,
    COMPLIANCE_STATES.CAPTURING,
  ].includes(visibleComplianceState);

  let spinnerProgress: number;
  if (visibleComplianceState === COMPLIANCE_STATES.STABLE) {
    spinnerProgress = Math.max(15, progress);
  } else if (visibleComplianceState === COMPLIANCE_STATES.CAPTURING) {
    spinnerProgress = 99;
  } else {
    spinnerProgress = 25;
  }

  const showManualCaptureControl =
    showManualButton ||
    (allowGalleryUpload && captureMode !== 'autoCaptureOnly');

  // Side-mounted controls are only used in the rotated UI. When the UI is
  // not rotated (e.g. landscape doc type on desktop), buttons live in the
  // bottom row alongside the portrait layout.
  const useSideManualCapture = shouldRotateUi && showManualCaptureControl;
  const showSideGalleryButton = shouldRotateUi && allowGalleryUpload;
  const showBottomGalleryButton = allowGalleryUpload && !showSideGalleryButton;
  // Only show the side progress spinner when the UI is actually rotated
  // (landscape doc type on a portrait viewport). In portrait/un-rotated UI
  // the bottom CaptureButton already shows progress, so a second spinner on
  // the right would just be a duplicate floating button.
  const showSideSpinner =
    baseShowSideSpinner && shouldRotateUi && !useSideManualCapture;
  const sideButtonProgress =
    visibleComplianceState === COMPLIANCE_STATES.STABLE ? captureProgress : 0;

  const handlePickFromGallery = () => {
    if (!allowGalleryUpload) return;
    galleryInputRef.current?.click();
  };

  const handleGalleryChange = (event: Event) => {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData =
        typeof reader.result === 'string' ? reader.result : null;
      if (imageData) publishImage(imageData, 'gallery', null);
    };
    reader.readAsDataURL(file);
    if (target) target.value = '';
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: theme.fonts.base,
  };

  // Inline styles for shadow-DOM host + global resets so the layout matches
  // the id-scanner viewport (where these come from index.css globally).
  const hostStyles = `
    :host { display: block; width: 100%; height: 100%; }
    *, *::before, *::after { box-sizing: border-box; }
  `;

  /* ---- Desktop layout ----
     Matches the legacy `<document-capture>` visual style: optional nav
     buttons at top, constrained video with a simple solid border whose
     colour reflects detection state, title + dynamic feedback text below
     the video, and the legacy concentric-circle capture button.
     Auto-capture detection logic (useCardDetection) is unchanged.
  */
  if (!isMobileDevice) {
    const borderColor = (() => {
      if (
        complianceState === COMPLIANCE_STATES.STABLE ||
        complianceState === COMPLIANCE_STATES.SUCCESS ||
        complianceState === COMPLIANCE_STATES.CAPTURING
      ) {
        return '#2CC05C';
      }
      if (complianceState === COMPLIANCE_STATES.DETECTING) {
        return '#F59E0B';
      }
      return '#9394ab';
    })();

    const titleLabel = title || `Submit ${sideOfId} of ID`;

    return (
      <div
        className="document-auto-capture document-auto-capture--desktop"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          fontFamily: theme.fonts.base,
          boxSizing: 'border-box',
        }}
      >
        <style>{hostStyles}</style>

        {allowGalleryUpload && (
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryChange}
            style={{ display: 'none' }}
          />
        )}

        {/* Navigation row — reuses the shared <smileid-navigation> element.
            Light desktop chrome: dark icons on a faint grey pill, overriding
            the element's default translucent-on-dark styling via CSS vars. */}
        {showNavigation && (
          <div style={{ padding: '0.75rem 1rem 0' }}>
            {/* @ts-expect-error preact-custom-element lacks ref/attr types */}
            <smileid-navigation
              ref={navigationRef}
              style={{
                width: '100%',
                '--smileid-navigation-button-bg': 'rgba(0,0,0,0.08)',
                '--smileid-navigation-icon-color': 'rgba(0,0,0,0.7)',
                '--smileid-navigation-focus-color': themeColor,
              }}
            />
          </div>
        )}

        {/* Video area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflow: 'hidden',
          }}
        >
          <div
            ref={cameraViewportRef}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              aspectRatio: `${guideAspectRatio} / 1`,
              borderRadius: 4,
              overflow: 'hidden',
              border: `4px solid ${borderColor}`,
              transition: 'border-color 0.25s ease',
              backgroundColor: '#000',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Debug-only: outline the active detection ROI so threshold
                issues (wall-hug, overflow, fill %) can be judged visually. */}
            {showDebug && debugRoi ? (
              <div
                style={{
                  position: 'absolute',
                  left: debugRoi.x,
                  top: debugRoi.y,
                  width: debugRoi.w,
                  height: debugRoi.h,
                  border: '2px dashed #ff3b30',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 4,
                    color: '#ff3b30',
                    font: '600 10px/1 sans-serif',
                    textShadow: '0 0 2px rgba(0,0,0,0.8)',
                  }}
                >
                  ROI
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer: title, feedback text, capture button */}
        <div
          style={{
            padding: '0 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: themeColor,
            }}
          >
            {titleLabel}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#333',
              minHeight: '1.25rem',
            }}
          >
            {visibleFeedback}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '0.75rem',
            }}
          >
            {allowGalleryUpload && (
              <GalleryButton onClick={handlePickFromGallery} />
            )}
            {/* The manual shutter only appears when it can actually be used
                (showManualButton): immediately for manualCaptureOnly, after
                the auto-capture timeout fallback fires in autoCapture, or on
                CV load failure; never in autoCaptureOnly. Auto-capture state
                is conveyed by the video border, so no progress ring is needed
                while the shutter is hidden. */}
            {showManualButton && (
              <DesktopCaptureButton
                progress={
                  complianceState === COMPLIANCE_STATES.STABLE
                    ? captureProgress
                    : 0
                }
                themeColor={themeColor}
                disabled={complianceState === COMPLIANCE_STATES.SUCCESS}
                onClick={triggerManualCapture}
              />
            )}
          </div>

          {captureMode === 'autoCaptureOnly' && cvLoadFailed && (
            <p
              style={{
                color: theme.colors.error,
                fontSize: '0.8rem',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Auto-detection unavailable. Please reload or try another browser.
            </p>
          )}
        </div>

        {showDebug && (
          <TuningPanel
            settings={settings}
            updateSetting={updateSetting}
            debugInfo={debugInfo}
          />
        )}
      </div>
    );
  }

  return (
    <div className="document-auto-capture" style={containerStyle}>
      <style>{hostStyles}</style>

      {allowGalleryUpload && (
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryChange}
          style={{ display: 'none' }}
        />
      )}

      {/* Camera viewport — fills the host absolutely. The rotated overlay
          below uses the observed pixel dimensions of this box (via
          ResizeObserver) so it matches the visible camera area regardless
          of whether the host fills the page viewport or a smaller parent. */}
      <div
        ref={cameraViewportRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* UI overlay container — rotated 90° CW on portrait phones with landscape doc types */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            ...(shouldRotateUi
              ? {
                  // Rotated 90° CW — swap parent box dimensions so the
                  // rotated rectangle covers the camera viewport exactly.
                  width: viewportBox.h ? `${viewportBox.h}px` : '100%',
                  height: viewportBox.w ? `${viewportBox.w}px` : '100%',
                  transformOrigin: '0 0',
                  transform: 'rotate(90deg) translateY(-100%)',
                }
              : {
                  width: '100%',
                  height: '100%',
                }),
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5,
          }}
        >
          {/* Top controls — reuses the shared <smileid-navigation> element,
              spanning the top so Back lands top-left and Close top-right. The
              element's default translucent-on-dark styling already matches the
              fullscreen camera chrome. */}
          {showNavigation && (
            <div
              style={{
                position: 'absolute',
                top: 32,
                left: 16,
                right: 16,
                zIndex: 10,
                pointerEvents: 'auto',
              }}
            >
              {/* @ts-expect-error preact-custom-element lacks ref/attr types */}
              <smileid-navigation
                ref={navigationRef}
                style={{
                  width: '100%',
                  '--smileid-navigation-button-bg': 'rgba(0,0,0,0.55)',
                  '--smileid-navigation-icon-color': '#fff',
                }}
              />
            </div>
          )}

          {/* Detection overlay with guide box */}
          <Overlay
            complianceState={visibleComplianceState}
            debugPath={debugPath}
            showDebug={showDebug}
            guideAspectRatio={guideAspectRatio}
            detectedDocType={detectedDocType}
            sideOfId={sideOfId}
            isRotated={shouldRotateUi}
          />

          {/* Side capture-progress button */}
          {showSideSpinner && (
            <div
              style={{
                position: 'absolute',
                right: 34,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 11,
                pointerEvents: 'auto',
              }}
            >
              <CaptureButton
                progress={spinnerProgress}
                disabled={false}
                appearance="light"
                onClick={() => {}}
              />
            </div>
          )}

          {/* Side manual capture button — anchor the CaptureButton (72px) at
              the vertical center so the gallery button stacks below without
              shifting the shutter off-center. */}
          {(useSideManualCapture || showSideGalleryButton) && (
            <div
              style={{
                position: 'absolute',
                right: 22,
                top: 'calc(50% - 36px)',
                zIndex: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
                pointerEvents: 'auto',
              }}
            >
              {useSideManualCapture && (
                <CaptureButton
                  progress={sideButtonProgress}
                  disabled={complianceState === COMPLIANCE_STATES.SUCCESS}
                  appearance="light"
                  onClick={triggerManualCapture}
                />
              )}
              {showSideGalleryButton && (
                <GalleryButton onClick={handlePickFromGallery} />
              )}
            </div>
          )}

          {/* Floating capture status pill */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: shouldRotateUi ? 5 : 184,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(35,35,35,0.95)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '9px 20px',
              minWidth: 220,
              maxWidth: 'calc(100% - 32px)',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
              pointerEvents: 'auto',
            }}
          >
            <span
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: theme.fonts.base,
                letterSpacing: '-0.1px',
              }}
            >
              {visibleFeedback}
            </span>
          </div>
        </div>

        {/* Manual fallback button — only shown in portrait layout (not rotated).
            Matches the landscape side-button styling: bare CaptureButton with
            no pill background. The CaptureButton is centered absolutely; the
            gallery button is anchored to its right so the shutter stays on
            the horizontal centerline regardless of which controls are shown. */}
        {!shouldRotateUi &&
          (showManualCaptureControl || showBottomGalleryButton) &&
          !useSideManualCapture && (
            <>
              {showManualCaptureControl && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 60,
                    transform: 'translateX(-50%)',
                    zIndex: 12,
                  }}
                >
                  <CaptureButton
                    progress={
                      complianceState === COMPLIANCE_STATES.STABLE
                        ? captureProgress
                        : 0
                    }
                    disabled={complianceState === COMPLIANCE_STATES.SUCCESS}
                    appearance="light"
                    onClick={triggerManualCapture}
                  />
                </div>
              )}
              {showBottomGalleryButton && (
                <div
                  style={{
                    position: 'absolute',
                    // Shutter is 72 px wide and centered; gallery sits to its
                    // left at 36 px half-width + 24 px gap so the shutter
                    // stays exactly on the centerline.
                    left: showManualCaptureControl
                      ? 'calc(50% - 36px - 24px)'
                      : '50%',
                    bottom: 60,
                    transform: showManualCaptureControl
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
                    zIndex: 12,
                  }}
                >
                  <GalleryButton onClick={handlePickFromGallery} />
                </div>
              )}
              {captureMode === 'autoCaptureOnly' && cvLoadFailed && (
                <p
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 28,
                    transform: 'translateX(-50%)',
                    zIndex: 12,
                    color: theme.colors.error,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  Auto-detection unavailable. Please reload or try another
                  browser.
                </p>
              )}
            </>
          )}
      </div>

      {/* Tuning panel (debug mode only) */}
      {showDebug && (
        <TuningPanel
          settings={settings}
          updateSetting={updateSetting}
          debugInfo={debugInfo}
        />
      )}
    </div>
  );
};

/**
 * `<document-auto-capture>` — auto-capture document scanner.
 *
 * Drop-in replacement for the legacy `<document-capture>` element used by
 * `DocumentCaptureScreens`. The orchestrator renders both front + back
 * instances simultaneously and toggles their `hidden` attribute, so this
 * wrapper observes the host's `hidden` attribute and only mounts the heavy
 * inner component (camera + OpenCV detection loop) while it's visible.
 */
const DocumentAutoCapture: FunctionComponent<Props> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current?.getRootNode();
    const host =
      root && root instanceof ShadowRoot ? (root.host as HTMLElement) : null;

    if (!host) {
      // Not inside a shadow root (e.g. test harness) — always render.
      setIsActive(true);
      return undefined;
    }

    const update = () => setIsActive(!host.hasAttribute('hidden'));
    update();

    const obs = new MutationObserver(update);
    obs.observe(host, { attributes: true, attributeFilter: ['hidden'] });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      style={{ width: '100%', height: '100%', display: 'contents' }}
    >
      {isActive ? <DocumentAutoCaptureInner {...props} /> : null}
    </div>
  );
};

if (
  typeof customElements !== 'undefined' &&
  !customElements.get('document-auto-capture')
) {
  register(
    DocumentAutoCapture,
    'document-auto-capture',
    [
      'document-type',
      'auto-capture',
      'auto-capture-timeout',
      'side-of-id',
      'show-navigation',
      'allow-gallery-upload',
      'document-capture-modes',
      'sync-roi-to-guide',
      'title',
    ],
    { shadow: true },
  );
}

export default DocumentAutoCapture;
