import { useState, useEffect } from 'preact/hooks';
import { IconLoader2 } from '@tabler/icons-preact';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { translate, translateHtml } from '../../../../domain/localisation';
import SmartSelfieCapture from '../smartselfie-capture/SmartSelfieCapture';
// Legacy web component fallback (used when Mediapipe isn't available)
import '../selfie-capture/SelfieCapture';
// Mediapipe loader/manager used by SmartSelfieCapture
import {
  getMediapipeInstance,
  UnsupportedMediapipeEnvironmentError,
} from '../smartselfie-capture/utils/mediapipeManager';

// Minimal typing for the optional Sentry SDK that host pages may expose on
// `window`. We only depend on `captureException`, so keep the surface tight.
// Sentry tag values are expected to be strings, so the type enforces that.
type SentryTags = Record<string, string>;
declare global {
  interface Window {
    Sentry?: {
      captureException: (
        error: unknown,
        context?: { tags?: SentryTags },
      ) => void;
    };
  }
}

interface Props {
  timeout?: number;
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'allow-legacy-selfie-fallback'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
  key?: string;
  'start-countdown'?: string | boolean;
  hidden?: string | boolean;
}

const DEFAULT_MEDIAPIPE_WAIT_MS = 90 * 1000; // For when legacy fallback is NOT allowed, we wait the full 90s for mediapipe to load before showing an error.
const DEFAULT_WAIT_MS = 20 * 1000; // default for when legacy fallback is allowed we wait for 20s
// Cap retries on transient init failures so we don't spin forever, while still
// allowing recovery from short-lived issues (e.g. CDN hiccups while the
// wrapper is preloading in a hidden state).
const MAX_MEDIAPIPE_INIT_ATTEMPTS = 3;

