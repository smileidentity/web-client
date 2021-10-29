it('should load an iframe', () => {
	cy.visit('/');

	cy
		.get('#smile-identity-hosted-integration')
		.its('0.contentDocument.body')
		.should('be.visible')
});
