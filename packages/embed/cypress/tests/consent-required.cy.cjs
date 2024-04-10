describe('consent required', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('should show consent screen for the required id type', () => {
    cy.visit('/consent-required');

    cy.selectBVNIDType();

    cy.getIFrameBody()
      .find('end-user-consent')
      .shadow()
      .find('#consent-screen')
      .should('be.visible');
  });

  it('should NOT show consent screen for the non-required id type', () => {
    cy.visit('/consent-required');

    cy.loadIDOptions();

    cy.getIFrameBody()
      .find('#country')
      .select('Nigeria')
      .should('have.value', 'NG');

    cy.getIFrameBody()
      .find('#id_type')
      .select('NIN')
      .should('have.value', 'NIN');

    cy.getIFrameBody().find('#submitConfig').click();

    cy.getIFrameBody().find('end-user-consent').should('not.exist');
  });

  it('should NOT show consent screen when configuration is absent', () => {
    cy.visit('/consent-not-required');

    cy.loadIDOptions();

    cy.getIFrameBody()
      .find('#country')
      .select('Nigeria')
      .should('have.value', 'NG');

    cy.getIFrameBody()
      .find('#id_type')
      .select('NIN')
      .should('have.value', 'NIN');

    cy.getIFrameBody().find('#submitConfig').click();

    cy.getIFrameBody().find('end-user-consent').should('not.exist');

    cy.getIFrameBody().find('smart-camera-web').should('exist');
  });
});
