/**
 * UI tests for `<enhanced-smartselfie-capture>` that don't require a real
 * webcam or MediaPipe runtime.
 *
 * `getUserMedia` is stubbed to return a fake canvas-backed `MediaStream`
 * so the capture pipeline reaches a steady state without prompting the
 * browser for permissions.
 *
 * Behaviours covered:
 *   - The guidelines screen is the first view and renders four tiles.
 *   - `hide-instructions` skips guidelines and goes straight to capture.
 *
 * The consent screen now lives in the standalone
 * `<enhanced-smart-selfie-consent>` element and is covered by
 * `enhanced-smart-selfie-consent.cy.js`.
 *
 * The submission card (`submission-state` attribute, `force-fail` event)
 * is intentionally not covered here: both surfaces are guarded to only
 * apply after the user has confirmed a capture, and exercising them
 * requires driving real MediaPipe detection. They are instead covered by
 * the embed integration tests that boot the full hosted-web flow.
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

const visitEnhanced = (qs = '') => {
  cy.visit(
    `/?component=enhanced-smartselfie-capture&direct=true${qs ? `&${qs}` : ''}`,
    {
      onBeforeLoad(win) {
        stubGetUserMediaWithFakeStream(win);
      },
    },
  );

  return cy.get('enhanced-smartselfie-capture', { timeout: 10000 });
};

context('Enhanced SmartSelfie — Guidelines screen', () => {
  it('renders the four guideline tiles as the first view', () => {
    visitEnhanced()
      .shadow()
      .within(() => {
        cy.get('.enhanced-instructions', { timeout: 10000 }).should(
          'be.visible',
        );
        cy.get('.enhanced-instructions .guideline-tile').should(
          'have.length',
          4,
        );
      });
  });

  // The dev harness in `src/app.tsx` wires URL params into Preact's
  // `createElement` props, which preact-custom-element applies as JS
  // property setters. For boolean attributes like `hide-instructions`,
  // that path can race with the component's first render, so we instead
  // boot the harness with no flags and then replace the element with one
  // whose attributes are already set in HTML before insertion — which is
  // the contract real partners use.
  it('honours `hide-instructions` and skips straight to the capture view', () => {
    visitEnhanced().then(() => {
      cy.window().then((win) => {
        const existing = win.document.querySelector(
          'enhanced-smartselfie-capture',
        );
        const parent = existing.parentNode;
        existing.remove();
        const fresh = win.document.createElement(
          'enhanced-smartselfie-capture',
        );
        fresh.setAttribute('hide-instructions', 'true');
        parent.appendChild(fresh);
      });

      cy.get('enhanced-smartselfie-capture', { timeout: 10000 })
        .shadow()
        .within(() => {
          cy.get('.enhanced-instructions').should('not.exist');
        });
    });
  });
});
