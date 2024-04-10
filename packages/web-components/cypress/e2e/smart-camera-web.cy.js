context('SmartCameraWeb', () => {
  beforeEach(() => {
    cy.visit('/smart-camera-web');
  });

  it('should start from the instructions screen', () => {
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('be.visible');
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .should('contain.text', "Next, we'll take a quick selfie");
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();
  });

  it('should switch from the instruction screen to the camera screen on clicking "Allow"', () => {
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
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

    cy.wait(8000);

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

  it('should have a timer for the capture', () => {
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
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

    cy.wait(8000);

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

  it('should show a "SMILE" prompt halfway through the video capture', () => {
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
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
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#smile-cta')
      .should('be.visible');

    cy.wait(5000);

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .shadow()
      .find('#smile-cta')
      .should('not.be.visible');
  });

  it('should switch from the review screen back to the selfie instruction screen on clicking "Re-take selfie"', () => {
    cy.clock();
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
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

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-review')
      .shadow()
      .find('#re-capture-image')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-review')
      .shadow()
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('be.visible');
  });

  it('should switch from the camera screen to selfie review screen on clicking "Yes, use this"', () => {
    cy.clock();
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');
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

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-review')
      .shadow()
      .should('not.be.visible');
  });

  it('should switch to request screen when "Rest"', () => {
    cy.get('smart-camera-web').then((element) => {
      element[0].reset();
    });

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .shadow()
      .find('#allow')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('be.visible');

    cy.get('smart-camera-web').then((element) => {
      element[0].reset();
    });

    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture')
      .should('not.be.visible');
    cy.get('smart-camera-web')
      .shadow()
      .find('selfie-capture-instructions')
      .should('be.visible');
  });
});
