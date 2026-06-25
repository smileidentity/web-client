/**
 * Wrapper-level MediaPipe states: cached-instance reuse, the load spinner→ready
 * transition (guards the load-effect self-cancel race), and the failure screen
 * copy + Retry button.
 *
 * The wrapper normally short-circuits the whole load path under Cypress; these
 * tests set `__SMILE_ID_TEST_FORCE_MEDIAPIPE_LOAD__` to opt into the real path
 * and drive MediaPipe purely by seeding `window.__smileIdentityMediapipe`.
 *
 * Note: the wrapper renders `SmartSelfieCapture` as a Preact component (a
 * `<div class="smartselfie-capture">`), not the `<smartselfie-capture>` custom
 * element — so "smart capture is mounted" is asserted via `.smartselfie-capture`.
 */
import {
  makeFaceResult,
  seedDeferredMediapipe,
  seedFakeMediapipe,
  stubFakeCamera,
} from '../support/mediapipeStub';

const wrapper = () =>
  cy.get('selfie-capture-wrapper', { timeout: 15000 }).shadow();

const smartCapture = (opts) => wrapper().find('.smartselfie-capture', opts);

describe('SelfieCaptureWrapper MediaPipe states (stubbed)', () => {
  it('reuses a cached instance: renders smart capture, not the spinner or legacy', () => {
    // No force flag and no deferred — a pre-loaded singleton should make the
    // wrapper render SmartSelfieCapture immediately (guards the cache-seed fix).
    cy.visit('/?component=selfie-capture-wrapper&direct=true', {
      onBeforeLoad(win) {
        stubFakeCamera(win);
        seedFakeMediapipe(win, () => makeFaceResult('smiling'));
      },
    });

    // The smart capture div rendering is mutually exclusive with the loading
    // spinner and the legacy fallback, so its presence proves neither is shown.
    smartCapture({ timeout: 15000 }).should('exist');
    wrapper().find('selfie-capture').should('not.exist');
  });

  it('shows the loading spinner then renders smart capture once the load resolves', () => {
    let deferred;
    cy.visit('/?component=selfie-capture-wrapper&direct=true', {
      onBeforeLoad(win) {
        win.__SMILE_ID_TEST_FORCE_MEDIAPIPE_LOAD__ = true;
        stubFakeCamera(win);
        deferred = seedDeferredMediapipe(win);
      },
    });

    // Spinner/progress copy is shown while the load is pending.
    wrapper().find('p').should('contain.text', 'Setting up the camera');
    smartCapture().should('not.exist');

    // Resolve the load → the wrapper must flip to ready and mount smart capture.
    // (With the pre-fix self-cancel race this stayed stuck on the spinner.)
    cy.then(() => deferred.resolve(() => makeFaceResult('smiling')));
    smartCapture({ timeout: 15000 }).should('exist');
  });

  it('shows the setup-error copy + Retry button on failure, and Retry recovers', () => {
    let deferred;
    cy.visit('/?component=selfie-capture-wrapper&direct=true&timeout=200', {
      onBeforeLoad(win) {
        win.__SMILE_ID_TEST_FORCE_MEDIAPIPE_LOAD__ = true;
        stubFakeCamera(win);
        deferred = seedDeferredMediapipe(win);
      },
    });

    // Fail the load terminally → after the 200ms deadline (no legacy fallback)
    // the wrapper shows the actionable setup error and a Retry button.
    cy.then(() => deferred.reject());
    wrapper()
      .find('p', { timeout: 15000 })
      .should('contain.text', 'finish setting up face capture');
    wrapper().find('button').should('contain.text', 'Try again');

    // Make the next attempt succeed, then click Retry → smart capture renders.
    cy.window().then((win) =>
      seedFakeMediapipe(win, () => makeFaceResult('smiling')),
    );
    wrapper().find('button').contains('Try again').click();
    smartCapture({ timeout: 15000 }).should('exist');
  });

  it('shows the offline copy when the browser reports being offline', () => {
    let deferred;
    cy.visit('/?component=selfie-capture-wrapper&direct=true&timeout=200', {
      onBeforeLoad(win) {
        win.__SMILE_ID_TEST_FORCE_MEDIAPIPE_LOAD__ = true;
        stubFakeCamera(win);
        deferred = seedDeferredMediapipe(win);
        Object.defineProperty(win.navigator, 'onLine', {
          configurable: true,
          value: false,
        });
      },
    });

    cy.then(() => deferred.reject());
    wrapper()
      .find('p', { timeout: 15000 })
      .should('contain.text', 'You appear to be offline');
  });
});
