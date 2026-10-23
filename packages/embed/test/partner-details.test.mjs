// Run after building web-components:
// node --test packages/embed/test/partner-details.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import withCheckedPartnerDetails from '../src/js/partner-details.js';

const partnerDetails = {
  partner_id: '1234',
  name: 'Example Partner',
  logo_url: 'https://example.com/logo.png',
  policy_url: 'https://example.com/privacy',
  theme_color: '#001096',
};

const check = (links) =>
  withCheckedPartnerDetails({
    partner_details: { ...partnerDetails, ...links },
  }).partner_details;

test('keeps well-formed partner details as given', () => {
  const config = { product: 'basic_kyc', partner_details: partnerDetails };
  assert.deepEqual(withCheckedPartnerDetails(config), config);
});

test('keeps a data: image logo', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const links = { logo_url: 'data:image/png;base64,iVBORw0KGgo=' };
  assert.deepEqual(check(links), { ...partnerDetails, ...links });
  assert.equal(log.mock.callCount(), 0);
});

// Runs fn as if in the SDK iframe, whose address is on the SDK host.
function inIframe(fn) {
  const original = globalThis.document;
  globalThis.document = { baseURI: 'https://cdn.example.com/inline/v1/' };
  try {
    fn();
  } finally {
    globalThis.document = original;
  }
}

test('keeps protocol-relative links', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const links = {
    logo_url: '//cdn.example.com/logo.png',
    policy_url: '//example.com/p',
  };
  inIframe(() =>
    assert.deepEqual(check(links), { ...partnerDetails, ...links }),
  );
  assert.equal(log.mock.callCount(), 0);
});

test('drops relative and scheme-less links, which would point at the SDK host', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  inIframe(() =>
    [
      { logo_url: 'img/logo.png', policy_url: '/privacy' },
      { logo_url: 'www.example.com/logo.png', policy_url: 'www.example.com/p' },
      { logo_url: 'https:logo.png', policy_url: 'https:privacy' },
    ].forEach((links) => {
      const details = check(links);
      assert.equal(details.logo_url, '');
      assert.equal(details.policy_url, '');
    }),
  );
  assert.equal(log.mock.callCount(), 6);
});

test('drops other links and reports each one', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const details = check({
    logo_url: 'data:text/html,<p>x</p>',
    // eslint-disable-next-line no-script-url
    policy_url: ' JavaScript:void(0)',
  });
  assert.equal(details.logo_url, '');
  assert.equal(details.policy_url, '');
  assert.deepEqual(
    log.mock.calls.map((call) => call.arguments[0]),
    [
      'SmileIdentity: partner_details.logo_url must be an http(s) URL or a data: image URL, so it will not be shown',
      'SmileIdentity: partner_details.policy_url must be an http(s) URL, so it will not be shown',
    ],
  );
});

test('turns missing links into empty strings without reporting them', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const details = check({ logo_url: undefined, policy_url: '' });
  assert.equal(details.logo_url, '');
  assert.equal(details.policy_url, '');
  assert.equal(log.mock.callCount(), 0);
});

test('drops a theme colour that is not a CSS colour', () => {
  assert.equal(check({ theme_color: 'red; x: y' }).theme_color, undefined);
});
