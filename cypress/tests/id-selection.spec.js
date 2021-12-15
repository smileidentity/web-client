it('should demonstrate id-restrictions via the `id_selection` config attribute', () => {
	cy.visit('/id-selection');

	cy
		.loadIDOptions();

	cy
		.getIFrameBody()
		.find('#country')
		.find('option')
		.then(options => {
			expect(options.length).to.eq(1);
		});

	cy
		.getIFrameBody()
		.find('#country')
		.select('Nigeria')
		.should('have.value', 'NG');

	cy
		.getIFrameBody()
		.find('#id_type')
		.find('option')
		.then(options => {
			expect(options.length).to.eq(1);
		});
});
