/**
 * Tests for the capture button 5-second fallback in SmartSelfieCapture.
 *
 * After mediapipe initialization completes (success or failure), if
 * isReadyToCapture is still false after 5 seconds, captureButtonFallbackEnabled
 * becomes true and the start-capture button is enabled regardless of face state.
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
    const captureButtonSelector = () =>
      cy.get('smartselfie-capture').shadow().find('#start-image-capture');

    it.skip('button is initially disabled before 5-second fallback elapses', () => {
      // Intercept mediapipe requests so init fails immediately
      cy.intercept('GET', '**/mediapipe**', { statusCode: 500 }).as(
        'mediapipeRequest',
      );
      cy.clock();
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      // Tick less than 5 seconds — fallback should not yet have fired
      cy.tick(4999);

      captureButtonSelector().should('be.disabled');
    });

    it.skip('button becomes enabled after 5-second fallback when face is not ready', () => {
      // Intercept mediapipe requests so init fails immediately
      cy.intercept('GET', '**/mediapipe**', { statusCode: 500 }).as(
        'mediapipeRequest',
      );
      cy.clock();
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      // Tick exactly 5 seconds — fallback timer fires, button should be enabled
      cy.tick(5000);

      captureButtonSelector().should('not.be.disabled');
    });

    it.skip('button is enabled immediately when face is detected and ready before 5 seconds (no fallback needed)', () => {
      // Skipped: requires a real camera and face detection to set isReadyToCapture=true
      // When isReadyToCapture becomes true, the button should be enabled naturally
      // without waiting for the 5s fallback timer.
    });
  });
});
