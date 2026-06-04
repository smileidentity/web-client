/**
 * Verifies the self-cancellation race in the SelfieCaptureWrapper MediaPipe
 * load effect. The shipped ("buggy") effect puts `mediapipeLoading` in its
 * dependency array and sets it true as its first action, so the effect re-runs
 * and its cleanup flips `cancelled` before a slow load resolves — leaving the
 * UI stuck on the loading spinner even though MediaPipe loaded successfully.
 */

describe('MediaPipe load effect cancellation race', () => {
  const importProbe = (win) =>
    win.eval("import('/cypress/fixtures/mediapipe-load-race-probe.js')");

  beforeEach(() => {
    cy.visit('/');
  });

  it('buggy variant: a slow load gets self-cancelled and stays LOADING', () => {
    cy.window().then(async (win) => {
      const mod = await importProbe(win);
      const result = await mod.default({ resolveDelayMs: 50, variant: 'buggy' });
      expect(result).to.equal('LOADING');
    });
  });

  it('fixed variant: the same slow load completes and reaches READY', () => {
    cy.window().then(async (win) => {
      const mod = await importProbe(win);
      const result = await mod.default({ resolveDelayMs: 50, variant: 'fixed' });
      expect(result).to.equal('READY');
    });
  });
});
