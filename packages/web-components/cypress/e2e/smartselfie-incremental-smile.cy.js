const createLandmarks = (upperLipY = 0.55, lowerLipY = 0.58) => {
  const points = Array.from({ length: 15 }, () => ({
    x: 0.5,
    y: 0.6,
    z: 0,
  }));

  points[0] = { x: 0.37, y: 0.42, z: 0 };
  points[1] = { x: 0.63, y: 0.42, z: 0 };
  points[2] = { x: 0.37, y: 0.78, z: 0 };
  points[3] = { x: 0.63, y: 0.78, z: 0 };
  points[4] = { x: 0.5, y: 0.6, z: 0 };
  points[13] = { x: 0.5, y: upperLipY, z: 0 };
  points[14] = { x: 0.5, y: lowerLipY, z: 0 };

  return [points];
};

const installBrowserMocks = (win, mode = 'always-smile', options = {}) => {
  const { switchAfterMs = 1600 } = options;
  const srcObjectStore = new WeakMap();
  const originalSrcObjectDescriptor = Object.getOwnPropertyDescriptor(
    win.HTMLMediaElement.prototype,
    'srcObject',
  );

  Object.defineProperty(win.HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    get() {
      return srcObjectStore.get(this) || null;
    },
    set(value) {
      srcObjectStore.set(this, value);
    },
  });

  const originalPlay = win.HTMLMediaElement.prototype.play;
  win.HTMLMediaElement.prototype.play = function play() {
    Object.defineProperty(this, 'videoWidth', {
      configurable: true,
      get: () => 720,
    });
    Object.defineProperty(this, 'videoHeight', {
      configurable: true,
      get: () => 1280,
    });
    Object.defineProperty(this, 'readyState', {
      configurable: true,
      get: () => 3,
    });

    this.dispatchEvent(new win.Event('loadedmetadata'));
    return Promise.resolve();
  };

  const originalDrawImage = win.CanvasRenderingContext2D.prototype.drawImage;
  win.CanvasRenderingContext2D.prototype.drawImage = () => {};

  win.__restoreBrowserMocks = () => {
    if (originalSrcObjectDescriptor) {
      Object.defineProperty(
        win.HTMLMediaElement.prototype,
        'srcObject',
        originalSrcObjectDescriptor,
      );
    }
    win.HTMLMediaElement.prototype.play = originalPlay;
    win.CanvasRenderingContext2D.prototype.drawImage = originalDrawImage;
  };

  Object.defineProperty(win.navigator, 'mediaDevices', {
    configurable: true,
    value: {
      enumerateDevices: () =>
        Promise.resolve([
          {
            deviceId: 'fake-camera-device',
            kind: 'videoinput',
            label: 'Fake Camera',
          },
        ]),
      getUserMedia: (constraints = {}) => {
        const requestedFacingMode = constraints?.video?.facingMode || 'user';
        const track = {
          getSettings: () => ({
            deviceId: 'fake-camera-device',
            facingMode: requestedFacingMode,
          }),
          stop: () => {},
        };

        return Promise.resolve({
          getTracks: () => [track],
          getVideoTracks: () => [track],
        });
      },
    },
  });

  const nonNeutralFrame = {
    faceBlendshapes: [
      {
        categories: [
          { categoryName: 'mouthSmileLeft', score: 0.6 },
          { categoryName: 'mouthSmileRight', score: 0.62 },
        ],
      },
    ],
    faceLandmarks: createLandmarks(0.55, 0.58),
  };

  const neutralFrame = {
    faceBlendshapes: [
      {
        categories: [
          { categoryName: 'mouthSmileLeft', score: 0.18 },
          { categoryName: 'mouthSmileRight', score: 0.2 },
        ],
      },
    ],
    faceLandmarks: createLandmarks(0.55, 0.565),
  };

  let progressiveFrameIndex = 0;
  let captureStartTimestamp = null;

  win.addEventListener('click', (event) => {
    const element = event.target;
    if (
      element &&
      element.nodeType === 1 &&
      element.id === 'start-image-capture' &&
      captureStartTimestamp === null
    ) {
      captureStartTimestamp = Date.now();
    }
  });

  const progressiveSmileFrame = () => {
    progressiveFrameIndex += 1;

    const smileBase = 0.3;
    const mouthBase = 0.065;
    const smile = Math.min(smileBase + progressiveFrameIndex * 0.05, 0.95);
    const mouthOpen = Math.min(mouthBase + progressiveFrameIndex * 0.015, 0.3);

    return {
      faceBlendshapes: [
        {
          categories: [
            { categoryName: 'mouthSmileLeft', score: smile },
            { categoryName: 'mouthSmileRight', score: smile },
          ],
        },
      ],
      faceLandmarks: createLandmarks(0.55, 0.55 + mouthOpen),
    };
  };

  const getDetectionFrame = () => {
    if (mode === 'neutral-then-smile') {
      const elapsedMs = captureStartTimestamp
        ? Date.now() - captureStartTimestamp
        : 0;
      if (elapsedMs < switchAfterMs) {
        return neutralFrame;
      }
      return progressiveSmileFrame();
    }

    return nonNeutralFrame;
  };

  win.__smileIdentityMediapipe = {
    instance: {
      detectForVideo: () => getDetectionFrame(),
    },
    loaded: true,
    loading: null,
  };

  win.__selfiePublishEvents = 0;
  win.addEventListener('selfie-capture.publish', () => {
    win.__selfiePublishEvents += 1;
  });
};

context('SmartSelfie Incremental Smile', () => {
  afterEach(() => {
    cy.window().then((win) => {
      win.__restoreBrowserMocks?.();
    });
  });

  it('pauses capture with neutral-expression alert when user smiles too early', () => {
    cy.visit('/?component=smartselfie-capture&direct=true', {
      onBeforeLoad: (win) => installBrowserMocks(win, 'always-smile'),
    });

    cy.get('smartselfie-capture')
      .shadow()
      .find('#start-image-capture', { timeout: 12000 })
      .should('be.enabled')
      .click();

    cy.get('smartselfie-capture')
      .shadow()
      .find('.alert-title', { timeout: 12000 })
      .should('contain.text', 'Neutral expression');

    cy.wait(4000);

    cy.window().its('__selfiePublishEvents').should('eq', 0);
  });

  it('keeps capture active when user is neutral first then progressively smiles', () => {
    cy.visit(
      '/?component=smartselfie-capture&direct=true&interval=350&duration=700',
      {
        onBeforeLoad: (win) =>
          installBrowserMocks(win, 'neutral-then-smile', {
            switchAfterMs: 500,
          }),
      },
    );

    cy.get('smartselfie-capture')
      .shadow()
      .find('#start-image-capture', { timeout: 12000 })
      .should('be.enabled')
      .click();

    cy.get('smartselfie-capture')
      .shadow()
      .find('.alert-title', { timeout: 12000 })
      .should('contain.text', 'Capturing');

    cy.wait(2500);

    cy.get('smartselfie-capture')
      .shadow()
      .find('.alert-title')
      .invoke('text')
      .then((text) => {
        expect(text).to.not.contain('Neutral expression');
        expect(text).to.match(/Smile!|Keep smiling!/);
      });
  });
});
