context('SmartCameraWeb', () => {
  beforeEach(() => {
    cy.visit('/smart-camera-web');
  });

  it('should find the button to request-camera-access', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .should('contain.text', 'Request Camera Access');
  });

  it('should switch from the request screen to the selfie instruction screen on clicking "Request Camera Access"', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .shadow()
      .should('contain.text', "Next, we'll take a quick selfie");
  });

  it('should switch from the instruction screen to the camera screen on clicking "Allow"', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .shadow()
      .find('#allow')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Take a Selfie');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#start-image-capture')
      .click();

    cy.wait(8000);

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .should('be.visible');
  });

  it('should show a "SMILE" prompt halfway through the video capture', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .shadow()
      .find('#allow')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Take a Selfie');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#start-image-capture')
      .click();
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#smile-cta')
      .should('be.visible');

    cy
      .wait(5000);

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#smile-cta')
      .should('not.be.visible');
  });

  it('should switch from the review screen back to the selfie instruction screen on clicking "Re-take selfie"', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .shadow()
      .find('#allow')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Take a Selfie');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#start-image-capture')
      .click();

    cy.wait(8000);

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .should('be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .shadow()
      .find('#re-capture-image')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .shadow()
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('be.visible');
  });

  it('should switch from the camera screen to selfie review screen on clicking "Yes, use this"', () => {
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .shadow()
      .find('#allow')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('contain.text', 'Take a Selfie');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#start-image-capture')
      .click();

    cy.wait(8000);

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .should('be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-review')
      .shadow()
      .should('not.be.visible');
  });

  it('should switch to request screen when "Rest"', () => {
    cy
      .get('smart-camera-web').then((element) => {
        element[0].reset();
      });

    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('#request-camera-access')
      .click();

    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('be.visible');

    cy
      .get('smart-camera-web').then((element) => {
        element[0].reset();
      });

    cy
      .get('smart-camera-web')
      .shadow()
      .find('selfie-instruction')
      .should('not.be.visible');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .should('be.visible');
  });
});
