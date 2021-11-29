// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// -- Get iFrame body
Cypress.Commands.add('getIFrameBody', () => {
	cy.log('getIFrameBody');

	return cy
		.get('iframe[data-cy="smile-identity-hosted-web-integration"]', { log: false })
		.its('0.contentDocument.body', { log: false })
		.should('not.be.empty')
		.then(body => cy.wrap(body, { log: false }));
});

Cypress.Commands.add('selectBVNIDType', () => {
	cy.log('selectingBVNIDType');

	cy
		.intercept('GET', '*/v1/services', { fixture: 'services' });

	cy
		.getIFrameBody()
		.find('#country')
		.select('NG')

	cy
		.getIFrameBody()
		.find('#id_type')
		.select('BVN')

	cy
		.getIFrameBody()
		.find('#submitConfig')
		.click();
});
