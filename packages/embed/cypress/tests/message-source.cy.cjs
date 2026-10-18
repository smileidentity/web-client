// The host and the SDK iframe talk over `postMessage`. Each side acts only on
// messages from the other.

const sdkFrame = 'iframe[data-cy="smile-identity-hosted-web-integration"]';
const productFrame =
  'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]';

// Runs `script` in a new same-origin frame on the host page: a sibling of the
// SDK iframe, standing in for an ad or widget the partner embeds.
const runInSiblingFrame = (script) =>
  cy.document().then((doc) => {
    const frame = doc.createElement('iframe');
    frame.srcdoc = `<script>${script}</script>`;
    doc.body.appendChild(frame);
  });

// If a page applies this, it hides its attribution and turns right-to-left.
const strayConfiguration = JSON.stringify({
  source: 'SmileIdentity::Configuration',
  environment: 'sandbox',
  hide_attribution: true,
  translation: { language: 'ar' },
});

const postToSdkIframe = `
  parent.document
    .querySelector('${sdkFrame}')
    .contentWindow.postMessage(${JSON.stringify(strayConfiguration)}, '*');
`;

const postToProductIframe = `
  parent.document
    .querySelector('${sdkFrame}')
    .contentDocument.querySelector('${productFrame}')
    .contentWindow.postMessage(${JSON.stringify(strayConfiguration)}, '*');
`;

// Each product page, and the host page that opens it.
const productPages = {
  'basic-kyc': '/basic_kyc',
  'biometric-kyc': '/biometric_kyc',
  'doc-verification': '/document-verification',
  'e-signature': '/e_signature',
  ekyc: '/enhanced_kyc',
  'enhanced-document-verification': '/enhanced_document_verification',
  'smartselfie-auth': '/smartselfie',
};

const sdkFrameElement = () => cy.get(sdkFrame);
const productFrameElement = () => cy.getIFrameBody().find(productFrame);

const assertLeftToRight = (frameElement) =>
  frameElement()
    .its('0.contentDocument.documentElement')
    .should('have.attr', 'dir', 'ltr');

// Waits until the host's configuration has reached a page: it shows `main`
// and sets the text direction only once configured.
const assertConfiguredLeftToRight = (frameElement) => {
  frameElement()
    .its('0.contentDocument.body')
    .find('main')
    .should('not.have.attr', 'hidden');
  assertLeftToRight(frameElement);
};

// Delivers a message straight to `win`'s listeners, claiming to come from
// `source` on `origin`. This stands in for the real page's message arriving
// just before the frame is navigated away, which a test cannot time.
const dispatchMessage = (win, data, source, origin) => {
  win.dispatchEvent(new win.MessageEvent('message', { data, source, origin }));
};

// Assertions pass as soon as they first hold, so a late message would slip
// past them. Give in-flight messages time to land first.
const letMessagesLand = () => {
  cy.wait(1000);
};

// Records every message the host page receives, so a test can assert what
// did, and did not, reach it.
const recordHostMessages = () =>
  cy.window().then((win) => {
    win.hostMessages = [];
    win.addEventListener('message', (event) => {
      win.hostMessages.push(event.data);
    });
  });

const hostMessages = () => cy.window().its('hostMessages');

// Navigates a frame to cypress/pages/other-origin-page.html on 127.0.0.1, another
// origin. Navigation keeps the frame's window object, so the origin check is
// what tells that page from the SDK's own.
const navigateToOtherOriginPage = (selector, hash) => (frameOwner) => {
  frameOwner.querySelector(selector).contentWindow.location =
    `http://127.0.0.1:8000/other-origin-page.html${hash}`;
};

const assertOtherOriginPageIgnored = () => {
  hostMessages().should('include', 'other-page-loaded');
  letMessagesLand();
  hostMessages().then((messages) => {
    expect(messages.filter((data) => data?.received)).to.deep.equal([]);
  });
  cy.get(sdkFrame).should('exist');
};

