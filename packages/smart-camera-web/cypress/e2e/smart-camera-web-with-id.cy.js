// smart-camera-web-with-id.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
context('SmartCameraWeb', () => {
  beforeEach(() => {
    cy.visit('/capture-id');
  });

  it('should find the button to request-camera-access', () => {
    cy.get('smart-camera-web')
      .shadow()
      .find('#request-camera-access')
      .should('contain.text', 'Request Camera Access');
  });

  it('should switch from the request screen to the camera screen on clicking "Request Camera Access"', () => {
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#request-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#camera-screen')
      .should('be.visible');
  });

  it('should switch from the camera screen to the review screen on clicking "Take Selfie"', () => {
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.wait(8000);

    cy.get('smart-camera-web')
      .shadow()
      .find('#camera-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#review-screen')
      .should('be.visible');
  });

  it('should show a "SMILE" prompt halfway through the video capture', () => {
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#smile-cta')
      .should('not.be.visible');

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.wait(3000);

    cy.get('smart-camera-web').shadow().find('#smile-cta').should('be.visible');

    cy.wait(5000);

    cy.get('smart-camera-web')
      .shadow()
      .find('#smile-cta')
      .should('not.be.visible');
  });

  it('should switch from the review screen back to the camera screen on clicking "Re-take selfie"', () => {
    cy.clock();
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.tick(8000);

    cy.get('smart-camera-web').shadow().find('#restart-image-capture').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#camera-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#review-screen')
      .should('not.be.visible');
  });

  it('should switch from the review screen to the id camera screen on clicking "Yes, use this one"', () => {
    cy.clock();
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.tick(8000);

    cy.get('smart-camera-web').shadow().find('#select-selfie').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#review-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape .actions')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape .image-frame')
      .should('be.visible');
  });

  it('should capture a photo when "capture-id-image" is clicked, and move to the "id-review-screen"', () => {
    cy.clock();
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.tick(8000);

    cy.get('smart-camera-web').shadow().find('#select-selfie').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web').shadow().find('#capture-id-image').click();

    cy.wait(2000);

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-review-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-review-screen .id-video-container.landscape img')
      .should('not.have.css', 'transform', 'none');
  });

  it('should switch from the id review screen back to the camera screen on clicking the "Re-Capture" icon', () => {
    cy.clock();
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.tick(8000);

    cy.get('smart-camera-web').shadow().find('#select-selfie').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web').shadow().find('#capture-id-image').click();

    cy.wait(2000);

    cy.get('smart-camera-web').shadow().find('#re-capture-id-image').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-review-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape .actions')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-camera-screen .id-video-container.landscape .image-frame')
      .should('be.visible');
  });

  it('should switch from the review screen to the id camera screen on clicking the "Approve" icon', () => {
    cy.clock();
    cy.get('smart-camera-web').shadow().find('#request-camera-access').click();

    cy.get('smart-camera-web').shadow().find('#start-image-capture').click();

    cy.tick(8000);

    cy.get('smart-camera-web').shadow().find('#select-selfie').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web').shadow().find('#capture-id-image').click();

    cy.wait(2000);

    cy.get('smart-camera-web').shadow().find('#select-id-image').click();

    cy.get('smart-camera-web')
      .shadow()
      .find('#id-review-screen')
      .should('not.be.visible');

    cy.get('smart-camera-web')
      .shadow()
      .find('#thanks-screen')
      .should('be.visible');
  });
});
