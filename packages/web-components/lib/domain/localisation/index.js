/**
 * Minimal runtime i18n module for SmileID web components.
 * Provides simple locale registration, loading, and translation lookup.
 */

// Bundle supported locales for offline/instant switching
import arLocale from '../../../locales/ar-EG.json';
import enLocale from '../../../locales/en-GB.json';
import frLocale from '../../../locales/fr-FR.json';

// Locale alias mapping for short codes
const LOCALE_ALIASES = {
  ar: 'ar-EG',
  en: 'en-GB',
  fr: 'fr-FR',
};

/**
 * Resolve locale alias to full locale code.
 * @param {string} lang - Language code (e.g., 'en', 'ar', 'en-GB')
 * @returns {string} Resolved locale code
 */
function resolveLocale(lang) {
  return LOCALE_ALIASES[lang] || lang;
}

const DEFAULT_LOCALE = 'en-GB';
const FETCH_TIMEOUT_MS = 5000;

let currentLocale = DEFAULT_LOCALE;
const locales = {
  'ar-EG': arLocale,
  'en-GB': enLocale,
  'fr-FR': frLocale,
};

/**
 * Register a locale object (in-memory).
 * @param {string} lang - Language code (e.g., 'en-GB', 'ar-EG')
 * @param {object} data - Locale translation object
 */
export function registerLocale(lang, data) {
  locales[lang] = data;
}

/**
 * Deep merge source object into target object.
 * Recursively merges nested objects while preserving non-overridden values.
 * @param {object} target - Base object to merge into
 * @param {object} source - Object with values to merge/override
 * @returns {object} New merged object (does not mutate inputs)
 */
export function deepMerge(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }

  if (!target || typeof target !== 'object') {
    return source;
  }

  return Object.keys(source).reduce(
    (result, key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        return { ...result, [key]: deepMerge(targetValue, sourceValue) };
      }
      // Override with source value
      return { ...result, [key]: sourceValue };
    },
    { ...target },
  );
}

/**
 * Required translation keys for a complete locale.
 * These are the minimum keys needed for the SDK to function properly.
 */
const REQUIRED_LOCALE_KEYS = [
  'direction',
  'common.back',
  'common.close',
  'common.continue',
  'common.cancel',
  'camera.permission.description',
  'camera.permission.requestButton',
  'camera.error.notAllowed',
  'selfie.instructions.title',
  'selfie.capture.button.takeSelfie',
  'selfie.review.title',
  'selfie.review.acceptButton',
  'selfie.review.retakeButton',
  'document.capture.captureButton',
  'document.review.acceptButton',
  'document.review.retakeButton',
];

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
  const resolvedLang = resolveLocale(lang);

  // Return cached locale if available
  if (locales[resolvedLang]) {
    return locales[resolvedLang];
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
 * Validate that a locale has all required translation keys.
 * @param {object} locale - Locale data to validate
 * @returns {{ missingKeys: string[], valid: boolean }} Validation result
 */
export function validateLocale(locale) {
  if (!locale || typeof locale !== 'object') {
    return { missingKeys: REQUIRED_LOCALE_KEYS, valid: false };
  }

  const missingKeys = REQUIRED_LOCALE_KEYS.filter((key) => {
    if (key === 'direction') {
      return !locale.direction;
    }
    return !getNestedValue(locale, key);
  });

  return {
    missingKeys,
    valid: missingKeys.length === 0,
  };
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
  const resolvedLocale = resolveLocale(currentLocale);
  const currentLocaleData = locales[resolvedLocale];
  const value = getNestedValue(currentLocaleData, key);
  if (value) {
    return value;
  }

  // Fallback to default locale if different from current
  const resolvedDefault = resolveLocale(DEFAULT_LOCALE);
  if (resolvedLocale !== resolvedDefault) {
    const defaultValue = getNestedValue(locales[resolvedDefault], key);
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
 * @param {Object} [options] - Configuration options
 * @param {string} [options.url] - URL to fetch locale from if not registered
 * @param {Object} [options.translation] - Complete locale data object (legacy)
 * @param {Object} [options.locales] - Locale data keyed by language code (new API)
 * @param {boolean} [options.validate] - Whether to validate locale completeness
 * @returns {Promise<boolean>} Whether locale was successfully set
 */
export async function setCurrentLocale(
  lang,
  { url, translation, locales: customLocales, validate = false } = {},
) {
  const resolvedLang = resolveLocale(lang);

  // Step 1: Process custom locales (new API - keyed by language code)
  if (customLocales && typeof customLocales === 'object') {
    Object.entries(customLocales).forEach(([localeKey, localeData]) => {
      if (!localeData || typeof localeData !== 'object') {
        return;
      }

      const resolvedKey = resolveLocale(localeKey);

      if (locales[resolvedKey]) {
        // Deep merge into existing bundled locale
        locales[resolvedKey] = deepMerge(locales[resolvedKey], localeData);
      } else {
        // Register as new locale
        registerLocale(resolvedKey, localeData);

        // Add alias if short code provided
        if (localeKey !== resolvedKey) {
          LOCALE_ALIASES[localeKey] = resolvedKey;
        }
      }
    });
  }

  // Step 2: Handle legacy translation option (for backward compatibility)
  if (!locales[resolvedLang]) {
    if (translation) {
      registerLocale(resolvedLang, translation);
    } else if (url) {
      try {
        await loadLocale(resolvedLang, url);
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

  // Step 3: Validate locale completeness if requested
  if (validate && locales[resolvedLang]) {
    const validation = validateLocale(locales[resolvedLang]);
    if (!validation.valid) {
      console.warn(
        `Locale '${lang}' is missing required keys:`,
        validation.missingKeys,
      );
    }
  }

  currentLocale = resolvedLang;

  // Apply RTL/LTR direction if specified in locale data
  const locale = locales[resolvedLang];
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

/**
 * Get the text direction for the current locale.
 * @returns {string} Direction ('ltr' or 'rtl'), defaults to 'ltr'
 */
export function getDirection() {
  const locale = locales[currentLocale];
  return locale?.direction || 'ltr';
}

export default {
  deepMerge,
  escapeHtml,
  getCurrentLocale,
  getDefaultLocale,
  getDirection,
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
  validateLocale,
};