describe('web integration - message source', () => {
  beforeEach(() => {
    cy.loadIDOptions();
    // Product selection asks for these without a locale, which
    // loadIDOptions does not match. Stub them so tests stay off the network.
    cy.intercept('GET', '**/v1/services', { fixture: 'services.json' });
    cy.intercept('POST', '**/v1/valid_documents', {
      fixture: 'valid_documents.json',
    });
  });

  it('ignores messages posted to the host by another frame', () => {
    cy.visit('/message_source');
    cy.getIFrameBody().find('#select-id-type').should('be.visible');

    runInSiblingFrame(`
      parent.postMessage('SmileIdentity::Success', '*');
      parent.postMessage('SmileIdentity::Error', '*');
      parent.postMessage('SmileIdentity::Close', '*');
    `);
    letMessagesLand();

    cy.get(sdkFrame).should('exist');
    cy.get('.callback-message').should('not.exist');

    // The flow's own messages still reach the host.
    cy.getIFrameBody().find('#select-id-type .close-iframe').click();
    cy.get(sdkFrame).should('not.exist');
    cy.get('.callback-message')
      .should('have.length', 1)
      .and('have.text', 'onClose');
  });

  Object.entries(productPages).forEach(([page, hostPage]) => {
    it(`ignores a configuration posted to ${page} by another frame`, () => {
      cy.visit(hostPage);
      assertConfiguredLeftToRight(sdkFrameElement);

      runInSiblingFrame(postToSdkIframe);
      letMessagesLand();

      assertLeftToRight(sdkFrameElement);
    });
  });

  it('ignores a configuration posted to the product page nested in product selection by another frame', () => {
    cy.visit('/verification-method-selection');
    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');
    cy.selectBVNIDType();
    assertConfiguredLeftToRight(productFrameElement);

    runInSiblingFrame(postToProductIframe);
    letMessagesLand();

    assertLeftToRight(productFrameElement);
  });

  it('ignores a configuration posted to product selection by another frame', () => {
    cy.visit('/verification-method-selection');
    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');

    runInSiblingFrame(postToSdkIframe);
    letMessagesLand();

    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');

    // The host's configuration still drives the nested product iframe, and
    // that iframe's messages still reach the host.
    cy.selectBVNIDType();
    cy.getIFrameBody()
      .find(productFrame)
      .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html')
      .its('0.contentDocument.body')
      .find('.close-iframe:visible')
      .first()
      // A native click: Cypress cannot always act on elements two frames down.
      .then((button) => button.get(0).click());
    cy.get(sdkFrame).should('not.exist');
  });

  it('ignores a page the SDK iframe was navigated to from another origin', () => {
    cy.visit('/message_source');
    cy.getIFrameBody().find('#select-id-type').should('be.visible');
    recordHostMessages();

    cy.document().then(navigateToOtherOriginPage(sdkFrame, ''));

    assertOtherOriginPageIgnored();
    cy.get('.callback-message').should('not.exist');
  });

  it('sends the configuration only to the SDK origin', () => {
    cy.visit('/message_source');
    cy.getIFrameBody().find('#select-id-type').should('be.visible');
    recordHostMessages();
    cy.document().then(navigateToOtherOriginPage(sdkFrame, ''));
    hostMessages().should('include', 'other-page-loaded');

    cy.window().then((win) => {
      const frameWindow = win.document.querySelector(sdkFrame).contentWindow;
      dispatchMessage(
        win,
        'SmileIdentity::ChildPageReady',
        frameWindow,
        win.location.origin,
      );
    });

    assertOtherOriginPageIgnored();
  });

  it('sends the configuration from product selection only to its own origin', () => {
    cy.visit('/verification-method-selection');
    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');
    cy.selectBVNIDType();
    cy.getIFrameBody().find(productFrame).should('exist');
    recordHostMessages();
    cy.getIFrameBody().then((body) =>
      navigateToOtherOriginPage(
        productFrame,
        '#nested',
      )(body.get(0).ownerDocument),
    );
    hostMessages().should('include', 'other-page-loaded');

    cy.get(sdkFrame).then((frame) => {
      const win = frame.get(0).contentWindow;
      const productWindow =
        win.document.querySelector(productFrame).contentWindow;
      dispatchMessage(
        win,
        'SmileIdentity::ChildPageReady',
        productWindow,
        win.location.origin,
      );
    });

    assertOtherOriginPageIgnored();
  });

  it('ignores a page the product iframe was navigated to from another origin', () => {
    cy.visit('/verification-method-selection');
    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');
    cy.selectBVNIDType();
    cy.getIFrameBody().find(productFrame).should('exist');
    recordHostMessages();

    cy.getIFrameBody().then((body) =>
      navigateToOtherOriginPage(
        productFrame,
        '#nested',
      )(body.get(0).ownerDocument),
    );

    assertOtherOriginPageIgnored();
    // Product selection relays messages only from its real product page.
    hostMessages().should('not.include', 'relayed-from-other-page');
  });

  it('does not relay messages to the host from a frame that is not its product iframe', () => {
    cy.visit('/verification-method-selection');
    cy.getIFrameBody().find('#select-id-type .credits').should('be.visible');
    recordHostMessages();

    runInSiblingFrame(`
      parent.document
        .querySelector('${sdkFrame}')
        .contentWindow.postMessage('relayed-from-sibling', '*');
      parent.postMessage('sibling-loaded', '*');
    `);

    hostMessages().should('include', 'sibling-loaded');
    letMessagesLand();
    hostMessages().should('not.include', 'relayed-from-sibling');
  });
});
