it('should load an iframe', () => {
	cy.visit('/');

	cy
		.get('#iframe')
		.its('0.contentDocument.body')
		.should('be.visible')
});
