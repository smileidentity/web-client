// smart-camera-web.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '?format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb BackPress [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/capture-back-of-id-navigation${suffix}`);
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
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .should('be.visible');
    });

    it('should navigate to "back_pressed" when back button on request page button is pressed', () => {
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
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.location('pathname').should('eq', '/back_pressed');
    });

    it('should navigate to "back_pressed" when back button is pressed in selfie camera screen', () => {
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
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('be.visible');
    });

    it('should switch from the idEntryScreen to the selfieScreen on clicking the back button', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-instructions')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-instructions')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
    });

    it('should switch from the idCameraScreen to the idEntryScreen on clicking the "back" button', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-instructions')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .should('not.be.visible');
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .should('be.visible');
    });

    it('should switch from the idBackEntryScreen to the idFrontEntryScreen on clicking the "back" button', () => {
      cy.navigateFaceCaptureScreens();
      cy.navigateDocumentFrontCaptureWithInstructions();
    });

    it('should switch from the backOfIdCameraScreen to the backOfIdEntryScreen on clicking the "back" button', () => {
      cy.navigateFaceCaptureScreens();

      cy.navigateDocumentFrontCaptureWithInstructions();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .should('be.visible');
    });

    it('should navigate to "closed" when close button is pressed in selfie instruction screen', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in selfie screen', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .should('be.visible');
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in selfie review screen', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .should('contain.text', 'Take a Selfie');
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
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in front document instructions screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();
      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in front document camera screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in front document review screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#front-of-document-capture-review')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in back document instructions screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#front-of-document-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in back document camera screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#front-of-document-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .shadow()
        .find('#take-photo')
        .click();
      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });

    it('should navigate to "closed" when close button is pressed in id back review screen', () => {
      cy.navigateFaceCaptureScreens();
      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#front-of-document-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .shadow()
        .find('#take-photo')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .click();

      cy.exitScreens();
    });
  });
});
