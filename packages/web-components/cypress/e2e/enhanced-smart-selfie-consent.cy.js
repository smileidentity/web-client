/**
 * UI tests for the standalone `<enhanced-smart-selfie-consent>` element.
 *
 * After Stage 1/2 the consent screen lives outside
 * `<enhanced-smartselfie-capture>` so embed product scripts can mount it
 * independently. These tests target the standalone element directly.
 */

const visitConsent = (qs = '') => {
  cy.visit(
    `/?component=enhanced-smart-selfie-consent&direct=true${qs ? `&${qs}` : ''}`,
  );
  return cy.get('enhanced-smart-selfie-consent', { timeout: 10000 });
};

context('Enhanced SmartSelfie Consent — standalone element', () => {
  it('renders with the partner name and Smile ID interpolated into the body', () => {
    visitConsent('partner-name=Acme%20Bank')
      .shadow()
      .within(() => {
        cy.get('.ess-consent', { timeout: 10000 }).should('be.visible');
        cy.get('.ess-consent .title').should('contain.text', 'Acme Bank');
        cy.get('.ess-consent .title').should('contain.text', 'Smile ID');
        cy.get('.ess-consent .body strong').should('contain.text', 'Smile ID');
        cy.get('.ess-consent .body strong').should('contain.text', 'Acme Bank');
        cy.get('.ess-consent .items li').should('have.length', 4);
      });
  });

  it('disables the Allow button until the consent checkbox is checked', () => {
    visitConsent('partner-name=Acme')
      .shadow()
      .within(() => {
        cy.get('.ess-consent .allow').should('be.disabled');
        cy.get('.ess-consent .checkbox input').check({ force: true });
        cy.get('.ess-consent .allow').should('not.be.disabled');
      });
  });

  it('dispatches `enhanced-smart-selfie-consent.granted` when Allow is clicked', () => {
    visitConsent('partner-name=Acme').then(() => {
      cy.window().then((win) => {
        const spy = cy.spy().as('granted');
        win.addEventListener('enhanced-smart-selfie-consent.granted', spy);
      });

      cy.get('enhanced-smart-selfie-consent')
        .shadow()
        .within(() => {
          cy.get('.ess-consent .checkbox input').check({ force: true });
          cy.get('.ess-consent .allow').click();
        });

      cy.get('@granted').should('have.been.called');
    });
  });

  it('dispatches `enhanced-smart-selfie-consent.denied` when Deny is clicked', () => {
    visitConsent('partner-name=Acme').then(() => {
      cy.window().then((win) => {
        const spy = cy.spy().as('denied');
        win.addEventListener('enhanced-smart-selfie-consent.denied', spy);
      });

      cy.get('enhanced-smart-selfie-consent')
        .shadow()
        .within(() => {
          cy.get('.ess-consent .deny').click();
        });

      cy.get('@denied').should('have.been.called');
    });
  });

  it('toggles the Learn more disclosure and exposes the privacy links', () => {
    visitConsent('partner-name=Acme')
      .shadow()
      .within(() => {
        cy.get('.ess-consent .learn-more-copy').should('not.exist');
        cy.get('.ess-consent .learn-more').click();
        cy.get('.ess-consent .learn-more-copy').should('be.visible');
        cy.get('.ess-consent .learn-more-copy a[href*="dsar.usesmileid.com"]')
          .should('exist')
          .and('contain.text', 'DSAR');
        cy.get(
          '.ess-consent .learn-more-copy a[href*="usesmileid.com/legal/privacy-policy"]',
        ).should('exist');
      });
  });
});
