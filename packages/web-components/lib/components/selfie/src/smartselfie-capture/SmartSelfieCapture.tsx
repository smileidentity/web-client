import { useRef, useEffect } from 'preact/hooks';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { useFaceCapture, useCamera } from './hooks';
import { CameraPreview } from './components/CameraPreview';
import { AlertDisplay } from './components/AlertDisplay';
import { CaptureControls } from './components/CaptureControls';

import '../../../navigation/src';
import '../../../attribution/PoweredBySmileId';

interface Props {
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
}

const SmartSelfieCapture: FunctionComponent<Props> = ({
  interval = 350,
  duration = 2800,
  'theme-color': themeColor = '#001096',
  'show-navigation': showNavigationProp = false,
  'allow-agent-mode': allowAgentModeProp = false,
  'show-agent-mode-for-tests': showAgentModeForTestsProp = false,
  'hide-attribution': hideAttributionProp = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigationRef = useRef<HTMLElement | null>(null);

  const showNavigation = getBoolProp(showNavigationProp);
  const allowAgentMode = getBoolProp(allowAgentModeProp);
  const showAgentModeForTests = getBoolProp(showAgentModeForTestsProp);
  const hideAttribution = getBoolProp(hideAttributionProp);

  const smileCooldown = 300;
  const smileThreshold = 0.25;
  const mouthOpenThreshold = 0.05;
  const minFaceSize = 0.35;
  const maxFaceSize = 0.5;

  const camera = useCamera();

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
  });

  useEffect(() => {
    const initializeCamera = async () => {
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] Starting initialization process');
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] User Agent:', navigator.userAgent);
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] Platform:', navigator.platform);
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] Touch points:', navigator.maxTouchPoints);

      // iOS-specific detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);
      const isIOSChrome = /CriOS/.test(navigator.userAgent);
      const isIOSFirefox = /FxiOS/.test(navigator.userAgent);
      const isIOSEdge = /EdgiOS/.test(navigator.userAgent);

      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] iOS Detection:', {
        isIOS,
        isSafari,
        isIOSChrome,
        isIOSFirefox,
        isIOSEdge,
        supportsWebGL: !!window.WebGLRenderingContext,
        supportsWebGL2: !!window.WebGL2RenderingContext,
        supportsWebAssembly: !!window.WebAssembly,
        mediaDevicesSupported: !!navigator.mediaDevices,
        getUserMediaSupported: !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ),
      });

      try {
        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Step 1: Starting camera...');
        await camera.startCamera();
        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Step 1: Camera started successfully');

        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Step 2: Checking agent support...');
        await camera.checkAgentSupport();
        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Step 2: Agent support check completed');

        // eslint-disable-next-line no-console
        console.log(
          '[SmartSelfie] Step 3: Initializing MediaPipe FaceLandmarker...',
        );
        await faceCapture.initializeFaceLandmarker();
        // eslint-disable-next-line no-console
        console.log(
          '[SmartSelfie] Step 3: MediaPipe FaceLandmarker initialized successfully',
        );

        // eslint-disable-next-line no-console
        console.log(
          '[SmartSelfie] Step 4: Setting up canvas and starting detection loop...',
        );
        setTimeout(() => {
          try {
            // eslint-disable-next-line no-console
            console.log('[SmartSelfie] Setting up canvas...');
            faceCapture.setupCanvas();
            // eslint-disable-next-line no-console
            console.log('[SmartSelfie] Canvas setup completed');

            // eslint-disable-next-line no-console
            console.log('[SmartSelfie] Starting detection loop...');
            faceCapture.startDetectionLoop();
            // eslint-disable-next-line no-console
            console.log('[SmartSelfie] Detection loop started');

            setTimeout(() => {
              if (camera.videoRef.current) {
                // eslint-disable-next-line no-console
                console.log(
                  '[SmartSelfie] Post-init check - Video dimensions:',
                  camera.videoRef.current.videoWidth,
                  'x',
                  camera.videoRef.current.videoHeight,
                  'readyState:',
                  camera.videoRef.current.readyState,
                );

                if (camera.videoRef.current.videoWidth === 0) {
                  // eslint-disable-next-line no-console
                  console.warn(
                    '[SmartSelfie] ⚠️ Video still has zero dimensions after 2 seconds',
                  );

                  if (camera.videoRef.current.readyState >= 1) {
                    // eslint-disable-next-line no-console
                    console.log('[SmartSelfie] Attempting canvas re-setup...');
                    faceCapture.setupCanvas();
                  }
                }
              }
            }, 2000);

            // eslint-disable-next-line no-console
            console.log(
              '[SmartSelfie] ✅ Full initialization completed successfully',
            );
          } catch (canvasError) {
            console.error(
              '[SmartSelfie] ❌ Error during canvas setup or detection start:',
              canvasError,
            );
          }
        }, 1000);
      } catch (error) {
        console.error('[SmartSelfie] ❌ Critical initialization error:', error);
        console.error('[SmartSelfie] Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    camera.registerCameraSwitchCallback(() => {
      try {
        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Camera switch callback triggered');
        faceCapture.resetFaceDetectionState();
        faceCapture.setupCanvas();
        faceCapture.stopDetectionLoop();
        faceCapture.startDetectionLoop();
        // eslint-disable-next-line no-console
        console.log('[SmartSelfie] Camera switch callback completed');
      } catch (error) {
        console.error(
          '[SmartSelfie] Error during camera switch callback:',
          error,
        );
      }
    });

    initializeCamera();

    return () => {
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] Cleanup started');
      faceCapture.stopDetectionLoop();
      camera.stopCamera();
      faceCapture.cleanup();
      // eslint-disable-next-line no-console
      console.log('[SmartSelfie] Cleanup completed');
    };
  }, []);

  useEffect(() => {
    const navigation = navigationRef.current;

    if (navigation && showNavigation) {
      const handleNavigationBack = () => {
        faceCapture.handleCancel();
      };

      const handleNavigationClose = () => {
        faceCapture.handleClose();
      };

      navigation.addEventListener('navigation.back', handleNavigationBack);
      navigation.addEventListener('navigation.close', handleNavigationClose);

      return () => {
        navigation.removeEventListener('navigation.back', handleNavigationBack);
        navigation.removeEventListener(
          'navigation.close',
          handleNavigationClose,
        );
      };
    }
    return undefined;
  }, [showNavigation]);

  return (
    <div className="smartselfie-capture">
      {showNavigation && (
        // @ts-ignore
        <smileid-navigation ref={navigationRef} theme-color={themeColor} />
      )}

      <CameraPreview
        videoRef={camera.videoRef}
        canvasRef={canvasRef}
        facingMode={camera.facingMode}
        multipleFaces={faceCapture.multipleFaces.value}
        progress={
          faceCapture.capturesTaken.value > 0
            ? faceCapture.capturesTaken.value / faceCapture.totalCaptures.value
            : 0
        }
        interval={interval}
        themeColor={themeColor}
      />

      <AlertDisplay alertTitle={faceCapture.alertTitle.value} />

      {!faceCapture.isCapturing.value &&
        !faceCapture.hasFinishedCapture.value && (
          <CaptureControls
            isCapturing={faceCapture.isCapturing.value}
            hasFinishedCapture={faceCapture.hasFinishedCapture.value}
            isReadyToCapture={faceCapture.isReadyToCapture.value}
            allowAgentMode={allowAgentMode}
            agentSupported={camera.agentSupported}
            showAgentModeForTests={showAgentModeForTests}
            facingMode={camera.facingMode}
            themeColor={themeColor}
            onStartCapture={faceCapture.startCapture}
            onSwitchCamera={camera.switchCamera}
          />
        )}

      {/* @ts-ignore */}
      {!hideAttribution && <powered-by-smile-id />}

      <style>{`
        * {
          box-sizing: border-box;
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

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        button.btn-primary {
          background-color: ${themeColor || '#001096'};
          border-radius: 2.5rem;
          color: white;
          border: none;
          height: 3.125rem;
          display: inline-block;
          padding: 0.75rem 1.5rem;
          text-align: center;
          font-size: 1.125rem;
          font-weight: 600;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
        }
        
        button.btn-primary:hover {
          background-color: #2d2b2a;
        }
          
        button.btn-primary:disabled {
          background-color: #666;
          cursor: not-allowed;
        }

        .smartselfie-capture {
          padding: 1rem;
          font-family: sans-serif;
        }
      `}</style>
    </div>
  );
};

if (!customElements.get('smartselfie-capture')) {
  register(
    SmartSelfieCapture,
    'smartselfie-capture',
    [
      'interval',
      'duration',
      'theme-color',
      'show-navigation',
      'allow-agent-mode',
      'show-agent-mode-for-tests',
      'hide-attribution',
      'disable-image-tests',
    ],
    { shadow: true },
  );
}

export default SmartSelfieCapture;
