describe('Document auto-capture quality scoring', () => {
  const importQualityScoring = (win) =>
    win.eval(
      "import('/lib/components/document/src/document-auto-capture/detection/qualityScoring.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('clamps scores to the accepted 0–1 range', () => {
    cy.window().then(async (win) => {
      const mod = await importQualityScoring(win);

      expect(mod.clamp01(-0.5)).to.equal(0);
      expect(mod.clamp01(0.4)).to.equal(0.4);
      expect(mod.clamp01(1.7)).to.equal(1);
    });
  });

  it('normalizes quality weights over only the present scores', () => {
    cy.window().then(async (win) => {
      const mod = await importQualityScoring(win);

      expect(mod.frameQualityScore({ glare: 0, sharpness: 1 })).to.be.closeTo(
        0.7,
        0.0001,
      );
      expect(mod.frameQualityScore({ glare: null, sharpness: 1 })).to.equal(1);
      expect(mod.frameQualityScore({})).to.equal(0);
    });
  });

  it('keeps synthetic contour confidence below a real full contour score', () => {
    cy.window().then(async (win) => {
      const mod = await importQualityScoring(win);

      expect(mod.SYNTHETIC_CONTOUR_CONFIDENCE).to.be.greaterThan(0);
      expect(mod.SYNTHETIC_CONTOUR_CONFIDENCE).to.be.lessThan(1);
      expect(
        mod.frameQualityScore({ contour: mod.SYNTHETIC_CONTOUR_CONFIDENCE }),
      ).to.equal(mod.SYNTHETIC_CONTOUR_CONFIDENCE);
    });
  });
});
