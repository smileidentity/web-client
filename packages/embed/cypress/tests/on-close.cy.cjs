describe('web integration - onClose', () => {
  beforeEach(() => {
    cy.loadIDOptions();
    cy.visit('/basic_kyc');
  });

  it('should execute the `onClose` handler when the close button is clicked', () => {
    cy.getIFrameBody().find('#select-id-type .close-iframe').click();

    cy.get('iframe').should('not.exist');

    cy.get('.validation-message').should('be.visible');

    cy.get('.validation-message').should('contain.text', 'User triggered');
  });

  it('should not execute the `onClose` handler when consent is denied', () => {
    cy.selectBVNMFAIDType();
    cy.getIFrameBody()
      .find('end-user-consent')
      .shadow()
      .find('#cancel')
      .click();

    cy.getIFrameBody()
      .find('end-user-consent')
      .shadow()
      .find('#confirm-consent-rejection')
      .click();

    cy.get('iframe').should('not.exist');

    cy.get('.validation-message').should('be.visible');

    cy.get('.validation-message').should('not.contain.text', 'User triggered');
  });

  it.only('should not execute the `onClose` handler when verification is successful', () => {
    cy.selectNINIDType();

    cy.intercept(
      {
        method: 'POST',
        url: '*v2/verify_async*',
      },
      { statusCode: 200, body: { success: true } },
    ).as('submitIdVerification');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();
    cy.wait('@submitIdVerification');

    cy.get('iframe').should('not.exist');

    cy.get('.validation-message').should('not.exist');
  });
});
