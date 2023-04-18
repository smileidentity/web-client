describe('SmartCameraWeb', () => {
	it('shows attribution by default', () => {
		cy.visit('/');
		cy
			.get('smart-camera-web')
			.shadow()
			.find('.powered-by')
			.should('contain.text', 'Powered By');
	});

	it('hides attribution when `hide-attribution` attribute is passed', () => {
		cy.visit('/capture-back-of-id-hide-attribution');
		cy
			.get('smart-camera-web')
			.shadow()
			.find('.powered-by')
			.should('not.exist');
	});
});
