// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('exitScreens', () => {
  cy.location('pathname').should('eq', '/closed');
  cy.get('smart-camera-web').should('not.exist');
});

Cypress.Commands.add('navigateFaceCaptureScreens', () => {
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

  // Wait for component to load
  cy.wait(2000);

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
        throw new Error('Neither smartselfie-capture nor selfie-capture found');
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

Cypress.Commands.add('navigateDocumentFrontCaptureWithInstructions', () => {
  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-instructions')
    .should('be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-instructions#document-capture-instructions-front')
    .shadow()
    .find('#take-photo')
    .click();

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-instructions#document-capture-instructions-front')
    .should('not.be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture#document-capture-front')
    .should('be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture#document-capture-front')
    .shadow()
    .find('#capture-id-image')
    .click();

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture#document-capture-front')
    .should('not.be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-review#front-of-document-capture-review')
    .should('be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-review#front-of-document-capture-review')
    .shadow()
    .find('#select-id-image')
    .click();

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-review#front-of-document-capture-review')
    .should('not.be.visible');

  cy.get('smart-camera-web')
    .shadow()
    .find('document-capture-instructions#document-capture-instructions-back')
    .should('be.visible');
});
