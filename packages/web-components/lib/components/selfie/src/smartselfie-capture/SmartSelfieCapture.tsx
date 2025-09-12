import { useRef, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';
import throttle from 'lodash/throttle';

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

  const initialFacingMode = allowAgentMode ? 'environment' : 'user';
  const camera = useCamera(initialFacingMode);

  const throttledMultipleFaces = useSignal(false);
  const updateMultipleFacesUI = useRef(
    throttle((value: boolean) => {
      throttledMultipleFaces.value = value;
    }, 100),
  ).current;

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
  });

  useEffect(() => {
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
      updateMultipleFacesUI.cancel();
    };
  }, []);

  useEffect(() => {
    updateMultipleFacesUI(faceCapture.multipleFaces.value);
  }, [faceCapture.multipleFaces.value]);

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

  useEffect(() => {
    if (faceCapture.hasFinishedCapture.value) {
      const smartCameraWeb = document.querySelector('smart-camera-web');
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );
    }
  }, [faceCapture.hasFinishedCapture.value]);

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
        multipleFaces={throttledMultipleFaces.value}
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
