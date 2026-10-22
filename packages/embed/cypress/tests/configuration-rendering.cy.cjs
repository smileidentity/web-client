// Configuration values are rendered as text, and partner links and colours
// are used only when they have the expected form. The markup variant of
// cypress/pages/configuration-rendering.html puts markup and quote characters
// in every rendered value; the plain variant uses normal values.

const RUN = 'localStorage.configMarker=1';
const TEXT = `Acme <img src="x" onerror="${RUN}"><script>${RUN}</script><b class="config-markup">b</b> x" onfocus="${RUN}" autofocus data-a="x' onfocus='${RUN}' autofocus data-b='`;
const PLAIN_TEXT = 'Allow & continue';

const visit = (product, variant) =>
  cy.visit(`/configuration-rendering?product=${product}&variant=${variant}`);

const consentScreen = () =>
  cy.getIFrameBody().find('end-user-consent').shadow();

// Walks the iframe documents and shadow roots for anything that could only
// have come from configuration markup.
function findAdded(root, found = []) {
  root.querySelectorAll('*').forEach((el) => {
    const added =
      el.matches('.config-markup, img[src="x"], [data-a], [data-b]') ||
      (el.localName === 'script' && el.textContent.includes('configMarker')) ||
      (el.localName === 'a' &&
        /^\s*javascript:/i.test(el.getAttribute('href') || '')) ||
      [...el.attributes].some(
        (attr) =>
          attr.name.startsWith('on') && attr.value.includes('configMarker'),
      );
    if (added) found.push(el.outerHTML.slice(0, 160));
    if (el.shadowRoot) findAdded(el.shadowRoot, found);
    if (el.localName === 'iframe' && el.contentDocument) {
      findAdded(el.contentDocument, found);
    }
  });
  return found;
}

function expectOnlyText() {
  // Give image error and focus handlers time to fire if any were rendered.
  cy.wait(500);
  cy.get('iframe[data-cy="smile-identity-hosted-web-integration"]')
    .its('0.contentDocument')
    .then((doc) => {
      expect(findAdded(doc), 'elements from configuration markup').to.deep.eq(
        [],
      );
    });
  cy.window().then((win) => {
    expect(
      win.localStorage.getItem('configMarker'),
      'script from configuration',
    ).to.eq(null);
  });
}

describe('configuration rendering', () => {
  beforeEach(() => {
    // Answer every API call locally; specific stubs below take precedence.
    cy.intercept(
      { hostname: /^(testapi|api|example)\.smileidentity\.com$/ },
      { statusCode: 404 },
    );
    cy.loadIDOptions();
    cy.intercept('GET', '*v1/documents**', {
      statusCode: 200,
      fixture: 'e_signature_documents.json',
    });
  });

  describe('with markup in configuration values', () => {
    ['biometric_kyc', 'basic_kyc', 'enhanced_kyc'].forEach((product) => {
      it(`${product}: renders the consent screen values as text`, () => {
        visit(product, 'markup');
        cy.selectBVNIDType();

        consentScreen().find('#consent-screen').should('be.visible');
        consentScreen()
          .find('h1')
          .first()
          .should('contain.text', TEXT)
          .and('contain.text', 'Acme <img src="x"');
        consentScreen().find('#allow').should('contain.text', TEXT);

        // Logo and policy link are dropped, theme colour falls back.
        consentScreen().find('img[width="50"]').should('not.exist');
        consentScreen().find('a.theme').should('not.exist');
        consentScreen()
          .find('#back-button path')
          .eq(1)
          .should('have.attr', 'fill', '#151F72');
        consentScreen()
          .find('#consent-screen')
          .should('have.attr', 'dir', 'ltr');

        expectOnlyText();
      });
    });

    it('biometric_kyc: renders the camera screens values as text', () => {
      visit('biometric_kyc', 'markup');
      cy.selectBVNIDType();
      consentScreen().find('#allow').click();

      cy.getIFrameBody().find('smart-camera-web').should('exist');
      expectOnlyText();
    });

    it('doc_verification: renders the selection and camera screens values as text', () => {
      visit('doc_verification', 'markup');

      cy.getIFrameBody()
        .find('smileid-combobox-trigger input')
        .should('have.attr', 'placeholder', TEXT);
      expectOnlyText();

      cy.selectPASSPORTIDType();
      cy.getIFrameBody().find('smart-camera-web').should('exist');
      expectOnlyText();
    });

    it('enhanced_document_verification: renders values as text', () => {
      visit('enhanced_document_verification', 'markup');
      cy.selectVOTERIDType();

      cy.getIFrameBody().find('smart-camera-web').should('exist');
      expectOnlyText();
    });

    it('authentication: renders values as text', () => {
      visit('authentication', 'markup');

      cy.getIFrameBody().find('smart-camera-web').should('exist');
      expectOnlyText();
    });

    it('e_signature: renders values as text', () => {
      visit('e_signature', 'markup');

      cy.getIFrameBody().find('#entry-screen').should('be.visible');
      expectOnlyText();
    });

    it('product selection: renders values as text', () => {
      visit('product_selection', 'markup');

      cy.getIFrameBody().find('#country option[value="NG"]').should('exist');
      expectOnlyText();

      cy.selectBVNIDType();
      cy.getIFrameBody()
        .find(
          'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
        )
        .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html');
      expectOnlyText();
    });
  });

  describe('with a normal configuration', () => {
    it('biometric_kyc: renders the consent screen as before', () => {
      visit('biometric_kyc', 'plain');
      cy.selectBVNIDType();

      consentScreen().find('#consent-screen').should('be.visible');
      consentScreen()
        .find('img[width="50"]')
        .should(
          'have.attr',
          'src',
          'https://portal.usesmileid.com/favicon.ico',
        );
      consentScreen()
        .find('a.theme')
        .should('have.attr', 'href', 'https://usesmileid.com/privacy-policy')
        .and('have.text', PLAIN_TEXT);
      consentScreen()
        .find('#back-button path')
        .eq(1)
        .should('have.attr', 'fill', '#000');
      consentScreen()
        .find('h1')
        .first()
        .should('contain.text', "Test Org & Sons' Ltd - Allow & continue");
      consentScreen()
        .find('.callout')
        .should(
          'contain.text',
          "You can view Test Org & Sons' Ltd's privacy policy",
        );
      consentScreen()
        .find('#allow')
        .invoke('text')
        .then((text) => expect(text.trim()).to.eq(PLAIN_TEXT));

      expectOnlyText();
    });

    it('doc_verification: renders the selection screen as before', () => {
      visit('doc_verification', 'plain');

      cy.getIFrameBody()
        .find('smileid-combobox-trigger input')
        .should('have.attr', 'placeholder', PLAIN_TEXT);
      expectOnlyText();
    });

    it('product selection: renders the selection screen as before', () => {
      visit('product_selection', 'plain');

      cy.getIFrameBody().find('#country option[value="NG"]').should('exist');
      cy.getIFrameBody().find('#country option[value="GH"]').should('exist');
      expectOnlyText();
    });
  });
});
