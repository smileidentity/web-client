// @ts-nocheck
// TODO(document-auto-capture): port to strict TypeScript. This is a verbatim
// port of the id-scanner OpenCV detection pipeline (834 LOC). Typing the
// `cv` namespace and the internal state machine is tracked separately.
import { useState, useEffect, useRef } from 'preact/hooks';

export const COMPLIANCE_STATES = {
  IDLE: 'idle',           // Searching for a card
  DETECTING: 'detecting', // Found a candidate, checking quality
  STABLE: 'stable',       // Quality passes, checking stability
  CAPTURING: 'capturing', // Stability passed, capturing
  SUCCESS: 'success',     // Captured
};

// Phase 1 → Phase 2 detection states
const DETECTION_PHASE = {
  DISCOVERY: 'discovery', // Phase 1: identify document type via aspect ratio
  CAPTURE: 'capture',     // Phase 2: quality gating with locked guide box
};

const ASPECT_RATIOS = {
  'id-card': 1.585,   // CR80 / ID-1
  'passport': 1.42,   // ID-3 bio-data page
  'greenbook': 1.42,  // Greenbook uses passport-like landscape aspect
};

// Midpoint for classifying detected aspect ratio
const ASPECT_RATIO_MIDPOINT = (ASPECT_RATIOS['id-card'] + ASPECT_RATIOS['passport']) / 2; // ~1.50

// Number of agreeing frames required to lock document type.
// Lowered from 10 → 6: laminated/hand-held cards produce intermittent detections
// so a shorter streak is needed to reach consensus before votes are wiped.
const DISCOVERY_CONSENSUS_THRESHOLD = 6;

// If contour detection can't classify within this many frames, default to id-card
const DISCOVERY_TIMEOUT_FRAMES = 60;

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
const MAX_FILL_PERCENT = 90;
// Minimum contour area to even consider (5% — catches far-away documents)
const MIN_CONTOUR_AREA_PERCENT = 0.05;
// During discovery, require at least this many grid cells to pass (out of 9).
// Less strict than full allQuadrantsPass (9/9) but still filters empty scenes.
const MIN_DISCOVERY_GRID_CELLS = 3;

