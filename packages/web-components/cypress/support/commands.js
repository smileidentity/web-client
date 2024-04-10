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
