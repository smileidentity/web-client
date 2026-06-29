describe('Document auto-capture synthesis timing', () => {
  const importSynthesisTiming = (win) =>
    win.eval(
      "import('/lib/components/document/src/document-auto-capture/detection/synthesisTiming.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('keeps the synthetic bridge open for the intended wall-clock window', () => {
    cy.window().then(async (win) => {
      const mod = await importSynthesisTiming(win);
      const lastRealCardAtMs = 1000;

      expect(mod.isSyntheticBridgeRecent(lastRealCardAtMs, 1000)).to.equal(
        true,
      );
      expect(
        mod.isSyntheticBridgeRecent(
          lastRealCardAtMs,
          lastRealCardAtMs + mod.SYNTH_BRIDGE_WINDOW_MS,
        ),
      ).to.equal(true);
      expect(
        mod.isSyntheticBridgeRecent(
          lastRealCardAtMs,
          lastRealCardAtMs + mod.SYNTH_BRIDGE_WINDOW_MS + 1,
        ),
      ).to.equal(false);
    });
  });

  it('does not bridge without a prior real card timestamp', () => {
    cy.window().then(async (win) => {
      const mod = await importSynthesisTiming(win);

      expect(mod.isSyntheticBridgeRecent(null, 1000)).to.equal(false);
      expect(mod.isSyntheticBridgeRecent(1200, 1000)).to.equal(false);
    });
  });
});
