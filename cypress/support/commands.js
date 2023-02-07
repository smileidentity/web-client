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

Cypress.Commands.add('loadIDOptions', () => {
	cy.log('loadingIDOptions');

	cy
		.intercept('GET', '**/v1/services', { fixture: 'services.json' });

	cy
		.intercept('POST', '**/v1/products_config', { fixture: 'products_config.json' });
});

Cypress.Commands.add('selectBVNIDType', () => {
	cy
		.loadIDOptions();

	cy.log('selectingBVNIDType');

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

Cypress.Commands.add('selectBVNMFAIDType', () => {
	cy
		.loadIDOptions();

	cy.log('selectingBVNMFAIDType');

	cy
		.getIFrameBody()
		.find('#country')
		.select('NG')

	cy
		.getIFrameBody()
		.find('#id_type')
		.select('BVN_MFA')

	cy
		.getIFrameBody()
		.find('#submitConfig')
		.click();
});

Cypress.Commands.add('selectNINIDType', () => {
	cy
		.loadIDOptions();

	cy.log('selectingNINIDType');

	cy
		.getIFrameBody()
		.find('#country')
		.select('NG')

	cy
		.getIFrameBody()
		.find('#id_type')
		.select('NIN')

	cy
		.getIFrameBody()
		.find('#submitConfig')
		.click();
});

Cypress.Commands.add('navigateThroughCameraScreens', () => {
	cy.log('navigatingThroughCameraScreens');

	cy
		.getIFrameBody()
		.find('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

	cy
		.getIFrameBody()
		.find('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(4000);

	cy
		.getIFrameBody()
		.find('smart-camera-web')
		.shadow()
		.find('#select-selfie')
		.click();
});
