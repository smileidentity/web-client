// Run: node --test packages/web-components/lib/utils/safe-values.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import {
  safeCssColor,
  safeHttpUrl,
  safeImageUrl,
  safeLinkUrl,
} from './safe-values.js';

const NOT_HTTP = [
  undefined,
  null,
  '',
  '   ',
  42,
  'javascript:alert(1)',
  'JAVASCRIPT:alert(1)',
  'JaVaScRiPt:alert(1)',
  ' javascript:x',
  '  JavaScript:x\n',
  'java\tscript:x',
  'vbscript:x',
  'blob:https://example.com/1',
  'data:text/html,<p>x</p>',
  'data:text/html;base64,PHA+eDwvcD4=',
  'https://',
  'http://[::1',
  'https://exa mple.com/',
];

const withPage = (baseURI, run) => {
  const original = globalThis.document;
  globalThis.document = { baseURI };
  try {
    run();
  } finally {
    globalThis.document = original;
  }
};

test('safeHttpUrl returns absolute http(s) URLs as the browser reads them', () => {
  assert.strictEqual(
    safeHttpUrl('https://portal.usesmileid.com/favicon.ico'),
    'https://portal.usesmileid.com/favicon.ico',
  );
  assert.strictEqual(
    safeHttpUrl('HTTP://Example.com/policy?lang=en#top'),
    'http://example.com/policy?lang=en#top',
  );
  assert.strictEqual(
    safeHttpUrl('  https://example.com/logo.png\n'),
    'https://example.com/logo.png',
  );
});

test('safeHttpUrl drops relative, protocol-relative and non-http(s) URLs', () => {
  withPage('https://partner.example/app/', () => {
    [...NOT_HTTP, '/img/logo.png', 'logo.png', '//cdn.example.com/x'].forEach(
      (value) => assert.strictEqual(safeHttpUrl(value), undefined),
    );
  });
});

test('safeLinkUrl returns absolute http(s) URLs as the browser reads them', () => {
  assert.strictEqual(
    safeLinkUrl('http://example.com/policy?lang=en#top'),
    'http://example.com/policy?lang=en#top',
  );
  assert.strictEqual(
    safeLinkUrl('  https://example.com/privacy\n'),
    'https://example.com/privacy',
  );
});

test('safeLinkUrl resolves relative and protocol-relative URLs on the page', () => {
  withPage('https://partner.example/app/', () => {
    [
      ['//cdn.example.com/privacy', 'https://cdn.example.com/privacy'],
      ['/privacy', 'https://partner.example/privacy'],
      ['privacy.html', 'https://partner.example/app/privacy.html'],
    ].forEach(([value, url]) => assert.strictEqual(safeLinkUrl(value), url));
  });
});

test('safeLinkUrl drops non-http(s) and malformed URLs', () => {
  withPage('https://partner.example/app/', () => {
    [...NOT_HTTP, 'data:image/png;base64,iVBORw0KGgo='].forEach((value) =>
      assert.strictEqual(safeLinkUrl(value), undefined),
    );
  });
  // No page address to resolve against outside a browser.
  ['/privacy', 'privacy.html', '//cdn.example.com/privacy'].forEach((value) =>
    assert.strictEqual(safeLinkUrl(value), undefined),
  );
});

test('safeLinkUrl keeps a single quote for the caller to escape', () => {
  // The URL parser keeps ' in the path, so callers must still escape it.
  assert.strictEqual(
    safeLinkUrl('https://example.com/a\' b"c'),
    "https://example.com/a'%20b%22c",
  );
});

test('safeImageUrl keeps data: image URLs', () => {
  [
    'data:image/png;base64,iVBORw0KGgo=',
    'data:image/jpeg;base64,/9j/4AAQ',
    'data:image/gif;base64,R0lGODlh',
    'data:image/webp;base64,UklGRg==',
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
  ].forEach((url) => assert.strictEqual(safeImageUrl(url), url));
  assert.strictEqual(
    safeImageUrl(' DATA:IMAGE/PNG;base64,iVBORw0KGgo= '),
    'data:IMAGE/PNG;base64,iVBORw0KGgo=',
  );
});

test('safeImageUrl resolves http(s), relative and protocol-relative URLs', () => {
  withPage('https://partner.example/app/', () => {
    [
      ['http://example.com/logo.png', 'http://example.com/logo.png'],
      ['//cdn.example.com/logo.png', 'https://cdn.example.com/logo.png'],
      ['/img/logo.png', 'https://partner.example/img/logo.png'],
      ['logo.png', 'https://partner.example/app/logo.png'],
    ].forEach(([value, url]) => assert.strictEqual(safeImageUrl(value), url));
  });
});

test('safeImageUrl drops other data: URLs and non-http(s) URLs', () => {
  withPage('https://partner.example/app/', () => {
    [
      ...NOT_HTTP,
      'data:,x',
      'data:image,x',
      'data:image/,x',
      'data: image/png,x',
      'data:application/xml,<x/>',
    ].forEach((value) => assert.strictEqual(safeImageUrl(value), undefined));
  });
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
