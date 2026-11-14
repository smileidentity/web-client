describe('zip upload screens', () => {
  beforeEach(() => {
    cy.loadIDOptions();

    cy.visit('/');

    cy.selectNINIDType();

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

    cy.getIFrameBody().find('end-user-consent').shadow().find('#allow').click();

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody().find('#id-info').should('be.visible');
  });

  describe('when a successful upload happens', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'PUT',
          url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
        },
        {
          statusCode: 200,
        },
      ).as('successfulUpload');
    });

    it('should show the completion screen', () => {
      cy.getIFrameBody().get('#id_number-hint').should('not.exist');

      cy.getIFrameBody().find('#id_number').type('12345678901');

      cy.getIFrameBody().find('#submitForm').click();

      cy.wait('@getUploadURL');

      cy.wait('@successfulUpload');

      cy.getIFrameBody().find('#complete-screen').should('be.visible');
    });
  });

  describe('when the upload fails', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'PUT',
          url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
        },
        {
          statusCode: 412,
        },
      ).as('failedUploadRequest');
    });

    it('should should show the upload failure screen', () => {
      cy.getIFrameBody().find('#id_number').type('12345678901');

      cy.getIFrameBody().find('#submitForm').click();

      cy.getIFrameBody().find('#id-info').should('not.be.visible');

      cy.wait('@getUploadURL');

      cy.wait('@failedUploadRequest');

      cy.getIFrameBody()
        .find('#upload-progress-screen')
        .should('not.be.visible');

      cy.getIFrameBody().find('#upload-failure-screen').should('be.visible');

      cy.getIFrameBody().find('#retry-upload').click();

      cy.wait('@failedUploadRequest');
    });

    it('should should retry upload when "try again" button is clicked', () => {
      cy.getIFrameBody().find('#id_number').type('12345678901');

      cy.getIFrameBody().find('#submitForm').click();

      cy.wait('@getUploadURL');

      cy.wait('@failedUploadRequest');

      cy.getIFrameBody().find('#retry-upload').click();

      cy.wait('@failedUploadRequest');
    });
  });

  describe('when the upload URL request is rate limited', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'POST',
          url: '*upload*',
          times: 1,
        },
        {
          statusCode: 429,
          body: { message: 'Too Many Requests' },
        },
      ).as('rateLimited');

      cy.intercept(
        {
          method: 'PUT',
          url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
        },
        {
          statusCode: 200,
        },
      ).as('successfulUpload');

      cy.intercept({ method: 'PUT', url: '**/undefined' }).as('undefinedPut');
    });

    it('should get a new upload URL on retry and complete', () => {
      cy.getIFrameBody().find('#id_number').type('12345678901');

      cy.getIFrameBody().find('#submitForm').click();

      cy.wait('@rateLimited');

      cy.getIFrameBody().find('#upload-failure-screen').should('be.visible');

      // Hold the retry's upload-URL response so a second tap could land.
      cy.intercept(
        {
          method: 'POST',
          url: '*upload*',
        },
        {
          delay: 1500,
          body: {
            upload_url:
              'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
          },
        },
      ).as('retryUploadURL');

      cy.getIFrameBody().find('#retry-upload').click();

      // The Retry button must be gone before the URL arrives, or a double tap
      // starts a second job.
      cy.getIFrameBody()
        .find('#retry-upload', { timeout: 500 })
        .should('not.be.visible');

      cy.wait('@retryUploadURL');

      cy.wait('@successfulUpload');

      cy.getIFrameBody().find('#complete-screen').should('be.visible');

      cy.get('@undefinedPut.all').should('have.length', 0);

      cy.get('@retryUploadURL.all').should('have.length', 1);
    });
  });
});
