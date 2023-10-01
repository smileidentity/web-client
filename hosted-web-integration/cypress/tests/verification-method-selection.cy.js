describe('Verification Method Selection', () => {
    describe('multiple countries / id_types', () => {
        beforeEach(() => {
            cy.visit('/verification-method-selection');
        });

        describe('biometric_kyc', () => {
            it('should redirect to the biometric kyc sequence in a nested iframe', () => {
                cy.selectBVNIDType();

                cy
                    .getIFrameBody()
                    .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                    .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html')
            });
        });

        describe('doc_verification', () => {
            it('should redirect to the biometric kyc sequence in a nested iframe', () => {
                cy.selectPASSPORTIDType();

                cy
                    .getIFrameBody()
                    .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                    .should('have.attr', 'src', 'http://localhost:8000/doc-verification.html')
            });
        });

        describe('enhanced_kyc', () => {
            it('should redirect to the biometric kyc sequence in a nested iframe', () => {
                cy.selectNINIDType();

                cy
                    .getIFrameBody()
                    .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                    .should('have.attr', 'src', 'http://localhost:8000/ekyc.html')
            });
        });
    });

    describe('single country / multiple id_types', () => {
        beforeEach(() => {
            cy.visit('/verification-method-selection-single-country-multiple-id-types');
        });

        it('disables country selector, allows id_type selection', () => {
            cy
                .getIFrameBody()
                .find('#country option:selected')
                .should('have.text', 'Nigeria');

            cy
                .getIFrameBody()
                .find('#id_type')
                .select('BVN');

            cy
                .getIFrameBody()
                .find('#submitConfig')
                .click();

            cy
                .getIFrameBody()
                .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html')
        });
    });

    describe('single country / id_type', () => {
        beforeEach(() => {
            cy.visit('/verification-method-selection-single-country-single-id-type');
        });

        it('goes directly to the web embed', () => {
            cy
                .getIFrameBody()
                .find('#country option:selected')
                .should('have.text', 'Nigeria');

            cy
                .getIFrameBody()
                .find('#id_type option:selected')
                .should('have.text', 'Bank Verification Number');

            cy
                .getIFrameBody()
                .find('#submitConfig')
                .click();

            cy
                .getIFrameBody()
                .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html')
        });
    });
});
