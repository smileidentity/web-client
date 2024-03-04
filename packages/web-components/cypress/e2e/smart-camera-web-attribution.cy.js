describe('SmartCameraWeb', () => {
  it('shows attribution by default', () => {
    cy.visit('/smart-camera-web');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('powered-by-smile-id')
      .should('be.visible');
  });

  it.only('hides attribution when `hide-attribution` attribute is passed', () => {
    cy.visit('/capture-back-of-id-hide-attribution');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('camera-permission')
      .shadow()
      .find('powered-by-smile-id')
      .should('not.exist');
  });
});
