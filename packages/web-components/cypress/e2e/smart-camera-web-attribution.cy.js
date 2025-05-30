const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '?format=esm' },
];

variants.forEach(({ name, suffix }) => {
  describe(`SmartCameraWeb Attribution [${name}]`, () => {
    it('shows attribution by default', () => {
      cy.visit(`/smart-camera-web-complete-flow${suffix}`);
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('selfie-capture-review')
        .shadow()
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
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
        .find('document-capture#document-capture-front')
        .shadow()
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
        .should('be.visible');

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
        .find('powered-by-smile-id')
        .should('be.visible');
    });

    it('hides attribution when `hide-attribution` attribute is passed', () => {
      cy.visit(`/capture-back-of-id-hide-attribution${suffix}`);
      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .find('selfie-capture-review')
        .shadow()
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');

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
        .get('powered-by-smile-id')
        .should('not.exist');
    });
  });
});
