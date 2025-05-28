const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '?format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb HideInstructions [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/smart-camera-web-hide-instructions${suffix}`);
    });

    it('should start from the request camera screen', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('be.visible');
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .should('contain.text', 'Request Camera Access');
    });

    it('should switch from the request screen to the selfie capture screen on clicking "Request Camera Access"', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
    });

    it('should have a 8000ms timer', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
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

    it('should switch from the selfie screen to the review screen on clicking "Take Selfie"', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
      cy.clock();
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

    it('should show a "SMILE" prompt halfway through the video capture', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
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

    it('should switch from the review screen back to the selfie capture screen on clicking "Re-take selfie"', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
      cy.clock();
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
        .find('selfie-capture')
        .should('be.visible');
    });

    it('should switch from the camera screen to selfie review screen on clicking "Yes, use this"', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
      cy.clock();
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

    it('should switch to request screen when "Reset"', () => {
      cy.get('smart-camera-web').then((element) => {
        element[0].reset();
      });

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .shadow()
        .find('#request-camera-access')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
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
        .find('camera-permission')
        .should('be.visible');
    });
  });
});
