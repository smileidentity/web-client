/**
 * UI tests for `<enhanced-smartselfie-capture>` that don't require a real
 * webcam or MediaPipe runtime.
 *
 * `getUserMedia` is stubbed to return a fake canvas-backed `MediaStream`
 * so the capture pipeline reaches a steady state without prompting the
 * browser for permissions.
 *
 * Behaviours covered:
 *   - Consent screen renders with the partner name + Smile ID strongs and
 *     the four data-collection items.
 *   - Allow button is gated by the consent checkbox.
 *   - Clicking Allow advances to the next view (instructions by default).
 *   - Clicking Deny dispatches the `selfie-capture.cancelled` window event.
 *   - Learn-more disclosure toggles open / closed and renders both the
 *     DSAR and Smile ID privacy links.
 *   - `hide-consent` skips straight to the instructions screen, where the
 *     four guideline tiles render.
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

context('Enhanced SmartSelfie — Consent screen', () => {
  it('renders with the partner name and Smile ID interpolated into the body', () => {
    visitEnhanced('partner-name=Acme%20Bank')
      .shadow()
      .within(() => {
        cy.get('.ess-consent', { timeout: 10000 }).should('be.visible');
        cy.get('.ess-consent .title').should('contain.text', 'Acme Bank');
        cy.get('.ess-consent .title').should('contain.text', 'Smile ID');
        cy.get('.ess-consent .body strong').should('contain.text', 'Smile ID');
        cy.get('.ess-consent .body strong').should('contain.text', 'Acme Bank');
        cy.get('.ess-consent .items li').should('have.length', 4);
      });
  });

  it('disables the Allow button until the consent checkbox is checked', () => {
    visitEnhanced('partner-name=Acme')
      .shadow()
      .within(() => {
        cy.get('.ess-consent .allow').should('be.disabled');
        cy.get('.ess-consent .checkbox input').check({ force: true });
        cy.get('.ess-consent .allow').should('not.be.disabled');
      });
  });

  it('advances past the consent screen once Allow is clicked', () => {
    visitEnhanced('partner-name=Acme')
      .shadow()
      .within(() => {
        cy.get('.ess-consent .checkbox input').check({ force: true });
        cy.get('.ess-consent .allow').click();
        cy.get('.ess-consent').should('not.exist');
        // With instructions enabled (the default), the next view is the
        // instructions screen.
        cy.get('.enhanced-instructions', { timeout: 10000 }).should(
          'be.visible',
        );
      });
  });

  it('dispatches `selfie-capture.cancelled` on window when Deny is clicked', () => {
    visitEnhanced('partner-name=Acme').then(() => {
      cy.window().then((win) => {
        const spy = cy.spy().as('cancelled');
        win.addEventListener('selfie-capture.cancelled', spy);
      });

      cy.get('enhanced-smartselfie-capture')
        .shadow()
        .within(() => {
          cy.get('.ess-consent .deny').click();
        });

      cy.get('@cancelled').should('have.been.called');
    });
  });

  it('toggles the Learn more disclosure and exposes the privacy links', () => {
    visitEnhanced('partner-name=Acme')
      .shadow()
      .within(() => {
        cy.get('.ess-consent .learn-more-copy').should('not.exist');
        cy.get('.ess-consent .learn-more').click();
        cy.get('.ess-consent .learn-more-copy').should('be.visible');
        cy.get('.ess-consent .learn-more-copy a[href*="dsar.usesmileid.com"]')
          .should('exist')
          .and('contain.text', 'DSAR');
        cy.get(
          '.ess-consent .learn-more-copy a[href*="usesmileid.com/legal/privacy-policy"]',
        ).should('exist');
      });
  });
});

context('Enhanced SmartSelfie — Instructions screen', () => {
  // The dev harness in `src/app.tsx` wires URL params into Preact's
  // `createElement` props, which preact-custom-element applies as JS
  // property setters. For boolean attributes like `hide-consent`, that
  // path can race with the component's first render, so we instead boot
  // the harness with no flags and then replace the element with one whose
  // attributes are already set in HTML before insertion — which is the
  // contract real partners use.
  it('honours `hide-consent` and renders the four guideline tiles', () => {
    visitEnhanced('partner-name=Acme').then(() => {
      cy.window().then((win) => {
        const existing = win.document.querySelector(
          'enhanced-smartselfie-capture',
        );
        const parent = existing.parentNode;
        existing.remove();
        // Insert a freshly-constructed element with all attributes set
        // before it enters the DOM so connectedCallback sees them.
        const fresh = win.document.createElement(
          'enhanced-smartselfie-capture',
        );
        fresh.setAttribute('hide-consent', 'true');
        fresh.setAttribute('partner-name', 'Acme');
        parent.appendChild(fresh);
      });

      cy.get('enhanced-smartselfie-capture', { timeout: 10000 })
        .shadow()
        .within(() => {
          cy.get('.ess-consent').should('not.exist');
          cy.get('.enhanced-instructions', { timeout: 10000 }).should(
            'be.visible',
          );
          cy.get('.enhanced-instructions .guideline-tile').should(
            'have.length',
            4,
          );
        });
    });
  });
});
