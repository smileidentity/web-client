import { useRef, useEffect } from 'preact/hooks';
import type { FunctionComponent } from 'preact';
import { COMPLIANCE_STATES } from '../hooks/useCardDetection';
import { getShimmerSvg, type ShimmerDocType } from '../assets/shimmers';

type ComplianceState =
  (typeof COMPLIANCE_STATES)[keyof typeof COMPLIANCE_STATES];

type DebugPathPoint = { x: number; y: number };
type DebugPath = DebugPathPoint[] & { roiWidth?: number; roiHeight?: number };

interface OverlayProps {
  complianceState: ComplianceState;
  debugPath?: DebugPath | null;
  showDebug?: boolean;
  guideAspectRatio?: number;
  detectedDocType?: ShimmerDocType;
  sideOfId?: string;
  isRotated?: boolean;
}

export const Overlay: FunctionComponent<OverlayProps> = ({
  complianceState,
  debugPath,
  showDebug = false,
  guideAspectRatio = 1.585,
  detectedDocType = null,
  sideOfId = 'Front',
  isRotated = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const guideBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw the detected card polygon in debug mode
    if (showDebug && debugPath && debugPath.length > 0) {
      // Points are in ROI (video native) coords — scale to canvas (CSS guide box) size
      const scaleX = canvas.width / (debugPath.roiWidth || 1);
      const scaleY = canvas.height / (debugPath.roiHeight || 1);

      ctx.beginPath();
      ctx.moveTo(debugPath[0].x * scaleX, debugPath[0].y * scaleY);
      for (let i = 1; i < debugPath.length; i++) {
        ctx.lineTo(debugPath[i].x * scaleX, debugPath[i].y * scaleY);
      }
      ctx.closePath();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00FF00';
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
      ctx.fill();
    }
  }, [debugPath, showDebug]);

  // Resize debug canvas to match guide box
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && guideBoxRef.current) {
        const rect = guideBoxRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    resizeCanvas();
    // ResizeObserver is missing on older browsers; the debug canvas is
    // optional, so fall back to the initial size rather than throwing.
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(resizeCanvas);
    if (guideBoxRef.current) observer.observe(guideBoxRef.current);
    return () => observer.disconnect();
  }, []);

  // Keep the guide visible across all states (including STABLE / CAPTURING /
  // SUCCESS) so users see the green outline confirm the lock-in. Only hide
  // it if compliance state is missing.
  const shimmerVisible = Boolean(complianceState);
  const shimmerSvg = getShimmerSvg(detectedDocType, sideOfId);

  let shimmerColor: string;
  if (
    complianceState === COMPLIANCE_STATES.STABLE ||
    complianceState === COMPLIANCE_STATES.SUCCESS ||
    complianceState === COMPLIANCE_STATES.CAPTURING
  ) {
    shimmerColor = '#2CC05C';
  } else if (complianceState === COMPLIANCE_STATES.DETECTING) {
    shimmerColor = '#F59E0B';
  } else {
    shimmerColor = '#FFFFFF';
  }

  // Inject sizing + swap ONLY the first stroke="white" to currentColor.
  // The first <path> in each shimmer SVG is the outer card outline; later
  // paths are interior decoration (face, text lines) and stay white.
  const shimmerHtml = shimmerSvg
    .replace(
      /<svg([^>]*)>/,
      '<svg$1 style="width:100%;height:100%;display:block;" preserveAspectRatio="xMidYMid meet">',
    )
    .replace('stroke="white"', 'stroke="currentColor"');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Shimmer SVG is the guide — replaces the bordered guide box entirely. */}
      <div
        ref={guideBoxRef}
        className="guide-box"
        style={{
          width: isRotated ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)',
          maxWidth: '480px',
          aspectRatio: `${guideAspectRatio} / 1`,
          position: 'relative',
          opacity: shimmerVisible ? 1 : 0,
          color: shimmerColor,
          transition: 'opacity 0.3s ease, color 0.3s ease',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: shimmerHtml }}
        />

        {/* Debug contour canvas — only visible in debug mode */}
        {showDebug && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
