describe('eSignature', () => {
	describe('with no document ids passed', () => {
		beforeEach(() => {
			cy.visit('/e_signature_no_ids');
		});

		it('should show an error message', () => {
			cy.get("iframe").should("not.exist");
			cy.get(".validation-message").should("be.visible");
			cy.get(".validation-message").should("contain", "`document_ids` field is required for `e_signature` ");
		});
	});

	describe('with no file found', () => {
		beforeEach(() => {
			cy.intercept(
				{
					method: "OPTIONS",
					url: "*v1/documents**",
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
					method: "GET",
					url: "*v1/documents**",
				},
				{
					statusCode: 400,
					fixture: 'e_signature_documents_no_file.json',
				}
			);

			cy.visit('/e_signature_no_file');
		});

		it('should show an error message', () => {
			cy.get("iframe").should("not.exist");
			cy.get(".validation-message").should("be.visible");
			cy.get(".validation-message").should("contain", "File not found");
		});
	});

	describe.only('with both document ids valid', () => {
		beforeEach(() => {
			cy.intercept(
				{
					method: "GET",
					url: "*v1/documents**",
				},
				{
					statusCode: 200,
					fixture: 'e_signature_documents.json',
				}
			);
			cy.visit('/e_signature');
		});

		it('should proceed to upload a signature', () => {
			cy.get("iframe").should("exist");

			cy.getIFrameBody().find("#entry-screen").should("be.visible");
		});
	});
});
