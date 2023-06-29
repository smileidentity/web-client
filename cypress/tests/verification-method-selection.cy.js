describe('Verification Method Selection', () => {
    beforeEach(() => {
        cy.visit('/verification-method-selection');
    });

    describe('biometric_kyc', () => {
        it('should redirect to the biometric kyc sequence in a nested iframe', () => {
            cy.selectBVNIDType();

            cy.wait(4000);

            cy
                .getIFrameBody()
                .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                .should('have.attr', 'src', 'http://localhost:8000/biometric-kyc.html')
        });
    });

    describe('doc_verification', () => {
        it('should redirect to the biometric kyc sequence in a nested iframe', () => {
            cy.selectPASSPORTIDType();

            cy.wait(4000);

            cy
                .getIFrameBody()
                .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                .should('have.attr', 'src', 'http://localhost:8000/doc-verification.html')
        });
    });

    describe('enhanced_kyc', () => {
        it('should redirect to the biometric kyc sequence in a nested iframe', () => {
            cy.selectNINIDType();

            cy.wait(4000);

            cy
                .getIFrameBody()
                .find('iframe[data-cy="smile-identity-hosted-web-integration-post-product-selection"]')
                .should('have.attr', 'src', 'http://localhost:8000/ekyc.html')
        });
    });
});