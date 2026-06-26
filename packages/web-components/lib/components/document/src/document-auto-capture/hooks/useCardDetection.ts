import { useState, useEffect, useRef } from 'preact/hooks';
import { isDebugEnabled } from '../utils/debug';
import { translate } from '../../../../../domain/localisation';

import {
  clamp01,
  frameQualityScore,
  SYNTHETIC_CONTOUR_CONFIDENCE,
} from '../detection/qualityScoring';
import {
  ASPECT_RATIOS,
  classifyDiscoveryAspect,
  isAspectKey,
  type AspectKey,
  type DiscoveryVote,
} from '../detection/documentAspect';
import {
  isSeamFalseQuad,
  type Corner as SeamCorner,
  type Segment as SeamSegment,
} from '../detection/seamRejection';

// eslint-disable-next-line import/extensions
import { nextCvErrorRecoveryAction } from '../detection/cvErrorRecovery.ts';
// eslint-disable-next-line import/extensions
import { isSyntheticBridgeRecent } from '../detection/synthesisTiming.ts';

declare const cv: any;

// Internal debug flag: emit verbose detection telemetry only in dev + preview
// builds (compiled-in via __SMILE_DEBUG__; off in production). Same switch that
// gates the tuning panel. Evaluated once at module load.
const IS_DEBUG_MODE = isDebugEnabled();

// Helper to safely release a list of OpenCV Mats. Mats not yet allocated or
// already deleted are skipped. Used in `finally` blocks to avoid a wall of
// repetitive `if (m && !m.isDeleted()) m.delete();` lines.
const safeDelete = (
  ...mats: Array<
    { isDeleted?: () => boolean; delete: () => void } | null | undefined
  >
) => {
  mats.forEach((m) => {
    try {
      if (m && !m.isDeleted?.()) m.delete();
    } catch {
      // best-effort; continue releasing remaining mats
    }
  });
};

const formatDebugError = (err: unknown) => {
  if (err instanceof Error) {
    return err.message ? `${err.name}: ${err.message}` : err.name;
  }
  if (typeof err === 'number' && Number.isFinite(err)) {
    const cvAny = typeof cv === 'undefined' ? null : (cv as any);
    if (cvAny && typeof cvAny.exceptionFromPtr === 'function') {
      try {
        const ex = cvAny.exceptionFromPtr(err);
        const msg =
          ex?.msg || ex?.what || ex?.message || ex?.toString?.() || null;
        if (msg) return `OpenCV(${err}): ${msg}`;
      } catch {
        // Best-effort decode only; fall through to numeric fallback.
      }
    }
    return `OpenCV/WASM code: ${err}`;
  }
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export const COMPLIANCE_STATES = {
  IDLE: 'idle', // Searching for a card
  DETECTING: 'detecting', // Found a candidate, checking quality
  STABLE: 'stable', // Quality passes, checking stability
  CAPTURING: 'capturing', // Stability passed, capturing
  SUCCESS: 'success', // Captured
};

// Phase 1 → Phase 2 detection states
const DETECTION_PHASE = {
  DISCOVERY: 'discovery', // Phase 1: identify document type via aspect ratio, when documentType prop is not provided
  CAPTURE: 'capture', // Phase 2: quality gating with locked guide box
};

// Number of agreeing frames required to lock document type.
// Lowered from 10 → 6: laminated/hand-held cards produce intermittent detections
// so a shorter streak is needed to reach consensus before votes are wiped.
const DISCOVERY_CONSENSUS_THRESHOLD = 6;

// If contour detection can't classify within this many PROCESSED frames, default
// to id-card. 30 ≈ 1s at the default 30fps processing throttle.
const DISCOVERY_TIMEOUT_FRAMES = 30;

// How many consecutive frames without a detected rectangle before resetting votes.
// Raised from 5 → 20: laminated cards and slight hand movement cause many gap
// frames between successful detections. A higher tolerance keeps accumulated votes
// alive long enough for the streak to complete.
const DISCOVERY_MISS_TOLERANCE = 20;

// Distance guidance: document fill percentage relative to ROI
// Below MIN_FILL → too far (card is tiny). Above MAX_FILL → too close (edges clipped).
// Min 65% ensures the document occupies ≥65-70% of the final captured image,
// satisfying the product requirement of a clear, readable scan.
const MIN_FILL_PERCENT = 65;
const MAX_FILL_PERCENT = 95;
// Minimum contour area to even consider (5% — catches far-away documents)
const MIN_CONTOUR_AREA_PERCENT = 0.05;
// During discovery, require at least this many grid cells to pass (out of 9).
// Less strict than full allQuadrantsPass (9/9) but still filters empty scenes.
const MIN_DISCOVERY_GRID_CELLS = 3;

// Adaptive contour-Canny high-threshold band (see the Sobel/magnitude block in
// the contour pass). CANNY_HIGH_MAX is the previously-fixed value: high-contrast
// scenes still cap here so the working metallic/high-contrast path cannot
// regress. CANNY_HIGH_MIN is the relaxed floor that lets faint document borders
// on plain backgrounds be detected. The low threshold is 40% of the resolved
// high threshold.
const CANNY_HIGH_MAX = 150;
const CANNY_HIGH_MIN = 60;

// --- Seam / straight-line rejection (parquet floors, slatted tables) ---
// HoughLinesP detects long straight background lines; a candidate quad whose
// edges sit on lines that overshoot its corners is a seam artifact, not a card
// (see detection/seamRejection.ts). Only the Hough acquisition knobs are
// tunable via settings; the geometric tolerances live in the helper.
const HOUGH_RHO = 1; // px distance resolution
const HOUGH_THETA = Math.PI / 180; // 1° angle resolution

// --- Contour rejection thresholds (shared by the in-guide pass and the
// off-guide detector) ---
// A real card border survives approxPolyDP with little perimeter loss;
// jagged background-texture paths compress 4-10×.
const PERI_COMPRESSION_MAX = 3.5;
// Minimum contour-area / bounding-box-area ratio for a card-shaped contour.
const MIN_RECT_FILL_RATIO = 0.65;
// Mobile content-region fallback (Fix 3): a low-contrast/tilted id-card that
// never forms a clean 4-corner quad can still be captured from the combined
// content bbox, but only after the region candidate has persisted this many
// consecutive frames — a transient blob must not trigger a capture.
const MOBILE_REGION_STABILITY_FRAMES = 8;

// --- Chroma-content gate (rolling average) ---
// A white keyboard / blank paper is rectangular, card-aspect and fills its
// rotated rect, so geometry alone can't reject it — but it has almost no
// colour. The per-frame chroma reading over the selected candidate's bbox is
// too noisy (AWB/exposure/contour jitter) to gate on directly, so we average
// the last CHROMA_AVG_WINDOW frames and only act once CHROMA_MIN_SAMPLES have
// accumulated (capture is still blocked by the stability counter meanwhile).
const CHROMA_AVG_WINDOW = 6;
const CHROMA_MIN_SAMPLES = 4;
// How many consecutive blur/glare misses to tolerate before discarding an
// already-captured best frame. Mobile cameras drop 1–2 frames to motion blur or
// AWB; nulling the candidate on the first stumble throws away a good capture and
// restarts the stability climb. Mirrors DISCOVERY_MISS_TOLERANCE in spirit.
const BEST_FRAME_MISS_TOLERANCE = 3;

// --- Distance metric source ---
// When true, compute docFillPercent from the presence edge map (independent of
// RETR_EXTERNAL). Set to false to revert to the legacy combined-contour metric.
const USE_PRESENCE_FILL_METRIC = true;

const getAutoCaptureFeedback = () => ({
  positionDocument: translate('document.autoCapture.feedback.positionDocument'),
  alignDocument: translate('document.autoCapture.feedback.alignDocument'),
  placeDocument: translate('document.autoCapture.feedback.placeDocument'),
  ensureDocumentVisible: translate('document.autoCapture.feedback.ensureDocumentVisible'),
  moveDocumentCloser: translate('document.autoCapture.feedback.moveDocumentCloser'),
  moveDocumentFurtherAway: translate('document.autoCapture.feedback.moveDocumentFurtherAway'),
  holdSteady: translate('document.autoCapture.feedback.holdSteady'),
  detectingDocumentType: translate('document.autoCapture.feedback.detectingDocumentType'),
  processingFailed: translate('document.autoCapture.feedback.processingFailed'),
  autoDetectionUnavailableRetry: translate(
    'document.autoCapture.feedback.autoDetectionUnavailableRetry',
  ),
  autoDetectionUnavailableManual: translate(
    'document.autoCapture.feedback.autoDetectionUnavailableManual',
  ),
  captured: translate('document.autoCapture.feedback.captured'),
  captureFailed: translate('document.autoCapture.feedback.captureFailed'),
  tooBlurry: translate('document.autoCapture.feedback.tooBlurry'),
  glareDetectedAdjustLighting: translate(
    'document.autoCapture.feedback.glareDetectedAdjustLighting',
  ),
  holdStill: translate('document.autoCapture.feedback.holdStill'),
  capturingDocument: translate('document.autoCapture.feedback.capturingDocument'),
});

// --- Off-guide detection (desktop / wide layouts) ---
const OFF_GUIDE_CHECK_INTERVAL = 5;
const OFF_GUIDE_DOWNSCALE_WIDTH = 320;
const OFF_GUIDE_MIN_MARGIN_X_CSS = 120;
const OFF_GUIDE_MIN_MARGIN_Y_CSS = 80;

// Downscale width for OpenCV detection. All CV ops run on this resolution;
// the full-res canvas is only read for the final captured image.
const PROCESS_WIDTH = 640;

function detectCardOutsideGuide(
  video: HTMLVideoElement,
  guideRectVideo: { x: number; y: number; w: number; h: number },
  expectedAspect: number | null,
  scratchCanvas: HTMLCanvasElement,
): boolean {
  if (typeof cv === 'undefined' || !cv.Mat) return false;
  const sw = OFF_GUIDE_DOWNSCALE_WIDTH;
  const sh = Math.max(
    1,
    Math.round((video.videoHeight / video.videoWidth) * sw),
  );
  if (scratchCanvas.width !== sw) scratchCanvas.width = sw;
  if (scratchCanvas.height !== sh) scratchCanvas.height = sh;
  const sctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
  if (!sctx) return false;
  sctx.drawImage(video, 0, 0, sw, sh);

  const scaleX = video.videoWidth / sw;
  const scaleY = video.videoHeight / sh;

  let mat = null;
  let gray = null;
  let blurred = null;
  let edges = null;
  let contours = null;
  let hierarchy = null;
  let foundOutside = false;
  try {
    mat = cv.imread(scratchCanvas);
    gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);
    blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150);
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );

    const minArea = sw * sh * 0.03;
    let bestArea = 0;
    let bestBR = null;
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area > minArea && area > bestArea) {
        const peri = cv.arcLength(cnt, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.04 * peri, true);
        if (approx.rows === 4) {
          const br = cv.boundingRect(approx);
          // Tilt-invariant aspect + fill from the rotated rect (see in-guide
          // pass); br is kept only to report the off-guide card position.
          const minRect = cv.minAreaRect(approx);
          const rotW = minRect.size.width;
          const rotH = minRect.size.height;
          const aspect =
            rotW > 0 && rotH > 0 ? Math.max(rotW / rotH, rotH / rotW) : 0;
          const aspectOk = expectedAspect
            ? Math.abs(aspect - expectedAspect) / expectedAspect < 0.25
            : aspect >= 1.15 && aspect <= 2.0;
          // Same texture rejection as the in-guide pass: background quads are
          // jagged paths that approxPolyDP compresses heavily and that fill
          // their bounding box poorly. Without these gates a textured backdrop
          // outside the guide fires false "Align document in frame" prompts.
          const approxPeri = cv.arcLength(approx, true);
          const isCompact =
            approxPeri > 0 && peri / approxPeri < PERI_COMPRESSION_MAX;
          const fillRatio = rotW > 0 && rotH > 0 ? area / (rotW * rotH) : 0;
          if (aspectOk && isCompact && fillRatio > MIN_RECT_FILL_RATIO) {
            bestArea = area;
            bestBR = br;
          }
        }
        approx.delete();
      }
      cnt.delete();
    }

    if (bestBR) {
      const cxVideo = (bestBR.x + bestBR.width / 2) * scaleX;
      const cyVideo = (bestBR.y + bestBR.height / 2) * scaleY;
      if (
        cxVideo < guideRectVideo.x ||
        cxVideo > guideRectVideo.x + guideRectVideo.w ||
        cyVideo < guideRectVideo.y ||
        cyVideo > guideRectVideo.y + guideRectVideo.h
      ) {
        foundOutside = true;
      }
    }
  } catch {
    // best-effort
  } finally {
    safeDelete(mat, gray, blurred, edges, contours, hierarchy);
  }
  return foundOutside;
}

