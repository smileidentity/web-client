// Verifies the integration contract in DocumentCaptureScreens.connectedCallback:
// the `auto-capture-enabled` attribute flips the live-capture element between the
// new <document-auto-capture> and the legacy <document-capture>. This is the key
// routing decision and is asserted at the DOM level, without exercising getUserMedia.

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`DocumentCaptureScreens auto-capture routing [${name}]`, () => {
    it('renders <document-auto-capture> when auto-capture-enabled is set', () => {
      cy.visit(
        `/?component=document-capture&direct=true&auto-capture-enabled&auto-capture=autoCapture${suffix}`,
      );

      cy.get('document-capture-screens')
        .find('document-auto-capture')
        .should('exist');

      // Legacy element must not be rendered in this mode.
      cy.get('document-capture-screens')
        .find('document-capture')
        .should('not.exist');
    });

    it('renders the legacy <document-capture> when auto-capture-enabled is absent', () => {
      cy.visit(`/?component=document-capture&direct=true${suffix}`);

      cy.get('document-capture-screens')
        .find('document-capture')
        .should('exist');

      cy.get('document-capture-screens')
        .find('document-auto-capture')
        .should('not.exist');
    });
  });
});
