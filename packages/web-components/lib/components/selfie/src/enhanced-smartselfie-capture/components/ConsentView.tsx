import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { t } from '../../../../../domain/localisation';
import {
  SmileIdLogo,
  CheckIcon,
  ChevronDownIcon,
} from '../assets/illustrations';

// Icon URLs — Vite resolves these to URL strings via the `*.svg` ambient
// module declaration in lib/types.d.ts.
// eslint-disable-next-line import/no-unresolved
import phoneIcon from '../assets/phone.svg';
// eslint-disable-next-line import/no-unresolved
import personIcon from '../assets/person.svg';
// eslint-disable-next-line import/no-unresolved
import idCardIcon from '../assets/id-card.svg';
// eslint-disable-next-line import/no-unresolved
import deviceIcon from '../assets/device.svg';

interface ConsentViewProps {
  themeColor: string;
  hideAttribution: boolean;
  partnerName?: string;
  partnerLogo?: string;
  policyUrl?: string;
  onGranted: () => void;
  onDenied: () => void;
}

const ITEMS: { icon: string; key: string }[] = [
  { icon: phoneIcon, key: 'selfie.ess.consent.items.contact' },
  { icon: personIcon, key: 'selfie.ess.consent.items.personal' },
  { icon: idCardIcon, key: 'selfie.ess.consent.items.biometric' },
  { icon: deviceIcon, key: 'selfie.ess.consent.items.device' },
];

/**
 * Returns the input only if it is a syntactically valid absolute URL whose
 * protocol is `http:` or `https:`. Anything else (including `javascript:`,
 * `data:`, malformed strings, or non-strings) is rejected. This prevents a
 * malicious partner config from injecting an XSS vector through props that
 * are rendered as `href`/`src`.
 */
const safeHttpUrl = (value?: string): string | undefined => {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    /* fall through */
  }
  return undefined;
};

/**
 * Strict-mode consent screen rendered as the first step of the Enhanced
 * SmartSelfie flow. Purpose-built for ESS and intentionally separate from the
 * legacy `<end-user-consent>` element used by KYC products — modifying that
 * element would change behaviour for every other product.
 */
