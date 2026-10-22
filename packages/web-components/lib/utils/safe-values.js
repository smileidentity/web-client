/**
 * Returns the URL, as the browser reads it, only when it is absolute and uses
 * http: or https:. Otherwise returns undefined.
 * @param {*} value - Candidate URL
 * @returns {string|undefined} The URL or undefined
 */
export function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

// Resolves the value against the page address, as the browser does for an
// href or src. Outside a browser (unit tests) only absolute URLs resolve.
function resolveUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    return new URL(value, globalThis.document?.baseURI);
  } catch {
    return undefined;
  }
}

/**
 * Returns a partner link, such as the policy URL, as an absolute URL when it
 * resolves to http: or https: against the page address. That covers absolute,
 * protocol-relative and relative URLs. Otherwise returns undefined.
 * @param {*} value - Candidate URL
 * @returns {string|undefined} The resolved URL or undefined
 */
export function safeLinkUrl(value) {
  const url = resolveUrl(value);
  return url && (url.protocol === 'https:' || url.protocol === 'http:')
    ? url.href
    : undefined;
}

/**
 * Returns a partner image, such as the logo, as an absolute URL when
 * safeLinkUrl() keeps it or when it is a data: URL with an image media type,
 * which an image element only ever shows as a picture. Otherwise returns
 * undefined.
 * @param {*} value - Candidate URL
 * @returns {string|undefined} The resolved URL or undefined
 */
export function safeImageUrl(value) {
  const url = resolveUrl(value);
  if (url?.protocol === 'data:' && /^image\/[\w.+-]+[;,]/i.test(url.pathname)) {
    return url.href;
  }
  return safeLinkUrl(value);
}

/**
 * Returns the value only when it is a valid CSS colour, otherwise undefined.
 * The character check keeps the value to a single CSS value wherever it is
 * written; CSS.supports then checks it is a colour where the browser offers it.
 * @param {*} value - Candidate colour
 * @returns {string|undefined} The colour or undefined
 */
export function safeCssColor(value) {
  if (typeof value !== 'string' || !/^[\w\s#(),.%/-]+$/.test(value)) {
    return undefined;
  }
  if (globalThis.CSS?.supports && !globalThis.CSS.supports('color', value)) {
    return undefined;
  }
  return value.trim();
}
