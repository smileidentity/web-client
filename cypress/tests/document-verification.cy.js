describe('document verification', () => {
	beforeEach(() => {
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

		cy.selectNINIDType();

		cy.navigateThroughCameraScreens();
	});

	it('should capture selfie and id image', () => {
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
});
