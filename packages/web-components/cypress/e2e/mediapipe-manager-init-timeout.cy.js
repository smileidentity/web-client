/**
 * Regression tests for the on-device init timeout added to mediapipeManager.
 *
 * Background: `FaceLandmarker.createFromOptions` downloads the WASM + model and
 * then compiles the WASM / initializes the GPU graph on-device. That on-device
 * step can stall indefinitely on some drivers — the network requests show as
 * complete in DevTools, yet the cached `loading` promise never settles. This
 * left the loading UI spinning until the wrapper's hard deadline (surfacing a
 * misleading "connection error") and poisoned the singleton so retries and
 * remounts awaited the same dead promise. `withTimeout` now bounds the init and
 * rejects with a typed `MediapipeInitTimeoutError` so the bounded retry / CPU
 * fallback can recover.
 */

describe('MediaPipe Manager init timeout', () => {
  const importManager = (win) =>
    win.eval(
      "import('/lib/components/selfie/src/smartselfie-capture/utils/mediapipeManager.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('resolves with the value when the promise settles before the timeout', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const result = await mod.__testUtils.withTimeout(
        Promise.resolve('ok'),
        1000,
        'should not time out',
      );
      expect(result).to.equal('ok');
    });
  });

  it('rejects with MediapipeInitTimeoutError when the promise never settles', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);

      let caught;
      try {
        await mod.__testUtils.withTimeout(
          new Promise(() => {}), // never settles — simulates a stalled init
          50,
          'init stalled',
        );
      } catch (error) {
        caught = error;
      }

      expect(caught, 'withTimeout should reject').to.not.equal(undefined);
      expect(caught).to.be.instanceOf(mod.MediapipeInitTimeoutError);
      expect(caught.name).to.equal('MediapipeInitTimeoutError');
      expect(caught.message).to.equal('init stalled');
    });
  });

  it('propagates the original rejection rather than a timeout error', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const original = new Error('boom');

      let caught;
      try {
        await mod.__testUtils.withTimeout(
          Promise.reject(original),
          1000,
          'should not time out',
        );
      } catch (error) {
        caught = error;
      }

      expect(caught).to.equal(original);
      expect(caught).to.not.be.instanceOf(mod.MediapipeInitTimeoutError);
    });
  });

  it('exposes a positive default init timeout', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      expect(mod.__testUtils.MEDIAPIPE_INIT_TIMEOUT_MS).to.be.greaterThan(0);
    });
  });
});
