context('SmartCameraWeb', () => {
  beforeEach(() => {
    cy.visit('/smart-camera-web-agent-mode');
  });
  it('should switch from the selfie mode to agent mode"', () => {
    cy.log('Enable agent mode for tests');
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .invoke('attr', 'show-agent-mode-for-tests', 'true');

    cy.clock();
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Agent Mode On');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#switch-camera')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Agent Mode Off');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#switch-camera')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Agent Mode On');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Take a Selfie');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#start-image-capture')
      .click();

    cy.tick(8000);

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-review')
      .should('be.visible');
  });
});
