const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb AgentMode [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/?component=smart-camera-web&direct=true${suffix}`);
    });

    it('should switch from the selfie mode to agent mode', () => {
      cy.log('Enable agent mode for tests');
      cy.get('smart-camera-web')
        .invoke('attr', 'allow-agent-mode', 'true')
        .should('have.attr', 'allow-agent-mode', 'true');

      cy.get('smart-camera-web').invoke(
        'attr',
        'show-agent-mode-for-tests',
        'true',
      );
      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');

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

      // Wait a bit for any async loading
      cy.wait(2000);

      // Debug: Let's see what's actually inside selfie-capture-wrapper shadow DOM
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .then(($shadow) => {
          const html = $shadow[0].innerHTML;
          cy.log('Shadow DOM content:', html);

          // Check what components are present
          const hasSmartSelfie = $shadow.find('smartselfie-capture').length > 0;
          const hasSelfieCapture = $shadow.find('selfie-capture').length > 0;
          const hasLoading =
            html.includes('Loading') || html.includes('loading');

          cy.log(`SmartSelfieCapture present: ${hasSmartSelfie}`);
          cy.log(`SelfieCapture present: ${hasSelfieCapture}`);
          cy.log(`Loading text present: ${hasLoading}`);
        });

      // Check for agent mode controls in either component
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .then(($shadow) => {
          if ($shadow.find('smartselfie-capture').length > 0) {
            // Modern SmartSelfieCapture path
            cy.log('Using SmartSelfieCapture path');
            cy.wrap($shadow)
              .find('smartselfie-capture')
              .shadow()
              .should('contain.text', 'Agent Mode On');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.log('Using SelfieCapture fallback path');
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .should('contain.text', 'Agent Mode On');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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
              .find('#switch-camera')
              .click();
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('#switch-camera')
              .click();
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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
              .should('contain.text', 'Agent Mode Off');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .should('contain.text', 'Agent Mode Off');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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
              .find('#switch-camera')
              .click();
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('#switch-camera')
              .click();
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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
              .should('contain.text', 'Agent Mode On');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .should('contain.text', 'Agent Mode On');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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

    it('should not show the agent mode switch button', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .invoke('attr', 'show-agent-mode-for-tests', 'false');
      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');

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
              .find('#switch-camera')
              .should('not.exist');
          } else if ($shadow.find('selfie-capture').length > 0) {
            // Fallback SelfieCapture path
            cy.wrap($shadow)
              .find('selfie-capture')
              .shadow()
              .find('#switch-camera')
              .should('not.exist');
          } else {
            throw new Error(
              'Neither smartselfie-capture nor selfie-capture found',
            );
          }
        });

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
  });
});
