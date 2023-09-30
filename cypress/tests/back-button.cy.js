describe('back-button', () => {
	beforeEach(() => {
		cy
			.intercept({
				method: 'POST',
				url: '*upload*',
			}, {
				upload_url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
			}).as('getUploadURL');

		cy
			.intercept({
				method: 'PUT',
				url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
			}, {
				statusCode: 200,
			}).as('successfulUpload');

		cy
			.loadIDOptions();
	});

	describe('for basic kyc', () => {
		it('should show the select id page when back is clicked', () => {
			cy.visit('/basic_kyc_preview_bvn_mfa');
			cy.loadIDOptions();
			cy
				.getIFrameBody()
				.find('#country')
				.select('NG');

			cy
				.getIFrameBody()
				.find('#id_type')
				.select('BVN_MFA');

			cy
				.getIFrameBody()
				.find('#submitConfig')
				.click();

			cy.navigateThroughTotpConsentApp();

			cy
				.getIFrameBody()
				.find('#back-button')
				.click();

			cy.getTotpConsentApp()
				.find('.try-another-method')
				.click();

			cy.getTotpConsentApp()
				.find('#back-to-entry-button')
				.click();
			cy
				.getIFrameBody()
				.find('end-user-consent')
				.shadow()
				.find('#back-button')
				.click();

			cy
				.getIFrameBody()
				.find('#select-id-type')
				.should('be.visible');
		});
	});

	describe('for biometric kyc', () => {
		beforeEach(() => {
			cy
				.intercept({
					method: 'POST',
					url: '*upload*',
				}, {
					upload_url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
				}).as('getUploadURL');

			cy
				.intercept({
					method: 'PUT',
					url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
				}, {
					statusCode: 200,
				}).as('successfulUpload');
		});

		it('should show the select id page when back is clicked', () => {
			cy.visit('/biometric_kyc_preview_bvn_mfa');
			cy.loadIDOptions();

			cy
				.getIFrameBody()
				.find('#country')
				.select('NG');

			cy
				.getIFrameBody()
				.find('#id_type')
				.select('BVN_MFA');

			cy
				.getIFrameBody()
				.find('#id_type')
				.should('contain', 'with OTP');

			cy
				.getIFrameBody()
				.find('#id_type')
				.select('BVN_MFA');

			cy
				.getIFrameBody()
				.find('#submitConfig')
				.click();

			cy.navigateThroughTotpConsentApp();

			cy.getIFrameBody()
				.find('end-user-consent')
				.should('not.be.visible');

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
				.find('.back-button-exit')
				.last()
				.click();

			cy.getTotpConsentApp()
				.find('.try-another-method')
				.click();

			cy.getTotpConsentApp()
				.find('#back-to-entry-button')
				.click();
			cy
				.getIFrameBody()
				.find('end-user-consent')
				.shadow()
				.find('#back-button')
				.click();

			cy
				.getIFrameBody()
				.find('#select-id-type')
				.should('be.visible');
		});
	});

	describe('for enhanced kyc', () => {
		beforeEach(() => {
			cy
				.intercept({
					method: 'POST',
					url: '*v1/async_id_verification*',
				}, {
					statusCode: 200,
					body: { success: true },
				}).as('submitEnhancedKYC');
		});

		it('should set "Bank Verification Number (with OTP)" in the id selection list when previewBVNMFA is true', () => {
			cy.visit('/enhanced_kyc_preview_bvn_mfa');
			cy.loadIDOptions();

			cy
				.getIFrameBody()
				.find('#country')
				.select('NG');

			cy
				.getIFrameBody()
				.find('#id_type')
				.select('BVN_MFA');

			cy
				.getIFrameBody()
				.find('#id_type')
				.should('contain', 'with OTP');

			cy
				.getIFrameBody()
				.find('#id_type')
				.select('BVN_MFA');

			cy
				.getIFrameBody()
				.find('#submitConfig')
				.click();

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
				.find('[type="radio"]')
				.check('email');

			cy.getTotpConsentApp()
				.find('#select-otp-mode')
				.click();

			cy.getTotpConsentApp()
				.find('#submit-otp')
				.should('be.visible');

			cy.getTotpConsentApp()
				.find('#totp-token')
				.type('000000');

			cy.getTotpConsentApp()
				.find('.try-another-method')
				.click();

			cy.getTotpConsentApp()
				.find('#back-to-entry-button')
				.click();
			cy
				.getIFrameBody()
				.find('end-user-consent')
				.shadow()
				.find('#back-button')
				.click();

			cy
				.getIFrameBody()
				.find('#select-id-type')
				.should('be.visible');
		});
	});
});
