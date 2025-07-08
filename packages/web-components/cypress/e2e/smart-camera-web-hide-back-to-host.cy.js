const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  describe(`SmartCameraWeb HideBackToHost [${name}]`, () => {
    beforeEach(() => {
      // Use dev server with URL-based prop passing - default selfie flow to test navigation
      cy.visit(`/?component=smart-camera-web&direct=true&disable-image-tests=true${suffix}`);
    });

    it('shows navigation by default', () => {
      // Check that back and cancel buttons exist in selfie instructions
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
        .find('#cancel')
        .should('be.visible');
    });

    it('hides back exit and cancel button when `hide-back-to-host` attribute is passed', () => {
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
        
      // Verify the cancel button is hidden
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#cancel', { timeout: 0 })
        .should('not.be.visible');
    });
  });
});
