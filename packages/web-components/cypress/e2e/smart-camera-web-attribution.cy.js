const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  describe(`SmartCameraWeb Attribution [${name}]`, () => {
    it('shows attribution by default in selfie flow', () => {
      cy.visit(
        `/?component=smart-camera-web&direct=true&disable-image-tests=true${suffix}`,
      );

      // Check attribution is shown in initial instructions
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('powered-by-smile-id')
        .should('be.visible');

      // Proceed to camera
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .should('be.visible');

      // Wait for component to load
      cy.wait(2000);

      // Check attribution is shown in camera view
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
              .find('powered-by-smile-id')
              .should('be.visible');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('powered-by-smile-id')
              .should('be.visible');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

      // Take a photo
      cy.clock();
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
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });
      cy.tick(8000);

      // Check attribution is shown in review
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .shadow()
        .find('powered-by-smile-id')
        .should('be.visible');
    });

    it('hides attribution when `hide-attribution` attribute is passed', () => {
      cy.visit(
        `/?component=smart-camera-web&direct=true&hide-attribution=true&disable-image-tests=true${suffix}`,
      );

      // Check attribution is hidden in initial instructions
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('powered-by-smile-id')
        .should('not.exist');

      // Proceed to camera
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .should('be.visible');

      // Wait for component to load
      cy.wait(2000);

      // Check attribution is hidden in camera view
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
              .find('powered-by-smile-id')
              .should('not.exist');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('powered-by-smile-id')
              .should('not.exist');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

      // Take a photo
      cy.clock();
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
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });
      cy.tick(8000);

      // Check attribution is hidden in review
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .shadow()
        .find('powered-by-smile-id')
        .should('not.exist');
    });
  });
});
