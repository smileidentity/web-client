it('should ask to confirm "consent denial"', () => {
	cy.visit('/');

	cy
		.selectNINIDType()

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#cancel')
		.click();

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('not.be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-rejected-screen')
		.should('be.visible');
});

it('should restore consent screen when user clicks "go back"', () => {
	cy.visit('/');

	cy
		.selectNINIDType()

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#cancel')
		.click();

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('not.be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-rejected-screen')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#back-to-consent')
		.click();

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('be.visible');
});

it('should close the iframe when user confirms consent denial', () => {
	cy.visit('/');

	cy
		.selectNINIDType()

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#cancel')
		.click();

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-screen')
		.should('not.be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#consent-rejected-screen')
		.should('be.visible');

	cy
		.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('#confirm-consent-rejection')
		.click();

	cy
		.get('[data-cy="smile-identity-hosted-web-integration"]')
		.should('not.exist');
});
