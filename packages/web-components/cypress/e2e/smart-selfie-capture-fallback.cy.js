/**
 * Tests for the capture button 10-second fallback in SmartSelfieCapture.
 *
 * After mediapipe initialization completes successfully, if isReadyToCapture
 * is still false after 10 seconds, captureButtonFallbackEnabled becomes true
 * and the start-capture button is enabled regardless of face state.
 *
 * These tests target `smartselfie-capture` directly (not through
 * `selfie-capture-wrapper`, which bypasses SmartSelfieCapture in Cypress).
 *
 * `getUserMedia` is stubbed to return a fake canvas stream so that the
 * capture UI renders (rather than the camera-error fallback) and the
 * fallback timer can be exercised.
 */

const stubGetUserMediaWithFakeStream = (win) => {
  const canvas = win.document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const fakeStream = canvas.captureStream(30);

  const mediaDevices = win.navigator.mediaDevices || {};
  Object.defineProperty(win.navigator, 'mediaDevices', {
    configurable: true,
    value: {
      ...mediaDevices,
      enumerateDevices: () =>
        Promise.resolve([
          {
            deviceId: 'fake-device',
            kind: 'videoinput',
            label: 'Fake Camera',
          },
        ]),
      getUserMedia: () => Promise.resolve(fakeStream),
    },
  });
};

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartSelfieCapture capture button fallback [${name}]`, () => {
    it('button is initially disabled before 10-second fallback elapses', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`, {
        onBeforeLoad: stubGetUserMediaWithFakeStream,
      });

      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture')
        .should('be.disabled');
    });

    it('button becomes enabled after 10-second fallback when face is not ready', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`, {
        onBeforeLoad: stubGetUserMediaWithFakeStream,
      });

      // Allow up to 15s for the real 10-second fallback timer to fire.
      // The fake stream has no face so isReadyToCapture stays false,
      // triggering the fallback.
      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture', { timeout: 15000 })
        .should('not.be.disabled');
    });
  });
});
