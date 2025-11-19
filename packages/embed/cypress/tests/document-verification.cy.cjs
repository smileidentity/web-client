describe('document verification', () => {
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

    cy.visit('/document-verification');

    cy.selectPASSPORTIDType();

    cy.navigateThroughCameraScreens();
  });

  // TODO: fix flakiness
  it.skip('should capture selfie and id image', () => {
    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'PASSPORT');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .shadow()
      .find('#take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('not.be.visible');

    cy.wait('@getUploadURL').should((interception) => {
      // Check request body
      const body = interception.request.body;
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
      expect(Number(metadata.selfie_capture_duration_ms)).to.be.greaterThan(0);

      // Check request headers
      // const headers = interception.request.headers;
      // expect(headers).to.have.property('smileid-request-mac');
      // expect(headers['smileid-request-mac']).to.be.a('string');
      // expect(headers).to.have.property('smileid-request-timestamp');
      // expect(headers['smileid-request-timestamp']).to.match(
      //   /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      // );
      // expect(headers).to.have.property('smileid-partner-id');
      // expect(headers['smileid-partner-id']).to.be.a('string');
    });

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });
});

describe('legacy support - preselected country / id_types', () => {
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

    cy.visit('/document-verification-legacy-id_types');
  });

  it('should show the Others input when selected', () => {
    cy.getIFrameBody()
      .find('smileid-combobox-trigger input')
      .type('South Africa');

    cy.getIFrameBody().find('smileid-combobox-option[value="ZA"]').click();

    cy.getIFrameBody().find('smileid-combobox-trigger > button').click();

    cy.getIFrameBody()
      .find('smileid-combobox-option[value="__Others"]')
      .should('be.visible');
  });

  // TODO: fix flakiness
  it.skip('should allow legacy id_types without capturing the back', () => {
    cy.selectZAGREENBOOKIDType();

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'GREEN_BOOK');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .shadow()
      .find('#take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('not.be.visible');

    cy.wait('@getUploadURL').should((interception) => {
      // Check request body
      const body = interception.request.body;
      const metadata = {};
      body.metadata.forEach(({ name, value }) => {
        metadata[name] = value;
      });
      expect(metadata.browser_version).to.match(/^\d+(\.\d+)+$/);
      expect(metadata.selfie_image_origin).to.equal('front_camera');
      expect(metadata.active_liveness_type).to.equal('smile');
      expect(metadata.active_liveness_version).to.equal('0.0.1');
      expect(metadata.fingerprint).to.be.a('string');
      expect(metadata.user_agent).to.be.a('string');
      expect(metadata.camera_name).to.be.a('string');
      expect(Number(metadata.selfie_capture_duration_ms)).to.be.greaterThan(0);

      // Check request headers
      // const headers = interception.request.headers;
      // expect(headers).to.have.property('smileid-request-mac');
      // expect(headers['smileid-request-mac']).to.be.a('string');
      // expect(headers).to.have.property('smileid-request-timestamp');
      // expect(headers['smileid-request-timestamp']).to.match(
      //   /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      // );
      // expect(headers).to.have.property('smileid-partner-id');
      // expect(headers['smileid-partner-id']).to.be.a('string');
    });

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });
});
