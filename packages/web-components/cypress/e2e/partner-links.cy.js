/**
 * Partner logo and policy links are shown when they are http(s) URLs, or for
 * the logo a data: image URL, and left out otherwise.
 */

const LOGO = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const visit = (component, attrs) =>
  cy.visit(
    `/?component=${component}&direct=true&${new URLSearchParams(attrs)}`,
  );

const consent = () =>
  cy.get('enhanced-smart-selfie-consent', { timeout: 10000 }).shadow();

const policyLink = () =>
  consent().find('.ess-consent .learn-more-copy a').contains('Acme');

context('Partner links', () => {
  it('consent screen shows a data: image logo and a protocol-relative policy link', () => {
    visit('enhanced-smart-selfie-consent', {
      'partner-logo': LOGO,
      'partner-name': 'Acme',
      'policy-url': '//example.com/privacy',
    });

    consent().find('img.partner-logo').should('have.attr', 'src', LOGO);
    consent().find('.ess-consent .learn-more').click();
    policyLink().should('have.attr', 'href', '//example.com/privacy');
  });

  it('consent screen shows a protocol-relative logo', () => {
    visit('enhanced-smart-selfie-consent', {
      'partner-logo': '//example.com/logo.png',
      'partner-name': 'Acme',
    });

    consent()
      .find('img.partner-logo')
      .should('have.attr', 'src', '//example.com/logo.png');
  });

  it('consent screen leaves out a data:text/html logo and a javascript: policy link', () => {
    visit('enhanced-smart-selfie-consent', {
      'partner-logo': 'data:text/html,<p>x</p>',
      'partner-name': 'Acme',
      // eslint-disable-next-line no-script-url
      'policy-url': 'JavaScript:void(0)',
    });

    consent().find('.ess-consent').should('be.visible');
    consent().find('img.partner-logo').should('not.exist');
    consent().find('.ess-consent .learn-more').click();
    consent().find('.ess-consent .learn-more-copy strong').contains('Acme');
    consent()
      .find('.ess-consent .learn-more-copy a')
      .each(($link) => {
        expect($link.attr('href')).to.match(/^https:/);
      });
  });

  it('smart-camera-web passes on a data: image logo and a protocol-relative policy link', () => {
    visit('smart-camera-web', {
      'partner-logo': LOGO,
      'policy-url': '//example.com/privacy',
    });

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-screens')
      .should('have.attr', 'partner-logo', LOGO)
      .and('have.attr', 'policy-url', '//example.com/privacy');
  });

  it('smart-camera-web leaves out a data:text/html logo and a javascript: policy link', () => {
    visit('smart-camera-web', {
      'partner-logo': 'data:text/html,<p>x</p>',
      // eslint-disable-next-line no-script-url
      'policy-url': 'JavaScript:void(0)',
    });

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-screens')
      .should(($screens) => {
        expect($screens.attr('partner-logo')).to.eq(undefined);
        expect($screens.attr('policy-url')).to.eq(undefined);
      });
  });
});
