describe('Combobox', () => {
  beforeEach(() => {
    cy.visit('/cypress/pages/combobox-test.html');
    cy.get('smileid-combobox').should('exist');
  });

  describe('country select filtering', () => {
    it('filters options when typing in the input', () => {
      cy.get('smileid-combobox-trigger input').type('nig');

      cy.get('smileid-combobox-option[value="NG"]').should(
        'not.have.attr',
        'hidden',
      );
      cy.get('smileid-combobox-option[value="GH"]').should(
        'have.attr',
        'hidden',
      );
      cy.get('smileid-combobox-option[value="KE"]').should(
        'have.attr',
        'hidden',
      );
    });

    it('shows all options when search is cleared', () => {
      cy.get('smileid-combobox-trigger input').type('nig');
      cy.get('smileid-combobox-option[value="GH"]').should(
        'have.attr',
        'hidden',
      );

      cy.get('smileid-combobox-trigger input').clear();
      cy.get('smileid-combobox-trigger input').trigger('input');

      cy.get('smileid-combobox-option[value="GH"]').should(
        'not.have.attr',
        'hidden',
      );
      cy.get('smileid-combobox-option[value="NG"]').should(
        'not.have.attr',
        'hidden',
      );
    });

    it('shows empty state when no options match', () => {
      cy.get('smileid-combobox-trigger input').type('zzz');

      cy.get('smileid-combobox-listbox #empty-state').should('exist');
      cy.get('smileid-combobox-option').each(($el) => {
        cy.wrap($el).should('have.attr', 'hidden');
      });
    });

    // Regression test: Huawei devices fire `input` events but keyup key === 'Unidentified'
    // Filtering must work via the `input` event alone, without a valid keyup key.
    it('filters options when input event fires without a keyup (Huawei soft keyboard)', () => {
      cy.get('smileid-combobox-trigger input').then(($input) => {
        // Directly set the value and fire only an input event — no keyup
        $input[0].value = 'ken';
        $input[0].dispatchEvent(new Event('input', { bubbles: true }));
      });

      cy.get('smileid-combobox-option[value="KE"]').should(
        'not.have.attr',
        'hidden',
      );
      cy.get('smileid-combobox-option[value="GH"]').should(
        'have.attr',
        'hidden',
      );
      cy.get('smileid-combobox-option[value="NG"]').should(
        'have.attr',
        'hidden',
      );
    });

    it('opens the listbox when typing starts', () => {
      cy.get('smileid-combobox-trigger').should(
        'have.attr',
        'expanded',
        'false',
      );

      cy.get('smileid-combobox-trigger input').type('g');

      cy.get('smileid-combobox-trigger').should(
        'have.attr',
        'expanded',
        'true',
      );
    });
  });
});
