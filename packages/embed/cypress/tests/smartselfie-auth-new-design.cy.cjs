const { expect } = require('chai');

describe('smartselfie authentication', () => {
  beforeEach(() => {
    cy.visit('/smartselfie-new-design');

    cy.getIFrameBody().should('be.visible');

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/smartselfie.zip',
      },
    ).as('getUploadURL');
  });

  describe('when a successful upload happens', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'PUT',
          url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/smartselfie.zip',
        },
        {
          statusCode: 200,
        },
      ).as('successfulUpload');
      cy.navigateThroughNewCameraScreens();
    });

    it('should show the completion screen', () => {
      cy.wait('@getUploadURL')
        .its('request.body')
        .should((body) => {
          const metadata = {};
          body.metadata.forEach(({ name, value }) => {
            metadata[name] = value;
          });
          expect(metadata.browser_version).to.match(/^\d+(\.\d+)+$/);
          expect(metadata.selfie_image_origin).to.equal('camera');
          expect(metadata.active_liveness_type).to.equal('smile');
          expect(metadata.active_liveness_version).to.equal('0.0.1');
          expect(metadata.fingerprint).to.be.a('string');
          expect(metadata.user_agent).to.be.a('string');
          expect(metadata.camera_name).to.be.a('string');
          expect(metadata.selfie_capture_duration_ms).to.be.greaterThan(0);
        });

      cy.wait('@successfulUpload');
      cy.getIFrameBody().find('#complete-screen').should('be.visible');
    });
  });

  describe('when the upload fails', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'PUT',
          url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/smartselfie.zip',
        },
        {
          statusCode: 412,
        },
      ).as('failedUploadRequest');
      cy.navigateThroughNewCameraScreens();
    });

    it('should show the upload failure screen', () => {
      cy.wait('@getUploadURL');

      cy.getIFrameBody()
        .find('#upload-progress-screen')
        .should('not.be.visible');

      cy.wait('@failedUploadRequest');

      cy.getIFrameBody().find('#upload-failure-screen').should('be.visible');
    });

    it('should should retry upload when "try again" button is clicked', () => {
      cy.wait('@getUploadURL');

      cy.wait('@failedUploadRequest');

      cy.getIFrameBody().find('#retry-upload').click();

      cy.wait('@failedUploadRequest');
    });
  });
});
