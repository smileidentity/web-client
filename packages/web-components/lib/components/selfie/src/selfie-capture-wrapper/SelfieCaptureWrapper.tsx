import { useState, useEffect, useRef } from 'preact/hooks';
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
  timeout?: string | number;
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

// Default deadlines for the Mediapipe load attempt. These are used when the
// host did NOT provide an explicit `timeout` prop; an explicit `timeout`
// always wins regardless of the legacy-fallback flag.
//   - With legacy fallback allowed: 20s, so users on broken networks get a
//     usable capture quickly.
//   - Without legacy fallback: 90s, so we keep waiting before giving up to
//     the error UI.
const DEFAULT_MEDIAPIPE_WAIT_MS = 90 * 1000;
const DEFAULT_WAIT_MS = 20 * 1000;
// Cap retries on transient init failures so we don't spin forever, while still
// allowing recovery from short-lived issues (e.g. CDN hiccups while the
// wrapper is preloading in a hidden state). Retries are spaced with
// exponential backoff (base * 2^(attempt-1)) so we don't hammer the CDN.
const MAX_MEDIAPIPE_INIT_ATTEMPTS = 3;
const MEDIAPIPE_RETRY_BASE_DELAY_MS = 500;

// Wrapper component that decides whether to use the modern
// SmartSelfieCapture (Mediapipe-based) or fallback to the legacy `selfie-capture`
// web component after a timeout (default 90 seconds).
const SelfieCaptureWrapper: FunctionComponent<Props> = ({
  timeout,
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

  // Resolve how long we'll wait for Mediapipe before the hard deadline fires.
  // Precedence:
  //   1. Explicit `timeout` prop (parsed defensively because web component
  //      attributes arrive as strings).
  //   2. With legacy fallback allowed: DEFAULT_WAIT_MS (20s).
  //   3. Otherwise: DEFAULT_MEDIAPIPE_WAIT_MS (90s).
  const parsedTimeout = typeof timeout === 'string' ? Number(timeout) : timeout;
  const hasExplicitTimeout =
    typeof parsedTimeout === 'number' &&
    Number.isFinite(parsedTimeout) &&
    parsedTimeout > 0;
  const defaultLoadingTime = allowLegacySelfieFallback
    ? DEFAULT_WAIT_MS
    : DEFAULT_MEDIAPIPE_WAIT_MS;
  const loadingTime = hasExplicitTimeout
    ? (parsedTimeout as number)
    : defaultLoadingTime;

  // Component state:
  // - mediapipeReady: whether the mediapipe instance has successfully loaded
  // - loadingProgress: percentage used for the visible loading UI (cosmetic)
  // - loadDeadlineExceeded: hard cap signal — once true, we stop waiting for
  //   Mediapipe and commit to the legacy fallback (or error UI). Kept
  //   separate from `loadingProgress` so the decision is driven by a single
  //   setTimeout firing once, not by a 200ms ticking interval that can race
  //   with the Mediapipe promise resolution.
  // - initialSessionCompleted: set when the legacy component emits publish/cancel/close
  // - mediapipeLoading: true while attempting to load mediapipe
  // - usingSelfieCapture: whether we've mounted the legacy `selfie-capture` element
  // If MediaPipe already loaded earlier in this session (e.g. we're remounting
  // after returning from document capture), reuse the cached singleton instance
  // immediately instead of showing the loading spinner again. The model and
  // WASM are already in memory, so no network call is needed.
  const mediapipeAlreadyLoaded = !!(
    window.__smileIdentityMediapipe?.loaded &&
    window.__smileIdentityMediapipe?.instance
  );

  const [mediapipeReady, setMediapipeReady] = useState(mediapipeAlreadyLoaded);
  const [loadingProgress, setLoadingProgress] = useState(
    isCypress || mediapipeAlreadyLoaded ? 100 : 0,
  );
  const [loadDeadlineExceeded, setLoadDeadlineExceeded] = useState(isCypress);
  const [initialSessionCompleted, setInitialSessionCompleted] = useState(false);
  const [mediapipeLoading, setMediapipeLoading] = useState(false);
  // Concurrency guard for the load effect. Kept in a ref — NOT in
  // `mediapipeLoading` state — so the effect's guard does not depend on a value
  // the effect itself sets. If it did (as it used to), calling
  // `setMediapipeLoading(true)` would re-run the effect, whose cleanup flips
  // `cancelled` true, and a slow `getMediapipeInstance()` would then resolve
  // into a cancelled closure — never calling `setMediapipeReady(true)`. That
  // left the UI stuck on the loading spinner even though MediaPipe loaded
  // successfully (intermittent: only when the load lost the race to the
  // re-render).
  const mediapipeLoadingRef = useRef(false);
  // Bumped to re-trigger the load effect for a bounded retry after a transient
  // failure (replaces re-using `mediapipeLoading` as the re-trigger signal).
  const [mediapipeRetryTick, setMediapipeRetryTick] = useState(0);
  // `unsupportedEnvironment` is a permanent, one-shot signal: we know
  // MediaPipe cannot run here, so stop trying.
  const [unsupportedEnvironment, setUnsupportedEnvironment] = useState(false);
  // Bounded retry counter for transient init failures. Stored in a ref so
  // incrementing it does not trigger a re-render — it's only read inside the
  // load effect.
  const mediapipeInitAttemptsRef = useRef(0);
  // Dedup flag so we only report a given init failure to Sentry once per
  // wrapper instance, even if we end up retrying. Ref for the same reason.
  const mediapipeInitReportedRef = useRef(false);
  const [usingSelfieCapture, setUsingSelfieCapture] = useState(false);

  // Attempt to load Mediapipe (with a small bounded retry budget). If
  // Mediapipe is already ready, currently loading, the environment is
  // definitively unsupported, we've exhausted our retry budget, or we're
  // running under Cypress, skip the attempt. On transient failure we wait
  // (exponential backoff) before allowing the effect to re-run.
  useEffect(() => {
    if (
      mediapipeReady ||
      mediapipeLoadingRef.current ||
      unsupportedEnvironment ||
      mediapipeInitAttemptsRef.current >= MAX_MEDIAPIPE_INIT_ATTEMPTS ||
      isCypress
    )
      return undefined;

    let cancelled = false;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // Mark loading via the ref (effect guard) and the state (UI). The state is
    // intentionally NOT in this effect's deps — see `mediapipeLoadingRef`.
    mediapipeLoadingRef.current = true;
    setMediapipeLoading(true);

    const loadMediapipe = async () => {
      const attemptNumber = mediapipeInitAttemptsRef.current + 1;
      mediapipeInitAttemptsRef.current = attemptNumber;
      try {
        await getMediapipeInstance();
        if (cancelled) return;
        mediapipeLoadingRef.current = false;
        setMediapipeReady(true);
        setMediapipeLoading(false);
      } catch (error) {
        if (cancelled) return;
        mediapipeLoadingRef.current = false;
        // Loading failed; we'll fall back to the legacy selfie-capture component
        // after the loadingProgress reaches 100% (or sooner for definitively
        // unsupported environments — see below).
        console.error('Failed to load Mediapipe:', error);
        const isUnsupportedEnvironment =
          error instanceof UnsupportedMediapipeEnvironmentError;
        // Report to Sentry (when the host page has exposed it on window) so we
        // can observe how often users land on the fallback path and which
        // environments are affected. Dedup so retries don't flood Sentry.
        if (!mediapipeInitReportedRef.current) {
          mediapipeInitReportedRef.current = true;
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
          setLoadDeadlineExceeded(true);
          setMediapipeLoading(false);
          return;
        }
        // Transient failure: wait with exponential backoff before allowing the
        // effect to re-run by flipping mediapipeLoading back to false. If
        // we've exhausted our retry budget, just release the loading flag so
        // the countdown / fallback UI can proceed.
        const hasRetriesLeft = attemptNumber < MAX_MEDIAPIPE_INIT_ATTEMPTS;
        if (!hasRetriesLeft) {
          setMediapipeLoading(false);
          return;
        }
        const backoffMs =
          MEDIAPIPE_RETRY_BASE_DELAY_MS * 2 ** (attemptNumber - 1);
        retryTimeoutId = setTimeout(() => {
          retryTimeoutId = null;
          if (cancelled) return;
          setMediapipeLoading(false);
          // Re-trigger the effect for the next attempt via a dedicated counter
          // rather than toggling `mediapipeLoading` (which is no longer a dep).
          setMediapipeRetryTick((tick) => tick + 1);
        }, backoffMs);
      }
    };

    loadMediapipe();

    return () => {
      cancelled = true;
      mediapipeLoadingRef.current = false;
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
    // `mediapipeLoading` is deliberately excluded: it is set inside this effect,
    // so depending on it would re-run the effect and cancel the in-flight load.
  }, [mediapipeReady, unsupportedEnvironment, mediapipeRetryTick]);

  // Cosmetic loading progress: ticks 0→100 over `loadingTime` so the UI can
  // show "slow connection" copy past the SLOW_CONNECTION_THRESHOLD. This is
  // purely visual — it does NOT decide when we fall back. The decision is
  // driven by `loadDeadlineExceeded` below.
  useEffect(() => {
    if (hidden || !startCountdown || mediapipeReady) return undefined;

    const timer = setInterval(() => {
      setLoadingProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, loadingTime / 100);

    return () => {
      clearInterval(timer);
    };
    // `mediapipeRetryTick` restarts the cosmetic progress when the user taps
    // Retry (which resets `loadingProgress` to 0).
  }, [hidden, startCountdown, loadingTime, mediapipeReady, mediapipeRetryTick]);

  // Hard deadline: a single setTimeout that flips `loadDeadlineExceeded`
  // exactly once. This is the signal the render path uses to commit to the
  // fallback. Skipped when hidden, when Mediapipe is already ready, or under
  // Cypress (where the flag is pre-seeded to true).
  useEffect(() => {
    if (hidden || mediapipeReady || loadDeadlineExceeded || isCypress)
      return undefined;

    const id = setTimeout(() => {
      setLoadDeadlineExceeded(true);
    }, loadingTime);

    return () => clearTimeout(id);
  }, [hidden, mediapipeReady, loadDeadlineExceeded, loadingTime, isCypress]);

  // Latch the legacy fallback decision in an effect rather than during
  // render. Effects only run after commit, so by the time this runs, any
  // Mediapipe-ready update scheduled in the same batch as the deadline tick
  // will already be visible — closing the race where `setLoadDeadlineExceeded`
  // and `setMediapipeReady` fire in adjacent microtasks.
  useEffect(() => {
    if (hidden || usingSelfieCapture || mediapipeReady) return;
    if (!loadDeadlineExceeded) return;
    const legacyFallbackAllowed = allowLegacySelfieFallback || isCypress;
    if (!legacyFallbackAllowed) return;
    setUsingSelfieCapture(true);
  }, [
    hidden,
    usingSelfieCapture,
    mediapipeReady,
    loadDeadlineExceeded,
    allowLegacySelfieFallback,
    isCypress,
  ]);

  useEffect(() => {
    if (hidden || mediapipeReady || !loadDeadlineExceeded) return undefined;

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
  }, [hidden, mediapipeReady, loadDeadlineExceeded]);

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

  // Retry from the failure screen: clear the give-up state and re-arm the load
  // effect, deadline, and cosmetic progress so we make a fresh attempt. We reset
  // `unsupportedEnvironment` so a genuinely unsupported device fails fast again
  // (rather than spinning for the full deadline) instead of being permanently
  // latched off.
  const handleRetry = () => {
    mediapipeInitAttemptsRef.current = 0;
    mediapipeInitReportedRef.current = false;
    mediapipeLoadingRef.current = false;
    setUnsupportedEnvironment(false);
    setLoadDeadlineExceeded(false);
    setLoadingProgress(0);
    setMediapipeRetryTick((tick) => tick + 1);
  };

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

  // Legacy capture is mounted only once the latch effect has set
  // `usingSelfieCapture`. The effect re-checks `mediapipeReady` after commit,
  // so if Mediapipe became ready in the same batch as the deadline tick, the
  // latch is skipped and the SmartSelfie branch above wins. While we're
  // waiting for the effect to fire (a single microtask), keep showing the
  // spinner instead of flashing legacy.
  if (usingSelfieCapture) {
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

  // Hard deadline elapsed and legacy fallback isn't allowed: show an actionable
  // error. The network is usually fine here (the hold-up is on-device setup), so
  // only blame the connection when the browser actually reports being offline —
  // otherwise frame it as a setup problem. Always offer a Retry control.
  if (loadDeadlineExceeded && !(allowLegacySelfieFallback || isCypress)) {
    const isOffline =
      typeof navigator !== 'undefined' && navigator.onLine === false;
    const errorKey = isOffline
      ? 'selfie.capture.loading.offlineError'
      : 'selfie.capture.loading.setupError';
    const themeColor = (props as Record<string, string>)['theme-color'];

    return (
      <div style={{ textAlign: 'center', marginTop: '20%', padding: '0 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>
          {translate(errorKey)}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          style={{
            marginTop: '16px',
            padding: '0.75rem 1.5rem',
            borderRadius: '2.5rem',
            border: 'none',
            backgroundColor: themeColor || '#001096',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {translate('selfie.capture.loading.retry')}
        </button>
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
