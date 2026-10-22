import { safeCssColor, safeHttpUrl } from '@smileid/web-components/validate';

/**
 * Keeps the partner_details values that the pages render only when they have
 * the expected form: absolute http(s) URLs for the logo and policy links, and
 * a CSS colour for the theme. Any other value is dropped, so the page falls
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
      logo_url: safeHttpUrl(details.logo_url),
      policy_url: safeHttpUrl(details.policy_url),
      theme_color: safeCssColor(details.theme_color),
    },
  };
}