export function useCardDetection(videoRef, settings, options = {}) {
  const {
    variant = 'fullscreen',
    documentType = null,
    captureMode = 'autoCapture',
    autoCaptureTimeout = 10000,
    captureOrientation = 'landscape',
    shouldRotateUi = false,
  } = options;
  // captureMode: 'autoCapture' | 'autoCaptureOnly' | 'manualCaptureOnly'
  const autoCaptureTimeoutMs = Math.max(3000, Math.min(30000, autoCaptureTimeout));
  const orientation = captureOrientation === 'portrait' ? 'portrait' : 'landscape';
  const orientAspect = (ratio) => (orientation === 'portrait' ? (1 / ratio) : ratio);

  // If documentType is provided and valid, skip discovery entirely.
  const providedDocType = documentType && ASPECT_RATIOS[documentType] ? documentType : null;
  const initialPhase = providedDocType ? DETECTION_PHASE.CAPTURE : DETECTION_PHASE.DISCOVERY;
  const initialAspect = orientAspect(providedDocType ? ASPECT_RATIOS[providedDocType] : ASPECT_RATIOS['passport']);

  const [feedback, setFeedback] = useState("Position your document in the frame");
  const [capturedImage, setCapturedImage] = useState(null);
  const [complianceState, setComplianceState] = useState(COMPLIANCE_STATES.IDLE);
  const [debugPath, setDebugPath] = useState(null); // For drawing the green box on overlay
  const [debugInfo, setDebugInfo] = useState({}); // For tuning panel
  const [detectedDocType, setDetectedDocType] = useState(providedDocType); // null = not yet classified
  const [guideAspectRatio, setGuideAspectRatio] = useState(initialAspect);

  // Refs for loop management to avoid stale closures
  const settingsRef = useRef(settings);
  const stabilityRef = useRef({ count: 0, lastCenter: null });
  const bestFrameRef = useRef({ dataUrl: null, score: 0 });
  const isCapturingRef = useRef(false);
  const canvasRef = useRef(null);
  const detectionPhaseRef = useRef(initialPhase);
  const discoveryRef = useRef({
    votes: [], docType: providedDocType, frameCount: 0, consecutiveMisses: 0
  });

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Capture origin tracks whether the image was taken automatically or manually.
  const [captureOrigin, setCaptureOrigin] = useState(null); // 'auto' | 'manual'
  // manualFallbackActive: true after the 10s timer fires (autoCapture mode only).
  const [manualFallbackActive, setManualFallbackActive] = useState(false);
  // cvLoadFailed: true if OpenCV is not ready after 20 seconds.
  const [cvLoadFailed, setCvLoadFailed] = useState(false);

  // Stores the most recent ROI coordinates so triggerManualCapture can crop on demand.
  const latestCropCoordsRef = useRef(null);
  // Mirror of captureMode for access inside the processFrame closure.
  const captureModeRef = useRef(captureMode);
  useEffect(() => { captureModeRef.current = captureMode; }, [captureMode]);

  // Configurable fallback: surface manual button if auto-capture hasn't fired yet.
  useEffect(() => {
    setManualFallbackActive(false);
    if (captureMode !== 'autoCapture') return;
    const timer = setTimeout(() => setManualFallbackActive(true), autoCaptureTimeoutMs);
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
    let animationFrameId;
    
    const processFrame = () => {
      // 0. Stop if capturing or video not ready
      if (isCapturingRef.current) return;
      if (!videoRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      if (video.readyState !== 4 || typeof cv === 'undefined' || !cv.Mat) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      // 1. Setup CV structs
      let fullFrame = null, src = null, gray = null, blurred = null, edges = null;
      let presenceEdges = null, presenceBlurred = null;
      let contours = null, hierarchy = null;
      let laplacian = null, mean = null, stdDev = null, glareMask = null;

      try {
        if (!canvasRef.current) {
             canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Sync canvas size
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
        const displayW = videoRect.width  > 0 ? videoRect.width  : canvas.width;
        const displayH = videoRect.height > 0 ? videoRect.height : canvas.height;

        // Skip frame if display dimensions aren't available yet (layout not settled)
        if (videoRect.width === 0 || videoRect.height === 0) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }
        const videoW = canvas.width;   // native video width
        const videoH = canvas.height;  // native video height

        // objectFit: cover scaling — video scales to fill, excess clipped
        const videoAspect   = videoW / videoH;
        const displayAspect = displayW / displayH;
        let coverScale, offsetX, offsetY;

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
        const currentAspect = detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY
          ? orientAspect(ASPECT_RATIOS['passport']) // Wider — accommodates both ID and passport
          : orientAspect(
              discoveryRef.current.docType === 'passport' || discoveryRef.current.docType === 'greenbook'
                ? ASPECT_RATIOS['passport']
                : ASPECT_RATIOS['id-card']
            );
        const isCard = variant === 'card';
        const guideWidthCSS  = isCard ? displayW : Math.min(displayW * 0.90, 600);
        const guideHeightCSS = isCard ? displayH : guideWidthCSS / currentAspect;
        const guideXCSS = (displayW - guideWidthCSS) / 2;
        const guideYCSS = (displayH - guideHeightCSS) / 2;

        // Map CSS → video native coordinates
        const guideWidth  = Math.round(guideWidthCSS  / coverScale);
        const guideHeight = Math.round(guideHeightCSS / coverScale);
        const startX = Math.round(guideXCSS / coverScale + offsetX);
        const startY = Math.round(guideYCSS / coverScale + offsetY);

        // Clamp to canvas bounds
        const clampedX = Math.max(0, Math.min(startX, videoW - guideWidth));
        const clampedY = Math.max(0, Math.min(startY, videoH - guideHeight));
        const clampedW = Math.min(guideWidth, videoW - clampedX);

        // Log ROI mapping once for diagnostics
        if (!canvasRef.current._roiLogged) {
          canvasRef.current._roiLogged = true;
          console.log('[ROI] display:', displayW + 'x' + displayH,
            '| video:', videoW + 'x' + videoH,
            '| scale:', coverScale.toFixed(3),
            '| offset:', Math.round(offsetX) + ',' + Math.round(offsetY),
            '| guideCSS:', Math.round(guideWidthCSS) + 'x' + Math.round(guideHeightCSS),
            'at', Math.round(guideXCSS) + ',' + Math.round(guideYCSS),
            '| ROI:', clampedX + ',' + clampedY, clampedW + 'x' + (Math.min(guideHeight, videoH - clampedY)));
        }
        const clampedH = Math.min(guideHeight, videoH - clampedY);

        // Store current ROI coords for on-demand manual capture (zero cost — no canvas ops).
        latestCropCoordsRef.current = { clampedX, clampedY, clampedW, clampedH };

        // Crop ROI
        fullFrame = cv.imread(canvas);
        let rect = new cv.Rect(clampedX, clampedY, clampedW, clampedH);
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
        cv.GaussianBlur(gray, presenceBlurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
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
        const insetFrac = 0.10; // 10% inset on each side
        const insetX = Math.floor(presenceEdges.cols * insetFrac);
        const insetY = Math.floor(presenceEdges.rows * insetFrac);
        const innerW = presenceEdges.cols - insetX * 2;
        const innerH = presenceEdges.rows - insetY * 2;
        const cols3 = 3, rows3 = 3;
        const cellW = Math.floor(innerW / cols3);
        const cellH = Math.floor(innerH / rows3);
        const cellPixels = cellW * cellH;
        // Each cell needs a minimum % of the overall edge threshold.
        // Mobile uses 50% (lenient for low-contrast cards like ECOWAS Ghana ID).
        // Desktop uses 70% to prevent capturing far-away cards.
        const cellRatio = settingsRef.current.gridCellRatio || 0.5;
        const cellMin = edgeThreshold * cellRatio;
        let quadDensities = [];
        let allQuadrantsPass = true;
        let passingCells = 0;
        for (let row = 0; row < rows3; row++) {
          for (let col = 0; col < cols3; col++) {
            const cRect = new cv.Rect(insetX + col * cellW, insetY + row * cellH, cellW, cellH);
            const cRoi = presenceEdges.roi(cRect);
            const cDensity = (cv.countNonZero(cRoi) / cellPixels) * 100;
            quadDensities.push(cDensity.toFixed(1));
            if (cDensity < cellMin) {
              allQuadrantsPass = false;
            } else {
              passingCells++;
            }
            cRoi.delete();
          }
        }

        // Grid coverage gating:
        // - Card variant: skip entirely — ROI is the full video frame, card can't fill 100%
        // - Discovery phase: relaxed — require MIN_DISCOVERY_GRID_CELLS (3/9) cells.
        //   The guide box uses wider passport ratio so a real document won't fill all cells,
        //   but it should fill at least some. This filters empty textured scenes.
        // - Capture phase (fullscreen): strict — require all cells to pass.
        //   Guide box matches detected doc type, grid check catches partial occlusion.
        const isDiscoveryPhase = detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY;
        let gridCheckFails;
        if (isCard) {
          gridCheckFails = false; // Skip grid check entirely for card variant
        } else if (isDiscoveryPhase) {
          gridCheckFails = passingCells < MIN_DISCOVERY_GRID_CELLS; // Relaxed: 3/9 cells
        } else {
          gridCheckFails = !allQuadrantsPass; // Strict: all 9/9 cells
        }

        if (!hasDocument || gridCheckFails) {
            const totalCells = rows3 * cols3; // 9
            const noDocumentPresent = !hasDocument || passingCells < Math.ceil(totalCells * 0.45);
            const reason = noDocumentPresent
              ? "Place document in frame" 
              : "Ensure document is fully visible";
            setFeedback(reason);
            setComplianceState(COMPLIANCE_STATES.IDLE);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { dataUrl: null, score: 0 };
            setDebugPath(null);
            setDebugInfo({ blur: 0, glare: 0, edgeDensity: edgeDensity.toFixed(1), texture: Math.round(textureScore), quadrants: quadDensities.join('/') });
            return;
        }

        // --- Phase 1 / Dynamic Border Detection ---
        // During discovery phase: ALWAYS run contour detection to classify document type.
        // During capture phase: ALWAYS run contour detection for distance guidance.
        // The useDynamicBorder setting only controls whether the green overlay is drawn.
        let isDiscovery = detectionPhaseRef.current === DETECTION_PHASE.DISCOVERY;
        const shouldRunContour = true;

        // Discovery timeout: moved AFTER contour detection (see below).
        // Only increments when a bestContour is actually found, so empty
        // scenes (textured desk, no document) never trigger the timeout.

        if (shouldRunContour) {
          blurred = new cv.Mat();
          cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
          
          edges = new cv.Mat();
          cv.Canny(blurred, edges, 50, 150);

          // Bridge gaps in the card border caused by lamination glare or finger occlusion.
          // A 3×3 closing kernel run twice fills edge breaks up to ~5px without merging
          // unrelated edges or creating false rectangles.
          const closingKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
          const closedEdges = new cv.Mat();
          cv.morphologyEx(edges, closedEdges, cv.MORPH_CLOSE, closingKernel, new cv.Point(-1, -1), 2);
          closingKernel.delete();
          edges.delete();
          edges = closedEdges;

          contours = new cv.MatVector();
          hierarchy = new cv.Mat();
          cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

          let maxArea = 0;
          let bestContour = null;
          // Track the combined bounding box of ALL significant contours for distance guidance.
          // Single contour area fails when fingers break card edges into many small contours.
          // The combined bounding box captures the document's full spatial extent.
          let combinedMinX = Infinity, combinedMinY = Infinity;
          let combinedMaxX = -Infinity, combinedMaxY = -Infinity;
          let hasSignificantContour = false;
          const minContourPixels = guideWidth * guideHeight * 0.005; // 0.5% — catches small text fragments

          for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            // Expand combined bounding box with any non-trivial contour
            if (area > minContourPixels) {
              hasSignificantContour = true;
              const br = cv.boundingRect(cnt);
              combinedMinX = Math.min(combinedMinX, br.x);
              combinedMinY = Math.min(combinedMinY, br.y);
              combinedMaxX = Math.max(combinedMaxX, br.x + br.width);
              combinedMaxY = Math.max(combinedMaxY, br.y + br.height);
            }

            if (area > (guideWidth * guideHeight * MIN_CONTOUR_AREA_PERCENT)) {
              let peri = cv.arcLength(cnt, true);
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
                const bRect = cv.boundingRect(approx);
                const fillRatio = area / (bRect.width * bRect.height);

                let anglesOk = true;
                for (let j = 0; j < 4; j++) {
                  const p0x = approx.data32S[j * 2];
                  const p0y = approx.data32S[j * 2 + 1];
                  const p1x = approx.data32S[((j + 1) % 4) * 2];
                  const p1y = approx.data32S[((j + 1) % 4) * 2 + 1];
                  const p2x = approx.data32S[((j + 2) % 4) * 2];
                  const p2y = approx.data32S[((j + 2) % 4) * 2 + 1];
                  const v1x = p0x - p1x, v1y = p0y - p1y;
                  const v2x = p2x - p1x, v2y = p2y - p1y;
                  const dot = v1x * v2x + v1y * v2y;
                  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
                  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
                  if (mag1 === 0 || mag2 === 0) { anglesOk = false; break; }
                  const cosAngle = dot / (mag1 * mag2);
                  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
                  if (angle < 60 || angle > 120) { anglesOk = false; break; }
                }

                if (fillRatio > 0.65 && anglesOk && area > maxArea) {
                  maxArea = area;
                  if (bestContour) bestContour.delete();
                  bestContour = approx;
                } else {
                  approx.delete();
                }
              } else {
                approx.delete();
              }
            }
            cnt.delete();
          }

          // --- Distance guidance (combined bounding box of all contours) ---
          // The combined bbox captures the document's full extent even when edges
          // are broken into many fragments by fingers, glare, etc.
          // Skip in card variant: the ROI is the full video frame, so background
          // contours (wall, desk, etc.) inflate the bbox to ~100% always.
          const roiArea = clampedW * clampedH;
          let docFillPercent = 0;
          if (hasSignificantContour) {
            const combinedW = combinedMaxX - combinedMinX;
            const combinedH = combinedMaxY - combinedMinY;
            const combinedArea = combinedW * combinedH;
            docFillPercent = (combinedArea / roiArea) * 100;
          }

          // Distance guidance only applies during capture phase (after doc type is locked).
          // During discovery, the guide box uses the wider passport ratio and distance
          // checks would block voting with misleading feedback.
          if (!isCard && !isDiscovery && hasSignificantContour && docFillPercent < MIN_FILL_PERCENT) {
            setFeedback("Move document closer");
            setComplianceState(COMPLIANCE_STATES.DETECTING);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { dataUrl: null, score: 0 };
            if (bestContour) bestContour.delete();
            setDebugInfo({ docFill: Math.round(docFillPercent), edgeDensity: edgeDensity.toFixed(1), texture: Math.round(textureScore) });
            return;
          }
          if (!isCard && !isDiscovery && hasSignificantContour && docFillPercent > MAX_FILL_PERCENT) {
            setFeedback("Move document further away");
            setComplianceState(COMPLIANCE_STATES.DETECTING);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { dataUrl: null, score: 0 };
            if (bestContour) bestContour.delete();
            setDebugInfo({ docFill: Math.round(docFillPercent), edgeDensity: edgeDensity.toFixed(1), texture: Math.round(textureScore) });
            return;
          }

          if (bestContour) {
            // Reset consecutive miss counter on successful detection
            if (isDiscovery) discoveryRef.current.consecutiveMisses = 0;

            // Store points relative to the ROI for overlay drawing (only if dynamic border is on)
            if (settingsRef.current.useDynamicBorder) {
              const points = [];
              for (let i = 0; i < 4; i++) {
                points.push({
                  x: bestContour.data32S[i * 2],
                  y: bestContour.data32S[i * 2 + 1],
                });
              }
              points.roiWidth = clampedW;
              points.roiHeight = clampedH;
              setDebugPath(points);
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
                console.log(`[Discovery] Timeout after ${discoveryRef.current.frameCount} frames — defaulting to: ${fallbackType}`);
                setFeedback('ID Card assumed — hold steady');
                if (canvasRef.current) canvasRef.current._roiLogged = false;
                bestContour.delete();
                return;
              }

              const detectedRatio = bRect.width / bRect.height;
              // Normalize orientation so portrait-held docs still classify correctly.
              const normalizedRatio = Math.max(detectedRatio, 1 / detectedRatio);
              const vote = normalizedRatio >= ASPECT_RATIO_MIDPOINT ? 'id-card' : 'passport';

              discoveryRef.current.votes.push(vote);

              // Keep only the last N votes to prevent stale history
              if (discoveryRef.current.votes.length > DISCOVERY_CONSENSUS_THRESHOLD * 2) {
                discoveryRef.current.votes = discoveryRef.current.votes.slice(-DISCOVERY_CONSENSUS_THRESHOLD);
              }

              // Check for consensus: last N votes must all agree
              const recentVotes = discoveryRef.current.votes.slice(-DISCOVERY_CONSENSUS_THRESHOLD);
              const allAgree = recentVotes.length >= DISCOVERY_CONSENSUS_THRESHOLD &&
                recentVotes.every(v => v === recentVotes[0]);

              setFeedback(`Detecting document type... (${normalizedRatio.toFixed(2)})`);
              setDebugInfo({
                blur: 0, glare: 0,
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                detectedRatio: normalizedRatio.toFixed(3),
                votes: `${recentVotes.filter(v => v === 'id-card').length}id / ${recentVotes.filter(v => v === 'passport').length}pp`,
              });

              if (allAgree) {
                const classifiedType = recentVotes[0];
                discoveryRef.current.docType = classifiedType;
                detectionPhaseRef.current = DETECTION_PHASE.CAPTURE;
                setDetectedDocType(classifiedType);
                setGuideAspectRatio(orientAspect(ASPECT_RATIOS[classifiedType]));
                console.log(`[Discovery] Document classified as: ${classifiedType} (ratio: ${normalizedRatio.toFixed(3)})`);
                setFeedback(`${classifiedType === 'passport' ? 'Passport' : 'ID Card'} detected — hold steady`);
                // Force ROI recalculation on next frame by clearing the log flag
                if (canvasRef.current) canvasRef.current._roiLogged = false;
              }

              bestContour.delete();
              // During discovery, skip quality gates — just loop
              return;
            }

            bestContour.delete();
          } else {
            setDebugPath(null);
            // During discovery, no contour found — keep waiting
            if (isDiscovery) {
              setFeedback("Position your document in the frame");
              // Tolerate a few consecutive misses before resetting votes.
              // Mobile cameras drop detections for 1-2 frames due to motion blur,
              // auto-exposure changes, etc. Hard-resetting on every miss prevents
              // consensus from ever being reached.
              discoveryRef.current.consecutiveMisses++;
              if (discoveryRef.current.consecutiveMisses >= DISCOVERY_MISS_TOLERANCE) {
                discoveryRef.current.votes = [];
              }
              setDebugInfo({
                edgeDensity: edgeDensity.toFixed(1),
                texture: Math.round(textureScore),
                quadrants: quadDensities.join('/'),
                misses: discoveryRef.current.consecutiveMisses,
                votes: `${discoveryRef.current.votes.filter(v => v === 'id-card').length}id / ${discoveryRef.current.votes.filter(v => v === 'passport').length}pp`,
              });
              return;
            }
          }
        }

        // --- Gate 1: Sharpness / Blur ---
        laplacian = new cv.Mat();
        cv.Laplacian(gray, laplacian, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
        mean = new cv.Mat();
        stdDev = new cv.Mat();
        cv.meanStdDev(laplacian, mean, stdDev);
        const variance = Math.pow(stdDev.doubleAt(0, 0), 2);

        if (variance < settingsRef.current.blurThreshold) {
            setFeedback(`Too Blurry (Var: ${Math.round(variance)})`);
            setComplianceState(COMPLIANCE_STATES.DETECTING);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { dataUrl: null, score: 0 };
            setDebugInfo({ blur: Math.round(variance), glare: 0 });
            return;
        }

        // --- Gate 2: Glare ---
        glareMask = new cv.Mat();
        cv.threshold(gray, glareMask, 240, 255, cv.THRESH_BINARY);
        const glarePixels = cv.countNonZero(glareMask);
        const totalPixels = gray.rows * gray.cols;
        const glarePercent = (glarePixels / totalPixels) * 100;

        setDebugInfo({ blur: Math.round(variance), glare: glarePercent.toFixed(1), edgeDensity: edgeDensity.toFixed(1), texture: Math.round(textureScore), quadrants: quadDensities.join('/') });

        if (glarePercent > settingsRef.current.glareThreshold) {
            setFeedback(`Glare Detected (${glarePercent.toFixed(1)}%)`);
            setComplianceState(COMPLIANCE_STATES.DETECTING);
            stabilityRef.current.count = 0;
            bestFrameRef.current = { dataUrl: null, score: 0 };
            return;
        }

        // --- Gate 3: Stability (track best frame) ---
        stabilityRef.current.count++;
        const progress = Math.min(100, (stabilityRef.current.count / settingsRef.current.stabilityThreshold) * 100);

        // Track the sharpest frame during the stability window
        if (variance > bestFrameRef.current.score) {
          bestFrameRef.current.score = variance;

          // In rotated-UI mode, keep the full frame and rotate it later.
          // Cropping the portrait source before rotation trims the card sides.
          if (settingsRef.current.cropToCard && !shouldRotateUi) {
            const pad = (settingsRef.current.cropPadding || 10) / 100;
            const padX = clampedW * pad;
            const padY = clampedH * pad;
            const cx = Math.max(0, Math.floor(clampedX - padX));
            const cy = Math.max(0, Math.floor(clampedY - padY));
            const cw = Math.min(canvas.width - cx, Math.ceil(clampedW + padX * 2));
            const ch = Math.min(canvas.height - cy, Math.ceil(clampedH + padY * 2));

            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = cw;
            cropCanvas.height = ch;
            cropCanvas.getContext('2d').drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
            bestFrameRef.current.dataUrl = cropCanvas.toDataURL('image/jpeg', 0.95);
          } else {
            bestFrameRef.current.dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          }
        }

        setFeedback(`Hold Still... ${Math.round(progress)}%`);
        setComplianceState(COMPLIANCE_STATES.STABLE);

        if (stabilityRef.current.count >= settingsRef.current.stabilityThreshold) {
           if (captureModeRef.current !== 'manualCaptureOnly') {
             console.log('--- AUTO CAPTURE TRIGGERED ---');
             console.log('Document Type:', discoveryRef.current.docType || 'unknown');
             console.log('Edge Density:', edgeDensity.toFixed(1) + '%', '| Quadrants:', quadDensities.join('/'));
             console.log('Blur Variance:', Math.round(variance), '(threshold:', settingsRef.current.blurThreshold + ')');
             console.log('Glare:', glarePercent.toFixed(1) + '%', '(threshold:', settingsRef.current.glareThreshold + '%)');
             console.log('Stability Frames:', stabilityRef.current.count, '/', settingsRef.current.stabilityThreshold);
             console.log('Best Frame Score:', Math.round(bestFrameRef.current.score));
             setFeedback("Capturing document...");
             setComplianceState(COMPLIANCE_STATES.CAPTURING);
             isCapturingRef.current = true;
             setCaptureOrigin('auto');
             // Use the sharpest frame captured during stability
            let bestFrameUrl = bestFrameRef.current.dataUrl;
            // Rotate if UI was rotated during capture
            if (shouldRotateUi && bestFrameUrl) {
              const img = new Image();
              img.onload = () => {
                const rotated = document.createElement('canvas');
                rotated.width = img.height;   // Swap dimensions for 90° rotation
                rotated.height = img.width;
                const ctx = rotated.getContext('2d');
                ctx.translate(rotated.width / 2, rotated.height / 2);
                ctx.rotate(-Math.PI / 2);  // 90° counter-clockwise
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                setCapturedImage(rotated.toDataURL('image/jpeg', 0.95));
                setComplianceState(COMPLIANCE_STATES.SUCCESS);
              };
              img.src = bestFrameUrl;
            } else {
              setCapturedImage(bestFrameUrl);
              setComplianceState(COMPLIANCE_STATES.SUCCESS);
            }
           }
           // manualCaptureOnly: quality threshold met — leave state as STABLE so
           // the green indicator persists until the user taps the capture button.
        }

      } catch (err) {
        console.error("CV Error:", err);
        setFeedback(`Error: ${err.message || 'Processing failed'}`);
        setComplianceState(COMPLIANCE_STATES.IDLE);
        stabilityRef.current.count = 0;
        bestFrameRef.current = { dataUrl: null, score: 0 };
      } finally {
        // Clean Memory
        if (fullFrame && !fullFrame.isDeleted()) fullFrame.delete();
        if (src && !src.isDeleted()) src.delete();
        if (presenceBlurred && !presenceBlurred.isDeleted()) presenceBlurred.delete();
        if (presenceEdges && !presenceEdges.isDeleted()) presenceEdges.delete();
        if (gray && !gray.isDeleted()) gray.delete();
        if (blurred && !blurred.isDeleted()) blurred.delete();
        if (edges && !edges.isDeleted()) edges.delete();
        if (contours && !contours.isDeleted()) contours.delete();
        if (hierarchy && !hierarchy.isDeleted()) hierarchy.delete();
        if (laplacian && !laplacian.isDeleted()) laplacian.delete();
        if (mean && !mean.isDeleted()) mean.delete();
        if (stdDev && !stdDev.isDeleted()) stdDev.delete();
        if (glareMask && !glareMask.isDeleted()) glareMask.delete();
        
        // Loop
        if (!isCapturingRef.current && !capturedImage) {
             animationFrameId = requestAnimationFrame(processFrame);
        }
      }
    };

    const timeoutId = setTimeout(processFrame, 1000); // 1s warm up

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef, capturedImage, variant, shouldRotateUi]); 

  // Helper to rotate a canvas 90° counter-clockwise with dimension swap.
  // In rotated-UI mode, captured frames are portrait-oriented but need to be
  // rotated to landscape to match the rotated UI and actual document orientation.
  const rotateCanvas90CCW = (canvas) => {
    const rotated = document.createElement('canvas');
    rotated.width = canvas.height;   // Swap dimensions
    rotated.height = canvas.width;
    const ctx = rotated.getContext('2d');
    ctx.translate(rotated.width, 0);  // Move to top-right corner
    ctx.rotate(Math.PI / 2);           // 90° clockwise (equivalent to 90° CCW with translate)
    ctx.drawImage(canvas, 0, 0);       // Draw at origin
    return rotated;
  };

  const triggerManualCapture = () => {
    if (isCapturingRef.current) return;
    const canvas = canvasRef.current;
    const coords = latestCropCoordsRef.current;
    if (!canvas || !coords) return;
    const { clampedX, clampedY, clampedW, clampedH } = coords;
    const s = settingsRef.current;
    let captureCanvas = canvas;
    let dataUrl;
    // Skip cropping if UI is rotated — crop margins don't work well with 90° rotation.
    // Instead, capture the full frame and rotate it to preserve the entire card.
    if (s.cropToCard && !shouldRotateUi) {
      const pad = (s.cropPadding || 10) / 100;
      const padX = clampedW * pad;
      const padY = clampedH * pad;
      const cx = Math.max(0, Math.floor(clampedX - padX));
      const cy = Math.max(0, Math.floor(clampedY - padY));
      const cw = Math.min(canvas.width - cx, Math.ceil(clampedW + padX * 2));
      const ch = Math.min(canvas.height - cy, Math.ceil(clampedH + padY * 2));
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cw;
      cropCanvas.height = ch;
      cropCanvas.getContext('2d').drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
      captureCanvas = cropCanvas;
    }
    // Rotate if UI was rotated during capture
    if (shouldRotateUi) {
      captureCanvas = rotateCanvas90CCW(captureCanvas);
    }
    dataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);
    console.log('--- MANUAL CAPTURE TRIGGERED ---');
    setCaptureOrigin('manual');
    setCapturedImage(dataUrl);
    setComplianceState(COMPLIANCE_STATES.SUCCESS);
    setFeedback('Captured!');
    isCapturingRef.current = true;
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCaptureOrigin(null);
    setComplianceState(COMPLIANCE_STATES.IDLE);
    setFeedback("Position your document in the frame");
    setDebugPath(null);
    isCapturingRef.current = false;
    stabilityRef.current.count = 0;
    stabilityRef.current.lastCenter = null;
    bestFrameRef.current = { dataUrl: null, score: 0 };
    // If documentType was provided, keep it locked; otherwise re-enter discovery
    if (providedDocType) {
      setDetectedDocType(providedDocType);
      setGuideAspectRatio(orientAspect(ASPECT_RATIOS[providedDocType]));
      detectionPhaseRef.current = DETECTION_PHASE.CAPTURE;
      discoveryRef.current = { votes: [], docType: providedDocType, frameCount: 0, consecutiveMisses: 0 };
    } else {
      setDetectedDocType(null);
      setGuideAspectRatio(orientAspect(ASPECT_RATIOS['passport']));
      detectionPhaseRef.current = DETECTION_PHASE.DISCOVERY;
      discoveryRef.current = { votes: [], docType: null, frameCount: 0, consecutiveMisses: 0 };
    }
  };

  return {
    feedback,
    capturedImage,
    captureOrigin,
    complianceState,
    debugPath,
    debugInfo,
    detectedDocType,
    guideAspectRatio,
    manualFallbackActive,
    cvLoadFailed,
    triggerManualCapture,
    resetCapture,
  };
}