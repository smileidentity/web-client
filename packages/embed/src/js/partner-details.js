import {
  safeCssColor,
  safeLinkUrl,
  safeImageUrl,
} from '@smileid/web-components/validate';

// The pages run in an iframe served from the SDK host, where a relative link
// would point at that host, so a value is kept only when it matches form
// (absolute or protocol-relative). Dropped values become '' because the pages
// set them as attributes, where undefined would become 'undefined'.
function partnerUrl(details, key, form, check, expected) {
  const value = details[key];
  if (!value) return '';
  if (form.test(value) && check(value)) return value;
  console.error(
    `SmileIdentity: partner_details.${key} must be ${expected}, so it will not be shown`,
  );
  return '';
}

// Same rule for the theme colour: '' when missing or not a CSS colour.
function partnerColour(details) {
  const value = details.theme_color;
  if (!value) return '';
  const colour = safeCssColor(value);
  if (colour) return colour;
  console.error(
    'SmileIdentity: partner_details.theme_color must be a CSS colour, so the default will be used',
  );
  return '';
}

/**
 * Keeps the partner_details values that the pages render only when they have
 * the expected form: an absolute or protocol-relative http(s) URL for the
 * logo and policy links, or a data: image URL for the logo, and a CSS colour
 * for the theme. Any other value is dropped, so the page falls back to its
 * default for it.
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
        /^((https?:)?\/\/|data:)/i,
        safeImageUrl,
        'an http(s) URL or a data: image URL',
      ),
      policy_url: partnerUrl(
        details,
        'policy_url',
        /^(https?:)?\/\//i,
        safeLinkUrl,
        'an http(s) URL',
      ),
      theme_color: partnerColour(details),
    },
  };
}
