const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb HideInstructions [${name}]`, () => {
    beforeEach(() => {
      // Use dev server with URL-based prop passing - hide instructions to skip to camera permission
      cy.visit(
        `/?component=smart-camera-web&direct=true&hide-instructions=true${suffix}`,
      );

      // Set disable-image-tests attribute on the component like the working tests
      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
    });

    it.skip('should have a 8000ms timer', () => {
      // Skipped: Selfie capture with timing requires camera access which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');

      // Click start button in selfie capture
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy.wait(8000);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .should('be.visible');
    });

    it.skip('should switch from the selfie screen to the review screen on clicking "Take Selfie"', () => {
      // Skipped: Selfie capture requires camera access which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');

      cy.clock();

      // Click start button in selfie capture
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy.tick(8000);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .should('be.visible');
    });

    it.skip('should switch from the review screen back to the selfie capture screen on clicking "Re-take selfie"', () => {
      // Skipped: Selfie capture requires camera access which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');

      cy.clock();

      // Click start button in selfie capture
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy.tick(8000);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
    });

    it.skip('should switch from the camera screen to selfie review screen on clicking "Yes, use this"', () => {
      // Skipped: Selfie capture requires camera access which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');

      cy.clock();

      // Click start button in selfie capture
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy.tick(8000);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
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
        .find('selfie-capture-wrapper')
        .should('be.visible');

      cy.get('smart-camera-web').then((element) => {
        element[0].reset();
      });

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .should('not.be.visible');
      cy.get('smart-camera-web')
        .shadow()
        .find('camera-permission')
        .should('be.visible');
    });
  });
});
