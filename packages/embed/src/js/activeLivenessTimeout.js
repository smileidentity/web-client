/**
 * Hosted Web Active Liveness inactivity timeout.
 *
 * When Enhanced SmartSelfie (`use_strict_mode: true`) is enabled, partners
 * expect the session to terminate if the user stops making progress on the
 * ESS capture screen for 120s (no pose completions). The timer is purely an
 * inactivity guard — every progress event resets it, so a user actively
 * working through the pose sequence is never penalised.
 *
 * On expiry this module:
 *   1. Tags the metadata payload with a forced-failure reason
 *      (key: `failure_reason`, value: `active_liveness_timed_out`) for
 *      parity with the mobile SDKs.
 *   2. Cancels the smart-camera-web component via its public cancelled event,
 *      which lets each product script run its existing close/error path
 *      without duplicating logic.
 *
 * Wiring: each hosted-web product script calls `installActiveLivenessTimeout`
 * once after the SmartCameraWeb element is configured. The timer arms itself
 * when capture starts, resets on each pose-progress event, and disarms on
 * publish/close/cancelled.
 */
import { addMetadataEntry } from './metadata';

export const ACTIVE_LIVENESS_TIMEOUT_MS = 120_000;
export const ACTIVE_LIVENESS_TIMEOUT_REASON = 'active_liveness_timed_out';

const dispatchTimeout = (smartCameraWeb) => {
  addMetadataEntry('failure_reason', ACTIVE_LIVENESS_TIMEOUT_REASON);
  // ESS owns the post-timeout UX: it packages whatever frames have been
  // captured so far, dispatches them through the normal publish pipeline so
  // the host posts the job to the backend (tagged with the failure reason
  // via metadata above), and immediately switches the user to the
  // submitting / error view. The host script then dispatches
  // `enhanced-smartselfie.submission-state: error` once the backend
  // responds.
  window.dispatchEvent(
    new CustomEvent('enhanced-smartselfie.force-fail', {
      detail: { reason: ACTIVE_LIVENESS_TIMEOUT_REASON },
    }),
  );
  // Also forward to the smart-camera-web element so any product-script
  // observers can react if needed (e.g. analytics). The event itself does
  // not close the iframe \u2014 that only happens after the user dismisses the
  // ESS error view.
  smartCameraWeb?.dispatchEvent(
    new CustomEvent('metadata.active-liveness-timeout', {
      detail: { reason: ACTIVE_LIVENESS_TIMEOUT_REASON },
    }),
  );
};

/**
 * Install the timeout hooks on a smart-camera-web element. The timer is armed
 * when `metadata.selfie-capture-start` fires and disarmed on terminal events.
 * Returns a teardown function for tests / cleanup.
 *
 * No-op when `enabled` is false (i.e. strict mode disabled), so callers don't
 * need to branch.
 */
export const installActiveLivenessTimeout = (
  smartCameraWeb,
  { enabled, ms = ACTIVE_LIVENESS_TIMEOUT_MS } = {},
) => {
  if (!enabled || !smartCameraWeb) return () => {};

  let timerId = null;

  const clear = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const arm = () => {
    clear();
    timerId = setTimeout(() => {
      timerId = null;
      dispatchTimeout(smartCameraWeb);
    }, ms);
  };

  smartCameraWeb.addEventListener('metadata.selfie-capture-start', arm);
  // Reset on progress — pose completions count as activity, so a user
  // working through the sequence is never killed mid-flow.
  smartCameraWeb.addEventListener('metadata.active-liveness-progress', arm);
  smartCameraWeb.addEventListener('smart-camera-web.publish', clear);
  smartCameraWeb.addEventListener('smart-camera-web.close', clear);
  smartCameraWeb.addEventListener('smart-camera-web.cancelled', clear);

  return () => {
    clear();
    smartCameraWeb.removeEventListener('metadata.selfie-capture-start', arm);
    smartCameraWeb.removeEventListener(
      'metadata.active-liveness-progress',
      arm,
    );
    smartCameraWeb.removeEventListener('smart-camera-web.publish', clear);
    smartCameraWeb.removeEventListener('smart-camera-web.close', clear);
    smartCameraWeb.removeEventListener('smart-camera-web.cancelled', clear);
  };
};
