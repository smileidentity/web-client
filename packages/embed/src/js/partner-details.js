import {
  safeCssColor,
  safeHttpUrl,
  safeImageUrl,
} from '@smileid/web-components/validate';

// Dropped values become '' because the pages set them as attributes, where
// undefined would become 'undefined', which reads as a relative URL.
function partnerUrl(details, key, check, expected) {
  const value = details[key];
  if (!value) return '';
  if (check(value)) return value;
  console.error(
    `SmileIdentity: partner_details.${key} must be ${expected}, so it will not be shown`,
  );
  return '';
}

/**
 * Keeps the partner_details values that the pages render only when they have
 * the expected form: an http(s) URL (absolute, protocol-relative or relative
 * to the page) for the logo and policy links, or a data: image URL for the
 * logo, and a CSS colour for the theme. Any other value is dropped, so the
 * page falls back to its default for it.
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
      logo_url: partnerUrl(
        details,
        'logo_url',
        safeImageUrl,
        'an http(s) URL or a data: image URL',
      ),
      policy_url: partnerUrl(
        details,
        'policy_url',
        safeHttpUrl,
        'an http(s) URL',
      ),
      theme_color: safeCssColor(details.theme_color),
    },
  };
}
