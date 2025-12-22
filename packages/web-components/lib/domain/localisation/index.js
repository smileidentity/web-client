/**
 * Minimal runtime i18n module for SmileID web components.
 * Provides simple locale registration, loading, and translation lookup.
 */

// Bundle supported locales for offline/instant switching
import arLocale from '../../../locales/ar.json';
import enLocale from '../../../locales/en.json';

const DEFAULT_LOCALE = 'en';
const FETCH_TIMEOUT_MS = 5000;

let currentLocale = DEFAULT_LOCALE;
const locales = {
  ar: arLocale,
  en: enLocale,
};

/**
 * Register a locale object (in-memory).
 * @param {string} lang - Language code (e.g., 'en', 'ar')
 * @param {object} data - Locale translation object
 */
export function registerLocale(lang, data) {
  locales[lang] = data;
}

/**
 * Fetch with timeout wrapper.
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, timeout = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Register a locale by URL (fetch and cache).
 * @param {string} lang - Language code
 * @param {string} url - URL to locale JSON file
 * @returns {Promise<object>} Loaded locale data
 */
export async function registerLocaleUrl(lang, url) {
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`Failed to load locale from ${url}: ${response.status}`);
    }
    const data = await response.json();
    registerLocale(lang, data);
    return data;
  } catch (error) {
    const errorMessage =
      error.name === 'AbortError'
        ? `Timeout loading locale '${lang}' from ${url}`
        : `Error loading locale '${lang}' from ${url}: ${error.message}`;
    console.error(errorMessage);

    // Fallback to default locale if available
    if (lang !== DEFAULT_LOCALE && locales[DEFAULT_LOCALE]) {
      console.warn(`Falling back to default locale '${DEFAULT_LOCALE}'`);
      return locales[DEFAULT_LOCALE];
    }
    throw error;
  }
}

/**
 * Load a locale (supports both inline registration and URL fetch).
 * @param {string} lang - Language code
 * @param {string} [url] - Optional URL to fetch locale from
 * @returns {Promise<object>} Loaded locale data
 */
export async function loadLocale(lang, url) {
  // Return cached locale if available
  if (locales[lang]) {
    return locales[lang];
  }

  // Fetch from URL if provided
  if (url) {
    return registerLocaleUrl(lang, url);
  }

  // No URL provided and locale not cached - fallback to default
  console.warn(
    `Locale '${lang}' not found and no URL provided, using default '${DEFAULT_LOCALE}'`,
  );
  return locales[DEFAULT_LOCALE] || {};
}

/**
 * Helper to get nested value from object using dot notation.
 * @param {object} obj - Object to traverse
 * @param {string} key - Dot-separated key path
 * @returns {string|undefined} Value at path or undefined
 */
function getNestedValue(obj, key) {
  if (!obj) return undefined;

  const value = key.split('.').reduce((acc, k) => {
    if (acc && typeof acc === 'object' && k in acc) {
      return acc[k];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

/**
 * Get translation for a key.
 * Supports nested keys with dot notation (e.g., 'camera.permission.description').
 * Fallback chain: current locale → default locale (English) → raw key.
 * @param {string} key - Translation key
 * @returns {string} Translated string or fallback
 */
export function t(key) {
  // Try current locale first
  const currentLocaleData = locales[currentLocale];
  const value = getNestedValue(currentLocaleData, key);
  if (value) {
    return value;
  }

  // Fallback to default locale if different from current
  if (currentLocale !== DEFAULT_LOCALE) {
    const defaultValue = getNestedValue(locales[DEFAULT_LOCALE], key);
    if (defaultValue) {
      return defaultValue;
    }
  }

  // Final fallback: return the key itself
  console.warn(`Translation key '${key}' not found in any locale`);
  return key;
}

/**
 * Alias for t() function.
 * @see t
 */
export const translate = t;

/**
 * HTML entity map for escaping special characters.
 */
const HTML_ENTITIES = {
  '"': '&quot;',
  '&': '&amp;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Get translation with HTML interpolation for styled placeholders.
 * Placeholders in format {{key}} will be replaced with provided values.
 * Values can be plain strings or objects with {value, className} for styled spans.
 * @param {string} key - Translation key
 * @param {Object} params - Interpolation parameters
 * @returns {string} Translated string with interpolations
 * @example
 * // Plain interpolation
 * tHtml('greeting', { name: 'John' }) // "Hello, John"
 *
 * // Styled interpolation
 * tHtml('consent.accessRequest', {
 *   partnerName: { value: 'Acme', className: 'theme' }
 * }) // "<span class="theme">Acme</span> wants to access..."
 */
export function tHtml(key, params = {}) {
  let text = t(key);

  Object.keys(params).forEach((paramKey) => {
    const paramValue = params[paramKey];
    const placeholder = `{{${paramKey}}}`;

    if (paramValue && typeof paramValue === 'object' && 'value' in paramValue) {
      // Styled interpolation: { value: 'text', className: 'theme' }
      const escapedValue = escapeHtml(String(paramValue.value || ''));
      const className = escapeHtml(String(paramValue.className || ''));
      text = text
        .split(placeholder)
        .join(
          className
            ? `<span class="${className}">${escapedValue}</span>`
            : escapedValue,
        );
    } else {
      // Plain text interpolation
      text = text.split(placeholder).join(escapeHtml(String(paramValue)));
    }
  });

  return text;
}

/**
 * Alias for tHtml() function.
 * @see tHtml
 */
export const translateHtml = tHtml;

/**
 * Set the current locale.
 * If the locale is not registered, it will attempt to load it from the provided URL.
 * Applies RTL direction to document element if direction is specified in locale.
 * @param {string} lang - Language code
 * @param {string} [url] - Optional URL to fetch locale from if not registered
 * @returns {Promise<boolean>} Whether locale was successfully set
 */
export async function setCurrentLocale(lang, { url, translation } = {}) {
  // If locale not registered, try to load it
  if (!locales[lang]) {
    if (translation) {
      registerLocale(lang, translation);
    } else if (url) {
      try {
        await loadLocale(lang, url);
      } catch (error) {
        console.error(
          `Failed to load locale '${lang}', keeping current locale '${currentLocale}'`,
        );
        return false;
      }
    } else {
      console.warn(`Locale '${lang}' not registered and no URL provided`);
      return false;
    }
  }

  currentLocale = lang;

  // Apply RTL/LTR direction if specified in locale data
  const locale = locales[lang];
  if (locale && locale.direction && document?.documentElement?.dir) {
    document.documentElement.dir = locale.direction;
  }

  return true;
}

/**
 * Get the current locale.
 * @returns {string} Current language code
 */
export function getCurrentLocale() {
  return currentLocale;
}

/**
 * Get the default locale code.
 * @returns {string} Default language code
 */
export function getDefaultLocale() {
  return DEFAULT_LOCALE;
}

/**
 * Check if a locale is registered.
 * @param {string} lang - Language code
 * @returns {boolean} Whether locale is registered
 */
export function hasLocale(lang) {
  return lang in locales;
}

/**
 * Set document direction based on locale direction property.
 * @param {string} lang - Language code
 */
export function setDocumentDir(lang) {
  const locale = locales[lang];
  if (locale && locale.direction) {
    document.documentElement.dir = locale.direction;
  }
}

export default {
  escapeHtml,
  getCurrentLocale,
  getDefaultLocale,
  hasLocale,
  loadLocale,
  registerLocale,
  registerLocaleUrl,
  setCurrentLocale,
  setDocumentDir,
  t,
  tHtml,
  translate,
  translateHtml,
};
