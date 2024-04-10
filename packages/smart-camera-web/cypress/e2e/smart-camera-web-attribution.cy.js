describe('SmartCameraWeb', () => {
  it('shows attribution by default', () => {
    cy.visit('/');
    cy.get('smart-camera-web')
      .shadow()
      .find('powered-by-smile-id')
      .should('be.visible');
  });

  it('hides attribution when `hide-attribution` attribute is passed', () => {
    cy.visit('/capture-back-of-id-hide-attribution');
    cy.get('smart-camera-web')
      .shadow()
      .find('powered-by-smile-id')
      .should('not.exist');
  });
});
