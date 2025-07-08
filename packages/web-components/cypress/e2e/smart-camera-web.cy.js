const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb Core Flow [${name}]`, () => {
    beforeEach(() => {
      // Use dev server with URL-based prop passing - basic selfie flow
      cy.visit(`/?component=smart-camera-web&direct=true${suffix}`);
      
      // Set disable-image-tests attribute on the component like the working tests
      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');
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
        .should('be.visible');
    });

    it.skip('should switch from the instruction screen to the camera screen on clicking "Allow"', () => {
      // Skipped: Requires camera capture which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
      
      // Handle modern vs fallback component logic for start button
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .then(($shadow) => {
          if ($shadow.find('smartselfie-capture').length > 0) {
            // Modern SmartSelfieCapture path
            cy.wrap($shadow)
              .find('smartselfie-capture')
              .shadow()
              .find('#start-image-capture')
              .click();
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('#start-image-capture')
              .click();
          } else {
            throw new Error('Neither smartselfie-capture nor selfie-capture found');
          }
        });

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

    it.skip('should have a timer for the capture', () => {
      // Skipped: Requires camera capture which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
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
    it.skip('should switch from the review screen back to the selfie instruction screen on clicking "Re-take selfie"', () => {
      // Skipped: Requires camera capture which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
      cy.clock();
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
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
        .find('selfie-capture-instructions')
        .should('be.visible');
    });

    it.skip('should switch from the camera screen to selfie review screen on clicking "Yes, use this"', () => {
      // Skipped: Requires camera capture which fails in Cypress environment
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
        .find('selfie-capture-wrapper')
        .should('be.visible');
      cy.clock();
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
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
        .find('selfie-capture-instructions')
        .should('be.visible');
    });
  });
});
