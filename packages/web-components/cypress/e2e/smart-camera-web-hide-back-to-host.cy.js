const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  describe(`SmartCameraWeb HideBackToHost [${name}]`, () => {
    beforeEach(() => {
      // Use dev server with URL-based prop passing - default selfie flow to test navigation
      cy.visit(
        `/?component=smart-camera-web&direct=true&disable-image-tests=true${suffix}`,
      );
    });

    it('shows navigation by default', () => {
      // Check that back and close buttons exist in selfie instructions
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('[part="close-button"]')
        .should('be.visible');
    });

    it('hides back exit and close button when `hide-back-to-host` attribute is passed', () => {
      // Set the hide-back-to-host attribute
      cy.get('smart-camera-web')
        .invoke('attr', 'hide-back-to-host', 'true')
        .should('have.attr', 'hide-back-to-host', 'true');

      // Verify the back button is hidden in navigation
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('.back-button')
        .should('not.exist');

      // Verify the close button still exists
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .shadow()
        .find('[part="close-button"]')
        .should('be.visible');
    });

    it('does not render navigation element when `show-navigation` is not provided', () => {
      // Visit with show-navigation=false to disable navigation
      cy.visit(
        `/?component=smart-camera-web&direct=true&disable-image-tests=true&show-navigation=false${suffix}`,
      );

      // Verify selfie-capture-instructions screen is visible
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .should('be.visible');

      // Verify smileid-navigation does not exist in the DOM
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('smileid-navigation')
        .should('not.exist');
    });
  });
});
