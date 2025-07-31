const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartCameraWeb AgentMode [${name}]`, () => {
    beforeEach(() => {
      cy.visit(`/?component=smart-camera-web&direct=true${suffix}`);
    });

    it('should show agent mode button when enabled', () => {
      cy.get('smart-camera-web')
        .invoke('attr', 'allow-agent-mode', 'true')
        .should('have.attr', 'allow-agent-mode', 'true');

      cy.get('smart-camera-web').invoke(
        'attr',
        'show-agent-mode-for-tests',
        'true',
      );

      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .should('be.visible');

      // Wait for component to load and setup
      cy.wait(3000);

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-wrapper')
        .shadow()
        .find('selfie-capture')
        .shadow()
        .find('#switch-camera')
        .should('exist');
    });

    it('should not show the agent mode switch button', () => {
      cy.get('smart-camera-web').invoke('attr', 'disable-image-tests', '');

      cy.get('smart-camera-web')
        .shadow()
        .find('selfie-capture-instructions')
        .shadow()
        .find('#allow')
        .click();

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
        .find('#switch-camera')
        .should('not.exist');
    });
  });
});
