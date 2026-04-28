import { useState, useEffect, useRef } from 'preact/hooks';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { useCamera } from './hooks/useCamera';
import {
  useCardDetection,
  COMPLIANCE_STATES,
} from './hooks/useCardDetection';
import { Overlay } from './components/Overlay';
import { CaptureButton } from './components/CaptureButton';
import { TuningPanel } from './components/TuningPanel';
import { ensureOpenCv } from './utils/opencvLoader';
import { theme } from './theme';

import '../../../attribution/PoweredBySmileId';

import { getBoolProp } from '../../../../utils/props';
import { JPEG_QUALITY } from '../../../../domain/constants/src/Constants';

interface Props {
  'document-type'?: string;
  'capture-mode'?: 'autoCapture' | 'autoCaptureOnly' | 'manualCaptureOnly';
  'auto-capture-timeout'?: string | number;
  'side-of-id'?: 'Front' | 'Back' | string;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'allow-gallery-upload'?: string | boolean;
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
        cropPadding: 10,
      }
    : {
        deviceType: 'Desktop',
        useDynamicBorder: false,
        edgeDensityThreshold: 6,
        gridCellRatio: 0.6,
        blurThreshold: 130,
        glareThreshold: 18.0,
        stabilityThreshold: 3,
        cropToCard: true,
        cropPadding: 10,
      };
};

const roundControlButtonStyle = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  backdropFilter: 'blur(1px)',
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

const galleryButtonInnerStyle = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.15)',
  backgroundColor: '#1d2f9d',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
};

const FEEDBACK_MIN_DISPLAY_MS = 500;

function GalleryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="white" strokeWidth="2" />
      <circle cx="9" cy="10" r="1.4" fill="white" />
      <path d="M6.5 16l4.2-4.2 2.8 2.8 1.9-1.9 2.1 2.1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      <span style={galleryButtonInnerStyle}>
        <GalleryIcon />
      </span>
    </button>
  );
}

/**
 * `<document-auto-capture>` — auto-capture document scanner.
 *
 * Designed to be a drop-in replacement for the legacy `<document-capture>`
 * element used by `DocumentCaptureScreens`. Until cutover, both elements
 * ship in the bundle so consumers can opt in.
 */
