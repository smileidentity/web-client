/**
 * Minimal runtime i18n module for SmileID web components.
 * Provides simple locale registration, loading, and translation lookup.
 */

let currentLocale = 'en';
const locales = {};

/**
 * Register a locale object (in-memory).
 * @param {string} lang - Language code (e.g., 'en', 'ar')
 * @param {object} data - Locale translation object
 */
export function registerLocale(lang, data) {
  locales[lang] = data;
}

/**
 * Register a locale by URL (fetch and cache).
 * @param {string} lang - Language code
 * @param {string} url - URL to locale JSON file
 * @returns {Promise<object>} Loaded locale data
 */
export async function registerLocaleUrl(lang, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load locale from ${url}: ${response.status}`);
    const data = await response.json();
    registerLocale(lang, data);
    return data;
  } catch (error) {
    console.error(`Error loading locale ${lang} from ${url}:`, error);
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
  if (locales[lang]) {
    return locales[lang];
  }
  if (url) {
    return registerLocaleUrl(lang, url);
  }
  console.warn(`Locale '${lang}' not found and no URL provided`);
  return {};
}

/**
 * Get translation for a key.
 * Supports nested keys with dot notation (e.g., 'camera.permission.description').
 * Falls back to key itself if translation not found.
 * @param {string} key - Translation key
 * @returns {string} Translated string or fallback key
 */
export function t(key) {
  const locale = locales[currentLocale];
  if (!locale) {
    console.warn(`No locale data for '${currentLocale}'`);
    return key;
  }

  const keys = key.split('.');
  let value = locale;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key '${key}' not found in locale '${currentLocale}'`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Set the current locale.
 * Optionally applies RTL direction to document element if direction is specified in locale.
 * @param {string} lang - Language code
 */
export function setCurrentLocale(lang) {
  if (!locales[lang]) {
    console.warn(`Locale '${lang}' not registered`);
    return;
  }
  currentLocale = lang;
  
  // Apply RTL/LTR direction if specified in locale data
  const locale = locales[lang];
  if (locale && locale.direction) {
    document.documentElement.dir = locale.direction;
  }
}

/**
 * Get the current locale.
 * @returns {string} Current language code
 */
export function getCurrentLocale() {
  return currentLocale;
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
  t,
  loadLocale,
  registerLocale,
  registerLocaleUrl,
  setCurrentLocale,
  getCurrentLocale,
  setDocumentDir,
};
