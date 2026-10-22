// Run: node --test packages/web-components/lib/utils/safe-values.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import { safeCssColor, safeHttpUrl } from './safe-values.js';

test('safeHttpUrl keeps absolute http(s) URLs as given', () => {
  [
    'https://portal.usesmileid.com/favicon.ico',
    'http://example.com/policy?lang=en#top',
  ].forEach((url) => assert.strictEqual(safeHttpUrl(url), url));
});

test('safeHttpUrl drops anything that is not an http(s) URL', () => {
  [
    undefined,
    null,
    '',
    42,
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<p>x</p>',
    'vbscript:x',
    ' javascript:x',
    'java\tscript:x',
    // No page address to resolve against outside a browser.
    '/relative/logo.png',
    'logo.png',
  ].forEach((value) => assert.strictEqual(safeHttpUrl(value), undefined));
});

test('safeHttpUrl keeps relative URLs that resolve to http(s) on the page', () => {
  const original = globalThis.document;
  globalThis.document = { baseURI: 'https://partner.example/app/' };
  try {
    ['/img/logo.png', 'logo.png', '//cdn.example.com/logo.png'].forEach((url) =>
      assert.strictEqual(safeHttpUrl(url), url),
    );
    assert.strictEqual(safeHttpUrl('javascript:x'), undefined);
  } finally {
    globalThis.document = original;
  }
});

test('safeHttpUrl keeps quotes in a valid URL for the caller to escape', () => {
  // The URL parser accepts this, so callers must still escape it in markup.
  const url = "https://example.com/a' b";
  assert.strictEqual(safeHttpUrl(url), url);
});

test('safeCssColor keeps colour values', () => {
  [
    '#151F72',
    '#fff',
    'tomato',
    'rgb(21, 31, 114)',
    'rgb(21 31 114 / 50%)',
    'hsl(120deg 75% 25%)',
  ].forEach((value) => assert.strictEqual(safeCssColor(value), value));
});

test('safeCssColor drops values that could end the CSS value or markup', () => {
  [
    undefined,
    null,
    '',
    7,
    'red; background: blue',
    'red} body {display:none',
    'red</style><p>x</p>',
    "red' onload='x",
    'red" x="y',
    'red /* note */',
    'red !important',
    'url(https://example.com/x.png)',
  ].forEach((value) => assert.strictEqual(safeCssColor(value), undefined));
});

test('safeCssColor defers to CSS.supports when the platform has it', () => {
  const original = globalThis.CSS;
  globalThis.CSS = { supports: (property, value) => value === 'tomato' };
  try {
    assert.strictEqual(safeCssColor('tomato'), 'tomato');
    assert.strictEqual(safeCssColor('notacolour'), undefined);
  } finally {
    globalThis.CSS = original;
  }
});
