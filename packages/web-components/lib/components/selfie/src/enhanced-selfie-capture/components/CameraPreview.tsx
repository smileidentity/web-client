import type { FunctionComponent, Ref } from 'preact';
import OvalProgress from '../OvalProgress';

interface CameraPreviewProps {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  facingMode: 'user' | 'environment';
  multipleFaces: boolean;
  progress: number;
  interval: number;
  themeColor: string;
}

export const CameraPreview: FunctionComponent<CameraPreviewProps> = ({
  videoRef,
  canvasRef,
  facingMode,
  multipleFaces,
  progress,
  interval,
  themeColor,
}) => (
  <>
    <div className="camera-preview-container">
      <div
        className="video-wrapper"
        style={{
          clipPath: multipleFaces ? 'none' : 'url(#selfie-clip-path)',
        }}
      >
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
        </div>
      </div>
      {!multipleFaces && (
        <OvalProgress
          progress={progress}
          duration={interval}
          themeColor={themeColor}
        />
      )}
    </div>

    <style>{`
      .camera-preview-container {
        position: relative;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }

      .video-wrapper {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        position: relative;
        aspect-ratio: 3 / 4;
        overflow: hidden;
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
