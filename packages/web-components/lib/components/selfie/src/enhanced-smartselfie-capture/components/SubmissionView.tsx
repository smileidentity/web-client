import type { FunctionComponent } from 'preact';
import { t } from '../../../../../domain/localisation';

export type SubmissionViewMode = 'review' | 'submitting' | 'success' | 'error';

interface SubmissionViewProps {
  imageSrc: string;
  mirror: boolean;
  themeColor: string;
  hideAttribution: boolean;
  mode: SubmissionViewMode;
  /** Optional supporting copy under the title (e.g. failure reason). */
  message?: string;
  onConfirm?: () => void;
  onRetake?: () => void;
  onContinue?: () => void;
  onExit?: () => void;
  onBack?: () => void;
}

const TickIcon: FunctionComponent = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="32" fill="#2CC05C" />
    <path
      d="M27.1566 42.6663C26.4724 42.6663 25.7882 42.4088 25.2481 41.8568L19.4503 35.9324C18.9481 35.4131 18.6664 34.7123 18.6664 33.9821C18.6664 33.252 18.9481 32.5512 19.4503 32.0319C20.4946 30.9647 22.2232 30.9647 23.2675 32.0319L27.1566 36.006L40.7327 22.1334C41.777 21.0662 43.5055 21.0662 44.5498 22.1334C45.5941 23.2005 45.5941 24.9668 44.5498 26.0339L29.0652 41.8568C28.525 42.4088 27.8408 42.6663 27.1566 42.6663Z"
      fill="white"
    />
  </svg>
);

const CrossIcon: FunctionComponent = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="32" fill="#EC221F" />
    <path
      d="M36.1146 31.9953L45.0425 22.6828C46.1682 21.5086 46.1682 19.5651 45.0425 18.3909C44.4947 17.8261 43.7555 17.5094 42.9852 17.5094C42.215 17.5094 41.4758 17.8261 40.9279 18.3909L32 27.7035L23.0721 18.3909C22.5242 17.8261 21.785 17.5094 21.0148 17.5094C20.2445 17.5094 19.5053 17.8261 18.9575 18.3909C17.8318 19.5651 17.8318 21.5086 18.9575 22.6828L27.8854 31.9953L18.9575 41.3079C17.8318 42.4821 17.8318 44.4256 18.9575 45.5998C19.5397 46.2071 20.2773 46.4906 21.0148 46.4906C21.7523 46.4906 22.4898 46.2071 23.0721 45.5998L32 36.2872L40.9279 45.5998C41.5102 46.2071 42.2477 46.4906 42.9852 46.4906C43.7227 46.4906 44.4603 46.2071 45.0425 45.5998C46.1682 44.4256 46.1682 42.4821 45.0425 41.3079L36.1146 31.9953Z"
      fill="white"
    />
  </svg>
);

