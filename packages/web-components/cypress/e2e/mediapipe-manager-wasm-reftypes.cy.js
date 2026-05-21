/**
 * Regression tests for the WebAssembly reftypes/externref feature probe
 * added to mediapipeManager.
 *
 * Background: MediaPipe Tasks Vision ships a .wasm that declares an
 * `externref` global. On older engines (Chrome < 96, Safari < 15,
 * Firefox < 79) `WebAssembly.instantiate` throws
 * `CompileError: invalid value type 'externref'`, surfacing in Sentry as
 * an unhandled rejection (see WEB-CLIENT-Q7). `getMediapipeInstance`
 * now probes support up-front and rejects with a typed
 * `UnsupportedMediapipeEnvironmentError` so the legacy selfie-capture
 * fallback path is used instead.
 */

describe('MediaPipe Manager WebAssembly reftypes support', () => {
  const importManager = (win) =>
    win.eval(
      "import('/lib/components/selfie/src/smartselfie-capture/utils/mediapipeManager.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('detects externref support in the current (modern) browser', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      expect(mod.__testUtils.supportsWasmReftypes()).to.equal(true);
    });
  });

  it('returns false when WebAssembly is unavailable', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const originalWasm = win.WebAssembly;

      try {
        // eslint-disable-next-line no-param-reassign
        delete win.WebAssembly;
        expect(mod.__testUtils.supportsWasmReftypes()).to.equal(false);
      } finally {
        // eslint-disable-next-line no-param-reassign
        win.WebAssembly = originalWasm;
      }
    });
  });

  it('returns false when WebAssembly.validate rejects the externref module', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const originalValidate = win.WebAssembly.validate;

      try {
        win.WebAssembly.validate = () => false;
        expect(mod.__testUtils.supportsWasmReftypes()).to.equal(false);
      } finally {
        win.WebAssembly.validate = originalValidate;
      }
    });
  });

  it('returns false when WebAssembly.validate throws', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const originalValidate = win.WebAssembly.validate;

      try {
        win.WebAssembly.validate = () => {
          throw new Error('blocked');
        };
        expect(mod.__testUtils.supportsWasmReftypes()).to.equal(false);
      } finally {
        win.WebAssembly.validate = originalValidate;
      }
    });
  });
});

describe('getMediapipeInstance reftypes fallback', () => {
  const importManager = (win) =>
    win.eval(
      "import('/lib/components/selfie/src/smartselfie-capture/utils/mediapipeManager.ts')",
    );

  beforeEach(() => {
    cy.visit('/');
  });

  it('rejects with UnsupportedMediapipeEnvironmentError when reftypes are unsupported', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);

      // Pre-seed the cache to simulate an old browser without externref.
      // eslint-disable-next-line no-param-reassign
      win.__smileIdentityMediapipe = {
        instance: null,
        loaded: false,
        loading: null,
        supportsWasmReftypes: false,
      };

      let caught;
      try {
        await mod.getMediapipeInstance();
      } catch (error) {
        caught = error;
      }

      expect(caught, 'getMediapipeInstance should reject').to.not.equal(
        undefined,
      );
      expect(caught).to.be.instanceOf(mod.UnsupportedMediapipeEnvironmentError);
      expect(caught.name).to.equal('UnsupportedMediapipeEnvironmentError');
      expect(caught.message).to.match(/externref|reference types/i);

      // Cleanup so other specs sharing the same window are unaffected.
      // eslint-disable-next-line no-param-reassign
      delete win.__smileIdentityMediapipe;
    });
  });

  it('does not start MediaPipe loading when reftypes are unsupported', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);

      // eslint-disable-next-line no-param-reassign
      win.__smileIdentityMediapipe = {
        instance: null,
        loaded: false,
        loading: null,
        supportsWasmReftypes: false,
      };

      try {
        await mod.getMediapipeInstance();
      } catch {
        /* expected */
      }

      const state = win.__smileIdentityMediapipe;
      expect(state.loading, 'loading promise must not be created').to.equal(
        null,
      );
      expect(state.loaded).to.equal(false);
      expect(state.instance).to.equal(null);

      // eslint-disable-next-line no-param-reassign
      delete win.__smileIdentityMediapipe;
    });
  });

  it('caches the reftypes probe result across calls', () => {
    cy.window().then(async (win) => {
      const mod = await importManager(win);

      // eslint-disable-next-line no-param-reassign
      win.__smileIdentityMediapipe = {
        instance: null,
        loaded: false,
        loading: null,
      };

      const originalValidate = win.WebAssembly.validate;
      let validateCalls = 0;
      win.WebAssembly.validate = () => {
        validateCalls += 1;
        return false;
      };

      try {
        await mod.getMediapipeInstance().catch(() => {});
        await mod.getMediapipeInstance().catch(() => {});
        await mod.getMediapipeInstance().catch(() => {});

        expect(
          validateCalls,
          'WebAssembly.validate should only be invoked once',
        ).to.equal(1);
        expect(win.__smileIdentityMediapipe.supportsWasmReftypes).to.equal(
          false,
        );
      } finally {
        win.WebAssembly.validate = originalValidate;
        // eslint-disable-next-line no-param-reassign
        delete win.__smileIdentityMediapipe;
      }
    });
  });
});
