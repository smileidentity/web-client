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
      // Use fake timers so we don't wait 10 real seconds.
      // onBeforeLoad runs before app scripts so cy.clock() takes effect
      // before any setTimeout calls are made by the component.
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`, {
        onBeforeLoad(win) {
          cy.stub(win, 'setTimeout').callsFake((fn, delay, ...args) => {
            // Let short timeouts (≤500ms) run normally so app init isn't broken.
            // Immediately invoke the fallback timer (10s) so the test is fast.
            if (delay >= 10000) {
              fn(...args);
              return 0;
            }
            return win.setTimeout.wrappedMethod.call(win, fn, delay, ...args);
          });
        },
      });

      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture')
        .should('not.be.disabled');
    });
  });
});
