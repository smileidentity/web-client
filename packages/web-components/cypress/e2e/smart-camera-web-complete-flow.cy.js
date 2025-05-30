const themeColor = '#001093';
const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '?format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/smart-camera-web-complete-flow${suffix}`);
    });

    it('should go from the camera screen through to document review with camera capture', () => {
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
        .find('selfie-capture')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find(
          'document-capture-instructions#document-capture-instructions-back',
        )
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

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
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .shadow()
        .find('#capture-id-image')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture#document-capture-back')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .invoke('attr', 'theme-color')
        .should('equal', themeColor);

      cy.get('smart-camera-web')
        .shadow()
        .find('document-capture-review#back-of-document-capture-review')
        .shadow()
        .find('#select-id-image')
        .click();
    });
  });
});
