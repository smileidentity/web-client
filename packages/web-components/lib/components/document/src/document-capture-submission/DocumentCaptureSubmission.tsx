import { useState, useEffect, useRef } from 'preact/hooks';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { t } from '../../../../domain/localisation';

import '../../../attribution/PoweredBySmileId';
import '../../../navigation/src';

export type SubmissionState = 'submitting' | 'success' | 'error';

interface Props {
  'theme-color'?: string;
  'hide-attribution'?: string | boolean;
  /** When set, render the close affordance (smileid-navigation). */
  'show-navigation'?: string | boolean;
  /** Captured document data URI shown behind the status card. */
  'image-src'?: string;
  /** Initial submission state. Can be overridden at runtime via attribute or event. */
  'submission-state'?: SubmissionState;
  /** Optional supporting copy under the title (e.g. failure reason). */
  'submission-message'?: string;
}

// ── Status overlays (match the Enhanced SmartSelfie visual language) ─────────

function Spinner() {
  return (
    <div class="doc-submit-overlay" aria-hidden="true">
      <svg
        class="doc-submit-spinner-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
      >
        <g clip-path="url(#doc-submit-loader-clip)">
          <foreignObject
            x="-1031.25"
            y="-1031.25"
            width="2062.5"
            height="2062.5"
            transform="matrix(0.032 0 0 0.032 32 32)"
          >
            <div
              {...{ xmlns: 'http://www.w3.org/1999/xhtml' }}
              style="background:conic-gradient(from 90deg,rgba(39,174,96,0) 0deg,rgba(58,225,128,0) 0.036deg,rgba(58,225,128,1) 360deg);height:100%;width:100%;opacity:1"
            />
          </foreignObject>
        </g>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M60.751 25.6018C62.2117 25.4134 63.5486 26.4447 63.737 27.9053C63.9122 29.2632 64 30.6309 64 31.9999C64 33.4727 62.8061 34.6666 61.3334 34.6666C59.8606 34.6666 58.6667 33.4727 58.6667 31.9999C58.6667 30.859 58.5935 29.7193 58.4475 28.5878C58.2591 27.1271 59.2904 25.7903 60.751 25.6018Z"
          fill="#2CC05C"
        />
        <defs>
          <clipPath id="doc-submit-loader-clip">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64ZM32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33333 32 5.33333C17.2724 5.33333 5.33333 17.2724 5.33333 32C5.33333 46.7276 17.2724 58.6667 32 58.6667Z"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function TickBadge() {
  return (
    <div class="doc-submit-overlay" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
      >
        <rect width="64" height="64" rx="32" fill="#2CC05C" />
        <path
          d="M27.1566 42.6663C26.4724 42.6663 25.7882 42.4088 25.2481 41.8568L19.4503 35.9324C18.9481 35.4131 18.6664 34.7123 18.6664 33.9821C18.6664 33.252 18.9481 32.5512 19.4503 32.0319C20.4946 30.9647 22.2232 30.9647 23.2675 32.0319L27.1566 36.006L40.7327 22.1334C41.777 21.0662 43.5055 21.0662 44.5498 22.1334C45.5941 23.2005 45.5941 24.9668 44.5498 26.0339L29.0652 41.8568C28.525 42.4088 27.8408 42.6663 27.1566 42.6663Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

function CrossBadge() {
  return (
    <div class="doc-submit-overlay" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
      >
        <rect width="64" height="64" rx="32" fill="#EC221F" />
        <path
          d="M36.1146 31.9953L45.0425 22.6828C46.1682 21.5086 46.1682 19.5651 45.0425 18.3909C44.4947 17.8261 43.7555 17.5094 42.9852 17.5094C42.215 17.5094 41.4758 17.8261 40.9279 18.3909L32 27.7035L23.0721 18.3909C22.5242 17.8261 21.785 17.5094 21.0148 17.5094C20.2445 17.5094 19.5053 17.8261 18.9575 18.3909C17.8318 19.5651 17.8318 21.5086 18.9575 22.6828L27.8854 31.9953L18.9575 41.3079C17.8318 42.4821 17.8318 44.4256 18.9575 45.5998C19.5397 46.2071 20.2773 46.4906 21.0148 46.4906C21.7523 46.4906 22.4898 46.2071 23.0721 45.5998L32 36.2872L40.9279 45.5998C41.5102 46.2071 42.2477 46.4906 42.9852 46.4906C43.7227 46.4906 44.4603 46.2071 45.0425 45.5998C46.1682 44.4256 46.1682 42.4821 45.0425 41.3079L36.1146 31.9953Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

/**
 * `<document-capture-submission>` — standalone post-capture submission UI for
 * document flows where the host takes the captured image, uploads it, and
 * wants to show submitting / success / failure cards in our visual language.
 *
 * Mirrors `<enhanced-smart-selfie-submission>`: the host knows the upload
 * outcome and drives this element accordingly.
 *
 * Drive it via either:
 *   - attribute updates: `submission-state="submitting|success|error"`,
 *     `submission-message`
 *   - or window events: `document-capture-submission.set-state`
 *       detail: { state, message? }
 *
 * Emits:
 *   - `document-capture-submission.continue` (detail: { success }) when the
 *     submission resolves (success or error). Hosts can listen to navigate on.
 */
const DocumentCaptureSubmission: FunctionComponent<Props> = ({
  'theme-color': themeColor = '#001096',
  'hide-attribution': hideAttributionProp = false,
  'show-navigation': showNavigationProp = false,
  'image-src': imageSrc = '',
  'submission-state': submissionStateProp = 'submitting',
  'submission-message': submissionMessage,
}) => {
  const hideAttribution = getBoolProp(hideAttributionProp);
  const showNavigation = getBoolProp(showNavigationProp);
  const navRef = useRef<HTMLElement | null>(null);

  const [state, setState] = useState<SubmissionState>(submissionStateProp);
  const [message, setMessage] = useState<string | undefined>(submissionMessage);

  // Bridge the navigation web component's `navigation.close` (which fires on
  // the element, not bubbling) out to a window event the host can act on.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return undefined;
    const onClose = () => {
      window.dispatchEvent(
        new CustomEvent('document-capture-submission.close'),
      );
    };
    el.addEventListener('navigation.close', onClose);
    return () => el.removeEventListener('navigation.close', onClose);
  }, [showNavigation, state]);

  // Sync attribute changes from the host through to local state so partners
  // can update the card by setAttribute alone (no event required).
  useEffect(() => {
    setState(submissionStateProp);
  }, [submissionStateProp]);
  useEffect(() => {
    setMessage(submissionMessage);
  }, [submissionMessage]);

  // Event-driven path: avoids partners having to reach into the shadow DOM
  // to flip attributes. Detail mirrors the attribute names.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{
        state?: SubmissionState;
        message?: string;
      }>;
      if (ce.detail?.state) setState(ce.detail.state);
      if (ce.detail?.message !== undefined) setMessage(ce.detail.message);
    };
    window.addEventListener('document-capture-submission.set-state', handler);
    return () => {
      window.removeEventListener(
        'document-capture-submission.set-state',
        handler,
      );
    };
  }, []);

  // Emit a resolution event when submission settles so hosts can navigate on.
  // Skip the initial mount so a host that renders the element already in a
  // resolved state (e.g. submission-state="success") doesn't get a spurious
  // `.continue` before any real upload — only transitions into a resolved
  // state should fire it.
  const isResolved = state === 'success' || state === 'error';
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!isResolved) return;
    window.dispatchEvent(
      new CustomEvent('document-capture-submission.continue', {
        detail: { success: state === 'success' },
      }),
    );
  }, [isResolved, state]);

  const isSubmitting = state === 'submitting';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  let title = '';
  let body = '';
  if (isSubmitting) {
    title = t('document.submission.submitting.title');
    body = t('document.submission.submitting.body');
  } else if (isSuccess) {
    // Success shows only the title (matches the design). Never surface a
    // leftover `submission-message` from a prior error state.
    title = t('document.submission.success.title');
    body = '';
  } else {
    title = t('document.submission.error.title');
    body = message || '';
  }

  return (
    <div class="doc-submit-root">
      {showNavigation && (
        <div class="doc-submit-nav">
          {/* @ts-expect-error preact-custom-element types */}
          <smileid-navigation
            ref={navRef}
            theme-color={themeColor}
            show-navigation
            hide-back
          />
        </div>
      )}
      <div class="doc-submit-image-area">
        <div class="doc-submit-image-wrap">
          {imageSrc && (
            <img
              class={`doc-submit-image ${isSubmitting ? 'is-dimmed' : ''}`}
              src={imageSrc}
              alt={t('document.submission.imageAlt')}
            />
          )}
          {isSubmitting && <Spinner />}
          {isSuccess && <TickBadge />}
          {isError && <CrossBadge />}
        </div>
      </div>

      <div class="doc-submit-footer">
        <div class="doc-submit-card">
          <h1 class="doc-submit-title" style={{ color: themeColor }}>
            {title}
          </h1>
          {isSubmitting ? (
            <p class="doc-submit-body">
              {body.split('\n').map((line, i, arr) => (
                <>
                  {line}
                  {i < arr.length - 1 && <br />}
                </>
              ))}
            </p>
          ) : (
            body && <p class="doc-submit-body">{body}</p>
          )}
        </div>

        {!hideAttribution && (
          <div class="doc-submit-attribution">
            {/* @ts-expect-error preact-custom-element types */}
            <powered-by-smile-id />
          </div>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; width: 100%; height: 100%; }

        .doc-submit-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-height: 100%;
          position: relative;
          overflow: hidden;
        }

        .doc-submit-nav {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          z-index: 10;
        }

        .doc-submit-image-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 72px 24px 16px;
          min-height: 0;
        }

        .doc-submit-image-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: 100%;
        }

        .doc-submit-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          border-radius: 12px;
          display: block;
          object-fit: contain;
          transition: filter 0.2s ease;
        }

        .doc-submit-image.is-dimmed {
          filter: brightness(0.55);
        }

        /* Centered status overlay (spinner / tick / cross) */
        .doc-submit-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doc-submit-spinner-svg {
          animation: doc-submit-spin 1s linear infinite;
          transform-origin: center;
        }

        @keyframes doc-submit-spin {
          to { transform: rotate(360deg); }
        }

        .doc-submit-footer {
          padding: 0 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .doc-submit-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08),
            0px 4px 6px -2px rgba(16, 24, 40, 0.03);
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .doc-submit-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .doc-submit-body {
          margin: 0;
          font-size: 0.8125rem;
          font-weight: 400;
          line-height: 1.35;
          color: #5b6b7b;
        }

        .doc-submit-attribution {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .doc-submit-image-area { padding-top: 80px; }
        }
      `}</style>
    </div>
  );
};

if (
  typeof customElements !== 'undefined' &&
  !customElements.get('document-capture-submission')
) {
  register(
    DocumentCaptureSubmission,
    'document-capture-submission',
    [
      'theme-color',
      'hide-attribution',
      'show-navigation',
      'image-src',
      'submission-state',
      'submission-message',
    ],
    { shadow: true },
  );
}

export default DocumentCaptureSubmission;
