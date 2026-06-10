import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';

import { getBoolProp } from '../../../../utils/props';
import { ConsentView } from './components/ConsentView';

import '../../../attribution/PoweredBySmileId';

interface Props {
  'theme-color'?: string;
  'hide-attribution'?: string | boolean;
  'partner-name'?: string;
  'partner-logo'?: string;
  'policy-url'?: string;
}

/**
 * Standalone Enhanced SmartSelfie consent screen. Hosted as its own custom
 * element so partner integrations (and the embed product scripts) can mount
 * the new consent UX independently of `<enhanced-smartselfie-capture>`.
 *
 * Events:
 *   - `enhanced-smart-selfie-consent.granted` \u2014 user accepted.
 *   - `enhanced-smart-selfie-consent.denied`  \u2014 user declined.
 */
const EnhancedSmartSelfieConsent: FunctionComponent<Props> = ({
  'theme-color': themeColor = '#001096',
  'hide-attribution': hideAttributionProp = false,
  'partner-name': partnerName,
  'partner-logo': partnerLogo,
  'policy-url': policyUrl,
}) => {
  const hideAttribution = getBoolProp(hideAttributionProp);

  return (
    <ConsentView
      themeColor={themeColor}
      hideAttribution={hideAttribution}
      partnerName={partnerName}
      partnerLogo={partnerLogo}
      policyUrl={policyUrl}
      onGranted={() => {
        window.dispatchEvent(
          new CustomEvent('enhanced-smart-selfie-consent.granted'),
        );
      }}
      onDenied={() => {
        window.dispatchEvent(
          new CustomEvent('enhanced-smart-selfie-consent.denied'),
        );
      }}
    />
  );
};

if (!customElements.get('enhanced-smart-selfie-consent')) {
  register(
    EnhancedSmartSelfieConsent,
    'enhanced-smart-selfie-consent',
    [
      'theme-color',
      'hide-attribution',
      'partner-name',
      'partner-logo',
      'policy-url',
    ],
    { shadow: true },
  );
}

export default EnhancedSmartSelfieConsent;
