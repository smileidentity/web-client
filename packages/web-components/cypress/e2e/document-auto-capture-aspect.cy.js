describe('Document auto-capture aspect classification', () => {
  const importDocumentAspect = (win) =>
    win.eval(
      "import('/lib/components/document/src/document-auto-capture/detection/documentAspect.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('recognizes supported document aspect keys', () => {
    cy.window().then(async (win) => {
      const mod = await importDocumentAspect(win);

      expect(mod.isAspectKey('id-card')).to.equal(true);
      expect(mod.isAspectKey('passport')).to.equal(true);
      expect(mod.isAspectKey('greenbook')).to.equal(true);
      expect(mod.isAspectKey('license')).to.equal(false);
    });
  });

  it('classifies discovery candidates around the document midpoint', () => {
    cy.window().then(async (win) => {
      const mod = await importDocumentAspect(win);

      expect(
        mod.classifyDiscoveryAspect(mod.ASPECT_RATIOS['id-card']),
      ).to.equal('id-card');
      expect(mod.classifyDiscoveryAspect(mod.ASPECT_RATIOS.passport)).to.equal(
        'passport',
      );
    });
  });

  it('keeps a tilted id-card vote based on normalized rotated aspect', () => {
    cy.window().then(async (win) => {
      const mod = await importDocumentAspect(win);

      expect(mod.classifyDiscoveryAspect(1.58)).to.equal('id-card');
      expect(mod.classifyDiscoveryAspect(1.32)).to.equal('passport');
    });
  });
});
