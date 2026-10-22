/**
 * Returns the value only when it is an http(s) URL, otherwise undefined.
 * Relative and protocol-relative URLs are checked against the page address,
 * the same way the browser resolves them.
 * @param {*} value - Candidate URL
 * @returns {string|undefined} The URL or undefined
 */
export function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value) return undefined;
  try {
    const { protocol } = new URL(value, globalThis.document?.baseURI);
    return protocol === 'https:' || protocol === 'http:' ? value : undefined;
  } catch {
    return undefined;
  }
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
