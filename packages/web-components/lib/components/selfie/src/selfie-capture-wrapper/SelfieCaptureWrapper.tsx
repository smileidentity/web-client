import { useState, useEffect } from 'preact/hooks';
import { IconLoader2 } from '@tabler/icons-preact';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '@/utils/props';
import SmartSelfieCapture from '../smartselfie-capture/SmartSelfieCapture';
import '../selfie-capture/SelfieCapture';
import { getMediapipeInstance } from '../smartselfie-capture/utils/mediapipeManager';

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
  'start-countdown'?: string | boolean;
  hidden?: string | boolean;
}

const SelfieCaptureWrapper: FunctionComponent<Props> = ({
  timeout = 20000,
  'start-countdown': startCountdownProp = false,
  hidden: hiddenProp = false,
  ...props
}) => {
  const hidden = getBoolProp(hiddenProp);
  const startCountdown = getBoolProp(startCountdownProp);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [initialSessionCompleted, setInitialSessionCompleted] = useState(false);
  const [mediapipeLoading, setMediapipeLoading] = useState(false);
  const [usingSelfieCapture, setUsingSelfieCapture] = useState(false);

  useEffect(() => {
    if (mediapipeReady || mediapipeLoading) return;

    const loadMediapipe = async () => {
      setMediapipeLoading(true);
      try {
        await getMediapipeInstance();
        setMediapipeReady(true);
      } catch (error) {
        console.error('Failed to load Mediapipe:', error);
      }
      setMediapipeLoading(false);
    };

    loadMediapipe();
  }, [mediapipeReady, mediapipeLoading]);

  useEffect(() => {
    if (hidden || !startCountdown || mediapipeReady) return undefined;

    const timer = setInterval(() => {
      setLoadingProgress((prev: number) => Math.min(prev + 1, 100));
    }, timeout / 100);

    return () => {
      clearInterval(timer);
    };
  }, [hidden, startCountdown, timeout, mediapipeReady]);

  useEffect(() => {
    if (hidden || mediapipeReady || loadingProgress < 100) return undefined;

    const setupEventForwarding = () => {
      const selfieCapture = document.querySelector('selfie-capture');
      if (
        selfieCapture &&
        !selfieCapture.hasAttribute('data-backup-events-setup')
      ) {
        selfieCapture.setAttribute('data-backup-events-setup', 'true');

        const forwardEvent = (event: Event) => {
          const customEvent = event as CustomEvent;
          window.dispatchEvent(
            new CustomEvent(customEvent.type, {
              detail: customEvent.detail,
              bubbles: true,
            }),
          );
        };

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
      return undefined;
    };

    const timeoutId = setTimeout(setupEventForwarding, 200);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [hidden, mediapipeReady, loadingProgress]);

  useEffect(() => {
    if (hidden || mediapipeLoading) return;

    const smartCameraWeb = document.querySelector('smart-camera-web');
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.active-liveness-version', {
        detail: {
          version: usingSelfieCapture ? '0.0.1' : '1.0.0',
        },
      }),
    );
  }, [usingSelfieCapture, hidden, mediapipeLoading]);

  if (hidden) {
    return null;
  }

  // on retakes, prefer SmartSelfieCapture if Mediapipe is ready
  if (initialSessionCompleted && mediapipeReady && !usingSelfieCapture) {
    return <SmartSelfieCapture {...props} />;
  }

  // use SmartSelfieCapture if mediapipe loads
  if (!initialSessionCompleted && mediapipeReady && !usingSelfieCapture) {
    return <SmartSelfieCapture {...props} />;
  }

  if (loadingProgress >= 100) {
    if (!usingSelfieCapture) {
      setUsingSelfieCapture(true);
    }

    const propsWithoutHidden = { ...props };
    delete (propsWithoutHidden as any).hidden;

    return (
      // @ts-ignore
      <selfie-capture
        {...propsWithoutHidden}
        ref={(el: HTMLElement) => {
          if (el && !el.hasAttribute('data-events-setup')) {
            el.setAttribute('data-events-setup', 'true');

            const forwardEvent = (event: Event) => {
              const customEvent = event as CustomEvent;

              if (
                customEvent.type === 'selfie-capture.publish' ||
                customEvent.type === 'selfie-capture.cancelled' ||
                customEvent.type === 'selfie-capture.close'
              ) {
                setInitialSessionCompleted(true);
              }

              window.dispatchEvent(
                new CustomEvent(customEvent.type, {
                  detail: customEvent.detail,
                  bubbles: true,
                }),
              );
            };

            el.addEventListener('selfie-capture.publish', forwardEvent);
            el.addEventListener('selfie-capture.cancelled', forwardEvent);
            el.addEventListener('selfie-capture.close', forwardEvent);
          }
        }}
      />
    );
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
      'hidden',
    ],
    { shadow: true },
  );
}

export default SelfieCaptureWrapper;
