it('should load an iframe', () => {
	cy.visit('/demo');

	cy
		.loadIDOptions();

	cy
		.getIFrameBody()
		.find('#country')
		.select('Nigeria');

	cy
		.getIFrameBody()
		.find('#id_type')
		.select('DRIVERS_LICENSE');

	cy
		.getIFrameBody()
		.find('#submitConfig')
		.click();

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('.demo-tip')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#allow')
		.click();

	cy
		.navigateThroughCameraScreens();

	cy
		.getIFrameBody()
		.find('#id-info')
		.as('IDInfoForm');
	
	cy
		.get('@IDInfoForm')
		.find('.demo-tip')
		.should('be.visible');

	cy
		.get('@IDInfoForm')
		.find('input')
		.then(inputs => {
			Array.prototype.forEach.call(inputs, input => {
				expect(input).to.have.prop('readonly', true);
			});
		});
});
