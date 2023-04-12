// smart-camera-web.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

context('SmartCameraWeb', () => {
	beforeEach(() => {
		cy.visit('/capture-back-of-id-navigation');
	});

	it('should find the button to request-camera-access', () => {
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-camera-access')
			.should('contain.text', 'Request Camera Access');
	});

	it('should navigate to "back_pressed" when back button on request page button is pressed', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access');

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#back-button-exit')
		.click();

		cy.location('pathname').should('eq', '/back_pressed')
		cy
		.get('smart-camera-web')
		.should('not.exist');
	});

	it('should navigate to "back_pressed" when back button is pressed in camera screen', () => {
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-camera-access')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-screen')
			.should('not.be.visible');

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#camera-screen')
			.should('be.visible');
		
		cy
			.get('smart-camera-web')
			.shadow()
			.find('.back-button-exit')
			.last()
			.click();

		cy.location('pathname').should('eq', '/back_pressed')
		cy
			.get('smart-camera-web')
			.should('not.exist');
	});

	it('should show selfie screen when back button is pressed', () => {
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-camera-access')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#start-image-capture')
			.click();

		cy
			.wait(8000);

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#select-selfie')
			.click();


		cy
			.get('smart-camera-web')
			.shadow()
			.find('#camera-screen')
			.should('not.be.visible');

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('be.visible');
		
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#back-button-selfie')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('not.be.visible');
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#camera-screen')
			.should('be.visible');
	});

	it('should switch from the back of ID screen to the id screen on clicking the "back" button', () => {
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-camera-access')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#start-image-capture')
			.click();

		cy
			.wait(8000);

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#select-selfie')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#capture-id-image')
			.click();

		cy
			.wait(2000);

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#select-id-image')
			.click();

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#back-of-id-camera-screen')
			.should('be.visible');

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#back-button-id-image')
			.click();

		// cy
		// 	.wait(2000);

		cy
			.get('smart-camera-web')
			.shadow()
			.find('#back-of-id-review-screen')
			.should('not.be.visible');
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#id-camera-screen')
			.should('be.visible');
	});

	it('should navigate to "closed" when close button is pressed in request screen', () => {
		cy
			.get('smart-camera-web')
			.shadow()
			.find('#request-screen-close')
			.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in selfie screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#camera-screen-close')
		.last()
		.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in selfie review screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(8000);

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#review-screen-close')
		.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in id screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(8000);

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-selfie')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#id-screen-close')
		.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in id review screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(8000);

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-selfie')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#capture-id-image')
		.click();

	cy
		.wait(2000);

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#id-review-screen-close')
		.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in id back screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(8000);

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-selfie')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#capture-id-image')
		.click();

	cy
		.wait(2000);

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-id-image')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#back-screen-close')
		.click();

		cy.exitScreens();
	});

	it('should navigate to "closed" when close button is pressed in id back review screen', () => {
		cy
		.get('smart-camera-web')
		.shadow()
		.find('#request-camera-access')
		.click();

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#start-image-capture')
		.click();

	cy
		.wait(8000);

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-selfie')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#capture-id-image')
		.click();

	cy
		.wait(2000);

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#select-id-image')
		.click();

	cy
		.get('smart-camera-web')
		.shadow()
		.find('#capture-back-of-id-image')
		.click();

	cy
		.wait(2000);

		cy
		.get('smart-camera-web')
		.shadow()
		.find('#back-review-screen-close')
		.click();

		cy.exitScreens();
	});
});
