describe('SmartCameraWeb', () => {
  it('shows attribution by default', () => {
    cy.visit('/');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('.back-button-exit')
      .should('be.visible');
  });

  it('hides back exit button when `hide-back-to-host` attribute is passed', () => {
    cy.visit('/capture-id-hide-back-to-host');
    cy
      .get('smart-camera-web')
      .shadow()
      .find('.back-button-exit')
      .should('not.exist');
  });
});
