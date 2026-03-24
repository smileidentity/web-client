/**
 * Tests for the capture button 10-second fallback in SmartSelfieCapture.
 *
 * After mediapipe initialization completes successfully, if isReadyToCapture
 * is still false after 10 seconds, captureButtonFallbackEnabled becomes true
 * and the start-capture button is enabled regardless of face state.
 *
 * These tests target `smartselfie-capture` directly (not through
 * `selfie-capture-wrapper`, which bypasses SmartSelfieCapture in Cypress).
 */

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartSelfieCapture capture button fallback [${name}]`, () => {
    it('button is initially disabled before 10-second fallback elapses', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture')
        .should('be.disabled');
    });

    it('button becomes enabled after 10-second fallback when face is not ready', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      // Allow up to 15s for the real 10-second fallback timer to fire.
      // No camera is available in Cypress so isReadyToCapture stays false,
      // triggering the fallback.
      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture', { timeout: 15000 })
        .should('not.be.disabled');
    });
  });
});
