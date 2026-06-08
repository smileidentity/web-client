/**
 * Test helpers for driving the MediaPipe-based smart selfie capture without the
 * real WASM/model. We seed `window.__smileIdentityMediapipe` with a fake
 * FaceLandmarker whose `detectForVideo` returns scripted results, and stub the
 * camera with a canvas-backed MediaStream so the video element has real
 * dimensions (so `useFaceCapture.detectFace`'s readiness guard passes).
 *
 * The synthetic landmark geometry is tuned against the real helpers in
 * `utils/faceDetection.ts` for the landscape oval (videoAspectRatio > 1, i.e. a
 * 640x480 stream): oval centre (0.5, 0.6). A 0.42-wide/tall box centred there
 * gives `calculateFaceSize` ≈ 0.42 (within [minFaceSize 0.35, maxFaceSize 0.5]
 * → "good") and lands inside `isFaceInBounds`.
 */

const OVAL_CENTER_X = 0.5;
const OVAL_CENTER_Y = 0.6;

// Builds a 468-point face landmark array as an ellipse centred on the oval.
// `sizeFrac` controls proximity; `mouthGap` controls `calculateMouthOpening`
// (indices 13/14 are the lip centres).
const buildLandmarks = (sizeFrac, mouthGap) => {
  const points = [];
  for (let i = 0; i < 468; i += 1) {
    const angle = (i / 468) * Math.PI * 2;
    points.push({
      x: OVAL_CENTER_X + (sizeFrac / 2) * Math.cos(angle),
      y: OVAL_CENTER_Y + (sizeFrac / 2) * Math.sin(angle),
      z: 0,
    });
  }
  // Lip centres consumed by calculateMouthOpening (face[13], face[14]).
  points[13] = { x: OVAL_CENTER_X, y: OVAL_CENTER_Y, z: 0 };
  points[14] = { x: OVAL_CENTER_X, y: OVAL_CENTER_Y + mouthGap, z: 0 };
  return points;
};

const blendshapes = (smileScore) => [
  {
    categories: [
      { categoryName: 'mouthSmileLeft', score: smileScore },
      { categoryName: 'mouthSmileRight', score: smileScore },
    ],
  },
];

/**
 * Build a `detectForVideo` result for a named scenario.
 * - 'smiling': face detected, in-bounds, good proximity, smiling (drives capture)
 * - 'good':    face detected, in-bounds, good proximity, neutral (no smile)
 * - 'too-far': face detected but too small → proximity not 'good'
 * - 'none':    no face detected
 */
export const makeFaceResult = (scenario = 'smiling') => {
  if (scenario === 'none') {
    return { faceBlendshapes: [], faceLandmarks: [] };
  }
  if (scenario === 'too-far') {
    return {
      faceBlendshapes: blendshapes(0),
      faceLandmarks: [buildLandmarks(0.2, 0)],
    };
  }
  const smiling = scenario === 'smiling';
  return {
    faceBlendshapes: blendshapes(smiling ? 0.3 : 0),
    faceLandmarks: [buildLandmarks(0.42, smiling ? 0.025 : 0)],
  };
};

/**
 * Seed a loaded fake FaceLandmarker. `scriptFn` is called on every
 * `detectForVideo` and returns the result, so a spec can change the scenario
 * over time. Defaults to a steady smiling face.
 */
export const seedFakeMediapipe = (
  win,
  scriptFn = () => makeFaceResult('smiling'),
) => {
  const instance = {
    close: () => {},
    detectForVideo: () => scriptFn(),
  };
  // eslint-disable-next-line no-param-reassign
  win.__smileIdentityMediapipe = {
    instance,
    loaded: true,
    loading: null,
    supportsWasmReftypes: true,
  };
  return instance;
};

/**
 * Seed a not-yet-loaded singleton with a deferred `loading` promise so a spec
 * can control when the wrapper's load resolves/rejects. Returns { resolve,
 * reject }; resolving also marks the singleton loaded with a fake instance.
 */
export const seedDeferredMediapipe = (win) => {
  let resolveFn;
  let rejectFn;
  const loading = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });
  // Mark handled so a rejection used to simulate init failure doesn't surface as
  // an unhandled rejection (which Cypress treats as a test failure). The wrapper
  // still observes the rejection via its own await.
  loading.catch(() => {});
  const state = {
    instance: null,
    loaded: false,
    loading,
    supportsWasmReftypes: true,
  };
  // eslint-disable-next-line no-param-reassign
  win.__smileIdentityMediapipe = state;

  return {
    reject: (err) => rejectFn(err || new Error('mediapipe init failed')),
    resolve: (scriptFn) => {
      const instance = {
        close: () => {},
        detectForVideo: () => (scriptFn || (() => makeFaceResult('smiling')))(),
      };
      state.instance = instance;
      state.loaded = true;
      state.loading = null;
      resolveFn(instance);
    },
  };
};

/**
 * Stub navigator.mediaDevices with a canvas-backed video stream so getUserMedia
 * resolves and the video element gets real dimensions. Mirrors the pattern in
 * smart-selfie-capture-fallback.cy.js.
 */
export const stubFakeCamera = (win) => {
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
          { deviceId: 'fake-device', kind: 'videoinput', label: 'Fake Camera' },
        ]),
      getUserMedia: () => Promise.resolve(fakeStream),
    },
  });
};
