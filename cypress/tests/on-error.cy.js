describe('web-integration onError', () => {
	beforeEach(() => {
		cy.loadIDOptions();
	});

	it('should run when an error is published from the integration', () => {
		cy.visit('/basic_kyc');
		cy.selectBVNMFAIDType();

		cy.getIFrameBody()
			.find('end-user-consent')
			.shadow()
			.find('#allow')
			.click();

		cy.getTotpConsentApp()
			.find('#id_number')
			.type('00000000000');

		cy.getTotpConsentApp()
			.find('#query-otp-modes')
			.click();

		cy.getTotpConsentApp()
			.find('form[name="select-mode-form"]')
			.should('be.visible');

		cy.getTotpConsentApp()
			.find('#contact-methods-outdated')
			.click();

		cy.get('iframe')
			.should('not.exist');

		cy.get('.validation-message')
			.should('be.visible');
	});
});
