describe('Virtual NIN', () => {
	beforeEach(() => {
		cy
			.intercept({
				method: 'POST',
				url: '*v2/verify*'
			}, {
				statusCode: 200,
				body: {}
			}).as('submitBasicKYC');

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

		cy
			.intercept({
				method: 'POST',
				url: '*v1/async_id_verification*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitEnhancedKYC');
	});

	describe('core', () => {
		it('should not show up for non-V_NIN id_types', () => {
			cy.visit('/basic_kyc');

			cy.selectNINIDType();

			cy.getIFrameBody()
				.find('end-user-consent')
				.should('not.exist');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.should('not.exist');
		});

		it('should show up for V_NIN id type', () => {
			cy.visit('/basic_kyc');

			cy.selectVNINIDType();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.should('be.visible');
		});

		it('should allow switching mode of virtual nin generation', () => {
			cy.visit('/basic_kyc');

			cy.selectVNINIDType();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#generate-virtual-nin')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#mobile-app-link')
				.invoke('removeAttr', 'target')
				.invoke('removeAttr', 'href')
				.should('be.visible')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#generate-virtual-nin')
				.should('not.be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#enter-virtual-nin')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#switch-method')
				.should('be.visible')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#enter-virtual-nin')
				.should('not.be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#generate-virtual-nin')
				.should('be.visible');
		});

		it('generates using NIMC App', () => {
			cy.visit('/basic_kyc');

			cy.selectVNINIDType();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#mobile-app-link')
				.invoke('removeAttr', 'target')
				.invoke('removeAttr', 'href')
				.invoke('removeAttr', 'href')
				.should('be.visible')
				.click();
		});

		it('generates using USSD flow', () => {
			cy.visit('/basic_kyc');

			cy.selectVNINIDType();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#generate-with-ussd')
				.should('be.visible')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#generate-ussd-code')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#nin')
				.should('be.visible')
				.type('00000000000');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#get-ussd-code')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#show-ussd-code')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#copy-ussd-code')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#enter-virtual-nin')
				.should('be.visible');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#id_number')
				.type('0000000000000000');

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.shadow()
				.find('#submit-virtual-nin')
				.click();

			cy.getIFrameBody()
				.find('virtual-nin-app')
				.should('not.be.visible');
		});
	});

	describe('for basic kyc', () => {
		it('should submit after data is collected from virtual nin app', () => {
			cy.visit('/basic_kyc');
			cy.selectVNINIDType();

			cy.navigateThroughVirtualNinApp();

			cy.getIFrameBody()
				.find('#id-info')
				.should('not.be.visible');

			cy
				.wait('@submitBasicKYC');

			cy
				.getIFrameBody()
				.find('#complete-screen')
				.should('be.visible');
		});
	});

	describe('for biometric kyc', () => {
		it('should navigate to the camera screen, and submit after images are captured', () => {
			cy.visit('/biometric_kyc');
			cy.selectVNINIDType();

			cy.navigateThroughVirtualNinApp();

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
		it('should submit after data is collected from virtual nin app', () => {
			cy.visit('/enhanced_kyc');
			cy.selectVNINIDType();

			cy.navigateThroughVirtualNinApp();

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
