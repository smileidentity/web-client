describe('id-info screen', () => {
	beforeEach(() => {
		cy.visit('/');

		cy
			.selectBVNIDType()

		cy
			.intercept({
				method: 'POST',
				url: '*upload*'
			}, {
				upload_url: "https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip"
			});

		cy
			.intercept({
				method: 'PUT',
				url: '*amazonaws.com*'
			}, {
				statusCode: 200
			});

		cy
			.getIFrameBody()
			.find('end-user-consent')
			.shadow()
			.find('#allow')
			.click();

		cy
			.navigateThroughCameraScreens();

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('be.visible');
	});

	it('should show an error message when input is invalid', () => {
		cy
			.getIFrameBody()
			.get('#id_number-hint')
			.should('not.exist');

		cy
			.getIFrameBody()
			.find('#id_number')
			.type('12345');

		cy
			.getIFrameBody()
			.find('#submitForm')
			.click();

		cy
			.getIFrameBody()
			.find('#id_number-hint')
			.should('be.visible');

		cy
			.getIFrameBody()
			.find('#id_number-hint')
			.should('contain', 'Id number is invalid');
	});

	it('should progress when input is valid', () => {
		cy
			.getIFrameBody()
			.find('#id_number')
			.type('12345678901');

		cy
			.getIFrameBody()
			.find('#submitForm')
			.click();

		cy
			.getIFrameBody()
			.find('#id-info')
			.should('not.be.visible');
	});
});
