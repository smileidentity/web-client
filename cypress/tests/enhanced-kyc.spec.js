describe('enhanced kyc', () => {
	beforeEach(() => {
		cy.visit('/enhanced-kyc');

		cy
			.selectBVNIDType()

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');
		cy
			.intercept({
				method: 'POST',
				url: '*v1/async_id_verification*'
			}, {}).as('submitEnhancedKYC');
	});

	it('should show an error message when input is invalid', () => {
		cy
			.getIFrameBody()
			.get('#id_number-hint')
			.should('not.exist');

		cy
			.getIFrameBody()
			.find('#id_number')
			.type('12345');

		cy
			.getIFrameBody()
			.find('#submitForm')
			.click();

		cy
			.getIFrameBody()
			.find('#id_number-hint')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('#id_number-hint')
			.should('contain', 'Id number is invalid');
	});

	it('should progress when input is valid', () => {
		cy
			.getIFrameBody()
			.find('#id_number')
			.type('12345678901');

		cy
			.getIFrameBody()
			.find('#submitForm')
			.click();
		cy
			.wait('@submitEnhancedKYC');
		cy
			.getIFrameBody()
			.find('#id-info')
			.should('not.be.visible');
	});
});
