import { useState, useEffect } from 'preact/hooks';
import { IconLoader2 } from '@tabler/icons-preact';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';
import { FaceLandmarker } from '@mediapipe/tasks-vision';

import SelfieBooth from '../selfie-booth/SelfieBooth';
import '../selfie-capture/SelfieCapture';

declare const h: any;

interface Props {
  timeout?: number;
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
  key?: string;
  'start-countdown'?: string | boolean; // Prop to control when countdown starts
}

const SelfieCaptureWrapper: FunctionComponent<Props> = ({
  timeout = 10000,
  'start-countdown': startCountdownProp = false,
  ...props
}) => {
  const startCountdown =
    startCountdownProp === true || startCountdownProp === 'true';
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mediapipeInstance, setMediapipeInstance] =
    useState<FaceLandmarker | null>(null);
  const [initialSessionCompleted, setInitialSessionCompleted] = useState(false);
  const [mediapipeLoading, setMediapipeLoading] = useState(false);
  const [usingSelfieCapture, setUsingSelfieCapture] = useState(false);

  // Load Mediapipe in background immediately
  useEffect(() => {
    if (mediapipeReady || mediapipeLoading) return;

    const loadMediapipe = async () => {
      setMediapipeLoading(true);
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
        );

        const faceLandmarker = await vision.FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 5,
          },
        );

        setMediapipeInstance(faceLandmarker);
        setMediapipeReady(true);
      } catch (error) {
        console.error('Failed to load Mediapipe:', error);
        // Don't set any permanent fallback flag - let retakes check again
      }
      setMediapipeLoading(false);
    };

    loadMediapipe();
  }, [mediapipeReady, mediapipeLoading]);

  // Start countdown only when startCountdown is true (when capture screen is active)
  useEffect(() => {
    if (!startCountdown || mediapipeReady) return undefined;

    const timer = setInterval(() => {
      setLoadingProgress((prev: number) => Math.min(prev + 1, 100));
    }, timeout / 100);

    return () => {
      clearInterval(timer);
    };
  }, [startCountdown, timeout, mediapipeReady]);

  // Set up event forwarding for selfie-capture component
  useEffect(() => {
    if (!mediapipeReady && loadingProgress >= 100) {
      // Find the selfie-capture element once it's rendered
      const selfieCapture = document.querySelector('selfie-capture');
      if (selfieCapture) {
        const forwardEvent = (event: Event) => {
          const customEvent = event as CustomEvent;

          // Track when a session completes (either success, cancel, or close)
          if (
            customEvent.type === 'selfie-capture.publish' ||
            customEvent.type === 'selfie-capture.cancelled' ||
            customEvent.type === 'selfie-capture.close'
          ) {
            setInitialSessionCompleted(true);
          }

          // Forward the event to window for SelfieCaptureScreens to catch
          window.dispatchEvent(
            new CustomEvent(customEvent.type, {
              detail: customEvent.detail,
              bubbles: true,
            }),
          );
        };

        // Add event listeners for the events that selfie-capture dispatches
        selfieCapture.addEventListener('selfie-capture.publish', forwardEvent);
        selfieCapture.addEventListener(
          'selfie-capture.cancelled',
          forwardEvent,
        );
        selfieCapture.addEventListener('selfie-capture.close', forwardEvent);

        return () => {
          selfieCapture.removeEventListener(
            'selfie-capture.publish',
            forwardEvent,
          );
          selfieCapture.removeEventListener(
            'selfie-capture.cancelled',
            forwardEvent,
          );
          selfieCapture.removeEventListener(
            'selfie-capture.close',
            forwardEvent,
          );
        };
      }
    }
    return undefined;
  }, [mediapipeReady, loadingProgress]);

  // On retakes (after initial session completed), prefer SelfieBooth if Mediapipe is ready
  if (
    initialSessionCompleted &&
    mediapipeReady &&
    mediapipeInstance &&
    !usingSelfieCapture
  ) {
    return <SelfieBooth {...props} mediapipeInstance={mediapipeInstance} />;
  }

  // For initial session, use SelfieBooth if Mediapipe loaded within timeout
  if (
    !initialSessionCompleted &&
    mediapipeReady &&
    mediapipeInstance &&
    !usingSelfieCapture
  ) {
    return <SelfieBooth {...props} mediapipeInstance={mediapipeInstance} />;
  }

  // Use selfie-capture if Mediapipe didn't load in time or failed
  if (loadingProgress >= 100) {
    // Mark that we're using selfie-capture to prevent switching later
    if (!usingSelfieCapture) {
      setUsingSelfieCapture(true);
    }

    // Remove the 'hidden' attribute when rendering selfie-capture to make it visible
    const propsWithoutHidden = { ...props };
    delete (propsWithoutHidden as any).hidden;
    return h('selfie-capture', propsWithoutHidden);
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconLoader2
          size={48}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
      <p>Loading... {loadingProgress}%</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Register as a custom element
if (!customElements.get('selfie-capture-wrapper')) {
  register(
    SelfieCaptureWrapper,
    'selfie-capture-wrapper',
    [
      'timeout',
      'interval',
      'duration',
      'theme-color',
      'show-navigation',
      'allow-agent-mode',
      'show-agent-mode-for-tests',
      'hide-attribution',
      'disable-image-tests',
      'key',
      'start-countdown',
    ],
    { shadow: false },
  );
}

export default SelfieCaptureWrapper;
