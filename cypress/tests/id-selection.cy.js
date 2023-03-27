describe('No ID Selection', () => {
	it('basic_kyc', () => {
		cy.visit('/basic_kyc');

		cy
			.selectNINIDType()

		cy
			.intercept({
				method: 'POST',
				url: '*v2/verify*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitBasicKYC');

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

	it('biometric_kyc', () => {
		cy.visit('/biometric_kyc');

		cy
			.selectBVNIDType()

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

	it('document_verification', () => {
		cy.visit('/document-verification');

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
			.selectNINIDType()

		cy
			.navigateThroughCameraScreens();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.invoke('attr', 'document-type')
			.should('eq', 'NIN')

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#capture-id-image')
			.click();

		cy
			.wait(2000);

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('not.be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#select-id-image')
			.click();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-review-screen')
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

	it('enhanced_kyc', () => {
		cy.visit('/enhanced_kyc');

		cy
			.selectNINIDType()

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');

		cy
			.intercept({
				method: 'POST',
				url: '*v1/async_id_verification*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitEnhancedKYC');

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

describe('Preselected Country', () => {
	it('basic_kyc', () => {
		cy.visit('/basic_kyc_pre_select_country');

		cy
			.loadIDOptions();

		cy
			.getIFrameBody()
			.find('#country')
			.should('contain', 'Nigeria')

		cy
			.getIFrameBody()
			.find('#id_type')
			.select('NIN')

		cy
			.getIFrameBody()
			.find('#submitConfig')
			.click();

		cy
			.intercept({
				method: 'POST',
				url: '*v2/verify*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitBasicKYC');

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

	it('biometric_kyc', () => {
		cy.visit('/biometric_kyc_pre_select_country');

		cy
			.loadIDOptions();

		cy
			.getIFrameBody()
			.find('#country')
			.should('contain', 'Nigeria')

		cy
			.getIFrameBody()
			.find('#id_type')
			.select('BVN')

		cy
			.getIFrameBody()
			.find('#submitConfig')
			.click();

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

	it('document_verification', () => {
		cy.visit('/document-verification-pre-select-country');

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
			.loadIDOptions();

		cy
			.getIFrameBody()
			.find('#country')
			.should('contain', 'Nigeria')

		cy
			.getIFrameBody()
			.find('#id_type')
			.select('PASSPORT')

		cy
			.getIFrameBody()
			.find('#submitConfig')
			.click();

		cy
			.navigateThroughCameraScreens();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.invoke('attr', 'document-type')
			.should('eq', 'PASSPORT')

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#capture-id-image')
			.click();

		cy
			.wait(2000);

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('not.be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#select-id-image')
			.click();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-review-screen')
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

	it('enhanced_kyc', () => {
		cy.visit('/enhanced_kyc_pre_select_country');

		cy
			.loadIDOptions();

		cy
			.getIFrameBody()
			.find('#country')
			.should('contain', 'Nigeria')

		cy
			.getIFrameBody()
			.find('#id_type')
			.select('NIN')

		cy
			.getIFrameBody()
			.find('#submitConfig')
			.click();

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');

		cy
			.intercept({
				method: 'POST',
				url: '*v1/async_id_verification*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitEnhancedKYC');

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

describe('Preselected Country and ID Type', () => {
	it('basic_kyc', () => {
		cy.visit('/basic_kyc_pre_select_id_type');

		cy.loadIDOptions();

		cy.getIFrameBody()
			.find('#country')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id_type')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id-info')
			.should('be.visible');

		cy
			.intercept({
				method: 'POST',
				url: '*v2/verify*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitBasicKYC');

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

	it('biometric_kyc', () => {
		cy.visit('/biometric_kyc_pre_select_id_type');

		cy.loadIDOptions();

		cy.getIFrameBody()
			.find('#country')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id_type')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('smart-camera-web')
			.should('be.visible');

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

	it('document_verification', () => {
		cy.visit('/document-verification-pre-select-id-type');

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

		cy.loadIDOptions();

		cy.getIFrameBody()
			.find('#country')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id_type')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('smart-camera-web')
			.should('be.visible');

		cy
			.navigateThroughCameraScreens();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.invoke('attr', 'document-type')
			.should('eq', 'PASSPORT')

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#capture-id-image')
			.click();

		cy
			.wait(2000);

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('not.be.visible');

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#select-id-image')
			.click();

		cy
			.getIFrameBody()
			.find('smart-camera-web')
			.shadow()
			.find('#id-review-screen')
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

	it('enhanced_kyc', () => {
		cy.visit('/enhanced_kyc_pre_select_id_type');

		cy.loadIDOptions();

		cy.getIFrameBody()
			.find('#country')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id_type')
			.should('not.be.visible');

		cy.getIFrameBody()
			.find('#id-info')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');

		cy
			.intercept({
				method: 'POST',
				url: '*v1/async_id_verification*'
			}, {
				statusCode: 200,
				body: { success: true }
			}).as('submitEnhancedKYC');

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
