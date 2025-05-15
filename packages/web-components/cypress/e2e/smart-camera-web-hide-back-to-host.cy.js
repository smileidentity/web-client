const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '?format=esm' },
];

variants.forEach(({ name, suffix }) => {
  describe(`SmartCameraWeb HideBackToHost [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/capture-back-of-id-navigation${suffix}`);
    });

    it('shows attribution by default', () => {
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
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#cancel')
        .should('be.visible');
    });

    it('hides back exit and cancel button when `hide-back-to-host` attribute is passed', () => {
      cy.get('smart-camera-web')
        .invoke('attr', 'hide-back-to-host', 'true')
        .should('have.attr', 'hide-back-to-host', 'true');

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
        .should('not.exist');
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#cancel')
        .should('not.exist');
    });
  });
});
