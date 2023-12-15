context('SmartCameraWeb - Skip Back of ID Document Capture', () => {
  beforeEach(() => {
    cy.visit('/capture-back-of-id');
  });

  context('when a document type does not exist', () => {
    it('should switch from the back of ID entry screen to the thanks screen on clicking the "Skip this step" button', () => {
      cy
        .get('smart-camera-web')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy
        .wait(8000);

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#select-selfie')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #take-photo')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('not.be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy
        .wait(2000);

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#select-id-image')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#back-of-id-entry-screen')
        .should('be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#back-of-id-entry-screen #skip-this-step')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#back-of-id-entry-screen')
        .should('not.be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#thanks-screen')
        .should('be.visible');
    });
  });

  context('when a document-type exists', () => {
    beforeEach(() => {
      cy
        .get('smart-camera-web')
        .invoke('attr', 'document-type', 'GREEN_BOOK');
    });

    it('should not show the "skip this step" button', () => {
      cy
        .get('smart-camera-web')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy
        .wait(8000);

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#select-selfie')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #take-photo')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('not.be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy
        .wait(2000);

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#select-id-image')
        .click();

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#back-of-id-entry-screen')
        .should('be.visible');

      cy
        .get('smart-camera-web')
        .shadow()
        .find('#back-of-id-entry-screen #skip-this-step')
        .should('not.exist');
    });
  });
});
