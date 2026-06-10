import type { ComponentChildren, FunctionComponent, Ref } from 'preact';
import OvalProgress from '../OvalProgress';

interface CameraPreviewProps {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  facingMode: 'user' | 'environment';
  themeColor: string;
  /** Optional overlay rendered inside the video container (e.g. active-liveness face animation). */
  overlay?: ComponentChildren;
  /** Optional override for the oval border colour (used to signal error states). */
  borderColor?: string;
  /** Highlight the offending side of the oval when a quality check fails. */
  errorSide?: 'top' | 'right' | 'bottom' | 'left' | 'all' | null;
}

export const CameraPreview: FunctionComponent<CameraPreviewProps> = ({
  videoRef,
  canvasRef,
  facingMode,
  overlay,
  borderColor,
  errorSide = null,
}) => (
  <>
    <div className="camera-preview-container">
      <div className="video-wrapper">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`camera-video ${facingMode === 'user' ? 'mirror' : ''}`}
          />
          <canvas
            ref={canvasRef}
            className={`camera-canvas ${facingMode === 'user' ? 'mirror' : ''}`}
          />
          {overlay}
        </div>
      </div>
      <OvalProgress borderColor={borderColor} errorSide={errorSide} />
    </div>

    <style>{`
      .camera-preview-container {
        position: relative;
        width: auto;
        height: clamp(220px, 42dvh, 418px);
        aspect-ratio: 311 / 418;
        max-width: 100%;
        margin: 0 auto;
        flex-shrink: 1;
        min-height: 0;
      }

      .video-wrapper {
        width: 100%;
        height: 100%;
        margin: 0 auto;
        position: relative;
        border: 2px solid #C4C4C4;
        border-radius: 50%;
        overflow: hidden;
        background: #F5F7FA;
        box-sizing: border-box;
      }

      .video-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .camera-video,
      .camera-canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .camera-video.mirror,
      .camera-canvas.mirror {
        transform: translate(-50%, -50%) scaleX(-1);
      }

      .camera-canvas {
        pointer-events: none;
      }
    `}</style>
  </>
);