// Wrapper component that decides whether to use the modern
// SmartSelfieCapture (Mediapipe-based) or fallback to the legacy `selfie-capture`
// web component after a timeout (default 90 seconds).
const SelfieCaptureWrapper: FunctionComponent<Props> = ({
  timeout = DEFAULT_MEDIAPIPE_WAIT_MS,
  'start-countdown': startCountdownProp = false,
  'allow-legacy-selfie-fallback': allowLegacySelfieFallbackProp = false,
  hidden: hiddenProp = false,
  ...props
}) => {
  // Detect if tests are running under Cypress/Electron (affects loading behavior)
  const isParentCypress = (() => {
    try {
      return (
        !!(window.parent as any).Cypress ||
        (window.parent.navigator.userAgent.includes('Electron') &&
          (window.parent as any).__Cypress)
      );
    } catch {
      return false;
    }
  })();
  const isCypress =
    isParentCypress ||
    !!(window as any).Cypress ||
    (window.navigator.userAgent.includes('Electron') &&
      (window as any).__Cypress);

  const hidden = getBoolProp(hiddenProp);
  const startCountdown = getBoolProp(startCountdownProp);
  const allowLegacySelfieFallback = getBoolProp(allowLegacySelfieFallbackProp);
  const loadingTime = allowLegacySelfieFallback ? DEFAULT_WAIT_MS : timeout;

  // Component state:
  // - mediapipeReady: whether the mediapipe instance has successfully loaded
  // - loadingProgress: percentage used for the visible loading UI
  // - initialSessionCompleted: set when the legacy component emits publish/cancel/close
  // - mediapipeLoading: true while attempting to load mediapipe
  // - usingSelfieCapture: whether we've mounted the legacy `selfie-capture` element
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(isCypress ? 100 : 0);
  const [initialSessionCompleted, setInitialSessionCompleted] = useState(false);
  const [mediapipeLoading, setMediapipeLoading] = useState(false);
  // `unsupportedEnvironment` is a permanent, one-shot signal: we know
  // MediaPipe cannot run here, so stop trying.
  const [unsupportedEnvironment, setUnsupportedEnvironment] = useState(false);
  // Bounded retry counter for transient init failures.
  const [mediapipeInitAttempts, setMediapipeInitAttempts] = useState(0);
  // Dedup flag so we only report a given init failure to Sentry once per
  // wrapper instance, even if we end up retrying.
  const [mediapipeInitReported, setMediapipeInitReported] = useState(false);
  const [usingSelfieCapture, setUsingSelfieCapture] = useState(false);

  // Attempt to load Mediapipe (with a small bounded retry budget). If
  // Mediapipe is already ready, currently loading, the environment is
  // definitively unsupported, we've exhausted our retry budget, or we're
  // running under Cypress, skip the attempt. This side-effect flips
  // mediapipeReady/mediapipeLoading flags which control which component is
  // used.
  useEffect(() => {
    if (
      mediapipeReady ||
      mediapipeLoading ||
      unsupportedEnvironment ||
      mediapipeInitAttempts >= MAX_MEDIAPIPE_INIT_ATTEMPTS ||
      isCypress
    )
      return;

    const loadMediapipe = async () => {
      setMediapipeLoading(true);
      setMediapipeInitAttempts((prev) => prev + 1);
      try {
        await getMediapipeInstance();
        setMediapipeReady(true);
      } catch (error) {
        // Loading failed; we'll fall back to the legacy selfie-capture component
        // after the loadingProgress reaches 100% (or sooner for definitively
        // unsupported environments — see below).
        console.error('Failed to load Mediapipe:', error);
        const isUnsupportedEnvironment =
          error instanceof UnsupportedMediapipeEnvironmentError;
        // Report to Sentry (when the host page has exposed it on window) so we
        // can observe how often users land on the fallback path and which
        // environments are affected. Dedup so retries don't flood Sentry.
        if (!mediapipeInitReported) {
          setMediapipeInitReported(true);
          window.Sentry?.captureException(error, {
            tags: {
              area: 'mediapipe_init',
              mediapipe_unsupported_environment: isUnsupportedEnvironment
                ? 'true'
                : 'false',
            },
          });
        }
        // When the environment definitively cannot run MediaPipe (e.g. no
        // WebAssembly reftypes support), there is no point retrying or keeping
        // the user staring at the loading spinner for the full countdown —
        // mark as unsupported and short-circuit to the fallback decision
        // immediately.
        if (isUnsupportedEnvironment) {
          setUnsupportedEnvironment(true);
          setLoadingProgress(100);
        }
      }
      setMediapipeLoading(false);
    };

    loadMediapipe();
  }, [
    mediapipeReady,
    mediapipeLoading,
    unsupportedEnvironment,
    mediapipeInitAttempts,
    mediapipeInitReported,
  ]);

  // When using the loading countdown (startCountdown), increment the
  // visible loading progress. This is only used while mediapipe hasn't
  // reported ready; once mediapipeReady becomes true we stop the timer.
  useEffect(() => {
    if (hidden || !startCountdown || mediapipeReady) return undefined;

    const timer = setInterval(() => {
      setLoadingProgress((prev: number) => Math.min(prev + 1, 100));
    }, loadingTime / 100);

    return () => {
      clearInterval(timer);
    };
  }, [hidden, startCountdown, loadingTime, mediapipeReady]);

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

  // Dispatch allow_legacy_selfie_fallback config for observability
  useEffect(() => {
    if (hidden) return;

    const smartCameraWeb = document.querySelector('smart-camera-web');
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.allow-legacy-selfie-fallback', {
        detail: {
          allow_legacy_selfie_fallback: allowLegacySelfieFallback,
        },
      }),
    );
  }, [hidden, allowLegacySelfieFallback]);

  // Announce to any `smart-camera-web` element which liveness version is active.
  // The old capture uses 0.0.1, the new one 1.0.0.
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
    // When loading completes without Mediapipe becoming ready, check if legacy
    // fallback is allowed. Legacy is allowed if:
    // 1. allow-legacy-selfie-fallback attribute is set to true, OR
    // 2. Running under Cypress (to keep existing test behavior)
    const legacyFallbackAllowed = allowLegacySelfieFallback || isCypress;

    if (legacyFallbackAllowed) {
      // Mount the legacy `selfie-capture` web component. We also set
      // `usingSelfieCapture` so other effects can react (e.g. metadata dispatch).
      if (!usingSelfieCapture) {
        setUsingSelfieCapture(true);
      }

      const propsWithoutHidden = { ...props };
      delete (propsWithoutHidden as any).hidden;

      return (
        // @ts-expect-error --- preact-custom-element doesn't have proper types for refs
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

    // Legacy fallback is NOT allowed: show error message
    return (
      <div style={{ textAlign: 'center', marginTop: '20%', padding: '0 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>
          {translate('selfie.capture.loading.connectionError')}
        </p>
      </div>
    );
  }

  // Midpoint threshold (40s out of 90s ≈ 44%)
  const SLOW_CONNECTION_THRESHOLD = 44;

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
      {loadingProgress >= SLOW_CONNECTION_THRESHOLD ? (
        <p>{translate('selfie.capture.loading.slowConnection')}</p>
      ) : (
        <p>
          {translateHtml('selfie.capture.loading.progress', {
            progress: loadingProgress,
          })}
        </p>
      )}
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
      'allow-legacy-selfie-fallback',
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
