// smart-camera-web.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb BackPress [${name}]`, () => {
    beforeEach(() => {
      cy.visit(
        `/?component=smart-camera-web&direct=true&capture-id=back&disable-image-tests=true&show-navigation=true${suffix}`,
      );
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

    it('should navigate back when back button is pressed in selfie camera screen', () => {
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

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('be.visible');
    });

    it('should switch from the document instructions to the selfie screen on clicking the back button', () => {
      // Navigate through selfie flow
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

      // Wait for component to load
      cy.wait(2000);

      cy.clock();
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#start-image-capture')
        .click();

      cy.tick(8000);

      // Select ID image to go to document flow
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-instructions')
        .should('be.visible');

      // Click back button in document instructions
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

      // Should go back to the selfie capture wrapper, not review
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .should('be.visible');
    });

    it('should handle close button interactions', () => {
      // Test close button in selfie instructions
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.close-button')
        .should('be.visible');

      // Component should emit close event (we can't test URL navigation in this setup)
      // But we can verify the button exists and is clickable
    });
  });
});
