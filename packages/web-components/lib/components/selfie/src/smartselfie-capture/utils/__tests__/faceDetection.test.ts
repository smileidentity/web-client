import { describe, it, expect } from 'vitest';
import {
  calculateFaceSize,
  isFaceInBounds,
  calculateMouthOpening,
} from '../faceDetection';

// Helpers
function makeLandmarks(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
) {
  return [[
    { x: minX, y: minY, z: 0 },
    { x: maxX, y: minY, z: 0 },
    { x: minX, y: maxY, z: 0 },
    { x: maxX, y: maxY, z: 0 },
  ]];
}

function makeFullLandmarks(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  upperLipY = 0.62,
  lowerLipY = 0.64,
) {
  const landmarks = Array(478)
    .fill(null)
    .map(() => ({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: 0 }));
  landmarks[0] = { x: minX, y: minY, z: 0 };
  landmarks[1] = { x: maxX, y: minY, z: 0 };
  landmarks[2] = { x: minX, y: maxY, z: 0 };
  landmarks[3] = { x: maxX, y: maxY, z: 0 };
  landmarks[13] = { x: 0.5, y: upperLipY, z: 0 };
  landmarks[14] = { x: 0.5, y: lowerLipY, z: 0 };
  return [landmarks];
}

describe('calculateFaceSize', () => {
  it('returns 0 for empty landmarks', () => {
    expect(calculateFaceSize([])).toBe(0);
    expect(calculateFaceSize(null)).toBe(0);
    expect(calculateFaceSize([[]])).toBe(0);
  });

  it('calculates size as the max of width and height', () => {
    // width = 0.3, height = 0.4 → size = 0.4
    const landmarks = makeLandmarks(0.35, 0.65, 0.35, 0.75);
    expect(calculateFaceSize(landmarks)).toBeCloseTo(0.4);
  });

  it('returns width when wider than tall', () => {
    // width = 0.6, height = 0.2 → size = 0.6
    const landmarks = makeLandmarks(0.2, 0.8, 0.4, 0.6);
    expect(calculateFaceSize(landmarks)).toBeCloseTo(0.6);
  });

  it('always uses first face (index 0) regardless of how many faces are detected', () => {
    const firstFace = [{ x: 0.3, y: 0.3, z: 0 }, { x: 0.7, y: 0.7, z: 0 }];
    const secondFace = [{ x: 0.1, y: 0.1, z: 0 }, { x: 0.9, y: 0.9, z: 0 }];
    const size = calculateFaceSize([firstFace, secondFace]);
    // Should use firstFace: width = height = 0.4
    expect(size).toBeCloseTo(0.4);
  });
});

describe('isFaceInBounds', () => {
  const portraitAspect = 0.75; // 480/640

  it('returns false for empty landmarks', () => {
    expect(isFaceInBounds([], portraitAspect)).toBe(false);
    expect(isFaceInBounds(null, portraitAspect)).toBe(false);
  });

  it('returns true for a well-centred face in portrait mode', () => {
    // Face centred at (0.5, 0.6), spanning 0.35→0.65 x 0.35→0.82
    const landmarks = makeLandmarks(0.35, 0.65, 0.35, 0.82);
    expect(isFaceInBounds(landmarks, portraitAspect)).toBe(true);
  });

  it('returns false for a face at the edge of the frame', () => {
    const landmarks = makeLandmarks(0.0, 0.3, 0.0, 0.4);
    expect(isFaceInBounds(landmarks, portraitAspect)).toBe(false);
  });

  it('always uses first face (index 0) when multiple faces are present', () => {
    const inBoundsFace = [
      { x: 0.35, y: 0.35, z: 0 },
      { x: 0.65, y: 0.35, z: 0 },
      { x: 0.35, y: 0.82, z: 0 },
      { x: 0.65, y: 0.82, z: 0 },
    ];
    const outOfBoundsFace = [
      { x: 0.0, y: 0.0, z: 0 },
      { x: 0.2, y: 0.0, z: 0 },
      { x: 0.0, y: 0.2, z: 0 },
      { x: 0.2, y: 0.2, z: 0 },
    ];
    expect(isFaceInBounds([inBoundsFace, outOfBoundsFace], portraitAspect)).toBe(true);
    expect(isFaceInBounds([outOfBoundsFace, inBoundsFace], portraitAspect)).toBe(false);
  });

  it('uses wider oval tolerances in landscape mode', () => {
    const landscapeAspect = 16 / 9;
    // Face centred at (0.5, 0.6) — should still be in bounds in landscape
    const landmarks = makeLandmarks(0.35, 0.65, 0.45, 0.75);
    expect(isFaceInBounds(landmarks, landscapeAspect)).toBe(true);
  });
});

describe('calculateMouthOpening', () => {
  it('returns 0 for empty landmarks', () => {
    expect(calculateMouthOpening([])).toBe(0);
    expect(calculateMouthOpening(null)).toBe(0);
    expect(calculateMouthOpening([[]])).toBe(0);
  });

  it('returns 0 when mouth landmark indices are missing', () => {
    // Array with fewer than 15 elements
    const landmarks = [[{ x: 0.5, y: 0.5, z: 0 }]];
    expect(calculateMouthOpening(landmarks)).toBe(0);
  });

  it('returns a positive ratio for an open mouth', () => {
    const landmarks = makeFullLandmarks(0.35, 0.65, 0.35, 0.82, 0.60, 0.68);
    const ratio = calculateMouthOpening(landmarks);
    expect(ratio).toBeGreaterThan(0);
  });

  it('returns a near-zero ratio for a closed mouth', () => {
    const landmarks = makeFullLandmarks(0.35, 0.65, 0.35, 0.82, 0.62, 0.625);
    const ratio = calculateMouthOpening(landmarks);
    expect(ratio).toBeCloseTo(0, 1);
  });

  it('always uses first face (index 0) for mouth calculation', () => {
    const closedMouth = makeFullLandmarks(0.35, 0.65, 0.35, 0.82, 0.62, 0.625)[0];
    const openMouth = makeFullLandmarks(0.35, 0.65, 0.35, 0.82, 0.60, 0.68)[0];

    const result = calculateMouthOpening([closedMouth, openMouth]);
    const singleResult = calculateMouthOpening([closedMouth]);
    expect(result).toBeCloseTo(singleResult, 5);
  });
});
