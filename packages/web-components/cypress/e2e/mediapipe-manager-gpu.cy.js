describe('MediaPipe Manager GPU detection', () => {
  const importManager = (win) =>
    win.eval(
      "import('/lib/components/selfie/src/smartselfie-capture/utils/mediapipeManager.ts')",
    );

  it("matches excluded GPU for 'Adreno (TM) 830'", () => {
    cy.visit('/');

    cy.window().then(async (win) => {
      const mod = await importManager(win);
      expect(mod.__testUtils.matchesExcludedGpu('Adreno (TM) 830')).to.equal(
        true,
      );
    });
  });

  it("matches excluded GPU family for 'Adreno 899'", () => {
    cy.visit('/');

    cy.window().then(async (win) => {
      const mod = await importManager(win);
      expect(mod.__testUtils.matchesExcludedGpu('Adreno 899')).to.equal(true);
    });
  });

  it('uses CPU when WebGL renderer and UA hints are both unavailable', () => {
    cy.visit('/');

    cy.window().then(async (win) => {
      const mod = await importManager(win);
      const originalCreateElement = win.document.createElement.bind(
        win.document,
      );
      const hadUserAgentData = Object.prototype.hasOwnProperty.call(
        win.navigator,
        'userAgentData',
      );
      const userAgentDataDescriptor = Object.getOwnPropertyDescriptor(
        win.navigator,
        'userAgentData',
      );

      try {
        win.document.createElement = function patchedCreateElement(
          tag,
          ...args
        ) {
          const element = originalCreateElement(tag, ...args);

          if (String(tag).toLowerCase() === 'canvas') {
            Object.defineProperty(element, 'getContext', {
              configurable: true,
              value: () => null,
            });
          }

          return element;
        };

        Object.defineProperty(win.navigator, 'userAgentData', {
          configurable: true,
          value: {
            getHighEntropyValues: () => Promise.reject(new Error('UA disabled')),
          },
        });

        const delegate = await mod.__testUtils.getDelegateFromGpuDetection();
        expect(delegate).to.equal('CPU');
      } finally {
        win.document.createElement = originalCreateElement;

        if (hadUserAgentData && userAgentDataDescriptor) {
          Object.defineProperty(
            win.navigator,
            'userAgentData',
            userAgentDataDescriptor,
          );
        } else {
          delete win.navigator.userAgentData;
        }
      }
    });
  });
});
