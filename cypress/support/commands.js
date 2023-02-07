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

	cy
		.intercept('POST', '**/v1/totp_consent', {
			statusCode: 200,
			body: {
				message: 'Select OTP Delivery Mode',
				modes: [
					{
						sms: '08001****67',
					},
					{
						email: 'fa*****il@gmail.com',
					}
				],
				session_id: '0000000000000',
				success: true,
			}
		});

	cy
		.intercept('POST', '**/v1/totp_consent/mode', {
			statusCode: 200,
			body: {
				message: 'OTP Delivery Mode Selected',
				success: true,
			}
		});

	cy
		.intercept('POST', '**/v1/totp_consent/otp', {
			statusCode: 200,
			body: {
				message: 'OTP Confirmed',
				success: true,
			}
		});
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

Cypress.Commands.add('getTotpConsentApp', () => {
	cy.getIFrameBody()
		.find('end-user-consent')
		.shadow()
		.find('totp-consent-app')
		.shadow()
});

Cypress.Commands.add('navigateThroughTotpConsentApp', () => {
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
		.find('[type="radio"]')
		.check('email');

	cy.getTotpConsentApp()
		.find('#select-otp-mode')
		.click();

	cy.getTotpConsentApp()
		.find('#totp-token')
		.type('000000');

	cy.getTotpConsentApp()
		.find('#submit-otp')
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
