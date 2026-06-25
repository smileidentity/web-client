export const SYNTHETIC_CONTOUR_CONFIDENCE = 0.55;

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const QUALITY_WEIGHTS = {
  sharpness: 0.35,
  glare: 0.15,
  fill: 0.2,
  aspect: 0.2,
  contour: 0.1,
  chroma: 0.05,
};

export interface FrameQualityParts {
  sharpness?: number | null;
  glare?: number | null;
  fill?: number | null;
  aspect?: number | null;
  contour?: number | null;
  chroma?: number | null;
}

export function frameQualityScore(parts: FrameQualityParts): number {
  const keys = Object.keys(QUALITY_WEIGHTS) as Array<
    keyof typeof QUALITY_WEIGHTS
  >;
  const present = keys.filter((key) => parts[key] != null);
  const den = present.reduce((sum, key) => sum + QUALITY_WEIGHTS[key], 0);
  if (den <= 0) return 0;
  const num = present.reduce(
    (sum, key) => sum + clamp01(parts[key] as number) * QUALITY_WEIGHTS[key],
    0,
  );
  return num / den;
}
