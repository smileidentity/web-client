describe('Document auto-capture CV error recovery', () => {
  const importCvErrorRecovery = (win) =>
    win.eval(
      "import('/lib/components/document/src/document-auto-capture/detection/cvErrorRecovery.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('keeps transient frame errors recoverable without disabling chroma', () => {
    cy.window().then(async (win) => {
      const mod = await importCvErrorRecovery(win);

      const action = mod.nextCvErrorRecoveryAction({
        chromaUnavailable: false,
        errorStreak: 0,
      });

      expect(action.nextErrorStreak).to.equal(1);
      expect(action.shouldDisableChroma).to.equal(false);
      expect(action.shouldClearProcessingError).to.equal(false);
      expect(action.shouldActivateFallback).to.equal(false);
    });
  });

  it('clears the processing error when disabling chroma for recovery', () => {
    cy.window().then(async (win) => {
      const mod = await importCvErrorRecovery(win);

      const action = mod.nextCvErrorRecoveryAction({
        chromaUnavailable: false,
        errorStreak: mod.CHROMA_DISABLE_ERROR_THRESHOLD - 1,
      });

      expect(action.nextErrorStreak).to.equal(
        mod.CHROMA_DISABLE_ERROR_THRESHOLD,
      );
      expect(action.shouldDisableChroma).to.equal(true);
      expect(action.shouldClearProcessingError).to.equal(true);
      expect(action.shouldActivateFallback).to.equal(false);
    });
  });

  it('activates fallback when errors continue after chroma is unavailable', () => {
    cy.window().then(async (win) => {
      const mod = await importCvErrorRecovery(win);

      const action = mod.nextCvErrorRecoveryAction({
        chromaUnavailable: true,
        errorStreak: mod.CV_ERROR_FALLBACK_THRESHOLD - 1,
      });

      expect(action.nextErrorStreak).to.equal(mod.CV_ERROR_FALLBACK_THRESHOLD);
      expect(action.shouldDisableChroma).to.equal(false);
      expect(action.shouldClearProcessingError).to.equal(false);
      expect(action.shouldActivateFallback).to.equal(true);
    });
  });
});