const DocumentAutoCapture: FunctionComponent<Props> = ({
  'document-type': documentTypeProp = '',
  'capture-mode': captureModeProp = 'autoCapture',
  'auto-capture-timeout': autoCaptureTimeoutProp = '10000',
  'side-of-id': sideOfId = 'Front',
  'theme-color': themeColor = '#001096',
  'show-navigation': showNavigationProp = false,
  'hide-attribution': hideAttributionProp = false,
  'allow-gallery-upload': allowGalleryUploadProp = true,
  title: titleProp,
  // themeColor accepted for parity with legacy <document-capture>; styling
  // currently uses fixed dark camera UI matching id-scanner.
  // 'theme-color' destructured above to keep the attribute on the API surface.
}) => {
  void themeColor;
  void titleProp;
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const captureFiredRef = useRef(false);

  const showNavigation = getBoolProp(showNavigationProp);
  const hideAttribution = getBoolProp(hideAttributionProp);
  const allowGalleryUpload = getBoolProp(allowGalleryUploadProp, true);

  // Normalise capture-mode and timeout prop strings to runtime values.
  const captureMode: CaptureMode = CAPTURE_MODES.includes(
    captureModeProp as CaptureMode,
  )
    ? (captureModeProp as CaptureMode)
    : 'autoCapture';
  const autoCaptureTimeout = (() => {
    const n = Number(autoCaptureTimeoutProp);
    return Number.isFinite(n) && n > 0 ? n : 10_000;
  })();

  // Map upper-case enum values used elsewhere in web-components (GREEN_BOOK,
  // ID_CARD, PASSPORT) to the lower-case keys used by useCardDetection.
  const documentType = ((): 'greenbook' | 'id-card' | 'passport' | null => {
    if (!documentTypeProp) return null;
    const v = String(documentTypeProp).toLowerCase();
    if (v === 'green_book' || v === 'greenbook') return 'greenbook';
    if (v === 'id_card' || v === 'id-card') return 'id-card';
    if (v === 'passport') return 'passport';
    return null;
  })();

  const [settings, setSettings] = useState(getOptimalDefaults());
  const [isTallViewport, setIsTallViewport] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false,
  );
  const updateSetting = (key: string, value: unknown) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const showDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug');

  // Lazy-load OpenCV on mount; the detection hook polls for `cv.Mat`.
  useEffect(() => {
    ensureOpenCv().catch((err: unknown) => {
      console.warn('[document-auto-capture] OpenCV load failed:', err);
    });
  }, []);

  // Track viewport orientation changes to trigger UI rotation
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateViewportShape = () => {
      setIsTallViewport(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', updateViewportShape);
    window.addEventListener('orientationchange', updateViewportShape);
    updateViewportShape();

    return () => {
      window.removeEventListener('resize', updateViewportShape);
      window.removeEventListener('orientationchange', updateViewportShape);
    };
  }, []);

  const isLandscapeDocumentType =
    documentType === 'id-card' || documentType === 'passport';
  const useLandscapeUi = isLandscapeDocumentType;
  const shouldRotateUi = useLandscapeUi && isTallViewport;
  const effectiveCaptureOrientation = isLandscapeDocumentType
    ? 'landscape'
    : 'portrait';

  const { videoRef, error } = useCamera();
  const {
    feedback,
    capturedImage,
    captureOrigin,
    complianceState,
    debugInfo,
    debugPath,
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

    if (feedback === visibleFeedback) return;

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

  // Re-encode at JPEG_QUALITY before publishing so output matches the legacy
  // `<document-capture>` element exactly. The detection hook captures at 0.95
  // quality for internal use; we round-trip via an Image to set the package's
  // canonical JPEG_QUALITY.
  const publishImage = (dataUrl: string, origin: string) => {
    if (!dataUrl || captureFiredRef.current) return;
    captureFiredRef.current = true;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      const finalImage = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

      // Use the same event surface as the legacy element for drop-in parity.
      const host = document.querySelector('document-auto-capture');
      const target = host || document;
      target.dispatchEvent(
        new CustomEvent('document-capture.publish', {
          bubbles: true,
          composed: true,
          detail: {
            image: finalImage,
            originalHeight: canvas.height,
            originalWidth: canvas.width,
            previewImage: finalImage,
            side: sideOfId,
            captureOrigin: origin,
          },
        }),
      );
    };
    img.onerror = () => {
      console.error('[document-auto-capture] failed to decode capture');
    };
    img.src = dataUrl;
  };

  // When auto-capture fires, publish image up
  useEffect(() => {
    if (capturedImage) {
      publishImage(capturedImage, captureOrigin || 'auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  // Wire up navigation back/close events.
  const dispatchHostEvent = (name: string) => {
    const host = document.querySelector('document-auto-capture');
    (host || document).dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  };

  const onBack = () => dispatchHostEvent('document-capture.cancelled');
  const onClose = () => dispatchHostEvent('document-capture.close');

  // Calculate progress for the capture button ring
  const progress =
    complianceState === COMPLIANCE_STATES.STABLE
      ? Math.min(
          100,
          (((debugInfo as { stability?: number })?.stability || 0) /
            settings.stabilityThreshold) *
            100,
        )
      : 0;

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
  ].includes(complianceState);

  const spinnerProgress =
    complianceState === COMPLIANCE_STATES.STABLE
      ? Math.max(15, progress)
      : complianceState === COMPLIANCE_STATES.CAPTURING
        ? 99
        : 25;

  const showManualCaptureControl =
    showManualButton ||
    (allowGalleryUpload && captureMode !== 'autoCaptureOnly');

  const useSideManualCapture = useLandscapeUi && showManualCaptureControl;
  const showSideGalleryButton = useLandscapeUi && allowGalleryUpload;
  const showBottomGalleryButton = allowGalleryUpload && !showSideGalleryButton;
  const showSideSpinner = baseShowSideSpinner && !useSideManualCapture;
  const sideButtonProgress =
    complianceState === COMPLIANCE_STATES.STABLE
      ? Math.round(Number((feedback.match(/(\d+)%/) || [, 0])[1]))
      : 0;

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
      if (imageData) publishImage(imageData, 'gallery');
    };
    reader.readAsDataURL(file);
    if (target) target.value = '';
  };

  const containerStyle = {
    width: '100%',
    height: '100vh',
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
    :host { display: block; width: 100%; height: 100vh; }
    *, *::before, *::after { box-sizing: border-box; }
  `;

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

      {/* Camera viewport — fills the host absolutely so the rotated overlay's
          100vh/100vw dimensions always match the visible camera area
          (independent of any sibling chrome like attribution). */}
      <div
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
                  width: '100vh',
                  height: '100vw',
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
          {/* Top controls — id-scanner-styled round translucent buttons.
              Back sits near the top edge; Close is aligned vertically with the
              capture button row so they share the same baseline. */}
          {showNavigation && (
            <>
              <button
                onClick={onBack}
                style={{
                  ...roundControlButtonStyle,
                  position: 'absolute',
                  top: 32,
                  left: 16,
                  zIndex: 10,
                  pointerEvents: 'auto',
                }}
                aria-label="Back"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={onClose}
                style={{
                  ...roundControlButtonStyle,
                  position: 'absolute',
                  top: 32,
                  right: 34,
                  zIndex: 10,
                  pointerEvents: 'auto',
                }}
                aria-label="Close camera"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <line x1="3" y1="3" x2="17" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="17" y1="3" x2="3" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </>
          )}

          {/* Detection overlay with guide box */}
          <Overlay
            complianceState={complianceState}
            debugPath={debugPath}
            showDebug={showDebug}
            guideAspectRatio={guideAspectRatio}
            detectedDocType={detectedDocType}
            sideOfId={sideOfId}
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

          {/* Side manual capture button */}
          {(useSideManualCapture || showSideGalleryButton) && (
            <div
              style={{
                position: 'absolute',
                right: 34,
                top: '50%',
                transform: 'translateY(-50%)',
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
              bottom: 24,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(35,35,35,0.95)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '14px 20px',
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

        {/* Manual fallback button — only shown in portrait layout (not rotated) */}
        {!shouldRotateUi &&
          (showManualCaptureControl || showBottomGalleryButton) &&
          !useSideManualCapture && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 102,
                transform: 'translateX(-50%)',
                zIndex: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: '8px 10px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(15,23,42,0.28)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {showManualCaptureControl && (
                  <CaptureButton
                    progress={
                      complianceState === COMPLIANCE_STATES.STABLE
                        ? Math.round(
                            Number((feedback.match(/(\d+)%/) || [, 0])[1]),
                          )
                        : 0
                    }
                    disabled={complianceState === COMPLIANCE_STATES.SUCCESS}
                    appearance="light"
                    onClick={triggerManualCapture}
                  />
                )}
                {showBottomGalleryButton && (
                  <GalleryButton onClick={handlePickFromGallery} />
                )}
              </div>
              {captureMode === 'autoCaptureOnly' && cvLoadFailed && (
                <p
                  style={{
                    color: theme.colors.error,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    margin: `${theme.spacing.sm} 0 0`,
                  }}
                >
                  Auto-detection unavailable. Please reload or try another browser.
                </p>
              )}
            </div>
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

      {!hideAttribution && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            pointerEvents: 'auto',
          }}
        >
          {/* @ts-expect-error preact-custom-element JSX type */}
          <powered-by-smile-id />
        </div>
      )}
    </div>
  );
};

if (typeof customElements !== 'undefined' && !customElements.get('document-auto-capture')) {
  register(
    DocumentAutoCapture,
    'document-auto-capture',
    [
      'document-type',
      'capture-mode',
      'auto-capture-timeout',
      'side-of-id',
      'theme-color',
      'show-navigation',
      'hide-attribution',
      'allow-gallery-upload',
      'title',
    ],
    { shadow: true },
  );
}

export default DocumentAutoCapture;
