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
    .get('iframe[data-cy="smile-identity-hosted-web-integration"]', {
      log: false,
    })
    .its('0.contentDocument.body', { log: false })
    .should('not.be.empty')
    .then((body) => cy.wrap(body, { log: false }));
});

Cypress.Commands.add('loadIDOptions', (baseApiUrl = '**/v1') => {
  cy.log('loadingIDOptions');

  cy.intercept('GET', `${baseApiUrl}/services`, {
    fixture: 'services.json',
  });

  cy.intercept('POST', `${baseApiUrl}/valid_documents`, {
    fixture: 'valid_documents.json',
  });

  cy.intercept('POST', `${baseApiUrl}/products_config`, {
    fixture: 'products_config.json',
  });

  cy.intercept('POST', `${baseApiUrl}/totp_consent`, {
    statusCode: 200,
    body: {
      message: 'Select OTP Delivery Mode',
      modes: [
        {
          sms: '08001****67',
        },
        {
          email: 'fa*****il@gmail.com',
        },
      ],
      session_id: '0000000000000',
      success: true,
    },
  });

  cy.intercept('POST', `${baseApiUrl}/totp_consent/mode`, {
    statusCode: 200,
    body: {
      message: 'OTP Delivery Mode Selected',
      success: true,
    },
  });

  cy.intercept('POST', `${baseApiUrl}/totp_consent/otp`, {
    statusCode: 200,
    body: {
      message: 'OTP Confirmed',
      success: true,
    },
  });
});

Cypress.Commands.add('selectBVNIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingBVNIDType');

  cy.getIFrameBody().find('#country').select('NG');

  cy.getIFrameBody().find('#id_type').select('BVN');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectBVNMFAIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingBVNMFAIDType');

  cy.getIFrameBody().find('#country').select('NG');

  cy.getIFrameBody().find('#id_type').select('BVN_MFA');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectNINIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingNINIDType');

  cy.getIFrameBody().find('#country').select('NG');

  cy.getIFrameBody().find('#id_type').select('NIN');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectVOTERIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingVoterIdType');

  cy.getIFrameBody().find('#country').select('NG');

  cy.getIFrameBody().find('#id_type').select('VOTER_ID');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectPASSPORTIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingPASSPORTIDType');

  cy.getIFrameBody().find('smileid-combobox-trigger input').type('Nigeria');

  cy.getIFrameBody().find('smileid-combobox-option[value="NG"]').click();

  cy.getIFrameBody().find('smileid-combobox-trigger > button').click();

  cy.getIFrameBody().find('smileid-combobox-option[value="PASSPORT"]').click();

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectZAGREENBOOKIDType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectingPASSPORTIDType');

  cy.getIFrameBody()
    .find('smileid-combobox-trigger input')
    .type('South Africa');

  cy.getIFrameBody().find('smileid-combobox-option[value="ZA"]').click();

  cy.getIFrameBody().find('smileid-combobox-trigger > button').click();

  cy.getIFrameBody()
    .find('smileid-combobox-option[value="GREEN_BOOK"]')
    .click();

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectKRAType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectKRAType');

  cy.getIFrameBody().find('#country').select('KE');

  cy.getIFrameBody().find('#id_type').select('KRA_PIN');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('selectKEDriversLicenseType', () => {
  cy.loadIDOptions('https://example.smileidentity.com/v1');

  cy.log('selectDriversLicenseType');

  cy.getIFrameBody().find('#country').select('KE');

  cy.getIFrameBody().find('#id_type').select('DRIVERS_LICENSE');

  cy.getIFrameBody().find('#submitConfig').click();
});

Cypress.Commands.add('getTotpConsentApp', () => {
  cy.getIFrameBody()
    .find('end-user-consent')
    .shadow()
    .find('totp-consent')
    .shadow();
});

Cypress.Commands.add('navigateThroughTotpConsentApp', () => {
  cy.getIFrameBody().find('end-user-consent').shadow().find('#allow').click();

  cy.getTotpConsentApp().find('#id_number').type('00000000000');

  cy.getTotpConsentApp().find('#query-otp-modes').click();

  cy.getTotpConsentApp()
    .find('form[name="select-mode-form"]')
    .should('be.visible');

  cy.getTotpConsentApp().find('[type="radio"]').check('email');

  cy.getTotpConsentApp().find('#select-otp-mode').click();

  cy.getTotpConsentApp().find('#submit-otp').should('be.visible');

  cy.getTotpConsentApp().find('#totp-token').type('000000');

  cy.getTotpConsentApp().find('#submit-otp').click();
});

Cypress.Commands.add('navigateThroughCameraScreens', () => {
  cy.log('SmartCameraWeb: disable image tests');

  cy.getIFrameBody()
    .find('smart-camera-web')
    .invoke('attr', 'disable-image-tests', 'true');

  cy.log('navigatingThroughCameraScreens');

  cy.getIFrameBody()
    .find('smart-camera-web')
    .shadow()
    .find('#request-camera-access')
    .click();

  cy.getIFrameBody()
    .find('smart-camera-web')
    .shadow()
    .find('#start-image-capture')
    .click();

  cy.wait(4000);

  cy.getIFrameBody()
    .find('smart-camera-web')
    .shadow()
    .find('#select-selfie')
    .click();
});
