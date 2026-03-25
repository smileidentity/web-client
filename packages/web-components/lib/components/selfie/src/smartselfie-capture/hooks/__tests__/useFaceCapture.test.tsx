import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/preact';
import type { FunctionComponent } from 'preact';
import { useFaceCapture } from '../useFaceCapture';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../utils/mediapipeManager', () => ({
  getMediapipeInstance: vi.fn(),
}));

vi.mock('../../utils/canvas', () => ({
  createCroppedVideoFrame: vi.fn().mockReturnValue(null),
  drawFaceMesh: vi.fn(),
  clearCanvas: vi.fn(),
}));

vi.mock('../../utils/imageCapture', () => ({
  captureImageFromVideo: vi
    .fn()
    .mockReturnValue('data:image/jpeg;base64,mock'),
}));

vi.mock('../../../../../../domain/localisation', () => ({
  t: (key: string) => key,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a set of face landmarks with a bounding box that sits inside the
 * capture oval (portrait frame, centre ~0.5, 0.6) and has a face size of ~0.47
 * which is within the default minFaceSize (0.35) / maxFaceSize (0.5) range.
 */
function makeInBoundsLandmarks() {
  const landmarks = Array(478)
    .fill(null)
    .map(() => ({ x: 0.5, y: 0.6, z: 0 }));
  // Four corners that establish the bounding box
  landmarks[0] = { x: 0.35, y: 0.35, z: 0 };
  landmarks[1] = { x: 0.65, y: 0.35, z: 0 };
  landmarks[2] = { x: 0.35, y: 0.82, z: 0 };
  landmarks[3] = { x: 0.65, y: 0.82, z: 0 };
  // Mouth landmarks (indices 13 = upper lip, 14 = lower lip)
  landmarks[13] = { x: 0.5, y: 0.62, z: 0 };
  landmarks[14] = { x: 0.5, y: 0.64, z: 0 };
  return landmarks;
}

function makeBlendshapes(smileLeft = 0, smileRight = 0) {
  return {
    categories: [
      { categoryName: 'mouthSmileLeft', score: smileLeft },
      { categoryName: 'mouthSmileRight', score: smileRight },
    ],
  };
}

function createMockVideoElement() {
  const video = document.createElement('video');
  Object.defineProperty(video, 'videoWidth', { value: 480, configurable: true });
  Object.defineProperty(video, 'videoHeight', {
    value: 640,
    configurable: true,
  });
  Object.defineProperty(video, 'readyState', { value: 4, configurable: true });
  return video;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useFaceCapture', () => {
  const defaultProps = {
    interval: 350,
    duration: 2800,
    smileThreshold: 0.25,
    mouthOpenThreshold: 0.05,
    minFaceSize: 0.35,
    maxFaceSize: 0.5,
    smileCooldown: 300,
    getFacingMode: () => 'user' as const,
  };

  let videoRef: { current: HTMLVideoElement };
  let canvasRef: { current: HTMLCanvasElement };
  let rafCallback: ((time: number) => void) | null;

  beforeEach(() => {
    videoRef = { current: createMockVideoElement() };
    canvasRef = { current: document.createElement('canvas') };
    rafCallback = null;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        rafCallback = cb as (time: number) => void;
        return 1;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /**
   * Renders the hook inside a minimal component, sets up a mock FaceLandmarker,
   * initialises it, and fires one detection animation frame.
   * Returns a getter for the latest hook result.
   */
  async function setupAndDetect(
    faceLandmarks: ReturnType<typeof makeInBoundsLandmarks>[],
    faceBlendshapes: ReturnType<typeof makeBlendshapes>[],
  ) {
    const { getMediapipeInstance } = await import(
      '../../utils/mediapipeManager'
    );
    vi.mocked(getMediapipeInstance).mockResolvedValue({
      detectForVideo: vi.fn().mockReturnValue({ faceLandmarks, faceBlendshapes }),
    } as any);

    let result!: ReturnType<typeof useFaceCapture>;

    const TestComponent: FunctionComponent = () => {
      result = useFaceCapture({ ...defaultProps, videoRef, canvasRef });
      return null;
    };

    render(<TestComponent />);

    await act(async () => {
      await result.initializeFaceLandmarker();
    });

    act(() => {
      result.startDetectionLoop();
    });

    // Fire one detection frame and let the async function complete
    await act(async () => {
      if (rafCallback) await Promise.resolve(rafCallback(performance.now()));
    });

    return () => result;
  }

  describe('faceDetected', () => {
    it('is true when exactly one face is present', async () => {
      const getResult = await setupAndDetect(
        [makeInBoundsLandmarks()],
        [makeBlendshapes()],
      );
      expect(getResult().faceDetected.value).toBe(true);
    });

    it('is true when multiple faces are present (numFaces >= 1)', async () => {
      const getResult = await setupAndDetect(
        [makeInBoundsLandmarks(), makeInBoundsLandmarks()],
        [makeBlendshapes(), makeBlendshapes()],
      );
      expect(getResult().faceDetected.value).toBe(true);
    });

    it('is false when no faces are present', async () => {
      const getResult = await setupAndDetect([], []);
      expect(getResult().faceDetected.value).toBe(false);
    });
  });

  describe('isReadyToCapture', () => {
    it('is true with a single face in bounds at good proximity', async () => {
      const getResult = await setupAndDetect(
        [makeInBoundsLandmarks()],
        [makeBlendshapes()],
      );
      expect(getResult().isReadyToCapture.value).toBe(true);
    });

    it('is true with multiple faces in frame — multi-face no longer blocks capture', async () => {
      const getResult = await setupAndDetect(
        [makeInBoundsLandmarks(), makeInBoundsLandmarks()],
        [makeBlendshapes(), makeBlendshapes()],
      );
      expect(getResult().isReadyToCapture.value).toBe(true);
    });

    it('is false when no faces are present', async () => {
      const getResult = await setupAndDetect([], []);
      expect(getResult().isReadyToCapture.value).toBe(false);
    });
  });
});
