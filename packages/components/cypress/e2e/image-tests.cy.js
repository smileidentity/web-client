// smart-camera-web.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
context('SmartCameraWeb - Image Tests', () => {
  beforeEach(() => {
    cy.visit('/image-tests');
  });

  it('should show an error message when image is unusable', () => {
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
      .find('#camera-screen')
      .should('not.be.visible');

    cy
      .get('smart-camera-web')
      .shadow()
      .find('#review-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#error')
      .should('contain.text', 'Unable to access webcam - please try using a different device');
  });
});
