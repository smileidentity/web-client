describe('Thank you message', () => {
	describe('should contain country and id type', () => {
		beforeEach(() => {
			cy.loadIDOptions();
		});

		it('for basic kyc', () => {
			cy.visit('/basic_kyc');

			cy
				.selectNINIDType();

			cy
				.intercept({
					method: 'POST',
					url: '*v2/verify*',
				}, {
					statusCode: 200,
					body: { success: true },
				})
.as('submitBasicKYC');

			cy
				.getIFrameBody()
				.find('#id-info')
				.should('be.visible');

			cy
				.getIFrameBody()
				.find('#id_number')
				.type('12345678901');

			cy
				.getIFrameBody()
				.find('#submitForm')
				.click();

			cy
				.wait('@submitBasicKYC');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');

			cy
				.getIFrameBody()
				.find('#thank-you-message')
				.should('be.visible')
				.should('contain', 'Nigeria')
				.should('contain', 'National ID');
		});

		it('for biometric kyc', () => {
			cy.visit('/biometric_kyc');

			cy
				.selectBVNIDType();

			cy
				.intercept({
					method: 'POST',
					url: '*upload*',
				}, {
					upload_url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
				})
.as('getUploadURL');

			cy
				.intercept({
					method: 'PUT',
					url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
				}, {
					statusCode: 200,
				})
.as('successfulUpload');

			cy
				.navigateThroughCameraScreens();

			cy
				.getIFrameBody()
				.find('#id-info')
				.should('be.visible');

			cy
				.getIFrameBody()
				.get('#id_number-hint')
				.should('not.exist');

			cy
				.getIFrameBody()
				.find('#id_number')
				.type('12345678901');

			cy
				.getIFrameBody()
				.find('#submitForm')
				.click();

			cy
				.wait('@getUploadURL');

			cy
				.wait('@successfulUpload');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');

			cy
				.getIFrameBody()
				.find('#thank-you-message')
				.should('be.visible')
				.should('contain', 'Nigeria')
				.should('contain', 'Bank Verification');
		});

		it('for enhanced kyc', () => {
			cy.visit('/enhanced_kyc');

			cy
				.selectNINIDType();

			cy
				.getIFrameBody()
				.find('#id-info')
				.should('be.visible');

			cy
				.intercept({
					method: 'POST',
					url: '*v1/async_id_verification*',
				}, {
					statusCode: 200,
					body: { success: true },
				})
.as('submitEnhancedKYC');

			cy
				.getIFrameBody()
				.find('#id_number')
				.type('12345678901');

			cy
				.getIFrameBody()
				.find('#submitForm')
				.click();

			cy
				.wait('@submitEnhancedKYC');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');

			cy
				.getIFrameBody()
				.find('#thank-you-message')
				.should('be.visible')
				.should('contain', 'Nigeria')
				.should('contain', 'National ID');
		});
	});
});