export const ConsentView: FunctionComponent<ConsentViewProps> = ({
  themeColor,
  hideAttribution,
  partnerName,
  partnerLogo,
  policyUrl,
  onGranted,
  onDenied,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const partner = partnerName;
  const safePolicyUrl = safeHttpUrl(policyUrl);
  const safePartnerLogo = safeHttpUrl(partnerLogo);

  return (
    <div className="ess-consent">
      <div className="logos">
        {safePartnerLogo && (
          <img className="partner-logo" src={safePartnerLogo} alt={partner} />
        )}
        <div className="smile-logo" aria-hidden="true">
          <SmileIdLogo />
        </div>
      </div>

      <h1 className="title">
        {partner} {t('selfie.ess.consent.titleSuffix')}{' '}
        <span style={{ whiteSpace: 'nowrap' }}>Smile ID.</span>
      </h1>

      <p className="body">
        {t('selfie.ess.consent.bodyPrefix')}
        <strong>Smile ID</strong>
        {t('selfie.ess.consent.bodyMiddle')}
        <strong>{partner}</strong>
        {t('selfie.ess.consent.bodySuffix')}
      </p>

      <ul className="items">
        {ITEMS.map((it) => (
          <li key={it.key}>
            <img src={it.icon} alt="" aria-hidden="true" />
            <span>{t(it.key)}</span>
          </li>
        ))}
      </ul>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted((e.target as HTMLInputElement).checked)}
        />
        <span className="box" aria-hidden="true">
          <CheckIcon />
        </span>
        <span className="copy">{t('selfie.ess.consent.consentCheckbox')}</span>
      </label>

      <button
        type="button"
        className="learn-more"
        onClick={() => setLearnMoreOpen((v) => !v)}
        aria-expanded={learnMoreOpen}
      >
        <span className="chevron" data-open={learnMoreOpen} aria-hidden="true">
          <ChevronDownIcon />
        </span>
        <span>{t('selfie.ess.consent.learnMore')}</span>
      </button>

      {learnMoreOpen && (
        <p className="learn-more-copy">
          {t('selfie.ess.consent.learnMoreBodyPrefix')}
          <strong>Smile ID</strong>
          {t('selfie.ess.consent.learnMoreBodyAnd')}
          <strong>{partner}</strong>
          {t('selfie.ess.consent.learnMoreBodySuffix')}
          <br />
          {t('selfie.ess.consent.learnMoreShare')}
          <br />
          {t('selfie.ess.consent.learnMoreRightsPrefix')}{' '}
          <a
            href="https://dsar.usesmileid.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: themeColor }}
          >
            {t('selfie.ess.consent.dsarLink')}
          </a>{' '}
          {t('selfie.ess.consent.learnMoreRightsMiddle')}{' '}
          <a
            href="https://usesmileid.com/legal/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: themeColor }}
          >
            Smile ID
          </a>
          {safePolicyUrl ? (
            <>
              {' '}
              {t('selfie.ess.consent.partnerPrivacyTailLinked')}{' '}
              <a
                href={safePolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: themeColor }}
              >
                {partner}
              </a>{' '}
              {t('selfie.ess.consent.partnerPrivacyTailEnd')}
            </>
          ) : (
            <>
              {' '}
              {t('selfie.ess.consent.partnerPrivacyTailLinked')}{' '}
              <strong>{partner}</strong>{' '}
              {t('selfie.ess.consent.partnerPrivacyTailEnd')}
            </>
          )}
        </p>
      )}

      <div className="actions">
        <button
          type="button"
          className="allow"
          style={{ background: themeColor, borderColor: themeColor }}
          disabled={!accepted}
          onClick={onGranted}
        >
          {t('selfie.ess.consent.allow')}
        </button>
        <button
          type="button"
          className="deny"
          style={{ color: themeColor, borderColor: themeColor }}
          onClick={onDenied}
        >
          {t('selfie.ess.consent.deny')}
        </button>
      </div>

      {!hideAttribution && (
        // @ts-expect-error preact-custom-element types
        <powered-by-smile-id />
      )}

      <style>{`
        :host { display: block; height: 100%; }
        .ess-consent {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          padding: clamp(0.75rem, 2.5dvh, 1.5rem) clamp(1rem, 4vw, 1.25rem) clamp(0.5rem, 1.5dvh, 0.5rem);
          font-family: "DM Sans", system-ui, sans-serif;
          background: #F5F7FA;
          color: #1A1A1A;
          box-sizing: border-box;
        }
        .ess-consent > powered-by-smile-id {
          display: block;
          width: 100%;
          padding-top: clamp(0.5rem, 1.5dvh, 1rem);
          background: #F5F7FA;
          flex-shrink: 0;
        }
        .logos {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: clamp(0.5rem, 1.5dvh, 1.25rem);
          margin-bottom: clamp(0.75rem, 2.25dvh, 1.75rem);
          flex-shrink: 0;
        }
        .partner-logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          background: #F9F0E7CC;
          border: 2px solid #F9F0E7CC;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          position: relative;
          z-index: 2;
        }
        .smile-logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F9F0E7CC;
          border: 2px solid #F9F0E7CC;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: -5px;
          z-index: 1;
        }
        .smile-logo svg { display: block; }
        .title {
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(15px, 2.2dvh, 18px);
          font-weight: 600;
          line-height: 1.25;
          text-align: center;
          color: #21232C;
          margin: 0 0 clamp(0.5rem, 1.2dvh, 1rem);
          flex-shrink: 0;
        }
        .body {
          color: #5E646E;
          text-align: justify;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(11px, 1.5dvh, 12px);
          font-style: normal;
          font-weight: 400;
          line-height: 1.35;
          margin: 0 0 clamp(0.5rem, 1.2dvh, 1rem);
          flex-shrink: 0;
        }
        .body strong {
          color: #5E646E;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
        .items {
          list-style: none;
          padding: 0;
          margin: 0 0 clamp(0.5rem, 1.2dvh, 1rem);
          display: flex;
          flex-direction: column;
          gap: clamp(6px, 1.4dvh, 16px);
          flex-shrink: 0;
        }
        .items li {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          color: #21232C;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(11px, 1.5dvh, 12px);
          font-style: normal;
          font-weight: 400;
          line-height: 1.35;
        }
        .items img {
          width: clamp(22px, 3.4dvh, 28px);
          height: clamp(22px, 3.4dvh, 28px);
          flex-shrink: 0;
          object-fit: contain;
          object-position: left center;
        }
        .checkbox {
          display: flex;
          align-items: flex-start;
          /* gap = items gap (0.85rem) + half the width difference between an
             items icon (28px) and the 20px checkbox so the trailing text
             column lines up with the text above. */
          gap: calc(0.85rem + 4px);
          margin-bottom: clamp(0.4rem, 1dvh, 0.75rem);
          cursor: pointer;
          flex-shrink: 0;
        }
        .checkbox input { position: absolute; opacity: 0; pointer-events: none; }
        .checkbox .box {
          width: 20px;
          height: 20px;
          /* Center the 20px box within the 28px icon lane used by .items img
             so the icon column visually aligns with those above. */
          margin-left: 4px;
          border-radius: 4px;
          background: transparent;
          border: 1.5px solid #2D2B2A;
          color: #F9F0E7;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          transition: background 120ms ease, border-color 120ms ease;
        }
        .checkbox .box svg { display: block; opacity: 0; transition: opacity 120ms ease; }
        .checkbox input:checked + .box {
          background: #2D2B2A;
          border-color: #2D2B2A;
        }
        .checkbox input:checked + .box svg { opacity: 1; }
        .checkbox .copy {
          color: #5E646E;
          text-align: justify;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(11px, 1.5dvh, 12px);
          font-style: normal;
          font-weight: 400;
          line-height: 1.35;
        }
        .learn-more {
          display: inline-flex;
          align-items: center;
          /* Match the checkbox/items icon column so trailing text aligns. */
          gap: calc(0.85rem + 4px);
          background: transparent;
          border: none;
          padding: 0;
          color: #21232C;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(11px, 1.5dvh, 12px);
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          cursor: pointer;
          margin-bottom: clamp(0.3rem, 0.8dvh, 0.5rem);
          flex-shrink: 0;
        }
        .learn-more .chevron {
          width: 20px;
          height: 20px;
          /* Center the 20px chevron within the 28px icon lane to align with
             the icons above. */
          margin-left: 4px;
          border-radius: 50%;
          background: #2D2B2A;
          color: #F9F0E7;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 150ms ease;
          flex-shrink: 0;
        }
        .learn-more .chevron[data-open="true"] { transform: rotate(180deg); }
        .learn-more-copy {
          color: #5E646E;
          text-align: justify;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: clamp(11px, 1.5dvh, 12px);
          font-style: normal;
          font-weight: 400;
          line-height: 1.35;
          margin: 0 0 0.5rem;
          flex-shrink: 1;
          overflow: hidden;
        }
        .learn-more-copy strong {
          color: #5E646E;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: clamp(0.4rem, 1dvh, 0.75rem);
          align-items: stretch;
          padding-top: clamp(0.5rem, 1.5dvh, 1.5rem);
          flex-shrink: 0;
        }
        .allow {
          width: 100%;
          height: clamp(40px, 6dvh, 48px);
          padding: 0 1rem;
          border-radius: 24px;
          border: 1px solid;
          color: white;
          font-size: clamp(0.95rem, 1.8dvh, 1.05rem);
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(16, 24, 40, 0.05);
        }
        .allow:disabled { opacity: 0.45; cursor: not-allowed; }
        .deny {
          width: 100%;
          height: clamp(40px, 6dvh, 48px);
          padding: 0 1rem;
          background: transparent;
          border: 1px solid;
          border-radius: 24px;
          font-size: clamp(0.95rem, 1.8dvh, 1.05rem);
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(16, 24, 40, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ConsentView;