export const SubmissionView: FunctionComponent<SubmissionViewProps> = ({
  imageSrc,
  mirror,
  themeColor,
  hideAttribution,
  mode,
  message,
  onConfirm,
  onRetake,
  onContinue,
  onExit,
}) => {
  const isReview = mode === 'review';
  const isSubmitting = mode === 'submitting';
  const isSuccess = mode === 'success';
  const isError = mode === 'error';

  let title = '';
  let body = '';
  if (isReview) {
    title = t('selfie.ess.submission.review.title');
    body = t('selfie.ess.submission.review.body');
  } else if (isSubmitting) {
    title = t('selfie.ess.submission.submitting.title');
  } else if (isSuccess) {
    title = t('selfie.ess.submission.success.title');
    body = message || t('selfie.ess.submission.success.body');
  } else {
    title = t('selfie.ess.submission.error.title');
    body = message || '';
  }

  return (
    <div className="enhanced-submission">
      <div className="submission-oval">
        <img
          src={imageSrc}
          alt={t('selfie.ess.submission.imageAlt')}
          style={mirror ? { transform: 'scaleX(-1)' } : undefined}
        />
        {isSubmitting && (
          <div className="spinner" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
            >
              <g clip-path="url(#ess-submit-loader-clip)">
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
                <clipPath id="ess-submit-loader-clip">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64ZM32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33333 32 5.33333C17.2724 5.33333 5.33333 17.2724 5.33333 32C5.33333 46.7276 17.2724 58.6667 32 58.6667Z"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
        )}
        {(isSuccess || isError) && (
          <div
            className={`badge ${isSuccess ? 'badge-success' : 'badge-error'}`}
          >
            {isSuccess ? <TickIcon /> : <CrossIcon />}
          </div>
        )}
      </div>

      <div className="submission-card">
        <h2 style={{ color: themeColor }}>{title}</h2>
        {isSubmitting ? (
          <p>
            {t('selfie.ess.submission.submitting.body')
              .split('\n')
              .map((line, i, arr) => (
                <>
                  {line}
                  {i < arr.length - 1 && <br />}
                </>
              ))}
          </p>
        ) : (
          body && <p>{body}</p>
        )}

        {isReview && (
          <div className="actions">
            <button
              type="button"
              className="retake"
              onClick={onRetake}
              aria-label={t('selfie.ess.submission.review.retake')}
            >
              <span className="icon">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#90A1B9"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </span>
              <span className="label">
                {t('selfie.ess.submission.review.retake')}
              </span>
            </button>
            <button
              type="button"
              className="confirm"
              onClick={onConfirm}
              aria-label={t('selfie.ess.submission.review.confirm')}
            >
              <span className="icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#12B76A"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="label confirm-label">
                {t('selfie.ess.submission.review.confirm')}
              </span>
            </button>
          </div>
        )}

        {(isSuccess || isError) && (
          <button
            type="button"
            className="primary"
            style={{ background: themeColor }}
            onClick={onContinue}
          >
            {t('selfie.ess.submission.continue')}
          </button>
        )}

        {isError && onExit && (
          <button
            type="button"
            className="secondary"
            style={{ color: themeColor, borderColor: themeColor }}
            onClick={onExit}
          >
            {t('selfie.ess.submission.exit')}
          </button>
        )}
      </div>

      {!hideAttribution && (
        // @ts-expect-error preact-custom-element types
        <powered-by-smile-id />
      )}

      <style>{`
        :host { display: block; height: 100%; }
        .enhanced-submission {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          overflow: hidden;
          padding: 1rem clamp(1rem, 4vw, 1.5rem) clamp(1rem, 3dvh, 1.5rem);
          background: #F8FAFC;
          font-family: "DM Sans", system-ui, sans-serif;
          box-sizing: border-box;
        }
        .enhanced-submission > powered-by-smile-id {
          display: block;
          width: 100%;
          margin-top: auto;
          padding: 0;
          background: #F8FAFC;
          flex-shrink: 0;
        }
        .submission-oval {
          position: relative;
          width: clamp(180px, 36dvh, 260px);
          max-width: 80%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 50%;
          margin: clamp(0.5rem, 1.5dvh, 1rem) auto;
          background: #ddd;
          flex-shrink: 0;
        }
        .submission-oval img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .submission-oval .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ess-submit-spin 1.1s linear infinite;
        }
        @keyframes ess-submit-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        }
        .badge-success { background: #12B76A; }
        .badge-error   { background: #E5484D; }

        .submission-card {
          width: 327px;
          max-width: 100%;
          min-height: 204px;
          margin-top: clamp(0.75rem, 2.5dvh, 1.25rem);
          padding: 16px 16px 20px;
          border-radius: 16px;
          border: 1px solid #F1F5F9;
          background: #FFF;
          box-shadow: 0 -12px 48px 0 rgba(0, 0, 0, 0.06);
          text-align: center;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          gap: 8px;
        }
        .submission-card h2 {
          margin: 0;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 20px;
          font-style: normal;
          font-weight: 800;
          line-height: 25.5px;
          letter-spacing: -0.425px;
          text-align: center;
        }
        .submission-card p {
          margin: 0;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: 1.4;
          text-align: center;
          color: #62748E;
        }
        .submission-card h2 + p {
          margin-top: -4px;
        }
        .actions {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-top: 4px;
        }
        .actions button {
          width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }
        .actions .icon {
          display: flex;
          width: 80px;
          height: 80px;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          border-radius: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10);
          transition: transform 120ms ease, background 120ms ease;
        }
        .actions button:active .icon { transform: scale(0.96); }
        .actions .retake .icon {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }
        .actions .confirm .icon {
          background: rgba(4, 176, 74, 0.10);
          border: 1px solid rgba(4, 176, 74, 0.30);
        }
        .actions .label {
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 10px;
          font-style: normal;
          font-weight: 700;
          line-height: 15px;
          text-transform: capitalize;
          text-align: center;
          color: #90A1B9;
        }
        .actions .confirm-label {
          color: #12B76A;
        }

        .primary,
        .secondary {
          margin: 8px 0 0;
          height: 48px;
          padding: 10px 16px;
          border-radius: 2.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-sizing: border-box;
          width: 100%;
        }
        .primary {
          color: white;
          border: none;
        }
        .secondary {
          background: transparent;
          border: 1.5px solid;
        }
      `}</style>
    </div>
  );
};

export default SubmissionView;
