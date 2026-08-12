describe('enhanced document verification', () => {
  beforeEach(() => {
    const stubHostedIframeCamera = () => {
      cy.get('iframe[data-cy="smile-identity-hosted-web-integration"]')
        .its('0.contentWindow')
        .should('exist')
        .then((iframeWin) => {
          const fakeDeviceId = 'fake-device';
          const canvas = iframeWin.document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const fakeStream = canvas.captureStream(30);

          // The app resolves camera name by matching track.getSettings().deviceId
          // to enumerateDevices() output. Canvas streams do not provide a useful
          // deviceId by default, so we patch it for deterministic metadata.
          const [videoTrack] = fakeStream.getVideoTracks();
          if (videoTrack && typeof videoTrack.getSettings === 'function') {
            const originalGetSettings = videoTrack.getSettings.bind(videoTrack);
            videoTrack.getSettings = () => ({
              ...originalGetSettings(),
              deviceId: fakeDeviceId,
            });
          }

          const mediaDevices = iframeWin.navigator.mediaDevices || {};

          Object.defineProperty(iframeWin.navigator, 'mediaDevices', {
            configurable: true,
            value: {
              ...mediaDevices,
              enumerateDevices: () =>
                Promise.resolve([
                  {
                    deviceId: fakeDeviceId,
                    kind: 'videoinput',
                    label: 'Fake Camera',
                  },
                ]),
              getUserMedia: () => Promise.resolve(fakeStream),
            },
          });
        });
    };

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

    cy.loadIDOptions('https://example.smileidentity.com/v1');

    cy.visit('/enhanced_document_verification_dev');

    stubHostedIframeCamera();

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
      .should('have.attr', 'data-camera-ready', 'true');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#loader')
      .should('have.prop', 'hidden', true);

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image')
      .should('be.visible')
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
      const headers = interception.request.headers;
      expect(headers).to.have.property('smileid-request-mac');
      expect(headers['smileid-request-mac']).to.be.a('string');
      expect(headers).to.have.property('smileid-request-timestamp');
      expect(headers['smileid-request-timestamp']).to.match(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(headers).to.have.property('smileid-partner-id');
      expect(headers['smileid-partner-id']).to.be.a('string');
    });

    cy.wait('@successfulUpload');

    // The document submission UI now shows the completion state in-place
    // (image + tick) rather than switching to the legacy #complete-screen.
    cy.getIFrameBody()
      .find('#doc-submission')
      .should('have.attr', 'submission-state', 'success');
  });
});
