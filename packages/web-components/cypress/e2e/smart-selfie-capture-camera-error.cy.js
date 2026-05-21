/**
 * Tests that SmartSelfieCapture surfaces camera errors to the user when
 * `getUserMedia` rejects (e.g. permission denied, no camera available).
 *
 * Targets `smartselfie-capture` directly via the test harness, stubbing
 * `navigator.mediaDevices.getUserMedia` before the component initializes.
 */

const stubGetUserMedia = (win, errorName) => {
  const mediaDevices = win.navigator.mediaDevices || {};
  // eslint-disable-next-line no-param-reassign
  Object.defineProperty(win.navigator, 'mediaDevices', {
    configurable: true,
    value: {
      ...mediaDevices,
      enumerateDevices: () => Promise.resolve([]),
      getUserMedia: () => {
        const error = new Error(`${errorName} (stubbed)`);
        error.name = errorName;
        return Promise.reject(error);
      },
    },
  });
};

const variants = [
  { name: 'iife', suffix: '' },
  { name: 'esm', suffix: '&format=esm' },
];

variants.forEach(({ name, suffix }) => {
  context(`SmartSelfieCapture camera errors [${name}]`, () => {
    it('shows a permission-denied message when getUserMedia rejects with NotAllowedError', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`, {
        onBeforeLoad(win) {
          stubGetUserMedia(win, 'NotAllowedError');
        },
      });

      cy.get('smartselfie-capture')
        .shadow()
        .find('.camera-error', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');

      // Capture preview and controls are hidden when there is a camera error.
      cy.get('smartselfie-capture')
        .shadow()
        .find('.camera-preview-container')
        .should('not.exist');

      cy.get('smartselfie-capture')
        .shadow()
        .find('#start-image-capture')
        .should('not.exist');
    });

    it('shows a not-found message when no camera is available', () => {
      cy.visit(`/?component=smartselfie-capture&direct=true${suffix}`, {
        onBeforeLoad(win) {
          stubGetUserMedia(win, 'NotFoundError');
        },
      });

      cy.get('smartselfie-capture')
        .shadow()
        .find('.camera-error', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');
    });
  });
});
