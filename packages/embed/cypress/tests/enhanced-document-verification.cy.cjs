describe('enhanced document verification', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.loadIDOptions();

    cy.visit('/enhanced_document_verification');

    cy.selectVOTERIDType();

    cy.navigateThroughCameraScreens();
  });

  it('should capture selfie and id image', () => {
    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'VOTER_ID');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#id-entry-screen')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#id-entry-screen #take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#id-camera-screen')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#capture-id-image')
      .click();

    cy.wait(2000);

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#id-camera-screen')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('#id-review-screen')
      .should('not.be.visible');

    cy.wait('@getUploadURL')
      .its('request.body')
      .should((body) => {
        const metadata = {};
        body.metadata.forEach(({ name, value }) => {
          metadata[name] = value;
        });
        expect(metadata.browser_version).to.match(/^\d+(\.\d+)+$/);
        expect(metadata.document_front_image_origin).to.equal(
          'camera_manual_capture',
        );
        expect(metadata.selfie_image_origin).to.equal('front_camera');
        expect(metadata.active_liveness_type).to.equal('smile');
        expect(metadata.active_liveness_version).to.equal('0.0.1');
        expect(metadata.fingerprint).to.be.a('string');
        expect(metadata.user_agent).to.be.a('string');
        expect(metadata.document_front_capture_camera_name).to.be.a('string');
        expect(metadata.camera_name).to.be.a('string');
        expect(Number(metadata.selfie_capture_duration_ms)).to.be.greaterThan(
          0,
        );
      });

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });
});
