const themeColor = '#001093';
const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb [${name}]`, () => {
    beforeEach(() => {
      cy.visit(
        `/?component=smart-camera-web&direct=true&capture-id=true&disable-image-tests=true&theme-color=${encodeURIComponent(themeColor)}${suffix}`,
      );
    });

    it('should go through the complete selfie capture flow with theme color', () => {
      cy.get('smart-camera-web')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

      // Since document capture has issues in Cypress, we'll verify we can reach document instructions
      // but not test the full document flow
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

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-instructions')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-front',
        )
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);
    });

    it.skip('should complete the full document capture flow', () => {
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

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

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

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
        .click({ force: true });

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-front')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .shadow()
        .find('#select-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .shadow()
        .find('#capture-id-image')
        .click({ force: true });

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);
    });
  });
});
