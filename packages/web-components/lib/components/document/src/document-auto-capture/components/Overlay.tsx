// @ts-nocheck
// TODO(document-auto-capture): port to strict TypeScript.
import { useRef, useEffect } from 'preact/hooks';
import { COMPLIANCE_STATES } from '../hooks/useCardDetection';
import { CornerBrackets } from './CornerBrackets';
import { getShimmerSvg } from '../assets/shimmers';

export function Overlay({
  feedback,
  complianceState,
  debugPath,
  showDebug = false,
  guideAspectRatio = 1.585,
  detectedDocType = null,
  sideOfId = 'Front',
}) {
  const canvasRef = useRef(null);
  
  // Determine bracket color based on state
  let bracketColor = 'rgba(255, 255, 255, 0.6)'; // Idle
  if (complianceState === COMPLIANCE_STATES.DETECTING) {
    bracketColor = '#FFA500'; // Orange
  }
  if (complianceState === COMPLIANCE_STATES.STABLE) {
    bracketColor = '#12B76A'; // Green
  }
  if (complianceState === COMPLIANCE_STATES.SUCCESS) {
    bracketColor = '#12B76A';
  }
  if (complianceState === COMPLIANCE_STATES.CAPTURING) {
    bracketColor = '#34D399';
  }

  const frameBorderColor =
    complianceState === COMPLIANCE_STATES.STABLE ||
    complianceState === COMPLIANCE_STATES.SUCCESS ||
    complianceState === COMPLIANCE_STATES.CAPTURING
      ? '#2CC05C'
      : complianceState === COMPLIANCE_STATES.DETECTING
        ? '#F59E0B'
        : 'rgba(255,255,255,0.4)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
  const guideBoxRef = useRef(null);
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && guideBoxRef.current) {
        const rect = guideBoxRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    const observer = new ResizeObserver(resizeCanvas);
    if (guideBoxRef.current) observer.observe(guideBoxRef.current);
    resizeCanvas();
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
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
    }}>

      {/* Guide Box with corner brackets */}
      <div ref={guideBoxRef} className="guide-box" style={{ 
        width: '50%',
        maxWidth: '600px',
        aspectRatio: `${guideAspectRatio} / 1`, 
        borderRadius: '20px', 
        border: `4px solid ${frameBorderColor}`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}>
        {/* Corner brackets */}
        <CornerBrackets color={bracketColor} size={32} thickness={4} />

        {/* Document-type shimmer silhouette — hidden once document is detected. */}
        {(() => {
          const shimmerSvg = getShimmerSvg(detectedDocType, sideOfId);
          if (!shimmerSvg) return null;
          const shimmerVisible =
            complianceState === COMPLIANCE_STATES.IDLE ||
            complianceState === COMPLIANCE_STATES.DETECTING;
          return (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: shimmerVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              dangerouslySetInnerHTML={{
                __html: shimmerSvg.replace(
                  /<svg([^>]*)>/,
                  '<svg$1 style="width:100%;height:100%;" preserveAspectRatio="xMidYMid meet">',
                ),
              }}
            />
          );
        })()}

        {/* Debug contour canvas — inside guide box, only visible in debug mode */}
        {showDebug && (
          <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: '12px' }} />
        )}
      </div>
    </div>
  );
}
