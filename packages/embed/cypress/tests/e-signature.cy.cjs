describe('eSignature', () => {
  describe('with no document ids passed', () => {
    beforeEach(() => {
      cy.visit('/e_signature_no_ids');
    });

    it('should show an error message', () => {
      cy.get('iframe').should('not.exist');
      cy.get('.validation-message').should('be.visible');
      cy.get('.validation-message').should(
        'contain',
        '`document_ids` field is required for `e_signature` ',
      );
    });
  });

  describe('with no file found', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '*v1/documents**',
        },
        {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
            'Access-Control-Allow-Headers': '*',
          },
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: '*v1/documents**',
        },
        {
          statusCode: 400,
          fixture: 'e_signature_documents_no_file.json',
        },
      );

      cy.visit('/e_signature_no_file');
    });

    it('should show an error message', () => {
      cy.get('iframe').should('not.exist');
      cy.get('.validation-message').should('be.visible');
      cy.get('.validation-message').should('contain', 'File not found');
    });
  });

  describe.only('with both document ids valid', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '*v1/documents**',
        },
        {
          statusCode: 200,
          fixture: 'e_signature_documents.json',
        },
      );
      cy.visit('/e_signature');
    });

    it('should proceed to upload a signature', () => {
      cy.get('iframe').should('exist');

      cy.getIFrameBody().find('#entry-screen').should('be.visible');
    });

    it('should not complete when the API answers 429 without an error field', () => {
      cy.intercept(
        {
          method: 'POST',
          url: '**/v1/documents/sign',
        },
        {
          statusCode: 429,
          body: { message: 'Too Many Requests' },
        },
      ).as('rateLimited');

      cy.getIFrameBody().find('#getStarted').click();
      cy.getIFrameBody().find('#i_agree').check();
      cy.getIFrameBody().find('#agreeToTerms').click();
      cy.getIFrameBody().find('#name').type('Jane Doe');
      cy.getIFrameBody().find('#submitForm').click();

      // Publish a signature directly rather than drawing one on the canvas.
      cy.getIFrameBody()
        .find('smileid-signature-pad')
        .then(($el) => {
          const win = $el[0].ownerDocument.defaultView;
          $el[0].dispatchEvent(
            new win.CustomEvent('signature-pad.publish', {
              detail:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            }),
          );
        });

      cy.getIFrameBody().find('#uploadSignature').click();
      cy.wait('@rateLimited');

      cy.getIFrameBody().find('#upload-failure-screen').should('be.visible');
      cy.getIFrameBody().find('#complete-screen').should('not.be.visible');
    });
  });
});
