describe('Verification Method Selection', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });
  describe('multiple countries / id_types', () => {
    beforeEach(() => {
      cy.visit('/verification-method-selection');
    });

    describe('biometric_kyc', () => {
      it('should redirect to the biometric kyc sequence in a nested iframe', () => {
        cy.selectBVNIDType();

        cy.getIFrameBody()
          .find(
            'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
          )
          .should(
            'have.attr',
            'src',
            'http://localhost:8000/biometric-kyc.html',
          );
      });
    });

    describe('doc_verification', () => {
      it('should redirect to the document verification sequence in a nested iframe', () => {
        cy.getIFrameBody().find('#country').select('NG');

        cy.getIFrameBody().find('#id_type').select('PASSPORT');

        cy.getIFrameBody().find('#submitConfig').click();

        cy.getIFrameBody()
          .find(
            'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
          )
          .should(
            'have.attr',
            'src',
            'http://localhost:8000/doc-verification.html',
          );
      });

      it('should redirect to the enhanced document verification sequence in a nested iframe', () => {
        cy.getIFrameBody().find('#country').select('ZA');

        cy.getIFrameBody().find('#id_type').select('IDENTITY_CARD');

        cy.getIFrameBody().find('#submitConfig').click();

        cy.getIFrameBody()
          .find(
            'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
          )
          .should(
            'have.attr',
            'src',
            'http://localhost:8000/enhanced-document-verification.html',
          );
      });
    });

    describe('enhanced_kyc', () => {
      it('should redirect to the enhanced kyc sequence in a nested iframe', () => {
        cy.selectNINIDType();

        cy.getIFrameBody()
          .find(
            'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
          )
          .should('have.attr', 'src', 'http://localhost:8000/ekyc.html');
      });
    });
  });

  describe('single country / multiple id_types', () => {
    beforeEach(() => {
      cy.visit(
        '/verification-method-selection-single-country-multiple-id-types',
      );
    });

    it('disables country selector, allows id_type selection', () => {
      cy.getIFrameBody()
        .find('#country option:selected')
        .should('have.text', 'Nigeria');

      cy.getIFrameBody().find('#id_type').select('BVN');

      cy.getIFrameBody().find('#submitConfig').click();

      cy.getIFrameBody()
        .find(
          'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
        )
        .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html');
    });
  });

  describe('single country / id_type', () => {
    beforeEach(() => {
      cy.visit('/verification-method-selection-single-country-single-id-type');
    });

    it('goes directly to the web embed', () => {
      cy.getIFrameBody()
        .find('#country option:selected')
        .should('have.text', 'Nigeria');

      cy.getIFrameBody()
        .find('#id_type option:selected')
        .should('have.text', 'Bank Verification Number');

      cy.getIFrameBody().find('#submitConfig').click();

      cy.getIFrameBody()
        .find(
          'iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]',
        )
        .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html');
    });
  });
});
