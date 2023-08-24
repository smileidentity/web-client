describe('ID verification', () => {
	beforeEach(() => {
		cy.loadIDOptions();
		cy.visit('/identity-verification');

		cy
			.selectNINIDType()

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');
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
			.intercept({
				method: 'POST',
				url: '*v2/verify_async*'
			}, {}).as('submitIdVerification');

		cy
			.getIFrameBody()
			.find('#id_number')
			.type('12345678901');

		cy
			.getIFrameBody()
			.find('#submitForm')
			.click();
		cy
			.wait('@submitIdVerification');
	});

	it('should show consent screen for the required id type', () => {
		cy.visit('/identity-verification');

		cy
			.selectBVNIDType();

		cy
			.getIFrameBody()
			.find('end-user-consent')
			.shadow()
			.find('#consent-screen')
			.should('be.visible');
	});

	it('should show the select id page', ()=>{
		cy
		.getIFrameBody()
		.find('#back-button')
		.click();

		cy
			.getIFrameBody()
			.find('#select-id-type')
			.should('be.visible');
	});
});
