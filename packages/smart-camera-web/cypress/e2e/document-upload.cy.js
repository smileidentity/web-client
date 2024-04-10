describe('SmartCameraWeb - Document Upload', () => {
  beforeEach(() => {
    cy.visit('/document-upload');
  });

  describe(' - default', () => {
    it('should not have the document-capture-mode attribute set', () => {
      cy.get('smart-camera-web').should(
        'not.have.attr',
        'document-capture-modes',
      );
    });

    it('should only show the "Take Photo" button', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #take-photo')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .should('not.exist');
    });
  });

  describe(' - upload', () => {
    beforeEach(() => {
      cy.get('smart-camera-web').invoke(
        'attr',
        'document-capture-modes',
        'upload',
      );
    });

    it('should have the document-capture-modes attribute set to upload', () => {
      cy.get('smart-camera-web').should(
        'have.attr',
        'document-capture-modes',
        'upload',
      );
    });

    it('should only show the "Upload Photo" button', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #take-photo')
        .should('not.exist');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .should('be.visible');
    });

    it('should accept an image that is just-right by dimensions', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .selectFile('cypress/fixtures/just-right.png');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('not.be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-review-screen')
        .should('be.visible');
    });

    it('should show an error message when an image is too-large in memory size', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .selectFile('cypress/fixtures/too-large.png');

      cy.get('smart-camera-web')
        .shadow()
        .find('#error')
        .should(
          'contain',
          'too-large.png is too large. Please ensure that the file is less than',
        );
    });
  });

  describe(' - both', () => {
    beforeEach(() => {
      cy.get('smart-camera-web').invoke(
        'attr',
        'document-capture-modes',
        'camera, upload',
      );
    });

    it('should have the document-capture-mode attribute set to a combination of both modes', () => {
      cy.get('smart-camera-web').should('have.attr', 'document-capture-modes');
    });

    it('should show both the "Take Photo" button and the "Upload Photo" button', () => {
      cy.navigateFaceCaptureScreens();

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #take-photo')
        .should('be.visible');

      cy.get('smart-camera-web')
        .shadow()
        .find('#id-entry-screen #upload-photo-label')
        .should('be.visible');
    });
  });
});
