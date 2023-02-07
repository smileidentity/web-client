describe('totpConsent', () => {
	describe('core', () => {
		it('should not show up for non-BVN_MFA id types', () => {
			cy.visit('/');

			cy.selectBVNIDType();

			cy.getIFrameBody()
				.find('end-user-consent')
				.shadow()
				.find('#allow')
				.click();

			cy.getTotpConsentApp()
				.should('not.be.visible');
		});

		it('should show up for BVN_MFA id types', () => {
			cy.visit('/');
			cy.selectBVNMFAIDType();

			cy.getIFrameBody()
				.find('end-user-consent')
				.shadow()
				.find('#allow')
				.click();

			cy.getTotpConsentApp()
				.find('#id-entry')
				.should('be.visible');
		});

		describe('queryOtpModes', () => {
			it('should display a validation error message when the input is invalid', () => {
				cy.visit('/');
				cy.selectBVNMFAIDType();

				cy.getIFrameBody()
					.find('end-user-consent')
					.shadow()
					.find('#allow')
					.click();

				cy.getTotpConsentApp()
					.find('#id_number')
					.type('000000');

				cy.getTotpConsentApp()
					.find('#query-otp-modes')
					.click();

				cy.getTotpConsentApp()
					.find('#id_number-hint')
					.should('be.visible');
			});

			it('should display a network error message when there is a network error', () => {
				cy.visit('/');
				cy.selectBVNMFAIDType();

				cy.intercept('POST', '**/v1/totp_consent', {
					statusCode: 400,
					body: {
						error: 'Result Not Found',
						success: false
					}
				});

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
					.find('.validation-message')
					.should('be.visible');
			});
		});

		describe('selectOtpMode', () => {
			it('should display a network error message when there is a network error', () => {
				cy.visit('/');
				cy.selectBVNMFAIDType();

				cy.intercept('POST', '**/v1/totp_consent/mode', {
					statusCode: 400,
					body: {
						error: 'Invalid Mode',
						success: false
					}
				});

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
					.check('sms');

				cy.getTotpConsentApp()
					.find('#select-otp-mode')
					.click();

				cy.getTotpConsentApp()
					.find('.validation-message')
					.should('be.visible')
					.should('contain', 'Invalid Mode');
			});

			it('should close if the user does not have access to any of the contact methods', () => {
				cy.visit('/');
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
					.find('#select-otp-mode')
					.should('be.visible');

				cy.getTotpConsentApp()
					.find('#contact-methods-outdated')
					.click();

				cy.get('iframe')
					.should('not.exist');
			});
		});

		describe('submitOtp', () => {
			it('should display a network error message when there is a network error', () => {
				cy.visit('/');
				cy.selectBVNMFAIDType();

				cy.intercept('POST', '**/v1/totp_consent/otp', {
					statusCode: 400,
					body: {
						error: 'Invalid OTP',
						success: false
					}
				});

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
					.check('sms');

				cy.getTotpConsentApp()
					.find('#select-otp-mode')
					.click();

				cy.getTotpConsentApp()
					.find('#totp-token')
					.type('123456')

				cy.getTotpConsentApp()
					.find('#submit-otp')
					.click();

				cy.getTotpConsentApp()
					.find('.validation-message')
					.should('be.visible')
					.should('contain', 'Invalid OTP');
			});

			it('should navigate to the selectOtpMode screen when the user chooses to try another contact method', () => {
				cy.visit('/');
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
					.find('[type="radio"]')
					.check('sms');

				cy.getTotpConsentApp()
					.find('#select-otp-mode')
					.click();

				cy.getTotpConsentApp()
					.find('.try-another-method')
					.should('be.visible');

				cy.getTotpConsentApp()
					.find('.try-another-method')
					.click();

				cy.getTotpConsentApp()
					.find('.try-another-method')
					.should('not.be.visible');

				cy.getTotpConsentApp()
					.find('#select-otp-mode')
					.should('be.visible')
			});
		});
	});

	describe('for basic kyc', () => {
		beforeEach(() => {
			cy
				.intercept({
					method: 'POST',
					url: '*v2/verify*'
				}, {}).as('submitBasicKYC');
		});

		it('should submit navigate to the id form after totp consent is granted, without the need to re-enter the id-number', () => {
			cy.visit('/basic_kyc');
			cy.selectBVNMFAIDType();
			cy.navigateThroughTotpConsentApp();

			cy.getIFrameBody()
				.find('#id-info')
				.should('be.visible');

			cy.getIFrameBody()
				.find('#id-number')
				.should('not.be.visible');
		});
	});

	describe('for biometric kyc', () => {
		beforeEach(() => {
			cy
				.intercept({
					method: 'POST',
					url: '*upload*'
				}, {
					upload_url: "https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip"
				}).as('getUploadURL');

			cy
				.intercept({
					method: 'PUT',
					url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip'
				}, {
					statusCode: 200
				}).as('successfulUpload');
		});

		it('should navigate to the camera screen, and submit after images are captured', () => {
			cy.visit('/biometric_kyc');
			cy.selectBVNMFAIDType();
			cy.navigateThroughTotpConsentApp();

			cy.getIFrameBody()
				.find('end-user-consent')
				.should('not.be.visible');

			cy.navigateThroughCameraScreens();

			cy.getIFrameBody()
				.find('#id-info')
				.should('not.be.visible');

			cy
				.wait('@getUploadURL');

			cy
				.wait('@successfulUpload');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');
		});
	});

	describe('for enhanced kyc', () => {
		beforeEach(() => {
			cy
				.intercept({
					method: 'POST',
					url: '*v1/async_id_verification*'
				}, {
					statusCode: 200,
					body: { success: true }
				}).as('submitEnhancedKYC');
		});

		it('should submit after totp consent is granted', () => {
			cy.visit('/enhanced_kyc');
			cy.selectBVNMFAIDType();
			cy.navigateThroughTotpConsentApp();

			cy.getIFrameBody()
				.find('#id-info')
				.should('not.be.visible');

			cy
				.wait('@submitEnhancedKYC');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');
		});
	});
});
