#!/usr/bin/env node
/**
 * CI guard: every locale file in packages/web-components/locales/ must contain
 * the same set of translation keys.
 *
 * The reference locale is en-GB.json (the SDK's documented fallback — see
 * packages/web-components/LOCALIZATION.md). Other locales must include every
 * key present in en-GB and must not introduce keys that don't exist there.
 *
 * Exits 1 (and prints the diffs) when locales drift; 0 when they are aligned.
 *
 * Usage:
 *   node scripts/checkLocaleParity.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(
  __dirname,
  '..',
  'packages',
  'web-components',
  'locales',
);
const REFERENCE_LOCALE = 'en-GB.json';

// Keys whose presence is locale-metadata, not user-facing translation.
// They are allowed to differ in value (e.g. `direction: rtl`) but must still
// exist in every locale.
const METADATA_KEYS = new Set(['direction']);

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadLocale(file) {
  const full = path.join(LOCALES_DIR, file);
  const raw = fs.readFileSync(full, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`✗ ${file} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
}

function main() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.json'));

  if (!files.includes(REFERENCE_LOCALE)) {
    console.error(
      `Reference locale ${REFERENCE_LOCALE} missing from ${LOCALES_DIR}`,
    );
    process.exit(1);
  }

  const reference = loadLocale(REFERENCE_LOCALE);
  const referenceKeys = new Set(flattenKeys(reference));

  // Sanity check: reference must contain every metadata key.
  for (const meta of METADATA_KEYS) {
    if (!referenceKeys.has(meta)) {
      console.error(
        `Reference locale ${REFERENCE_LOCALE} is missing metadata key "${meta}"`,
      );
      process.exit(1);
    }
  }

  const failures = [];

  for (const file of files) {
    if (file === REFERENCE_LOCALE) continue;
    const data = loadLocale(file);
    const keys = new Set(flattenKeys(data));

    const missing = [...referenceKeys].filter((k) => !keys.has(k)).sort();
    const extra = [...keys].filter((k) => !referenceKeys.has(k)).sort();

    if (missing.length || extra.length) {
      failures.push({ file, missing, extra });
    }
  }

  if (failures.length === 0) {
    console.log(
      `✓ All ${files.length} locale files match ${REFERENCE_LOCALE} (${referenceKeys.size} keys).`,
    );
    process.exit(0);
  }

  console.error('✗ Locale parity check failed:\n');
  for (const { file, missing, extra } of failures) {
    console.error(`  ${file}`);
    if (missing.length) {
      console.error(`    Missing keys (${missing.length}):`);
      for (const k of missing) console.error(`      - ${k}`);
    }
    if (extra.length) {
      console.error(`    Extra keys (${extra.length}, not in ${REFERENCE_LOCALE}):`);
      for (const k of extra) console.error(`      + ${k}`);
    }
    console.error('');
  }
  console.error(
    `Fix by adding the missing keys (or removing the extras) so every locale\n` +
      `matches ${REFERENCE_LOCALE}. See CONTRIBUTING.md → "Adding a translation key".`,
  );
  process.exit(1);
}

if (require.main === module) {
  main();
}
