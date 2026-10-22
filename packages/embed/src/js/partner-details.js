import { safeCssColor, safeHttpUrl } from '@smileid/web-components/validate';

// A path-relative URL would point at the SDK's own host, so only absolute and
// protocol-relative http(s) URLs are kept. Dropped values become '' because
// the pages set them as attributes, where undefined would become 'undefined'.
const partnerUrl = (value) =>
  (/^(https?:)?\/\//i.test(value) && safeHttpUrl(value)) || '';

/**
 * Keeps the partner_details values that the pages render only when they have
 * the expected form: absolute or protocol-relative http(s) URLs for the logo
 * and policy links, and a CSS colour for the theme. Any other value is dropped, so the page falls
 * back to its default for it.
 * @param {Object} config - Configuration received from the host page
 * @returns {Object} The configuration with checked partner_details
 */
export default function withCheckedPartnerDetails(config) {
  const details = config?.partner_details;
  if (!details) return config;
  return {
    ...config,
    partner_details: {
      ...details,
      logo_url: partnerUrl(details.logo_url),
      policy_url: partnerUrl(details.policy_url),
      theme_color: safeCssColor(details.theme_color),
    },
  };
}