export function useCardDetection(
  videoRef: { current: HTMLVideoElement | null },
  settings: Record<string, any>,
  options: Record<string, any> = {},
) {
  const autoCaptureFeedback = getAutoCaptureFeedback();
  const {
    variant = 'fullscreen',
    documentType = null,
    captureMode = 'autoCapture',
    autoCaptureTimeout = 20_000,
    captureOrientation = 'landscape',
    shouldRotateUi = false,
    syncRoiToGuide = false,
    skipGridCheck = false,
  } = options;
  // captureMode: 'autoCapture' | 'autoCaptureOnly' | 'manualCaptureOnly'
  const autoCaptureTimeoutMs = Math.max(
    3000,
    Math.min(30000, autoCaptureTimeout),
  );
  const orientation =
    captureOrientation === 'portrait' ? 'portrait' : 'landscape';
  const orientAspect = (ratio: number) =>
    orientation === 'portrait' ? 1 / ratio : ratio;

  // If documentType is provided and valid, skip discovery entirely.
  const providedDocType: AspectKey | null = isAspectKey(documentType)
    ? documentType
    : null;
  const initialPhase = providedDocType
    ? DETECTION_PHASE.CAPTURE
    : DETECTION_PHASE.DISCOVERY;
  const initialAspect = orientAspect(
    providedDocType ? ASPECT_RATIOS[providedDocType] : ASPECT_RATIOS.passport,
  );

  const [feedback, setFeedback] = useState(
    autoCaptureFeedback.positionDocument,
  );
  const [captureProgress, setCaptureProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [complianceState, setComplianceState] = useState<string>(
    COMPLIANCE_STATES.IDLE,
  );
  const [debugPath, setDebugPath] = useState<any>(null); // For drawing the green box on overlay
  // Debug-only: the active detection ROI mapped to the video element's CSS
  // box, for drawing an on-screen outline. Updated only when the rect
  // actually changes (keyed via ref) to avoid a setState per frame.
  const [debugRoi, setDebugRoi] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const debugRoiKeyRef = useRef('');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({}); // For tuning panel
  const debugInfoRef = useRef<Record<string, any>>({});
  // Merge debug fields rather than replace: each gate emits only the values
  // it computed, so the panel keeps the last-known docFill / grid / blur /
  // glare visible together instead of blanking whichever the current frame's
  // early-return path didn't include. Debug-only; setDebugInfo identity is
  // stable so this needs no memoisation. Outside debug mode this is a no-op;
  // inside debug mode it also skips patches that don't change displayed values.
  const mergeDebugInfo = (patch: Record<string, unknown>) => {
    if (!IS_DEBUG_MODE) return;

    const { current } = debugInfoRef;
    const hasChanged = Object.entries(patch).some(
      ([key, value]) => current[key] !== value,
    );
    if (!hasChanged) return;

    const next = { ...current, ...patch };
    debugInfoRef.current = next;
    setDebugInfo(next);
  };
  const updateDebugPath = (path: any) => {
    if (IS_DEBUG_MODE) setDebugPath(path);
  };
  // Latest distance fill %, stashed each frame so debug payloads emitted
  // AFTER the contour block (blur/glare/capture gates) can still report it.
  const latestDocFillRef = useRef(0);
  // EMA of docFillPercent. Smooths distance jitter so a hand hovering near the
  // fill thresholds doesn't toggle the "move closer/further" gate frame-to-frame.
  // null until the first measurement; reset to null whenever the document is
  // declared gone so a re-acquired doc doesn't inherit a stale average.
  const docFillEmaRef = useRef<number | null>(null);
  const [detectedDocType, setDetectedDocType] = useState<AspectKey | null>(
    providedDocType,
  ); // null = not yet classified
  const [guideAspectRatio, setGuideAspectRatio] = useState(initialAspect);

  // Refs for loop management to avoid stale closures
  const settingsRef = useRef(settings);
  const stabilityRef = useRef<{
    count: number;
    lastCenter: { x: number; y: number } | null;
  }>({ count: 0, lastCenter: null });
  // Tracks the sharpest frame during the stability window. We keep both the
  // full-frame submission image and an optional cropped preview so the review
  // screen can show the cropped region while the API still receives the full
  // frame.
  const bestFrameRef = useRef<{
    image: string | null;
    preview: string | null;
    score: number;
  }>({ image: null, preview: null, score: 0 });
  const isCapturingRef = useRef(false);
  const canvasRef = useRef<
    (HTMLCanvasElement & { _roiLogged?: boolean }) | null
  >(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Full-resolution crop of just the guide-box ROI. Contour detection runs
  // here at native pixel fidelity (the 640px dsCanvas loses the card border).
  const contourCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionPhaseRef = useRef(initialPhase);
  const discoveryRef = useRef<{
    votes: DiscoveryVote[];
    docType: AspectKey | null;
    frameCount: number;
    consecutiveMisses: number;
  }>({
    votes: [],
    docType: providedDocType,
    frameCount: 0,
    consecutiveMisses: 0,
  });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [captureOrigin, setCaptureOrigin] = useState<string | null>(null); // 'camera_auto_capture' | 'camera_manual_capture'
  const [manualFallbackActive, setManualFallbackActive] = useState(false);
  const [cvLoadFailed, setCvLoadFailed] = useState(false);

  // Stores the most recent ROI coordinates so triggerManualCapture can crop on demand.
  const latestCropCoordsRef = useRef<{
    clampedX: number;
    clampedY: number;
    clampedW: number;
    clampedH: number;
  } | null>(null);
  // Off-guide detection (desktop only): low-res scratch canvas + frame counter +
  // last-known in-guide state to skip the scan once a card is locked in.
  const offGuideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offGuideFrameCounterRef = useRef(0);
  const inGuideDetectedRef = useRef(false);
  // Consecutive frames in CAPTURE phase with no valid in-guide contour.
  // Used to absorb intermittent detection misses (especially on book-style
  // documents whose spine/page edges can momentarily break) before flipping
  // the user-facing prompt to "Align document in frame".
  const captureMissCounterRef = useRef(0);
  // Timestamp (performance.now) of the last frame we actually ran detection on,
  // and the timestamp before that — used to throttle the heavy CV pipeline to
  // settingsRef.targetProcessingFps and to report the live processing rate.
  const lastProcessedRef = useRef(0);
  const prevProcessedRef = useRef(0);
  // Set true if Lab chroma conversion is unavailable/throws on this device, so
  // the chroma-fusion path (Fix 2) disables itself for the session and falls
  // back to luminance-only edges.
  const chromaUnavailableRef = useRef(false);
  // Consecutive per-frame CV errors (outer catch). A persistent throw is almost
  // always the optional chroma path leaving a malformed edge map that the
  // downstream findContours/morphology then rejects every frame — which strands
  // detection on "Processing failed". After a few in a row we disable chroma for
  // the session so detection self-heals onto the luminance-only path. Reset on
  // any successful frame.
  const cvErrorStreakRef = useRef(0);
  // When CV keeps throwing after optional chroma has been disabled, pause the
  // hot detection loop so repeated state updates do not freeze the page.
  const autoDetectionSuspendedRef = useRef(false);
  // Consecutive frames a mobile content-region candidate has qualified (Fix 3).
  // Gates the mobile region fallback so a transient blob can't trigger capture.
  const regionStabilityRef = useRef(0);
  // Rolling window of the selected candidate's mean bbox chroma (last
  // CHROMA_AVG_WINDOW frames). Smooths the noisy per-frame reading so the
  // chroma-content gate acts on a stable average. Cleared when no candidate.
  const chromaWindowRef = useRef<number[]>([]);
  // Geometry of the candidate selected as bestContour this frame, captured at
  // the selection site (deep in the contour pass) so the composite quality
  // score can read it at the later blur/glare/stability gates, where the
  // contour-scope locals are out of scope. `aspect` is the normalized (>=1)
  // rotated-rect aspect; `fillRatio` is the rotated-rect fill of a real quad
  // (0 for synthetic); `synthetic` flags the inferred fallback rect.
  const winnerGeomRef = useRef<{
    aspect: number;
    fillRatio: number;
    synthetic: boolean;
  }>({ aspect: 0, fillRatio: 0, synthetic: false });
  // Consecutive blur/glare misses while a best frame is already held. Lets a
  // transient bad frame pass without discarding the captured candidate
  // (see BEST_FRAME_MISS_TOLERANCE). Reset once a frame reaches the stability
  // section cleanly.
  const bestFrameMissRef = useRef(0);
  // Soften a transient gate failure instead of nuking capture progress: while a
  // best frame is held and we're within BEST_FRAME_MISS_TOLERANCE, decay the
  // stability count by 1 (the same pattern the blur/glare gates already use) so
  // a single jittery frame doesn't drain the ring or flip the compliance state.
  // Returns true when the failure was ABSORBED (decayed); false when tolerance
  // is exceeded and the candidate is hard-reset/discarded.
  const softFailStability = (): boolean => {
    if (
      bestFrameRef.current.image &&
      bestFrameMissRef.current < BEST_FRAME_MISS_TOLERANCE
    ) {
      bestFrameMissRef.current += 1;
      stabilityRef.current.count = Math.max(0, stabilityRef.current.count - 1);
      return true;
    }
    bestFrameMissRef.current = 0;
    stabilityRef.current.count = 0;
    bestFrameRef.current = { image: null, preview: null, score: 0 };
    return false;
  };
  // Timestamp for the last genuine (non-synthetic) 4-corner card validation.
  // Gates the desktop id-card synthetic fallback so it only bridges brief
  // dropouts of a card that WAS being detected, rather than synthesizing one
  // from background contours.
  const lastRealCardAtRef = useRef<number | null>(null);
  // Last detected card bounding rect in CANVAS coords. Updated whenever the
  // contour-detection pass produces a 4-point card. Sticky across frames so
  // intermittent contour misses don't fall back to the looser guide rect.
  const latestCardRectRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  // Mirror of captureMode for access inside the processFrame closure.
  const captureModeRef = useRef(captureMode);
  useEffect(() => {
    captureModeRef.current = captureMode;
  }, [captureMode]);

  // Configurable fallback: surface manual button if auto-capture hasn't fired yet.
  useEffect(() => {
    setManualFallbackActive(false);
    if (captureMode !== 'autoCapture') return undefined;
    const timer = setTimeout(
      () => setManualFallbackActive(true),
      autoCaptureTimeoutMs,
    );
    return () => clearTimeout(timer);
  }, [captureMode, autoCaptureTimeoutMs]);

  // 20-second OpenCV load timeout.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof cv === 'undefined' || !cv.Mat) setCvLoadFailed(true);
    }, 20_000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const processFrame = () => {
      // 0. Stop if capturing or video not ready
      if (isCapturingRef.current) return;
      if (autoDetectionSuspendedRef.current) return;
      if (!videoRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      if (video.readyState !== 4 || typeof cv === 'undefined' || !cv.Mat) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      // Throttle the heavy CV pipeline to a target processing rate (default
      // 30fps). rAF fires at the display refresh rate (60/90/120Hz/adaptive), so
      // a time-based gate keeps the real detection rate — and every frame-count
      // constant tuned against it — consistent across devices and under thermal
      // load. Skipped ticks reschedule and return BEFORE any Mat/canvas/state
      // work, so they cost nothing and the UI naturally holds its last state.
      const nowTs = performance.now();
      const targetFps = settingsRef.current.targetProcessingFps ?? 30;
      // ~4ms slack so a 33ms target doesn't beat against 16.7ms vsync into 20fps.
      const minInterval = 1000 / targetFps - 4;
      if (nowTs - lastProcessedRef.current < minInterval) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      prevProcessedRef.current = lastProcessedRef.current;
      lastProcessedRef.current = nowTs;
      if (prevProcessedRef.current > 0) {
        const dt = nowTs - prevProcessedRef.current;
        if (dt > 0) mergeDebugInfo({ procFps: Math.round(1000 / dt) });
      }

      // 1. Setup CV structs
      let fullFrame: any = null;
      let src: any = null;
      let gray: any = null;
      let contourFull: any = null;
      let contourGray: any = null;
      let blurred: any = null;
      let edges: any = null;
      let presenceEdges: any = null;
      let presenceBlurred: any = null;
      let contours: any = null;
      let hierarchy: any = null;
      let laplacian: any = null;
      let mean: any = null;
      let stdDev: any = null;
      let glareMask: any = null;
      // Chroma-fusion Mats (Fix 2). Declared here so the shared finally frees
      // them even if a gate returns mid-pipeline.
      let contourRgb: any = null;
      let contourLab: any = null;
      let labPlanes: any = null;
      let aPlane: any = null;
      let bPlane: any = null;
      let aBlur: any = null;
      let bBlur: any = null;
      let aEdges: any = null;
      let bEdges: any = null;
      // Per-pixel chroma magnitude, kept alive past the chroma block for the
      // Level 2 content gate (measured per detected rectangle).
      let chromaMag: any = null;

      // Inner function so each early `return` inside the detection pipeline
      // exits only this helper (then falls through to the shared finally
      // cleanup below). Splitting the body out of the surrounding try keeps
      // the per-function code-path graph small enough that the
      // `no-useless-return` ESLint rule does not exceed Node's call stack.
      const runDetection = () => {
        const frameTimeMs = performance.now();

        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        // Sync canvas size
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight)
          canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Downscaled canvas for OpenCV (all CV ops run here; full-res canvas is
        // only used for the final captured image).
        if (!detectionCanvasRef.current) {
          detectionCanvasRef.current = document.createElement('canvas');
        }
        const dsCanvas = detectionCanvasRef.current;
        if (!video.videoWidth) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }
        const dsW = Math.min(PROCESS_WIDTH, video.videoWidth);
        const dsH = Math.round(video.videoHeight * (dsW / video.videoWidth));
        if (dsCanvas.width !== dsW) dsCanvas.width = dsW;
        if (dsCanvas.height !== dsH) dsCanvas.height = dsH;
        const dsCtx = dsCanvas.getContext('2d', { willReadFrequently: true });
        if (!dsCtx) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }
        dsCtx.drawImage(video, 0, 0, dsW, dsH);
        const dsScale = dsW / video.videoWidth;

        // The cheap presence gate runs on the 640px dsCanvas, so its blur
        // kernel is scaled with dsScale to keep the physical blur radius
        // constant (a fixed 5px kernel would over-smooth at 640px and bridge
        // background texture gaps like carpet lines).
        // `| 1` ensures the kernel size is always odd (OpenCV requirement).
        const rawKernel = Math.round(5 * dsScale);
        const blurKernel = Math.max(
          3,
          rawKernel % 2 === 0 ? rawKernel + 1 : rawKernel,
        );

        // 2. Define ROI (Region of Interest)
        // The guide box is rendered in CSS space (Overlay.jsx) but detection
        // runs on the native-resolution canvas. With objectFit:'cover' on the
        // video element, CSS pixels ≠ video pixels. We must map the CSS guide
        // box into video coordinates so the detection/crop region matches what
        // the user actually sees on screen.
        //
        // Use getBoundingClientRect() — more reliable than clientWidth/clientHeight
        // for absolutely-positioned elements, especially on mobile where layout
        // may not be settled when the detection loop first starts.
        const videoRect = video.getBoundingClientRect();
        const displayW = videoRect.width > 0 ? videoRect.width : canvas.width;
        const displayH =
          videoRect.height > 0 ? videoRect.height : canvas.height;

        // Skip frame if display dimensions aren't available yet (layout not settled)
        if (videoRect.width === 0 || videoRect.height === 0) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }
        const videoW = canvas.width; // native video width
        const videoH = canvas.height; // native video height

        // objectFit: cover scaling — video scales to fill, excess clipped
        const videoAspect = videoW / videoH;
        const displayAspect = displayW / displayH;
        let coverScale;
        let offsetX;
        let offsetY;

        if (videoAspect > displayAspect) {
          // Video wider than display → height fills, sides cropped
          coverScale = displayH / videoH;
          offsetX = (videoW - displayW / coverScale) / 2;
          offsetY = 0;
        } else {
          // Video taller → width fills, top/bottom cropped
          coverScale = displayW / videoW;
          offsetX = 0;
          offsetY = (videoH - displayH / coverScale) / 2;
        }

        // Guide box in CSS space.
        // Fullscreen: matches Overlay.jsx (90% width, max 600px, dynamic aspect ratio)
        // Card: the entire video container IS the detection area (100%)
        // In discovery phase, use the wider passport ratio to fit both doc types.
        // After classification, lock to the detected document's aspect ratio.
        const currentAspect =
          detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY
            ? orientAspect(ASPECT_RATIOS.passport) // Wider — accommodates both ID and passport
            : orientAspect(
                discoveryRef.current.docType === 'passport' ||
                  discoveryRef.current.docType === 'greenbook'
                  ? ASPECT_RATIOS.passport
                  : ASPECT_RATIOS['id-card'],
              );
        const isCard = variant === 'card';
        // When the UI overlay is rotated 90° CW (portrait phone, landscape doc),
        // the visible guide-box lives in the rotated overlay's local coords.
        // The video element underneath is NOT rotated, so its CSS axes are
        // swapped relative to the overlay. We compute the guide in the
        // overlay's frame, then map back to video-CSS via the inverse rotation.
        let guideWidthCSS;
        let guideHeightCSS;
        let guideXCSS;
        let guideYCSS;
        if (isCard) {
          guideWidthCSS = displayW;
          guideHeightCSS = displayH;
          guideXCSS = 0;
          guideYCSS = 0;
        } else if (shouldRotateUi) {
          // Overlay-local dimensions are swapped: ovW = displayH, ovH = displayW.
          // Inset = 16rem (256px) when rotated.
          const ovW = displayH;
          const ovH = displayW;
          const inset = syncRoiToGuide ? 256 : Math.max(0, ovW * 0.1);
          const guideOvW = Math.min(Math.max(0, ovW - inset), 480);
          const guideOvH = guideOvW / currentAspect;
          const ovX = (ovW - guideOvW) / 2;
          const ovY = (ovH - guideOvH) / 2;
          // Map (xL, yL) overlay-local → video-CSS (W - yL, xL) where W = ovH = displayW.
          // The rotated guide-rect's video-CSS bbox:
          guideXCSS = ovH - ovY - guideOvH; // = (displayW - guideOvH) / 2
          guideYCSS = ovX; // = (displayH - guideOvW) / 2
          guideWidthCSS = guideOvH; // narrow in unrotated video
          guideHeightCSS = guideOvW; // tall in unrotated video
        } else if (skipGridCheck) {
          // Desktop: the video container IS the visible guide (it's already
          // sized to the card aspect ratio and bordered). Use almost the whole
          // displayed box as the ROI — only a small 4% margin so the card's
          // corners aren't clipped at the edge — so "card fills the on-screen
          // box" == "card fills the detection region". The fixed 64px inset
          // below is for the mobile overlay; on a ≤480px desktop box it shrank
          // the (invisible) ROI to ~75% of the box and made a full-looking card
          // read as too far away.
          const marginFrac = 0.04;
          guideWidthCSS = displayW * (1 - marginFrac * 2);
          guideHeightCSS = displayH * (1 - marginFrac * 2);
          guideXCSS = (displayW - guideWidthCSS) / 2;
          guideYCSS = (displayH - guideHeightCSS) / 2;
        } else {
          // Unrotated: original behaviour.
          const insetPx = syncRoiToGuide ? 64 : 0;
          guideWidthCSS = syncRoiToGuide
            ? Math.min(Math.max(0, displayW - insetPx), 480)
            : Math.min(displayW * 0.9, 480);
          guideHeightCSS = guideWidthCSS / currentAspect;
          guideXCSS = (displayW - guideWidthCSS) / 2;
          guideYCSS = (displayH - guideHeightCSS) / 2;
        }

        // Map CSS → video native coordinates
        const guideWidth = Math.round(guideWidthCSS / coverScale);
        const guideHeight = Math.round(guideHeightCSS / coverScale);
        const startX = Math.round(guideXCSS / coverScale + offsetX);
        const startY = Math.round(guideYCSS / coverScale + offsetY);

        // Clamp to canvas bounds
        const clampedX = Math.max(0, Math.min(startX, videoW - guideWidth));
        const clampedY = Math.max(0, Math.min(startY, videoH - guideHeight));
        const clampedW = Math.min(guideWidth, videoW - clampedX);

        // Log ROI mapping once for diagnostics
        if (IS_DEBUG_MODE && !canvasRef.current._roiLogged) {
          canvasRef.current._roiLogged = true;
          console.info(
            '[ROI] display:',
            `${displayW}x${displayH}`,
            '| video:',
            `${videoW}x${videoH}`,
            '| scale:',
            coverScale.toFixed(3),
            '| offset:',
            `${Math.round(offsetX)},${Math.round(offsetY)}`,
            '| guideCSS:',
            `${Math.round(guideWidthCSS)}x${Math.round(guideHeightCSS)}`,
            'at',
            `${Math.round(guideXCSS)},${Math.round(guideYCSS)}`,
            '| ROI:',
            `${clampedX},${clampedY}`,
            `${clampedW}x${Math.min(guideHeight, videoH - clampedY)}`,
          );
        }
        const clampedH = Math.min(guideHeight, videoH - clampedY);

        // Downscaled ROI coords — used for all OpenCV ops below. Clamp to the
        // dsCanvas bounds (= fullFrame dims): rounding clampedX and clampedW
        // independently can push x+w one pixel past dsW when the ROI sits flush
        // against the frame edge, tripping the cv.Mat roi assertion
        // (0 <= roi.x && roi.x + roi.width <= m.cols). Clamp x/y first, then size
        // to the remaining span so x+w <= dsW and y+h <= dsH always hold.
        const dsClampedX = Math.min(Math.round(clampedX * dsScale), dsW - 1);
        const dsClampedY = Math.min(Math.round(clampedY * dsScale), dsH - 1);
        const dsClampedW = Math.max(
          1,
          Math.min(Math.round(clampedW * dsScale), dsW - dsClampedX),
        );
        const dsClampedH = Math.max(
          1,
          Math.min(Math.round(clampedH * dsScale), dsH - dsClampedY),
        );

        // Store current ROI coords for on-demand manual capture (zero cost — no canvas ops).
        latestCropCoordsRef.current = {
          clampedX,
          clampedY,
          clampedW,
          clampedH,
        };

        // Debug overlay: publish the clamped ROI mapped back to the video
        // element's CSS box (inverse of the CSS → native mapping above).
        if (IS_DEBUG_MODE) {
          const roiCss = {
            x: Math.round((clampedX - offsetX) * coverScale),
            y: Math.round((clampedY - offsetY) * coverScale),
            w: Math.round(clampedW * coverScale),
            h: Math.round(clampedH * coverScale),
          };
          const roiKey = `${roiCss.x},${roiCss.y},${roiCss.w},${roiCss.h}`;
          if (debugRoiKeyRef.current !== roiKey) {
            debugRoiKeyRef.current = roiKey;
            setDebugRoi(roiCss);
          }
        }

        // --- Off-guide detection ---
        // Active on every layout that has spare margin around the visible
        // guide. In CAPTURE phase the gate runs unconditionally on the 5-frame
        // interval — a stale `inGuideDetectedRef` from a prior frame must not
        // suppress an authoritative "card outside the guide" signal. In
        // DISCOVERY phase we still skip while a card is locked in to avoid
        // contending with the per-frame contour pass.
        const isCardVariant = variant === 'card';
        // Book-style documents (passport, greenbook) open to two pages: the
        // off-page legitimately sits outside the guide while the bio-data
        // page is aligned, so the off-guide detector would produce false
        // "Align document in frame" prompts. Skip it for these doc types.
        const lockedDocTypeForGate = discoveryRef.current.docType;
        const isBookDoc =
          lockedDocTypeForGate === 'passport' ||
          lockedDocTypeForGate === 'greenbook';
        const hasMargin =
          displayW - guideWidthCSS > OFF_GUIDE_MIN_MARGIN_X_CSS ||
          displayH - guideHeightCSS > OFF_GUIDE_MIN_MARGIN_Y_CSS;
        offGuideFrameCounterRef.current =
          (offGuideFrameCounterRef.current + 1) % OFF_GUIDE_CHECK_INTERVAL;
        const isCapturePhase =
          detectionPhaseRef.current === DETECTION_PHASE.CAPTURE;
        const shouldRunOffGuide =
          !isCardVariant &&
          !skipGridCheck &&
          !isBookDoc &&
          hasMargin &&
          (isCapturePhase || !inGuideDetectedRef.current) &&
          offGuideFrameCounterRef.current === 0;

        if (shouldRunOffGuide) {
          if (!offGuideCanvasRef.current) {
            offGuideCanvasRef.current = document.createElement('canvas');
          }
          const lockedDocType = discoveryRef.current.docType;
          const expectedAspect = lockedDocType
            ? ASPECT_RATIOS[lockedDocType]
            : null;
          const cardOutside = detectCardOutsideGuide(
            video,
            { x: clampedX, y: clampedY, w: clampedW, h: clampedH },
            expectedAspect,
            offGuideCanvasRef.current,
          );
          if (cardOutside) {
            setFeedback(autoCaptureFeedback.alignDocument);
            setComplianceState(COMPLIANCE_STATES.IDLE);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { image: null, preview: null, score: 0 };
            docFillEmaRef.current = null;
            inGuideDetectedRef.current = false;
            mergeDebugInfo({ rejectReason: 'off-guide (card outside guide)' });
            return;
          }
        }

        // Crop ROI for the cheap gates from the downscaled canvas (presence,
        // texture, grid, blur, glare all run at PROCESS_WIDTH).
        fullFrame = cv.imread(dsCanvas);
        const rect = new cv.Rect(
          dsClampedX,
          dsClampedY,
          dsClampedW,
          dsClampedH,
        );
        src = fullFrame.roi(rect);
        fullFrame.delete();
        fullFrame = null;

        // 3. Pre-processing
        gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // --- Gate 0: Document Presence (Edge Density + Texture + Coverage) ---
        // A document has text, borders, patterns = high edge density + texture.
        // Low-contrast cards (e.g. ECOWAS Ghana ID) have subtle watermarks/guilloché
        // that need lower Canny thresholds to detect.
        // A bare desk/surface has very few edges AND low texture variance.
        presenceBlurred = new cv.Mat();
        cv.GaussianBlur(
          gray,
          presenceBlurred,
          new cv.Size(blurKernel, blurKernel),
          0,
          0,
          cv.BORDER_DEFAULT,
        );
        presenceEdges = new cv.Mat();
        cv.Canny(presenceBlurred, presenceEdges, 20, 80); // Low thresholds to catch subtle patterns

        const edgePixels = cv.countNonZero(presenceEdges);
        const roiPixels = gray.rows * gray.cols;
        const edgeDensity = (edgePixels / roiPixels) * 100;

        // Texture check: stddev of pixel intensity across the ROI
        // Documents have varied content (text, photos, patterns) = high stddev
        // Blank surfaces are uniform = low stddev
        const texMean = new cv.Mat();
        const texStdDev = new cv.Mat();
        cv.meanStdDev(gray, texMean, texStdDev);
        const textureScore = texStdDev.doubleAt(0, 0);
        texMean.delete();
        texStdDev.delete();

        const edgeThreshold = settingsRef.current.edgeDensityThreshold || 3;
        // A doc is present if EITHER edge density is high enough OR texture is rich enough
        // Texture > 30 is typical for any printed document; bare surfaces are ~5-15
        const hasDocument = edgeDensity >= edgeThreshold || textureScore > 30;

        // Coverage grid: check the inner 80% of the ROI (inset by 10% on each side)
        // so edge cells aren't penalized for containing desk/background margin.
        // The 3x3 grid over this inner region catches occlusion (hand covering 1/3).
        const insetFrac = 0.1; // 10% inset on each side
        const insetX = Math.floor(presenceEdges.cols * insetFrac);
        const insetY = Math.floor(presenceEdges.rows * insetFrac);
        const innerW = presenceEdges.cols - insetX * 2;
        const innerH = presenceEdges.rows - insetY * 2;
        const cols3 = 3;
        const rows3 = 3;
        const cellW = Math.floor(innerW / cols3);
        const cellH = Math.floor(innerH / rows3);
        const cellPixels = cellW * cellH;
        // Each cell needs a minimum % of the overall edge threshold.
        // Mobile uses 50% (lenient for low-contrast cards like ECOWAS Ghana ID).
        // Desktop uses 70% to prevent capturing far-away cards.
        const cellRatio = settingsRef.current.gridCellRatio || 0.5;
        const cellMin = edgeThreshold * cellRatio;
        const quadDensities = [];
        let passingCells = 0;
        for (let row = 0; row < rows3; row++) {
          for (let col = 0; col < cols3; col++) {
            const cRect = new cv.Rect(
              insetX + col * cellW,
              insetY + row * cellH,
              cellW,
              cellH,
            );
            const cRoi = presenceEdges.roi(cRect);
            const cDensity = (cv.countNonZero(cRoi) / cellPixels) * 100;
            quadDensities.push(cDensity.toFixed(1));
            if (cDensity >= cellMin) {
              passingCells++;
            }
            cRoi.delete();
          }
        }

        // Grid coverage gating:
        // - Card variant: skip entirely — ROI is the full video frame, card can't fill 100%
        // - Discovery phase: relaxed — require MIN_DISCOVERY_GRID_CELLS (3/9) cells.
        // - Capture phase (fullscreen): require 7/9 cells. Allows up to ~2 cells
        //   of background (face, hand, etc.) peeking into the guide without
        //   blocking capture. 9/9 was too strict for hand-held framing.
        const isDiscoveryPhase =
          detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY;
        let gridCheckFails;
        if (isCard || skipGridCheck) {
          gridCheckFails = false; // Skip grid check (card variant or desktop fullscreen)
        } else if (isDiscoveryPhase) {
          gridCheckFails = passingCells < MIN_DISCOVERY_GRID_CELLS; // Relaxed: 3/9 cells
        } else {
          // Early-out only: bail just on a near-empty grid. The real "document
          // fills the box / is close enough" check is docFillPercent >=
          // minFillPercent (65%) in the contour pass below. A 7/9 bar here
          // false-rejected low-contrast cards on plain backgrounds (only the
          // printed center cells carry edges; the plain outer cells read ~0)
          // before the contour pass — incl. the clutter-adaptive Canny floor
          // for faint borders — ever ran. Synthetic-fallback eligibility still
          // requires the strong passingCells >= 7 signal separately below.
          gridCheckFails =
            passingCells < (settingsRef.current.captureGridMinCells ?? 4);
        }

        if (!hasDocument || gridCheckFails) {
          const totalCells = rows3 * cols3; // 9
          const noDocumentPresent =
            !hasDocument || passingCells < Math.ceil(totalCells * 0.45);
          const reason = noDocumentPresent
            ? autoCaptureFeedback.placeDocument
            : autoCaptureFeedback.ensureDocumentVisible;
          // Document truly absent → hard reset. Document present but coverage
          // momentarily dipped ("fully visible") → soften so a flickered cell
          // doesn't drain progress (mobile gateDecayEnabled only).
          let gate0Absorbed = false;
          if (noDocumentPresent) {
            docFillEmaRef.current = null;
            stabilityRef.current.count = 0;
            bestFrameMissRef.current = 0;
            bestFrameRef.current = { image: null, preview: null, score: 0 };
          } else {
            gate0Absorbed =
              settingsRef.current.gateDecayEnabled === true &&
              softFailStability();
          }
          if (!gate0Absorbed) {
            setFeedback(reason);
            setComplianceState(COMPLIANCE_STATES.IDLE);
          }
          updateDebugPath(null);
          mergeDebugInfo({
            blur: 0,
            glare: 0,
            edgeDensity: edgeDensity.toFixed(1),
            texture: Math.round(textureScore),
            quadrants: quadDensities.join('/'),
            rejectReason: noDocumentPresent
              ? 'Gate0: no document present'
              : `Gate0: grid coverage (${passingCells}/9)${gate0Absorbed ? ' [held]' : ''}`,
          });
          return;
        }

        // --- Phase 1 / Dynamic Border Detection ---
        // During discovery phase: ALWAYS run contour detection to classify document type.
        // During capture phase: ALWAYS run contour detection for distance guidance.
        // The useDynamicBorder setting only controls whether the green overlay is drawn.
        const isDiscovery =
          detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY;
        const shouldRunContour = true;

        // Discovery timeout: moved AFTER contour detection (see below).
        // Only increments when a bestContour is actually found, so empty
        // scenes (textured desk, no document) never trigger the timeout.

        if (shouldRunContour) {
          // Contour detection runs at FULL resolution on a crop of just the
          // guide-box ROI. The 640px dsCanvas collapses the card border to a
          // ~1px line that Canny/findContours can't recover unless the card is
          // large in frame — running here at native fidelity restores reliable
          // border detection while staying cheap (the ROI is a fraction of the
          // frame, and this pass is gated behind the presence/grid check above).
          if (!contourCanvasRef.current) {
            contourCanvasRef.current = document.createElement('canvas');
          }
          const contourCanvas = contourCanvasRef.current;
          if (contourCanvas.width !== clampedW) contourCanvas.width = clampedW;
          if (contourCanvas.height !== clampedH)
            contourCanvas.height = clampedH;
          const contourCtx = contourCanvas.getContext('2d', {
            willReadFrequently: true,
          });
          if (!contourCtx) {
            animationFrameId = requestAnimationFrame(processFrame);
            return;
          }
          // Draw only the ROI sub-rect from the full-res canvas at native size
          // (avoids cv.imread over the whole multi-megapixel canvas).
          contourCtx.drawImage(
            canvas,
            clampedX,
            clampedY,
            clampedW,
            clampedH,
            0,
            0,
            clampedW,
            clampedH,
          );
          contourFull = cv.imread(contourCanvas);
          contourGray = new cv.Mat();
          cv.cvtColor(contourFull, contourGray, cv.COLOR_RGBA2GRAY, 0);
          // Fix 2: keep the RGBA crop (contourFull) alive for chroma fusion
          // when enabled; otherwise free it immediately as before so the
          // luminance-only path is byte-identical.
          const chromaFusionOn =
            settingsRef.current.chromaEdgeFusion === true &&
            !chromaUnavailableRef.current &&
            typeof cv.COLOR_RGB2Lab !== 'undefined';
          if (!chromaFusionOn) {
            contourFull.delete();
            contourFull = null;
          }
          let edgeSource = 'lum';

          blurred = new cv.Mat();
          cv.GaussianBlur(
            contourGray,
            blurred,
            new cv.Size(5, 5),
            0,
            0,
            cv.BORDER_DEFAULT,
          );

          // Adaptive Canny thresholds (anchored on the frame's own gradient
          // distribution) instead of a fixed 50/150. The fixed pair needs a
          // strong brightness gradient at the document border, so capture only
          // fires reliably on high-contrast surfaces (e.g. a card on metal) and
          // stalls on general backgrounds (wood, matte desk, similar-toned
          // paper) where the boundary gradient is weak.
          //
          // Canny thresholds are compared against gradient magnitude, so derive
          // them from the magnitude statistics: high ≈ mean + sigma·stddev. A
          // plain background yields a small mean/stddev → lower thresholds →
          // the faint border is still detected. A busy/cluttered background
          // yields large stats → thresholds stay high → spurious edges are
          // suppressed. The magnitude here is just a per-frame anchor for
          // choosing the threshold; cv.Canny keeps its default gradient norm
          // (unchanged from before), so at the cap the behaviour is identical.
          //
          // high is clamped to [CANNY_HIGH_MIN, CANNY_HIGH_MAX]; the ceiling is
          // the proven fixed value so the high-contrast path that already works
          // cannot regress — this only *relaxes* detection for low contrast.
          const sobelX = new cv.Mat();
          const sobelY = new cv.Mat();
          cv.Sobel(blurred, sobelX, cv.CV_32F, 1, 0, 3);
          cv.Sobel(blurred, sobelY, cv.CV_32F, 0, 1, 3);
          const gradMag = new cv.Mat();
          cv.magnitude(sobelX, sobelY, gradMag);
          sobelX.delete();
          sobelY.delete();
          const gradMean = new cv.Mat();
          const gradStdDev = new cv.Mat();
          cv.meanStdDev(gradMag, gradMean, gradStdDev);
          const gMean = gradMean.doubleAt(0, 0);
          const gStd = gradStdDev.doubleAt(0, 0);
          gradMag.delete();
          gradMean.delete();
          gradStdDev.delete();

          const cannySigma = settingsRef.current.autoCannySigma ?? 1.0;
          // Clutter-adaptive high-threshold floor. On a featureless surface
          // (pale ID on pale wood) the card border gradient is faint and the
          // fixed CANNY_HIGH_MIN=60 floor pins too high → no quad forms. But a
          // genuinely empty scene (Gate-0 edgeDensity ~0) has no background
          // texture to turn into false edges, so the floor can safely drop to
          // recover the faint border. Busy scenes keep the proven 60 floor, so
          // the working high-contrast/metallic path cannot regress.
          const lowClutter =
            edgeDensity < (settingsRef.current.lowClutterEdgeDensity ?? 2);
          const cannyHighMin = lowClutter
            ? (settingsRef.current.cannyHighMinLowClutter ?? 40)
            : CANNY_HIGH_MIN;
          const highThreshold = Math.min(
            CANNY_HIGH_MAX,
            Math.max(cannyHighMin, gMean + cannySigma * gStd),
          );
          const lowThreshold = Math.max(15, highThreshold * 0.4);
          mergeDebugInfo({
            canny: `${Math.round(lowThreshold)}/${Math.round(highThreshold)}`,
          });

          edges = new cv.Mat();
          cv.Canny(blurred, edges, lowThreshold, highThreshold);

          // Fix 2: chroma-aware edge fusion. A card whose border has near-zero
          // LUMINANCE gradient against the background (e.g. a beige ID on light
          // wood) is invisible to the grayscale Canny above, so no 4-corner
          // quad forms. The same boundary is strong in CHROMA, which grayscale
          // discards. Convert the colour crop to Lab, run Canny on the a/b
          // chroma channels, and OR those edges into `edges`. findContours is
          // RETR_EXTERNAL, so the extra interior chroma edges cannot corrupt
          // the outer-contour search — only the (now reinforced) outer boundary
          // matters. Falls back to luminance-only if Lab is unavailable.
          if (chromaFusionOn) {
            try {
              contourRgb = new cv.Mat();
              cv.cvtColor(contourFull, contourRgb, cv.COLOR_RGBA2RGB, 0);
              contourFull.delete();
              contourFull = null;

              contourLab = new cv.Mat();
              cv.cvtColor(contourRgb, contourLab, cv.COLOR_RGB2Lab, 0);
              contourRgb.delete();
              contourRgb = null;

              labPlanes = new cv.MatVector();
              cv.split(contourLab, labPlanes); // [0]=L, [1]=a, [2]=b
              contourLab.delete();
              contourLab = null;

              // OpenCV.js MatVector.get() returns Mats that must be released.
              aPlane = labPlanes.get(1);
              bPlane = labPlanes.get(2);
              const chromaK = new cv.Size(7, 7); // chroma is noisier than luma
              aBlur = new cv.Mat();
              bBlur = new cv.Mat();
              cv.GaussianBlur(aPlane, aBlur, chromaK, 0, 0, cv.BORDER_DEFAULT);
              cv.GaussianBlur(bPlane, bBlur, chromaK, 0, 0, cv.BORDER_DEFAULT);

              // Per-pixel chroma magnitude |a-128| + |b-128| (Lab neutral =
              // 128). Near 0 for a neutral white/gray object (keyboard, paper,
              // desk); high where a colour ID has a photo/printing. Kept alive
              // for the Level 2 content gate, measured per detected rectangle
              // below so background colour can't mask a monochrome object.
              const aAbs = new cv.Mat();
              const bAbs = new cv.Mat();
              cv.convertScaleAbs(aPlane, aAbs, 1, -128);
              cv.convertScaleAbs(bPlane, bAbs, 1, -128);
              chromaMag = new cv.Mat();
              cv.addWeighted(aAbs, 1, bAbs, 1, 0, chromaMag);
              aAbs.delete();
              bAbs.delete();

              const chromaLow = settingsRef.current.chromaCannyLow ?? 15;
              const chromaHigh = settingsRef.current.chromaCannyHigh ?? 40;
              aEdges = new cv.Mat();
              bEdges = new cv.Mat();
              cv.Canny(aBlur, aEdges, chromaLow, chromaHigh);
              cv.Canny(bBlur, bEdges, chromaLow, chromaHigh);

              cv.bitwise_or(edges, aEdges, edges);
              cv.bitwise_or(edges, bEdges, edges);
              edgeSource = 'lum+chroma';

              safeDelete(aPlane, bPlane);
              aPlane = null;
              bPlane = null;

              labPlanes.delete(); // frees L/a/b incl. borrowed aPlane/bPlane
              labPlanes = null;
              aBlur.delete();
              aBlur = null;
              bBlur.delete();
              bBlur = null;
              aEdges.delete();
              aEdges = null;
              bEdges.delete();
              bEdges = null;
            } catch (chromaErr) {
              // Lab path failed on this device — disable for the session and
              // continue with the luminance edges already in `edges`.
              chromaUnavailableRef.current = true;
              edgeSource = 'lum';
              mergeDebugInfo({
                chromaError: formatDebugError(chromaErr),
                chromaStatus: 'disabled',
              });
            }
          }
          mergeDebugInfo({ contourSource: edgeSource });

          // Bridge gaps in the card border caused by lamination glare or finger
          // occlusion. At full resolution the card border is crisp and well
          // separated from the background, so a fixed 2-iteration close is safe.
          const closingKernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(3, 3),
          );
          const closedEdges = new cv.Mat();
          cv.morphologyEx(
            edges,
            closedEdges,
            cv.MORPH_CLOSE,
            closingKernel,
            new cv.Point(-1, -1),
            2,
          );
          closingKernel.delete();
          edges.delete();
          edges = closedEdges;

          contours = new cv.MatVector();
          hierarchy = new cv.Mat();
          cv.findContours(
            edges,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
          );

          let maxArea = 0;
          // Aspect of the largest 4-corner candidate this frame (debug only):
          // lets on-device tuning read why a keyboard/screen passed or failed
          // the aspect gate. 0 when no 4-corner candidate was evaluated.
          let lastCandidateAspect = 0;
          // Mean chroma magnitude of the largest candidate's bbox (debug); -1
          // when not measured (gate off or chroma unavailable).
          let bestContour: any = null;
          // True when bestContour is the synthesized book-doc fallback rect.
          // Its bbox covers inner content (photo/text/MRZ), not the full page,
          // so distance gates that compare bbox/ROI are unreliable for it.
          let bestContourIsSynthetic = false;
          // Desktop only: a card-shaped quad passed every shape gate EXCEPT
          // the ROI wall-hug check this frame — i.e. a real card, too close.
          // Consumed in the no-contour handling below to show distance
          // guidance instead of the dead-end "Align document in frame".
          let wallHugRejectedCardThisFrame = false;
          // Track the combined bounding box of ALL significant contours for distance guidance.
          // Single contour area fails when fingers break card edges into many small contours.
          // The combined bounding box captures the document's full spatial extent.
          let combinedMinX = Infinity;
          let combinedMinY = Infinity;
          let combinedMaxX = -Infinity;
          let combinedMaxY = -Infinity;
          let hasSignificantContour = false;
          // Per-contour boxes (full-res ROI px), collected so the synthetic
          // fallback can build a CARD-FOCUSED bbox via outlier trimming instead
          // of the absolute union — a hand/arm entering the frame is a sparse
          // outlier that would otherwise inflate the box and over-read distance.
          const contourBoxes: Array<{
            x: number;
            y: number;
            r: number;
            b: number;
          }> = [];
          // All contour-pass geometry is in full-res ROI pixels.
          const minContourPixels = clampedW * clampedH * 0.005; // 0.5% — catches small text fragments

          // Seam rejection: straight background lines from the closed `edges`
          // map. Computed lazily (once per frame, only when a 4-corner
          // candidate actually reaches the acceptance gate) so empty / no-card
          // frames pay nothing. Cached in a frame-local; the transient `lines`
          // Mat is released immediately after conversion to a plain array.
          const seamRejectEnabled =
            settingsRef.current.seamRejectEnabled !== false;
          let houghSegments: SeamSegment[] | null = null;
          const getHoughSegments = (): SeamSegment[] => {
            if (houghSegments) return houghSegments;
            const found: SeamSegment[] = [];
            const lines = new cv.Mat();
            try {
              const houghThreshold = settingsRef.current.houghThreshold ?? 40;
              const minLenRatio =
                settingsRef.current.houghMinLengthRatio ?? 0.3;
              const maxGap = settingsRef.current.houghMaxLineGap ?? 10;
              const minLineLen = Math.max(
                10,
                Math.round(minLenRatio * Math.min(clampedW, clampedH)),
              );
              cv.HoughLinesP(
                edges,
                lines,
                HOUGH_RHO,
                HOUGH_THETA,
                houghThreshold,
                minLineLen,
                maxGap,
              );
              for (let li = 0; li < lines.rows; li++) {
                found.push({
                  x1: lines.data32S[li * 4],
                  y1: lines.data32S[li * 4 + 1],
                  x2: lines.data32S[li * 4 + 2],
                  y2: lines.data32S[li * 4 + 3],
                });
              }
            } catch {
              // best-effort: on any failure, treat as "no seam lines found"
              // so the gate never blocks capture on its own error.
            } finally {
              safeDelete(lines);
            }
            houghSegments = found;
            return houghSegments;
          };

          for (let i = 0; i < contours.size(); ++i) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);

            // Expand combined bounding box with any non-trivial contour
            if (area > minContourPixels) {
              hasSignificantContour = true;
              const br = cv.boundingRect(cnt);
              combinedMinX = Math.min(combinedMinX, br.x);
              combinedMinY = Math.min(combinedMinY, br.y);
              combinedMaxX = Math.max(combinedMaxX, br.x + br.width);
              combinedMaxY = Math.max(combinedMaxY, br.y + br.height);
              contourBoxes.push({
                x: br.x,
                y: br.y,
                r: br.x + br.width,
                b: br.y + br.height,
              });
            }

            if (area > clampedW * clampedH * MIN_CONTOUR_AREA_PERCENT) {
              const peri = cv.arcLength(cnt, true);
              let approx = new cv.Mat();
              cv.approxPolyDP(cnt, approx, 0.04 * peri, true);

              // Laminated cards held in hand often produce 5-7 vertices because
              // fingers or glare break a corner into two points. Retry with a
              // wider epsilon to collapse back to a 4-point polygon.
              if (approx.rows > 4 && approx.rows <= 7) {
                approx.delete();
                approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.07 * peri, true);
              }

              if (approx.rows === 4 && area > maxArea) {
                // --- Rectangularity check ---
                // Reject contours that aren't proper rectangles (e.g. faces).
                // Measure fill against the MINIMUM-AREA (rotated) rect, not the
                // axis-aligned bbox: a real card fills its rotated rect ~fully
                // at ANY tilt, whereas the axis-aligned bbox is inflated by
                // rotation and wrongly fails a tilted card (a ~15° tilt drops
                // axis-aligned fill to ~0.64). bRect is still used for the
                // wall-hug check below.
                const bRect = cv.boundingRect(approx);
                const minRect = cv.minAreaRect(approx);
                const rotW = minRect.size.width;
                const rotH = minRect.size.height;
                const fillRatio =
                  rotW > 0 && rotH > 0 ? area / (rotW * rotH) : 0;

                // --- ROI-boundary check ---
                // Reject contours that hug the ROI walls: background pattern
                // rectangles fill the entire ROI and touch all 4 walls
                // simultaneously. Mobile rejects at 3+ touches (a real card at
                // correct distance leaves space on at least 2 sides). Desktop
                // requires all 4 — its ROI is the visible bordered box, which
                // users naturally fill, so 3 touches is common for legitimate
                // off-center hand-held cards.
                const wallMargin = Math.round(
                  Math.min(clampedW, clampedH) * 0.04,
                );
                const wallTouches =
                  (bRect.x <= wallMargin ? 1 : 0) +
                  (bRect.y <= wallMargin ? 1 : 0) +
                  (bRect.x + bRect.width >= clampedW - wallMargin ? 1 : 0) +
                  (bRect.y + bRect.height >= clampedH - wallMargin ? 1 : 0);
                const roiWallHug = wallTouches >= (skipGridCheck ? 4 : 3);

                // --- Aspect-ratio gate ---
                // Reject candidates whose shape doesn't match a document.
                // During discovery, allow anything in the union of passport
                // (1.42) and ID (1.585) ranges with ±20% slack. After the
                // doc type is locked, gate tightly against the expected ratio.
                // Use the rotated-rect dimensions so the aspect is the card's
                // TRUE aspect, not the tilt-skewed axis-aligned bbox aspect
                // (which drifts toward 1.0 as the card rotates).
                const detectedAspect = rotH > 0 ? rotW / rotH : 0;
                const normalizedAspect = Math.max(
                  detectedAspect,
                  detectedAspect > 0 ? 1 / detectedAspect : 0,
                );
                if (area > maxArea) lastCandidateAspect = normalizedAspect;
                const lockedDocType = discoveryRef.current.docType;
                const expectedAspect = lockedDocType
                  ? ASPECT_RATIOS[lockedDocType]
                  : null;
                const isBookDocAspect =
                  lockedDocType === 'passport' || lockedDocType === 'greenbook';
                // minAreaRect gives the document's TRUE aspect (tilt-invariant),
                // so both windows can be tight. id-card: 1.585 ± 12%. Passport
                // (1.42) ± 10% = [1.278, 1.562] — excludes ID cards (1.585),
                // 16:9/16:10 monitors and phones that the old ±0.35 admitted.
                // Both tunable for on-device dialing.
                const aspectTolerance = isBookDocAspect
                  ? (settingsRef.current.bookDocAspectTolerance ?? 0.1)
                  : (settingsRef.current.idAspectTolerance ?? 0.12);
                const aspectOk = expectedAspect
                  ? Math.abs(normalizedAspect - expectedAspect) /
                      expectedAspect <
                    aspectTolerance
                  : normalizedAspect >= 1.18 && normalizedAspect <= 1.95;

                let anglesOk = true;
                for (let j = 0; j < 4; j++) {
                  const p0x = approx.data32S[j * 2];
                  const p0y = approx.data32S[j * 2 + 1];
                  const p1x = approx.data32S[((j + 1) % 4) * 2];
                  const p1y = approx.data32S[((j + 1) % 4) * 2 + 1];
                  const p2x = approx.data32S[((j + 2) % 4) * 2];
                  const p2y = approx.data32S[((j + 2) % 4) * 2 + 1];
                  const v1x = p0x - p1x;
                  const v1y = p0y - p1y;
                  const v2x = p2x - p1x;
                  const v2y = p2y - p1y;
                  const dot = v1x * v2x + v1y * v2y;
                  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
                  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
                  if (mag1 === 0 || mag2 === 0) {
                    anglesOk = false;
                    break;
                  }
                  const cosAngle = dot / (mag1 * mag2);
                  const angle =
                    Math.acos(Math.max(-1, Math.min(1, cosAngle))) *
                    (180 / Math.PI);
                  if (angle < 60 || angle > 120) {
                    anglesOk = false;
                    break;
                  }
                }

                const minFillRatio =
                  settingsRef.current.minFillRatio ?? MIN_RECT_FILL_RATIO;

                // Seam rejection: a candidate that passes every shape gate and
                // is the new largest is tested against the frame's straight
                // background lines. If >= 2 of its edges sit on through-lines
                // that overshoot its corners, it is framed by seams (parquet /
                // slatted table), not a card — reject. Evaluated here (gated on
                // passesShape && area > maxArea) so the lazy Hough pass runs at
                // most once per frame and only when a real candidate appears.
                const passesShape =
                  fillRatio > minFillRatio &&
                  anglesOk &&
                  aspectOk &&
                  !roiWallHug;
                let seamReject = false;
                if (passesShape && area > maxArea && seamRejectEnabled) {
                  const corners: SeamCorner[] = [];
                  for (let c = 0; c < 4; c++) {
                    corners.push({
                      x: approx.data32S[c * 2],
                      y: approx.data32S[c * 2 + 1],
                    });
                  }
                  const lineSegments = getHoughSegments();
                  // Clutter guard: on a high-frequency texture (woven fabric,
                  // carpet) HoughLinesP returns hundreds of long lines, so a
                  // real card always has >=2 edges sitting on overshooting
                  // through-lines and would be wrongly rejected. The seam
                  // discriminator only holds on LOW-clutter surfaces (a parquet
                  // shows a handful of lines, a fabric ~400+), so skip the gate
                  // entirely once the line count is implausibly high.
                  const seamMaxLines =
                    settingsRef.current.seamMaxHoughLines ?? 60;
                  const tooCluttered = lineSegments.length > seamMaxLines;
                  seamReject =
                    !tooCluttered &&
                    isSeamFalseQuad(corners, lineSegments, {
                      roiW: clampedW,
                      roiH: clampedH,
                    });
                  mergeDebugInfo({
                    houghLines: lineSegments.length,
                    seamRejected: seamReject,
                    seamClutter: tooCluttered,
                  });
                }

                // Chroma-content gate is applied AFTER selection, on a rolling
                // average of the chosen candidate's chroma (see below) — the
                // per-frame value is too noisy (AWB/exposure/contour jitter) to
                // gate on directly. Geometry selects the candidate here.
                if (
                  fillRatio > minFillRatio &&
                  anglesOk &&
                  aspectOk &&
                  !roiWallHug &&
                  area > maxArea &&
                  !seamReject
                ) {
                  maxArea = area;
                  if (bestContour) bestContour.delete();
                  bestContour = approx;
                  // Record the winner's true geometry for the composite quality
                  // score read later at the stability gate (out of scope there).
                  winnerGeomRef.current = {
                    aspect: normalizedAspect,
                    fillRatio,
                    synthetic: false,
                  };
                  // Genuine 4-corner card validated — open the synthetic
                  // fallback's bridge window and reset the mobile-region streak.
                  lastRealCardAtRef.current = frameTimeMs;
                  regionStabilityRef.current = 0;
                } else {
                  // Desktop: the quad failed ONLY the wall-hug check — every
                  // shape gate (rectangularity, angles, aspect) says this is
                  // a real card, just too close.
                  if (
                    skipGridCheck &&
                    roiWallHug &&
                    fillRatio > minFillRatio &&
                    anglesOk &&
                    aspectOk
                  ) {
                    wallHugRejectedCardThisFrame = true;
                  }
                  approx.delete();
                }
              } else {
                approx.delete();
              }
            }
            cnt.delete();
          }

          mergeDebugInfo({ aspect: lastCandidateAspect.toFixed(2) });

          // --- Desktop overflow detection ---
          // A card pushed too close overflows the ROI: its outer edges leave
          // the frame, so no 4-corner quad forms (and the wall-hug "too
          // close" signal above never fires — it needs a complete quad).
          // What remains are inner-content contours CLIPPED at the ROI
          // walls. A combined bbox touching 2+ walls with capture-grade grid
          // coverage means the document overflows the box; a genuinely far
          // card produces a small, centered bbox touching nothing.
          // Require an OPPOSITE wall pair (left+right or top+bottom): a card
          // overflowing the box spans the ROI along an axis, while the hand
          // holding it intrudes from one side or corner — adjacent touches —
          // and must not read as overflow at an otherwise good distance.
          let combinedBboxOverflow = false;
          if (skipGridCheck && hasSignificantContour) {
            const cbMargin = Math.round(Math.min(clampedW, clampedH) * 0.04);
            const touchesLeft = combinedMinX <= cbMargin;
            const touchesTop = combinedMinY <= cbMargin;
            const touchesRight = combinedMaxX >= clampedW - cbMargin;
            const touchesBottom = combinedMaxY >= clampedH - cbMargin;
            combinedBboxOverflow =
              ((touchesLeft && touchesRight) ||
                (touchesTop && touchesBottom)) &&
              passingCells >= 7;
          }

          // --- Chroma-mask fallback (colored card on neutral background) ---
          // A strongly COLOURED card (e.g. a green/yellow ID) on a near-neutral
          // surface (grey fabric) has almost no LUMINANCE border, and its chroma
          // edges are swamped by the background texture, so no 4-corner quad
          // forms above. Segment the card by CHROMA MAGNITUDE instead: threshold
          // |a-128|+|b-128| (already computed as chromaMag), clean up, take the
          // largest blob. Heavily gated — a chromatic BACKGROUND (wood/parquet)
          // fills the ROI and is caught by the coverage/wall-hug gates.
          // KNOWN LIMITATION: a colourful rug/carpet patch is classically
          // indistinguishable from a card and CAN pass this path (fill, aspect
          // and internal-edge density all overlap). Flag-gated (chromaMaskFallback,
          // default on for mobile) so it can be disabled live if it regresses.
          const chromaMaskOn =
            settingsRef.current.chromaMaskFallback === true &&
            !!chromaMag &&
            !skipGridCheck;
          if (!bestContour && chromaMaskOn) {
            let mask: any = null;
            let maskContours: any = null;
            let maskHierarchy: any = null;
            let maskKernel: any = null;
            let maskBest: any = null;
            let maskApprox: any = null;
            try {
              const roiPix = clampedW * clampedH;
              mask = new cv.Mat();
              const maskThresh = settingsRef.current.chromaMaskThreshold ?? 18;
              cv.threshold(chromaMag, mask, maskThresh, 255, cv.THRESH_BINARY);
              maskKernel = cv.getStructuringElement(
                cv.MORPH_RECT,
                new cv.Size(7, 7),
              );
              cv.morphologyEx(
                mask,
                mask,
                cv.MORPH_CLOSE,
                maskKernel,
                new cv.Point(-1, -1),
                2,
              );
              cv.morphologyEx(
                mask,
                mask,
                cv.MORPH_OPEN,
                maskKernel,
                new cv.Point(-1, -1),
                1,
              );
              const maskFrac = cv.countNonZero(mask) / roiPix;
              maskContours = new cv.MatVector();
              maskHierarchy = new cv.Mat();
              cv.findContours(
                mask,
                maskContours,
                maskHierarchy,
                cv.RETR_EXTERNAL,
                cv.CHAIN_APPROX_SIMPLE,
              );
              let maskBestArea = 0;
              for (let mi = 0; mi < maskContours.size(); mi++) {
                const c = maskContours.get(mi);
                const a = cv.contourArea(c);
                if (a > maskBestArea) {
                  maskBestArea = a;
                  if (maskBest) maskBest.delete();
                  maskBest = c;
                } else {
                  c.delete();
                }
              }
              const areaFrac = maskBestArea / roiPix;
              const maskMaxFrac = settingsRef.current.chromaMaskMaxFrac ?? 0.7;
              const maskMinFrac = settingsRef.current.chromaMaskMinFrac ?? 0.08;
              // Coverage band: too small => noise; > maxFrac => a chromatic
              // background spanning the whole ROI, not a card.
              if (
                maskBest &&
                areaFrac >= maskMinFrac &&
                maskFrac <= maskMaxFrac
              ) {
                const peri = cv.arcLength(maskBest, true);
                maskApprox = new cv.Mat();
                cv.approxPolyDP(maskBest, maskApprox, 0.04 * peri, true);
                if (maskApprox.rows > 4 && maskApprox.rows <= 7) {
                  maskApprox.delete();
                  maskApprox = new cv.Mat();
                  cv.approxPolyDP(maskBest, maskApprox, 0.07 * peri, true);
                }
                if (maskApprox.rows === 4) {
                  const mRect = cv.minAreaRect(maskApprox);
                  const mw = mRect.size.width;
                  const mh = mRect.size.height;
                  const mFill = mw > 0 && mh > 0 ? maskBestArea / (mw * mh) : 0;
                  const mAsp = mh > 0 ? mw / mh : 0;
                  const mNorm = Math.max(mAsp, mAsp > 0 ? 1 / mAsp : 0);
                  const mBr = cv.boundingRect(maskApprox);
                  const wm = Math.round(Math.min(clampedW, clampedH) * 0.04);
                  const mTouches =
                    (mBr.x <= wm ? 1 : 0) +
                    (mBr.y <= wm ? 1 : 0) +
                    (mBr.x + mBr.width >= clampedW - wm ? 1 : 0) +
                    (mBr.y + mBr.height >= clampedH - wm ? 1 : 0);
                  // Same aspect windows as the real-contour path: tight when the
                  // doc type is locked, the passport∪ID discovery window otherwise.
                  const maskDocType = discoveryRef.current.docType;
                  const maskExpected = maskDocType
                    ? ASPECT_RATIOS[maskDocType]
                    : null;
                  const maskIsBookDoc =
                    maskDocType === 'passport' || maskDocType === 'greenbook';
                  const maskAspectTol = maskIsBookDoc
                    ? (settingsRef.current.bookDocAspectTolerance ?? 0.1)
                    : (settingsRef.current.idAspectTolerance ?? 0.12);
                  const maskAspectOk = maskExpected
                    ? Math.abs(mNorm - maskExpected) / maskExpected <
                      maskAspectTol
                    : mNorm >= 1.18 && mNorm <= 1.95;
                  const maskFillOk =
                    mFill >
                    (settingsRef.current.minFillRatio ?? MIN_RECT_FILL_RATIO);
                  const maskWallOk = mTouches < (skipGridCheck ? 4 : 3);
                  mergeDebugInfo({
                    chromaMaskFrac: Math.round(maskFrac * 100),
                    chromaMaskArea: Math.round(areaFrac * 100),
                    chromaMaskFill: mFill.toFixed(2),
                    chromaMaskAspect: mNorm.toFixed(2),
                    chromaMaskWall: mTouches,
                  });
                  if (maskAspectOk && maskFillOk && maskWallOk) {
                    // Genuine full-card quad — treat as a real contour (NOT
                    // synthetic): distance/fill gating applies normally below.
                    bestContour = maskApprox;
                    maskApprox = null; // ownership transferred to bestContour
                    winnerGeomRef.current = {
                      aspect: mNorm,
                      fillRatio: mFill,
                      synthetic: false,
                    };
                    edgeSource = 'chroma-mask';
                    mergeDebugInfo({ contourSource: edgeSource });
                  }
                }
              }
            } catch (maskErr) {
              mergeDebugInfo({ chromaMaskError: formatDebugError(maskErr) });
            } finally {
              safeDelete(
                mask,
                maskContours,
                maskHierarchy,
                maskKernel,
                maskBest,
                maskApprox,
              );
            }
          }

          // --- Book-doc fallback ---
          // Passport/greenbook frequently fail the strict 4-vertex check
          // because the binding seam at the top is low-contrast and breaks
          // the outer contour. When no 4-corner card is found in CAPTURE
          // phase for a book doc, synthesize an axis-aligned rect from the
          // combined bbox of all significant contours (photo, text, MRZ,
          // page edges) if the aspect roughly matches the locked doc type.
          if (!bestContour && hasSignificantContour && !isDiscovery) {
            const lockedDocTypeForFallback = discoveryRef.current.docType;
            // Synthetic-fallback eligibility, shared by id-card AND book docs.
            // Either a genuine 4-corner quad was seen moments ago and briefly
            // dropped out (finger/glare broke an edge), OR the scene passes the
            // 7/9 grid-coverage bar (a document fills the box; a document-free
            // scene — face, furniture, window frames — leaves blank cells).
            // Without this gate the combined bbox of background contours passes
            // the aspect/area checks below and auto-captures a non-document.
            // An overflowing card must never synthesize: its bbox covers only
            // the visible (clipped) content, so the fill metric underestimates
            // distance and a capture would clip the card's edges anyway.
            const synthCoverageEligible =
              !combinedBboxOverflow &&
              (isSyntheticBridgeRecent(
                lastRealCardAtRef.current,
                frameTimeMs,
              ) ||
                passingCells >= 7);
            // Passports/greenbooks rarely form a clean 4-corner quad (the spine
            // breaks the outer contour), so they depend on this synthetic path
            // — but it MUST be gated like id-card. Previously book docs
            // synthesized on aspect+area alone, so an empty desktop scene
            // synthesized a passport from background contours and auto-captured.
            const isBookDocFallback =
              (lockedDocTypeForFallback === 'passport' ||
                lockedDocTypeForFallback === 'greenbook') &&
              synthCoverageEligible;
            const idCardSynthEligible = synthCoverageEligible;
            // Fix 3: mobile content-region fallback. Mirror the desktop id-card
            // synthetic on mobile (where skipGridCheck is false), but gate it on
            // sustained presence: a candidate must persist
            // MOBILE_REGION_STABILITY_FRAMES frames before it can synthesize a
            // card. The aspect/area gates below and the synthetic id-card fill
            // enforcement downstream still apply, so distance/shape safety holds.
            const mobileRegionCandidate =
              settingsRef.current.mobileRegionFallback === true &&
              !skipGridCheck &&
              lockedDocTypeForFallback === 'id-card' &&
              passingCells >= 7 &&
              !combinedBboxOverflow;
            if (mobileRegionCandidate) {
              regionStabilityRef.current += 1;
            } else {
              regionStabilityRef.current = 0;
            }
            const mobileRegionEligible =
              mobileRegionCandidate &&
              regionStabilityRef.current >= MOBILE_REGION_STABILITY_FRAMES;
            const isIdCardFallback =
              (skipGridCheck &&
                lockedDocTypeForFallback === 'id-card' &&
                idCardSynthEligible) ||
              mobileRegionEligible;
            if (isBookDocFallback || isIdCardFallback) {
              // Card-focused bbox (A): the document is a dense cluster of content
              // contours; a hand/arm entering the frame is a sparse outlier that
              // the absolute union (combinedMin/Max) lets inflate the box, so
              // distance over-reads and it captures from too far. On desktop,
              // with enough contours, take a percentile envelope (10th–90th) so
              // 1–2 outlier contours are trimmed and the box hugs the card.
              // Mobile keeps the absolute union unchanged.
              let cMinX = combinedMinX;
              let cMinY = combinedMinY;
              let cMaxX = combinedMaxX;
              let cMaxY = combinedMaxY;
              if (skipGridCheck && contourBoxes.length >= 8) {
                const pctl = (vals: number[], p: number) => {
                  const s = vals.slice().sort((a, b) => a - b);
                  return s[Math.round(p * (s.length - 1))];
                };
                cMinX = pctl(
                  contourBoxes.map((c) => c.x),
                  0.1,
                );
                cMinY = pctl(
                  contourBoxes.map((c) => c.y),
                  0.1,
                );
                cMaxX = pctl(
                  contourBoxes.map((c) => c.r),
                  0.9,
                );
                cMaxY = pctl(
                  contourBoxes.map((c) => c.b),
                  0.9,
                );
              }
              const bw = cMaxX - cMinX;
              const bh = cMaxY - cMinY;
              if (bw > 0 && bh > 0) {
                const expectedAspect = ASPECT_RATIOS[lockedDocTypeForFallback];
                const rawAspect = bw / bh;
                const normalizedAspect = Math.max(rawAspect, 1 / rawAspect);
                // Use the same tight aspect windows as the real-contour path so
                // the fallback can't accept an off-aspect rectangle the strict
                // path would reject (16:9 screen, ID card in passport flow…).
                const aspectTol = isBookDocFallback
                  ? (settingsRef.current.bookDocAspectTolerance ?? 0.1)
                  : (settingsRef.current.idAspectTolerance ?? 0.12);
                const aspectOk =
                  Math.abs(normalizedAspect - expectedAspect) / expectedAspect <
                  aspectTol;
                const minArea =
                  guideWidth * guideHeight * MIN_CONTOUR_AREA_PERCENT;
                // The chroma-content gate is NOT applied here — selection on
                // both the real and synthetic paths is geometry-only. The
                // synthesized contour is gated downstream on the rolling chroma
                // average alongside the real-contour winner (see below), so a
                // near-monochrome object (white keyboard) that only ever forms
                // a synthetic rect is still rejected, without double-gating on
                // the noisy per-frame value.
                if (aspectOk && bw * bh > minArea) {
                  // For id-card synthetics, the combined bbox covers only the
                  // inner printed content (text, photo, header band). Real cards
                  // have a ~10-15% margin from card edge to first element, so
                  // the raw bbox understates the true card extent. Expand from
                  // the bbox center by a card-margin factor and clamp to ROI.
                  let minX = cMinX;
                  let minY = cMinY;
                  let maxX = cMaxX;
                  let maxY = cMaxY;
                  if (isIdCardFallback) {
                    const SYNTH_EXPAND = 1.15;
                    const cx = (cMinX + cMaxX) / 2;
                    const cy = (cMinY + cMaxY) / 2;
                    const halfW = (bw * SYNTH_EXPAND) / 2;
                    const halfH = (bh * SYNTH_EXPAND) / 2;
                    minX = Math.max(0, Math.round(cx - halfW));
                    minY = Math.max(0, Math.round(cy - halfH));
                    maxX = Math.min(clampedW, Math.round(cx + halfW));
                    maxY = Math.min(clampedH, Math.round(cy + halfH));
                  }
                  const synth = new cv.Mat(4, 1, cv.CV_32SC2);
                  synth.data32S[0] = minX;
                  synth.data32S[1] = minY;
                  synth.data32S[2] = maxX;
                  synth.data32S[3] = minY;
                  synth.data32S[4] = maxX;
                  synth.data32S[5] = maxY;
                  synth.data32S[6] = minX;
                  synth.data32S[7] = maxY;
                  bestContour = synth;
                  bestContourIsSynthetic = true;
                  // Synthetic rect: record its aspect; fillRatio is not
                  // meaningful (the rect is inferred), so the quality score
                  // applies a fixed lower confidence (SYNTHETIC_CONTOUR_*).
                  winnerGeomRef.current = {
                    aspect: normalizedAspect,
                    fillRatio: 0,
                    synthetic: true,
                  };
                  if (mobileRegionEligible) {
                    edgeSource = 'region';
                    mergeDebugInfo({ contourSource: edgeSource });
                  }
                }
              }
            }
          }

          // --- Distance guidance (combined bounding box of all contours) ---
          // The combined bbox captures the document's full extent even when edges
          // are broken into many fragments by fingers, glare, etc.
          // Skip in card variant: the ROI is the full video frame, so background
          // contours (wall, desk, etc.) inflate the bbox to ~100% always.
          // docFillPercent is a ratio, so each branch divides by the ROI area
          // in ITS OWN coordinate space: full-res for the contour-pass geometry,
          // 640px for the presenceEdges fallback.
          const roiArea = clampedW * clampedH; // full-res ROI (contour pass)
          const dsRoiArea = dsClampedW * dsClampedH; // 640px ROI (presence map)
          let docFillPercent = 0;

          if (bestContour) {
            const cardRect = cv.boundingRect(bestContour);
            docFillPercent =
              ((cardRect.width * cardRect.height) / roiArea) * 100;
          } else if (hasSignificantContour) {
            const cbw = combinedMaxX - combinedMinX;
            const cbh = combinedMaxY - combinedMinY;
            docFillPercent = ((cbw * cbh) / roiArea) * 100;
          } else if (USE_PRESENCE_FILL_METRIC) {
            let nz = null;
            try {
              nz = new cv.Mat();
              cv.findNonZero(presenceEdges, nz);
              if (nz.rows > 0) {
                const br = cv.boundingRect(nz);
                docFillPercent = ((br.width * br.height) / dsRoiArea) * 100;
              }
            } catch {
              // fall through with docFillPercent = 0
            } finally {
              if (nz) nz.delete();
            }
          }
          // Smooth the fill % with an EMA so distance jitter near the gate
          // thresholds doesn't toggle "move closer/further" frame-to-frame.
          // alpha = 1 disables smoothing (desktop default via the ?? fallback).
          const fillAlpha = settingsRef.current.docFillEmaAlpha ?? 1;
          docFillEmaRef.current =
            docFillEmaRef.current == null
              ? docFillPercent
              : fillAlpha * docFillPercent +
                (1 - fillAlpha) * docFillEmaRef.current;
          const smoothedDocFill = docFillEmaRef.current;
          latestDocFillRef.current = smoothedDocFill;

          // Active whenever we have a real contour to measure against.
          // Skip distance gating when the contour is the synthetic book-doc
          // fallback: its bbox reflects inner content, not the full page,
          // so fill% is structurally low and would block capture forever.
          // ID-card synthetics still enforce fill — the combined bbox reflects
          // the card's actual extent so the distance signal is meaningful.
          const isIdCardSynthetic =
            bestContourIsSynthetic &&
            discoveryRef.current.docType === 'id-card';
          const fillCheckActive =
            !!bestContour && (!bestContourIsSynthetic || isIdCardSynthetic);

          // Book-style docs (passport/greenbook) frequently yield a contour
          // covering only the bio-data page rather than the full guide rect,
          // so we relax the minimum fill threshold for them.
          // ID-card synthetics use the standard floor — their bbox has been
          // pre-expanded above to approximate the true card edge.
          // Per-device overrides can be supplied via settings (minFillPercent /
          // maxFillPercent). Desktop uses 70 / 98 (measured against the visible
          // box, which IS the desktop ROI); mobile keeps 75 / 95.
          const lockedDocTypeForFill = discoveryRef.current.docType;
          const isBookDocFill =
            lockedDocTypeForFill === 'passport' ||
            lockedDocTypeForFill === 'greenbook';
          const minFillPercent = isBookDocFill
            ? 20
            : (settingsRef.current.minFillPercent ?? MIN_FILL_PERCENT);
          const maxFillPercent =
            settingsRef.current.maxFillPercent ?? MAX_FILL_PERCENT;

          // Distance guidance only applies during capture phase (after doc type is locked).
          // During discovery, the guide box uses the wider passport ratio and distance
          // checks would block voting with misleading feedback.
          // Hysteresis deadband (pct points): trip the distance gate only when
          // the smoothed fill is clearly out of band, so a hand hovering on the
          // threshold doesn't toggle. 0 disables (desktop default).
          const fillBand = settingsRef.current.fillHysteresis ?? 0;
          const gateDecayOn = settingsRef.current.gateDecayEnabled === true;
          if (
            !isCard &&
            !isDiscovery &&
            fillCheckActive &&
            smoothedDocFill < minFillPercent - fillBand
          ) {
            // Soften instead of nuking progress on a transient dip; only
            // downgrade the displayed state when the failure isn't absorbed.
            const absorbed = gateDecayOn && softFailStability();
            if (!absorbed) {
              setFeedback(autoCaptureFeedback.moveDocumentCloser);
              setComplianceState(COMPLIANCE_STATES.DETECTING);
            }
            if (bestContour) bestContour.delete();
            mergeDebugInfo({
              docFill: Math.round(smoothedDocFill),
              edgeDensity: edgeDensity.toFixed(1),
              texture: Math.round(textureScore),
              rejectReason: `fill too small (${Math.round(smoothedDocFill)}% < ${minFillPercent}%)${absorbed ? ' [held]' : ''}`,
            });
            return;
          }
          if (
            !isCard &&
            !isDiscovery &&
            fillCheckActive &&
            smoothedDocFill > maxFillPercent + fillBand
          ) {
            const absorbed = gateDecayOn && softFailStability();
            if (!absorbed) {
              setFeedback(autoCaptureFeedback.moveDocumentFurtherAway);
              setComplianceState(COMPLIANCE_STATES.DETECTING);
            }
            if (bestContour) bestContour.delete();
            mergeDebugInfo({
              docFill: Math.round(smoothedDocFill),
              edgeDensity: edgeDensity.toFixed(1),
              texture: Math.round(textureScore),
              rejectReason: `fill too large (${Math.round(smoothedDocFill)}% > ${maxFillPercent}%)${absorbed ? ' [held]' : ''}`,
            });
            return;
          }

          // --- Chroma-content gate (rolling average, post-selection) ---
          // Geometry just selected the best candidate (real quad or synthetic
          // rect). A white keyboard / blank paper passes every shape gate, so
          // reject near-monochrome winners by colour content. The per-frame
          // chroma is noisy, so we average it over the candidate's bbox across
          // the last few frames and only gate once the window has filled
          // (capture is still blocked by the stability counter until then).
          // Only active when chroma fusion built chromaMag (mobile) and on.
          if (
            bestContour &&
            chromaMag &&
            settingsRef.current.chromaContentGate === true
          ) {
            const cRect = cv.boundingRect(bestContour);
            const cx = Math.max(0, cRect.x);
            const cy = Math.max(0, cRect.y);
            const cw = Math.min(chromaMag.cols - cx, cRect.width);
            const ch = Math.min(chromaMag.rows - cy, cRect.height);
            let candChroma = 0;
            if (cw > 0 && ch > 0) {
              const chRoi = chromaMag.roi(new cv.Rect(cx, cy, cw, ch));
              [candChroma] = cv.mean(chRoi);
              chRoi.delete();
            }
            const win = chromaWindowRef.current;
            win.push(candChroma);
            if (win.length > CHROMA_AVG_WINDOW) win.shift();
            const avgChroma = win.reduce((sum, v) => sum + v, 0) / win.length;
            mergeDebugInfo({ chroma: Math.round(avgChroma) });
            if (
              win.length >= CHROMA_MIN_SAMPLES &&
              avgChroma < (settingsRef.current.minChromaContent ?? 13)
            ) {
              const absorbed = gateDecayOn && softFailStability();
              if (!absorbed) {
                setFeedback(autoCaptureFeedback.positionDocument);
                setComplianceState(COMPLIANCE_STATES.DETECTING);
              }
              bestContour.delete();
              mergeDebugInfo({
                rejectReason: `chroma content low (${Math.round(avgChroma)} < ${settingsRef.current.minChromaContent ?? 13})${absorbed ? ' [held]' : ''}`,
              });
              return;
            }
          }

          if (bestContour) {
            // Reset consecutive miss counter on successful detection
            if (isDiscovery) discoveryRef.current.consecutiveMisses = 0;
            captureMissCounterRef.current = 0;
            // Mark in-guide hit so the off-guide scan stays paused while
            // a card is locked in.
            inGuideDetectedRef.current = true;

            // Cache the card's bounding rect in canvas coords for tight
            // crop-to-contour at capture time. Contour points are ROI-relative,
            // so translate by the ROI origin. For the synthetic book-doc
            // fallback the contour bbox covers only inner content (photo,
            // text, MRZ) — expand it to the guide rect so the preview shows
            // the whole bio page rather than just the inner cluster.
            if (bestContourIsSynthetic) {
              latestCardRectRef.current = {
                x: clampedX,
                y: clampedY,
                w: clampedW,
                h: clampedH,
              };
            } else {
              // Contour coords are already in full-res ROI space, so only the
              // ROI origin offset is needed for capture cropping
              // (triggerManualCapture + bestFrame).
              const cardRect = cv.boundingRect(bestContour);
              latestCardRectRef.current = {
                x: clampedX + cardRect.x,
                y: clampedY + cardRect.y,
                w: cardRect.width,
                h: cardRect.height,
              };
            }

            // Store points relative to the ROI for overlay drawing (only if dynamic border is on)
            if (settingsRef.current.useDynamicBorder) {
              const points: Array<{ x: number; y: number }> & {
                roiWidth?: number;
                roiHeight?: number;
              } = [];
              for (let i = 0; i < 4; i++) {
                points.push({
                  x: bestContour.data32S[i * 2],
                  y: bestContour.data32S[i * 2 + 1],
                });
              }
              points.roiWidth = clampedW;
              points.roiHeight = clampedH;
              updateDebugPath(points);
            }
            setComplianceState(COMPLIANCE_STATES.DETECTING);

            // --- Phase 1: Classify document type from detected contour ---
            if (isDiscovery) {
              const bRect = cv.boundingRect(bestContour);

              // --- Discovery timeout ---
              // Only increments when a valid rectangle is found (large enough to be a document).
              // This prevents empty scenes from triggering the timeout fallback.
              discoveryRef.current.frameCount++;
              if (discoveryRef.current.frameCount >= DISCOVERY_TIMEOUT_FRAMES) {
                const fallbackType = 'id-card';
                discoveryRef.current.docType = fallbackType;
                detectionPhaseRef.current = DETECTION_PHASE.CAPTURE;
                setDetectedDocType(fallbackType);
                setGuideAspectRatio(orientAspect(ASPECT_RATIOS[fallbackType]));
                console.info(
                  `[Discovery] Timeout after ${discoveryRef.current.frameCount} frames — defaulting to: ${fallbackType}`,
                );
                setFeedback(autoCaptureFeedback.holdSteady);
                if (canvasRef.current) canvasRef.current._roiLogged = false;
                bestContour.delete();
                mergeDebugInfo({
                  rejectReason: 'discovery: timeout → id-card',
                });
                return;
              }

              const detectedRatio = bRect.width / bRect.height;
              // Normalize orientation so portrait-held docs still classify correctly.
              // Prefer the rotated-rect aspect computed during contour
              // acceptance: unlike boundingRect, it is stable when the card is
              // tilted in-plane. Fall back to boundingRect only if the winner
              // geometry is unavailable.
              const normalizedRatio =
                winnerGeomRef.current.aspect > 0
                  ? winnerGeomRef.current.aspect
                  : Math.max(detectedRatio, 1 / detectedRatio);
              const vote = classifyDiscoveryAspect(normalizedRatio);

              discoveryRef.current.votes.push(vote);

              // Keep only the last N votes to prevent stale history
              if (
                discoveryRef.current.votes.length >
                DISCOVERY_CONSENSUS_THRESHOLD * 2
              ) {
                discoveryRef.current.votes = discoveryRef.current.votes.slice(
                  -DISCOVERY_CONSENSUS_THRESHOLD,
                );
              }

              // Check for consensus: last N votes must all agree
              const recentVotes = discoveryRef.current.votes.slice(
                -DISCOVERY_CONSENSUS_THRESHOLD,
              );
              const allAgree =
                recentVotes.length >= DISCOVERY_CONSENSUS_THRESHOLD &&
                recentVotes.every((v) => v === recentVotes[0]);

              setFeedback(autoCaptureFeedback.detectingDocumentType);
              mergeDebugInfo({
                blur: 0,
                glare: 0,
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                detectedRatio: normalizedRatio.toFixed(3),
                votes: `${recentVotes.filter((v) => v === 'id-card').length}id / ${recentVotes.filter((v) => v === 'passport').length}pp`,
                rejectReason: allAgree
                  ? 'discovery: type locked'
                  : 'discovery: detecting type',
              });

              if (allAgree) {
                const classifiedType = recentVotes[0];
                discoveryRef.current.docType = classifiedType;
                detectionPhaseRef.current = DETECTION_PHASE.CAPTURE;
                setDetectedDocType(classifiedType);
                setGuideAspectRatio(
                  orientAspect(ASPECT_RATIOS[classifiedType]),
                );
                console.info(
                  `[Discovery] Document classified as: ${classifiedType} (ratio: ${normalizedRatio.toFixed(3)})`,
                );
                setFeedback(autoCaptureFeedback.holdSteady);
                // Force ROI recalculation on next frame by clearing the log flag
                if (canvasRef.current) canvasRef.current._roiLogged = false;
              }

              bestContour.delete();
              // During discovery, skip quality gates — just loop
              return;
            }

            bestContour.delete();
          } else {
            updateDebugPath(null);
            // No card inside the guide → re-enable off-guide scanning.
            inGuideDetectedRef.current = false;
            // No candidate this frame — drop the chroma history so a stale
            // average can't carry over to the next object entering the frame.
            chromaWindowRef.current = [];
            // During discovery, no contour found — keep waiting
            if (isDiscovery) {
              // A wall-hug-rejected card means the user is too close, not
              // absent. Without this hint a too-close card deadlocks
              // discovery: the timeout counter only advances on valid
              // contours, so no fallback classification ever fires.
              setFeedback(
                skipGridCheck &&
                  (wallHugRejectedCardThisFrame || combinedBboxOverflow)
                  ? autoCaptureFeedback.moveDocumentFurtherAway
                  : autoCaptureFeedback.positionDocument,
              );
              // Tolerate a few consecutive misses before resetting votes.
              // Mobile cameras drop detections for 1-2 frames due to motion blur,
              // auto-exposure changes, etc. Hard-resetting on every miss prevents
              // consensus from ever being reached.
              discoveryRef.current.consecutiveMisses++;
              if (
                discoveryRef.current.consecutiveMisses >=
                DISCOVERY_MISS_TOLERANCE
              ) {
                discoveryRef.current.votes = [];
              }
              mergeDebugInfo({
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                misses: discoveryRef.current.consecutiveMisses,
                votes: `${discoveryRef.current.votes.filter((v) => v === 'id-card').length}id / ${discoveryRef.current.votes.filter((v) => v === 'passport').length}pp`,
                rejectReason: 'discovery: no card contour',
              });
              return;
            }
            // CAPTURE phase, desktop: the card is real but too close —
            // either a card-shaped quad was rejected solely for hugging the
            // ROI walls, or the card overflows the box entirely (no quad can
            // form; inner content is clipped at 2+ ROI walls with full grid
            // coverage). Surface distance guidance immediately instead of
            // letting the miss counter drift to "Align document in frame".
            // Mirrors the maxFillPercent branch above, which cannot run here
            // because distance gating requires a bestContour.
            if (
              skipGridCheck &&
              (wallHugRejectedCardThisFrame || combinedBboxOverflow)
            ) {
              captureMissCounterRef.current = 0;
              const absorbed = gateDecayOn && softFailStability();
              if (!absorbed) {
                setFeedback(autoCaptureFeedback.moveDocumentFurtherAway);
                setComplianceState(COMPLIANCE_STATES.DETECTING);
              }
              mergeDebugInfo({
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                rejectReason: `fill too large (card overflows ROI)${absorbed ? ' [held]' : ''}`,
              });
              return;
            }
            // CAPTURE phase: no validated card-shaped contour inside the
            // ROI. Tolerate a few consecutive misses before changing the
            // prompt — book-style documents (passport, greenbook) frequently
            // drop the contour for 1–3 frames as the spine flexes or fingers
            // cross the edge, and flipping between "Move closer" and "Align
            // document" on every miss is jarring.
            captureMissCounterRef.current += 1;
            const CAPTURE_MISS_TOLERANCE = 20;
            if (captureMissCounterRef.current < CAPTURE_MISS_TOLERANCE) {
              mergeDebugInfo({
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                missStreak: captureMissCounterRef.current,
                rejectReason: `no card contour (miss ${captureMissCounterRef.current}/${CAPTURE_MISS_TOLERANCE})`,
              });
              return;
            }
            setFeedback(autoCaptureFeedback.alignDocument);
            setComplianceState(COMPLIANCE_STATES.IDLE);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { image: null, preview: null, score: 0 };
            docFillEmaRef.current = null;
            mergeDebugInfo({
              edgeDensity: edgeDensity.toFixed(1),
              texture: Math.round(textureScore),
              quadrants: quadDensities.join('/'),
              missStreak: captureMissCounterRef.current,
              rejectReason: 'no card contour (no 4-corner quad formed)',
            });
            return;
          }
        }

        // --- Gate 1: Sharpness / Blur ---
        laplacian = new cv.Mat();
        cv.Laplacian(gray, laplacian, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
        mean = new cv.Mat();
        stdDev = new cv.Mat();
        cv.meanStdDev(laplacian, mean, stdDev);
        const variance = stdDev.doubleAt(0, 0) ** 2;

        if (variance < settingsRef.current.blurThreshold) {
          setFeedback(autoCaptureFeedback.tooBlurry);
          setComplianceState(COMPLIANCE_STATES.DETECTING);
          // Tolerate a transient blurry frame while a best frame is already
          // held — mobile cameras drop 1–2 frames to motion blur / AWB. Soften
          // the stability count instead of discarding the captured candidate.
          if (
            bestFrameRef.current.image &&
            bestFrameMissRef.current < BEST_FRAME_MISS_TOLERANCE
          ) {
            bestFrameMissRef.current += 1;
            stabilityRef.current.count = Math.max(
              0,
              stabilityRef.current.count - 1,
            );
          } else {
            bestFrameMissRef.current = 0;
            stabilityRef.current.count = 0;
            bestFrameRef.current = { image: null, preview: null, score: 0 };
          }
          mergeDebugInfo({
            blur: Math.round(variance),
            glare: 0,
            rejectReason: `Gate1: too blurry (${Math.round(variance)} < ${settingsRef.current.blurThreshold})`,
          });
          return;
        }

        // --- Gate 2: Glare ---
        glareMask = new cv.Mat();
        cv.threshold(gray, glareMask, 240, 255, cv.THRESH_BINARY);
        const glarePixels = cv.countNonZero(glareMask);
        const totalPixels = gray.rows * gray.cols;
        const glarePercent = (glarePixels / totalPixels) * 100;

        mergeDebugInfo({
          blur: Math.round(variance),
          glare: glarePercent.toFixed(1),
          edgeDensity: edgeDensity.toFixed(1),
          texture: Math.round(textureScore),
          quadrants: quadDensities.join('/'),
          docFill: Math.round(latestDocFillRef.current),
        });

        if (glarePercent > settingsRef.current.glareThreshold) {
          setFeedback(autoCaptureFeedback.glareDetectedAdjustLighting);
          setComplianceState(COMPLIANCE_STATES.DETECTING);
          // Same transient-miss tolerance as the blur gate above.
          if (
            bestFrameRef.current.image &&
            bestFrameMissRef.current < BEST_FRAME_MISS_TOLERANCE
          ) {
            bestFrameMissRef.current += 1;
            stabilityRef.current.count = Math.max(
              0,
              stabilityRef.current.count - 1,
            );
          } else {
            bestFrameMissRef.current = 0;
            stabilityRef.current.count = 0;
            bestFrameRef.current = { image: null, preview: null, score: 0 };
          }
          mergeDebugInfo({
            rejectReason: `Gate2: glare (${glarePercent.toFixed(1)}% > ${settingsRef.current.glareThreshold}%)`,
          });
          return;
        }

        // --- Gate 3: Stability (track best frame) ---
        // Clean frame — clear the transient-miss streak.
        bestFrameMissRef.current = 0;
        stabilityRef.current.count++;
        const progress = Math.min(
          100,
          (stabilityRef.current.count /
            settingsRef.current.stabilityThreshold) *
            100,
        );

        // --- Composite per-frame quality score ---
        // Blend the metrics already computed this frame into one 0–1
        // readability score and keep the highest-scoring frame of the window
        // (Stripe/Persona-style), rather than the merely-sharpest one. Sub-
        // scores: sharpness vs blur threshold; inverse glare; framing (distance
        // from the center of the accepted fill band); aspect closeness to the
        // doc-type ratio; contour confidence (real quad fill, synthetic capped);
        // and colour content on mobile.
        const sharpScore = clamp01(
          variance / (2 * settingsRef.current.blurThreshold),
        );
        const glareLimit = settingsRef.current.glareThreshold || 1;
        const glareScore = clamp01(1 - glarePercent / glareLimit);
        // Recompute the accepted fill band (same basis as the distance gate's
        // minFillPercent/maxFillPercent, which are out of scope here).
        const qDocType = discoveryRef.current.docType;
        const qIsBookDoc = qDocType === 'passport' || qDocType === 'greenbook';
        const qMinFill = qIsBookDoc
          ? 20
          : (settingsRef.current.minFillPercent ?? MIN_FILL_PERCENT);
        const qMaxFill = settingsRef.current.maxFillPercent ?? MAX_FILL_PERCENT;
        const fillCenter = (qMinFill + qMaxFill) / 2;
        const fillHalf = Math.max(1, (qMaxFill - qMinFill) / 2);
        const fillScore = clamp01(
          1 - Math.abs(latestDocFillRef.current - fillCenter) / fillHalf,
        );
        const expectedAspect = isAspectKey(qDocType)
          ? ASPECT_RATIOS[qDocType]
          : null;
        const qAspectTol = qIsBookDoc
          ? (settingsRef.current.bookDocAspectTolerance ?? 0.1)
          : (settingsRef.current.idAspectTolerance ?? 0.12);
        const aspectScore =
          expectedAspect && winnerGeomRef.current.aspect > 0
            ? clamp01(
                1 -
                  Math.abs(winnerGeomRef.current.aspect - expectedAspect) /
                    (expectedAspect * qAspectTol),
              )
            : null;
        const contourScore = winnerGeomRef.current.synthetic
          ? SYNTHETIC_CONTOUR_CONFIDENCE
          : clamp01((winnerGeomRef.current.fillRatio - 0.5) / 0.5);
        let chromaScore: number | null = null;
        const chromaWin = chromaWindowRef.current;
        if (
          settingsRef.current.chromaContentGate === true &&
          chromaWin.length
        ) {
          const chromaAvg =
            chromaWin.reduce((sum, v) => sum + v, 0) / chromaWin.length;
          const minChroma = settingsRef.current.minChromaContent ?? 13;
          chromaScore = clamp01(chromaAvg / (2 * minChroma));
        }
        const composite = frameQualityScore({
          sharpness: sharpScore,
          glare: glareScore,
          fill: fillScore,
          aspect: aspectScore,
          contour: contourScore,
          chroma: chromaScore,
        });
        mergeDebugInfo({ quality: composite.toFixed(2) });

        // Keep the most readable frame (highest composite) of the window.
        if (composite > bestFrameRef.current.score) {
          bestFrameRef.current.score = composite;

          // Submitted image: full frame, or guide-rect crop when cropToCard
          // is enabled (original behavior). Padded by `cropPadding` (default 10%).
          // Crop in unrotated native-pixel space; any UI rotation is applied
          // to the cropped output below.
          const fullDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          let submittedDataUrl = fullDataUrl;
          if (settingsRef.current.cropToCard) {
            const submitPad =
              (settingsRef.current.cropPadding == null
                ? 10
                : settingsRef.current.cropPadding) / 100;
            const sPadX = clampedW * submitPad;
            const sPadY = clampedH * submitPad;
            const scx = Math.max(0, Math.floor(clampedX - sPadX));
            const scy = Math.max(0, Math.floor(clampedY - sPadY));
            const scw = Math.min(
              canvas.width - scx,
              Math.ceil(clampedW + sPadX * 2),
            );
            const sch = Math.min(
              canvas.height - scy,
              Math.ceil(clampedH + sPadY * 2),
            );
            const submitCanvas = document.createElement('canvas');
            submitCanvas.width = scw;
            submitCanvas.height = sch;
            submitCanvas
              .getContext('2d')!
              .drawImage(canvas, scx, scy, scw, sch, 0, 0, scw, sch);
            submittedDataUrl = submitCanvas.toDataURL('image/jpeg', 0.95);
          }

          // Preview: tighter crop using the detected card's contour when
          // available. Padded by `previewCropPadding` (default 2%). Crop runs in
          // unrotated native-pixel space; rotation is applied to the result below.
          let croppedDataUrl = null;
          if (settingsRef.current.cropToCard) {
            const useContour =
              settingsRef.current.cropToContour !== false &&
              latestCardRectRef.current;
            const sourceX = useContour
              ? latestCardRectRef.current!.x
              : clampedX;
            const sourceY = useContour
              ? latestCardRectRef.current!.y
              : clampedY;
            const sourceW = useContour
              ? latestCardRectRef.current!.w
              : clampedW;
            const sourceH = useContour
              ? latestCardRectRef.current!.h
              : clampedH;
            const padPct = settingsRef.current.previewCropPadding;
            const pad = (padPct == null ? 2 : padPct) / 100;
            const padX = sourceW * pad;
            const padY = sourceH * pad;
            const cx = Math.max(0, Math.floor(sourceX - padX));
            const cy = Math.max(0, Math.floor(sourceY - padY));
            const cw = Math.min(
              canvas.width - cx,
              Math.ceil(sourceW + padX * 2),
            );
            const ch = Math.min(
              canvas.height - cy,
              Math.ceil(sourceH + padY * 2),
            );

            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = cw;
            cropCanvas.height = ch;
            cropCanvas
              .getContext('2d')!
              .drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
            croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.95);
          }

          bestFrameRef.current.image = submittedDataUrl;
          bestFrameRef.current.preview = croppedDataUrl;
        }

        setFeedback(autoCaptureFeedback.holdStill);
        setCaptureProgress(Math.round(progress));
        setComplianceState(COMPLIANCE_STATES.STABLE);
        mergeDebugInfo({
          rejectReason: `Gate3: stabilizing (${stabilityRef.current.count}/${settingsRef.current.stabilityThreshold})`,
        });

        if (
          stabilityRef.current.count >= settingsRef.current.stabilityThreshold
        ) {
          if (captureModeRef.current !== 'manualCaptureOnly') {
            if (IS_DEBUG_MODE) {
              console.info('--- AUTO CAPTURE TRIGGERED ---');
              console.info(
                'Document Type:',
                discoveryRef.current.docType || 'unknown',
              );
              console.info(
                'Edge Density:',
                `${edgeDensity.toFixed(1)}%`,
                '| Quadrants:',
                quadDensities.join('/'),
              );
              console.info(
                'Blur Variance:',
                Math.round(variance),
                '(threshold:',
                `${settingsRef.current.blurThreshold})`,
              );
              console.info(
                'Glare:',
                `${glarePercent.toFixed(1)}%`,
                '(threshold:',
                `${settingsRef.current.glareThreshold}%)`,
              );
              console.info(
                'Stability Frames:',
                stabilityRef.current.count,
                '/',
                settingsRef.current.stabilityThreshold,
              );
              console.info(
                'Best Frame Quality:',
                bestFrameRef.current.score.toFixed(2),
              );
            }
            setFeedback(autoCaptureFeedback.capturingDocument);
            setComplianceState(COMPLIANCE_STATES.CAPTURING);
            mergeDebugInfo({ rejectReason: '✓ capturing' });
            isCapturingRef.current = true;
            setCaptureOrigin('camera_auto_capture');
            // Use the sharpest frame captured during stability
            const bestFrameUrl = bestFrameRef.current.image;
            const bestPreviewUrl = bestFrameRef.current.preview;
            // Rotate if UI was rotated during capture
            if (shouldRotateUi && bestFrameUrl) {
              const rotateDataUrl = (srcUrl: string) =>
                new Promise<string>((resolve, reject) => {
                  const img = new Image();
                  img.onload = () => {
                    const rotated = document.createElement('canvas');
                    rotated.width = img.height;
                    rotated.height = img.width;
                    const rctx = rotated.getContext('2d');
                    if (!rctx) {
                      reject(new Error('2d context unavailable'));
                      return;
                    }
                    rctx.translate(rotated.width / 2, rotated.height / 2);
                    rctx.rotate(-Math.PI / 2);
                    rctx.drawImage(img, -img.width / 2, -img.height / 2);
                    resolve(rotated.toDataURL('image/jpeg', 0.95));
                  };
                  img.onerror = reject;
                  img.src = srcUrl;
                });

              Promise.all([
                rotateDataUrl(bestFrameUrl),
                bestPreviewUrl
                  ? rotateDataUrl(bestPreviewUrl)
                  : Promise.resolve<string | null>(null),
              ])
                .then(([rotatedFull, rotatedPreview]) => {
                  setCapturedImage(rotatedFull);
                  setPreviewImage(rotatedPreview);
                  setComplianceState(COMPLIANCE_STATES.SUCCESS);
                })
                .catch(() => {
                  isCapturingRef.current = false;
                  stabilityRef.current.count = 0;
                  bestFrameRef.current = {
                    image: null,
                    preview: null,
                    score: 0,
                  };
                  setComplianceState(COMPLIANCE_STATES.IDLE);
                  setFeedback(autoCaptureFeedback.captureFailed);
                  animationFrameId = requestAnimationFrame(processFrame);
                });
            } else {
              setCapturedImage(bestFrameUrl);
              setPreviewImage(bestPreviewUrl);
              setComplianceState(COMPLIANCE_STATES.SUCCESS);
            }
          }
          // manualCaptureOnly: quality threshold met — leave state as STABLE so
          // the green indicator persists until the user taps the capture button.
        }
      };

      try {
        runDetection();
        // Clean frame — clear the error streak so a later one-off blip doesn't
        // trip the circuit breaker below.
        cvErrorStreakRef.current = 0;
      } catch (err: any) {
        console.error('CV Error:', err);
        const recoveryAction = nextCvErrorRecoveryAction({
          errorStreak: cvErrorStreakRef.current,
          chromaUnavailable: chromaUnavailableRef.current,
        });
        cvErrorStreakRef.current = recoveryAction.nextErrorStreak;
        if (recoveryAction.shouldDisableChroma) {
          chromaUnavailableRef.current = true;
        }
        if (recoveryAction.shouldActivateFallback) {
          autoDetectionSuspendedRef.current =
            recoveryAction.shouldSuspendDetection;
          setManualFallbackActive(true);
          setCvLoadFailed(true);
        }
        let nextFeedback = autoCaptureFeedback.processingFailed;
        if (recoveryAction.shouldActivateFallback) {
          nextFeedback =
            captureModeRef.current === 'autoCaptureOnly'
              ? autoCaptureFeedback.autoDetectionUnavailableRetry
              : autoCaptureFeedback.autoDetectionUnavailableManual;
        } else if (recoveryAction.shouldClearProcessingError) {
          nextFeedback = autoCaptureFeedback.positionDocument;
        }
        setFeedback(nextFeedback);
        setComplianceState(
          recoveryAction.shouldClearProcessingError
            ? COMPLIANCE_STATES.DETECTING
            : COMPLIANCE_STATES.IDLE,
        );
        stabilityRef.current.count = 0;
        bestFrameRef.current = { image: null, preview: null, score: 0 };
        // Never let a per-frame CV error freeze the loop: clearing the
        // capturing flag guarantees the rescheduler below runs, so detection
        // self-recovers on the next frame instead of getting stuck on
        // "Processing failed" until a manual page refresh.
        isCapturingRef.current = false;
        let cvRecovery = 'retrying';
        if (recoveryAction.shouldActivateFallback) {
          cvRecovery = 'suspended';
        } else if (recoveryAction.shouldDisableChroma) {
          cvRecovery = 'disabled chroma';
        }
        mergeDebugInfo({
          cvError: formatDebugError(err),
          cvErrors: recoveryAction.nextErrorStreak,
          cvRecovery,
          rejectReason: `CV error (${cvRecovery})`,
        });
      } finally {
        // Clean Memory
        safeDelete(
          fullFrame,
          src,
          contourFull,
          contourGray,
          presenceBlurred,
          presenceEdges,
          gray,
          blurred,
          edges,
          contours,
          hierarchy,
          laplacian,
          mean,
          stdDev,
          glareMask,
          contourRgb,
          contourLab,
          labPlanes,
          aPlane,
          bPlane,
          aBlur,
          bBlur,
          aEdges,
          bEdges,
          chromaMag,
        );

        // Loop
        if (!isCapturingRef.current && !autoDetectionSuspendedRef.current) {
          animationFrameId = requestAnimationFrame(processFrame);
        }
      }
    };

    const timeoutId = setTimeout(processFrame, 100); // 1s warm up

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef, variant, shouldRotateUi]);

  // Helper to rotate a canvas 90° counter-clockwise with dimension swap.
  // Must match the auto-capture rotation direction (-π/2) so manual and auto
  // captures produce identically-oriented previews.
  const rotateCanvas90CCW = (canvas: HTMLCanvasElement) => {
    const rotated = document.createElement('canvas');
    rotated.width = canvas.height;
    rotated.height = canvas.width;
    const ctx = rotated.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.translate(0, rotated.height);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(canvas, 0, 0);
    return rotated;
  };

  const triggerManualCapture = () => {
    if (isCapturingRef.current) return;
    const canvas = canvasRef.current;
    const coords = latestCropCoordsRef.current;
    if (!canvas || !coords) return;
    const { clampedX, clampedY, clampedW, clampedH } = coords;
    const s = settingsRef.current;

    try {
      // Submitted image: full frame, or guide-rect crop when cropToCard is on
      // (original behavior, padded by `cropPadding`).
      let submitCaptureCanvas: HTMLCanvasElement = canvas;
      let previewCaptureCanvas: HTMLCanvasElement | null = null;

      // Crop in unrotated native-pixel space. If the UI is rotated, the
      // cropped canvas is rotated CCW below to match the on-screen orientation.
      if (s.cropToCard) {
        // Submitted: guide-rect crop with cropPadding.
        const submitPad = (s.cropPadding == null ? 10 : s.cropPadding) / 100;
        const sPadX = clampedW * submitPad;
        const sPadY = clampedH * submitPad;
        const scx = Math.max(0, Math.floor(clampedX - sPadX));
        const scy = Math.max(0, Math.floor(clampedY - sPadY));
        const scw = Math.min(
          canvas.width - scx,
          Math.ceil(clampedW + sPadX * 2),
        );
        const sch = Math.min(
          canvas.height - scy,
          Math.ceil(clampedH + sPadY * 2),
        );
        const submitCanvas = document.createElement('canvas');
        submitCanvas.width = scw;
        submitCanvas.height = sch;
        const submitCtx = submitCanvas.getContext('2d');
        if (!submitCtx) throw new Error('2d context unavailable');
        submitCtx.drawImage(canvas, scx, scy, scw, sch, 0, 0, scw, sch);
        submitCaptureCanvas = submitCanvas;

        // Preview: tighter contour crop with previewCropPadding.
        const useContour =
          s.cropToContour !== false && latestCardRectRef.current;
        const sourceX = useContour ? latestCardRectRef.current!.x : clampedX;
        const sourceY = useContour ? latestCardRectRef.current!.y : clampedY;
        const sourceW = useContour ? latestCardRectRef.current!.w : clampedW;
        const sourceH = useContour ? latestCardRectRef.current!.h : clampedH;
        const padPct = s.previewCropPadding;
        const pad = (padPct == null ? 2 : padPct) / 100;
        const padX = sourceW * pad;
        const padY = sourceH * pad;
        const cx = Math.max(0, Math.floor(sourceX - padX));
        const cy = Math.max(0, Math.floor(sourceY - padY));
        const cw = Math.min(canvas.width - cx, Math.ceil(sourceW + padX * 2));
        const ch = Math.min(canvas.height - cy, Math.ceil(sourceH + padY * 2));
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cw;
        cropCanvas.height = ch;
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) throw new Error('2d context unavailable');
        cropCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
        previewCaptureCanvas = cropCanvas;
      }

      // Rotate both outputs if UI was rotated during capture.
      if (shouldRotateUi) {
        submitCaptureCanvas = rotateCanvas90CCW(submitCaptureCanvas);
        if (previewCaptureCanvas) {
          previewCaptureCanvas = rotateCanvas90CCW(previewCaptureCanvas);
        }
      }

      const fullDataUrl = submitCaptureCanvas.toDataURL('image/jpeg', 0.95);
      const previewDataUrl = previewCaptureCanvas
        ? previewCaptureCanvas.toDataURL('image/jpeg', 0.95)
        : null;

      if (IS_DEBUG_MODE) {
        console.info('--- MANUAL CAPTURE TRIGGERED ---');
      }
      setCaptureOrigin('camera_manual_capture');
      setCapturedImage(fullDataUrl);
      setPreviewImage(previewDataUrl);
      setComplianceState(COMPLIANCE_STATES.SUCCESS);
      setFeedback(autoCaptureFeedback.captured);
      isCapturingRef.current = true;
    } catch (err) {
      console.error('Manual capture failed:', err);
      setComplianceState(COMPLIANCE_STATES.IDLE);
      setFeedback(autoCaptureFeedback.captureFailed);
      isCapturingRef.current = false;
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setPreviewImage(null);
    setCaptureOrigin(null);
    setComplianceState(COMPLIANCE_STATES.IDLE);
    setFeedback(autoCaptureFeedback.positionDocument);
    updateDebugPath(null);
    isCapturingRef.current = false;
    autoDetectionSuspendedRef.current = false;
    stabilityRef.current.count = 0;
    stabilityRef.current.lastCenter = null;
    bestFrameRef.current = { image: null, preview: null, score: 0 };
    latestCardRectRef.current = null;
    docFillEmaRef.current = null;
    lastProcessedRef.current = 0;
    prevProcessedRef.current = 0;
    captureMissCounterRef.current = 0;
    cvErrorStreakRef.current = 0;
    lastRealCardAtRef.current = null;
    regionStabilityRef.current = 0;
    // If documentType was provided, keep it locked; otherwise re-enter discovery
    if (providedDocType) {
      setDetectedDocType(providedDocType);
      setGuideAspectRatio(orientAspect(ASPECT_RATIOS[providedDocType]));
      detectionPhaseRef.current = DETECTION_PHASE.CAPTURE;
      discoveryRef.current = {
        votes: [],
        docType: providedDocType,
        frameCount: 0,
        consecutiveMisses: 0,
      };
    } else {
      setDetectedDocType(null);
      setGuideAspectRatio(orientAspect(ASPECT_RATIOS.passport));
      detectionPhaseRef.current = DETECTION_PHASE.DISCOVERY;
      discoveryRef.current = {
        votes: [],
        docType: null,
        frameCount: 0,
        consecutiveMisses: 0,
      };
    }
  };

  return {
    feedback,
    captureProgress,
    capturedImage,
    previewImage,
    captureOrigin,
    complianceState,
    debugPath,
    debugInfo,
    debugRoi,
    detectedDocType,
    guideAspectRatio,
    manualFallbackActive,
    cvLoadFailed,
    triggerManualCapture,
    resetCapture,
  };
}
