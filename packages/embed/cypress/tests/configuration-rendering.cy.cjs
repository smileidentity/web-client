// Configuration values are rendered as text, and partner links and colours
// are used only when they have the expected form. The markup variant of
// cypress/pages/configuration-rendering.html puts markup and quote characters
// in every rendered value; the plain variant uses normal values.

const RUN = 'localStorage.configMarker=1';
const TEXT = `Acme <img src="x" onerror="${RUN}"><script>${RUN}</script><b class="config-markup">b</b> x" onfocus="${RUN}" autofocus data-a="x' onfocus='${RUN}' autofocus data-b='`;
const PLAIN_TEXT = 'Allow & continue';

const visit = (product, variant, extra = {}) =>
  cy.visit(
    `/configuration-rendering?${new URLSearchParams({ product, variant, ...extra })}`,
  );

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
    cy.intercept({ hostname: 'example.com' }, { statusCode: 404 });
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

    it('biometric_kyc: renders http(s) partner links with quote characters as given', () => {
      const logo = `https://example.com/logo' onerror='${RUN}' data-a='x`;
      const policy = `https://example.com/policy' onfocus='${RUN}' autofocus data-a='x`;
      visit('biometric_kyc', 'markup', { links: 'quoted' });
      cy.selectBVNIDType();

      consentScreen()
        .find('img[width="50"]')
        .should(($img) => {
          expect($img.attr('src')).to.eq(logo);
          expect($img.attr('onerror')).to.eq(undefined);
        });
      consentScreen()
        .find('a.theme')
        .should(($link) => {
          expect($link.attr('href')).to.eq(policy);
          expect($link.attr('onfocus')).to.eq(undefined);
          expect($link.attr('autofocus')).to.eq(undefined);
        });

      expectOnlyText();
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

    it('e_signature: renders values and document details as text', () => {
      const link = `https://example.com/doc' onfocus='${RUN}' autofocus data-a='x`;
      cy.intercept('GET', '*v1/documents**', {
        statusCode: 200,
        body: {
          documents: [
            { id: '1', link, name: TEXT, size: 1 },
            { id: '2', link: `javascript:${RUN}`, name: TEXT, size: 1 },
          ],
        },
      });
      visit('e_signature', 'markup');

      cy.getIFrameBody().find('#entry-screen').should('be.visible');
      cy.getIFrameBody()
        .find('#document-review-screen .document-list a')
        .should('have.length', 2)
        .then(($links) => {
          expect($links.eq(0).attr('href')).to.eq(link);
          expect($links.eq(1).attr('href')).to.eq(undefined);
          $links.each((_, el) => {
            expect(el.querySelector('.flow p').textContent).to.eq(TEXT);
          });
        });
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

  describe('with an identity provider sign-in', () => {
    it('enhanced_kyc: opens the sign-in link only when it is http(s)', () => {
      cy.fixture('services.json').then((services) => {
        services.hosted_web.enhanced_kyc.ET = {
          name: 'Ethiopia',
          id_types: {
            NATIONAL_ID: {
              required_fields: ['country', 'id_type', 'user_id', 'job_id'],
              label: 'National ID',
            },
          },
        };
        cy.intercept('GET', '**/v1/services?locale=en-GB', services);
      });
      cy.fixture('products_config.json').then((productsConfig) => {
        productsConfig.idSelection.enhanced_kyc.ET = ['NATIONAL_ID'];
        cy.intercept('POST', '**/v1/products_config', productsConfig);
      });
      cy.intercept('POST', '**/v2/oidc/authorize_url', {
        authorize_url: `javascript:${RUN}`,
        state: 'state',
        expires_in: 600,
      });
      visit('enhanced_kyc', 'plain');

      cy.getIFrameBody().find('#country').select('ET');
      cy.getIFrameBody().find('#id_type').select('NATIONAL_ID');
      cy.getIFrameBody().find('#submitConfig').click();
      cy.getIFrameBody().find('#oidc-error').should('be.visible');

      const popup = {
        closed: false,
        location: {},
        focus() {},
        close() {
          this.closed = true;
        },
      };
      cy.get('iframe[data-cy="smile-identity-hosted-web-integration"]')
        .its('0.contentWindow')
        .then((win) => cy.stub(win, 'open').returns(popup));
      cy.getIFrameBody().find('#oidc-continue-button').click();

      cy.getIFrameBody().find('#oidc-error').should('be.visible');
      cy.wrap(popup).its('closed').should('eq', true);
      cy.wrap(popup).its('location').should('deep.eq', {});
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

    it('biometric_kyc: renders a named theme colour', () => {
      visit('biometric_kyc', 'plain', { theme: 'red' });
      cy.selectBVNIDType();

      consentScreen()
        .find('#back-button path')
        .eq(1)
        .should('have.attr', 'fill', 'red');
    });

    it('biometric_kyc: renders a protocol-relative logo and policy link', () => {
      visit('biometric_kyc', 'plain', {
        logo: '//example.com/logo.png',
        policy: '//example.com/privacy',
      });
      cy.selectBVNIDType();

      consentScreen()
        .find('img[width="50"]')
        .should('have.attr', 'src', '//example.com/logo.png');
      consentScreen()
        .find('a.theme')
        .should('have.attr', 'href', '//example.com/privacy');
    });

    it('biometric_kyc: renders a relative logo and policy link', () => {
      visit('biometric_kyc', 'plain', {
        logo: '/img/logo.png',
        policy: 'privacy.html',
      });
      cy.selectBVNIDType();

      consentScreen()
        .find('img[width="50"]')
        .should('have.attr', 'src', '/img/logo.png');
      consentScreen()
        .find('a.theme')
        .should('have.attr', 'href', 'privacy.html');
    });

    it('biometric_kyc: renders a data: image logo', () => {
      const logo = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      visit('biometric_kyc', 'plain', { logo });
      cy.selectBVNIDType();

      consentScreen().find('img[width="50"]').should('have.attr', 'src', logo);
    });

    it('biometric_kyc: leaves out a data:text/html logo and a javascript: policy link', () => {
      visit('biometric_kyc', 'plain', {
        logo: 'data:text/html,<p>x</p>',
        policy: ' JavaScript:void(0)',
      });
      cy.selectBVNIDType();

      consentScreen().find('#consent-screen').should('be.visible');
      consentScreen().find('img[width="50"]').should('not.exist');
      consentScreen().find('a.theme').should('not.exist');
    });

    it('biometric_kyc: renders right to left for ar-EG', () => {
      cy.loadIDOptions('**/v1', 'ar-EG');
      visit('biometric_kyc', 'plain', { language: 'ar-EG' });
      cy.selectBVNIDType();

      consentScreen().find('#consent-screen').should('have.attr', 'dir', 'rtl');
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
