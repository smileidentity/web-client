import { useState, useEffect } from 'preact/hooks';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { t } from '../../../../domain/localisation';
import {
  SubmissionView,
  type SubmissionViewMode,
} from './components/SubmissionView';

import '../../../attribution/PoweredBySmileId';

interface Props {
  'theme-color'?: string;
  'hide-attribution'?: string | boolean;
  /** Captured selfie data URI shown inside the oval. */
  'image-src'?: string;
  /** When true, the image is mirrored (user-facing camera). */
  mirror?: string | boolean;
  /** Initial submission state. Can be overridden at runtime via attribute or event. */
  'submission-state'?: SubmissionViewMode;
  /** Optional supporting copy under the title. */
  'submission-message'?: string;
  /**
   * When set, the failure card uses a localised reason message instead of
   * the supplied submission-message. Currently the only recognised value is
   * `active_liveness_timed_out`.
   */
  'failure-reason'?: string;
}

/**
 * Convert an internal forced-failure reason code into the message we render
 * under the "Submission Failed" title. Returns `undefined` for unknown
 * reasons so callers can fall back to whatever the host supplied.
 */
const failureReasonToMessage = (
  reason: string | undefined,
): string | undefined => {
  switch (reason) {
    case 'active_liveness_timed_out':
      return t('selfie.ess.failure.sessionTimedOut');
    default:
      return undefined;
  }
};

/**
 * Standalone post-capture submission UI for Enhanced SmartSelfie flows
 * where the partner takes the captured selfie, uploads it, and wants to
 * show submitting / success / failure cards in our visual language.
 *
 * Used today by SmartSelfie Auth, where the host script knows the upload
 * outcome and drives this element accordingly. KYC / DV / EDV products
 * skip it entirely and route the user into their next form step.
 *
 * Drive it via either:
 *   - attribute updates: `submission-state="submitting|success|error"`,
 *     `submission-message`, `failure-reason`
 *   - or window events:
 *     `enhanced-smart-selfie-submission.set-state`
 *       detail: { state, message?, failureReason? }
 *
 * Emits:
 *   - `enhanced-smart-selfie-submission.continue` (detail: { success })
 *     when the user taps Continue on the success/error card.
 *   - `enhanced-smart-selfie-submission.exit` when the user taps Exit on
 *     the failure card.
 */
const EnhancedSmartSelfieSubmission: FunctionComponent<Props> = ({
  'theme-color': themeColor = '#001096',
  'hide-attribution': hideAttributionProp = false,
  'image-src': imageSrc = '',
  mirror: mirrorProp = false,
  'submission-state': submissionStateProp = 'submitting',
  'submission-message': submissionMessage,
  'failure-reason': failureReason,
}) => {
  const hideAttribution = getBoolProp(hideAttributionProp);
  const mirror = getBoolProp(mirrorProp);

  const [state, setState] = useState<SubmissionViewMode>(submissionStateProp);
  const [message, setMessage] = useState<string | undefined>(submissionMessage);
  const [reason, setReason] = useState<string | undefined>(failureReason);

  // Sync attribute changes from the host through to local state so partners
  // can update the card by setAttribute alone (no event required).
  useEffect(() => {
    setState(submissionStateProp);
  }, [submissionStateProp]);
  useEffect(() => {
    setMessage(submissionMessage);
  }, [submissionMessage]);
  useEffect(() => {
    setReason(failureReason);
  }, [failureReason]);

  // Event-driven path: avoids partners having to reach into the shadow DOM
  // to flip attributes. Detail mirrors the attribute names.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{
        state?: SubmissionViewMode;
        message?: string;
        failureReason?: string;
      }>;
      if (ce.detail?.state) setState(ce.detail.state);
      if (ce.detail?.message !== undefined) setMessage(ce.detail.message);
      if (ce.detail?.failureReason !== undefined) {
        setReason(ce.detail.failureReason);
      }
    };
    window.addEventListener(
      'enhanced-smart-selfie-submission.set-state',
      handler,
    );
    return () => {
      window.removeEventListener(
        'enhanced-smart-selfie-submission.set-state',
        handler,
      );
    };
  }, []);

  const success = state === 'success';
  const isResolved = success || state === 'error';
  const resolvedMessage = !success
    ? (failureReasonToMessage(reason) ?? message)
    : message;

  return (
    <SubmissionView
      imageSrc={imageSrc}
      mirror={mirror}
      themeColor={themeColor}
      hideAttribution={hideAttribution}
      mode={state}
      message={resolvedMessage}
      onContinue={
        isResolved
          ? () => {
              window.dispatchEvent(
                new CustomEvent('enhanced-smart-selfie-submission.continue', {
                  detail: { success },
                }),
              );
            }
          : undefined
      }
      onExit={
        state === 'error'
          ? () => {
              window.dispatchEvent(
                new CustomEvent('enhanced-smart-selfie-submission.exit'),
              );
            }
          : undefined
      }
    />
  );
};

if (!customElements.get('enhanced-smart-selfie-submission')) {
  register(
    EnhancedSmartSelfieSubmission,
    'enhanced-smart-selfie-submission',
    [
      'theme-color',
      'hide-attribution',
      'image-src',
      'mirror',
      'submission-state',
      'submission-message',
      'failure-reason',
    ],
    { shadow: true },
  );
}

export default EnhancedSmartSelfieSubmission;
