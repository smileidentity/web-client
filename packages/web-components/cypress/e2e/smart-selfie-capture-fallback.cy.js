/**
 * Tests for the capture button 10-second fallback in SmartSelfieCapture.
 *
 * After mediapipe initialization completes (success or failure), if
 * isReadyToCapture is still false after 10 seconds, captureButtonFallbackEnabled
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

    it('button is initially disabled before 10-second fallback elapses', () => {
      // Intercept mediapipe requests so init fails immediately
      cy.intercept('GET', '**/mediapipe**', { statusCode: 500 }).as(
        'mediapipeRequest',
      );
      cy.clock();
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      // Tick less than 10 seconds — fallback should not yet have fired
      cy.tick(9999);

      captureButtonSelector().should('be.disabled');
    });

    it('button becomes enabled after 10-second fallback when face is not ready', () => {
      // Intercept mediapipe requests so init fails immediately
      cy.intercept('GET', '**/mediapipe**', { statusCode: 500 }).as(
        'mediapipeRequest',
      );
      cy.clock();
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`);

      // Tick exactly 10 seconds — fallback timer fires, button should be enabled
      cy.tick(10000);

      captureButtonSelector().should('not.be.disabled');
    });
  });
});
