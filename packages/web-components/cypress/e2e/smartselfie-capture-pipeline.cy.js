/**
 * Exercises the MediaPipe-based smart selfie capture pipeline end-to-end with a
 * stubbed FaceLandmarker + fake camera. Mounts `smartselfie-capture` directly
 * (it has no isCypress short-circuit — that lives in the wrapper), seeds a fake
 * loaded instance, and drives detection via scripted `detectForVideo` results.
 */
import {
  makeFaceResult,
  seedFakeMediapipe,
  stubFakeCamera,
} from '../support/mediapipeStub';

describe('SmartSelfie capture pipeline (stubbed MediaPipe)', () => {
  // Per-test scenario the stubbed detectForVideo returns; mutated by tests.
  let scenario = 'smiling';

  const mount = () => {
    cy.visit('/?component=smartselfie-capture&direct=true', {
      onBeforeLoad(win) {
        stubFakeCamera(win);
        seedFakeMediapipe(win, () => makeFaceResult(scenario));
        win.addEventListener('selfie-capture.publish', (event) => {
          // eslint-disable-next-line no-param-reassign
          win.__capturePublished = event.detail;
        });
      },
    });
  };

  const alertTitle = () =>
    cy.get('smartselfie-capture').shadow().find('.alert-title', {
      timeout: 15000,
    });

  it('initializes and reaches the ready-to-capture state when a good face is present', () => {
    scenario = 'smiling';
    mount();

    // Camera preview renders (no camera error)...
    cy.get('smartselfie-capture').shadow().find('video').should('exist');
    cy.get('smartselfie-capture')
      .shadow()
      .find('.camera-error')
      .should('not.exist');

    // ...and once detection runs, it leaves "Initialising" and is ready.
    alertTitle().should('contain.text', 'Ready to capture');
  });

  it('shows the "position your face" prompt when no face is detected', () => {
    scenario = 'none';
    mount();

    alertTitle().should('contain.text', 'Position your face in the oval');
  });

  it('completes detection → capture → publishes selfie-capture.publish', () => {
    scenario = 'smiling';
    mount();

    // Wait for the ready state, then start capture.
    cy.get('smartselfie-capture')
      .shadow()
      .find('#start-image-capture', { timeout: 15000 })
      .should('not.be.disabled')
      .click();

    // The detection-driven capture interval should publish with images.
    cy.window({ timeout: 20000 })
      .its('__capturePublished')
      .should('exist')
      .then((detail) => {
        expect(detail.images, 'published images')
          .to.be.an('array')
          .with.length.greaterThan(0);
        expect(detail.referenceImage, 'reference image').to.be.a('string');
      });
  });
});
