export const ASPECT_RATIOS = {
  'id-card': 1.585,
  passport: 1.42,
  greenbook: 1.42,
};

export type AspectKey = keyof typeof ASPECT_RATIOS;
export type DiscoveryVote = 'id-card' | 'passport';

export const isAspectKey = (v: unknown): v is AspectKey =>
  typeof v === 'string' &&
  Object.prototype.hasOwnProperty.call(ASPECT_RATIOS, v);

const ASPECT_RATIO_MIDPOINT =
  (ASPECT_RATIOS['id-card'] + ASPECT_RATIOS.passport) / 2;

export const classifyDiscoveryAspect = (
  normalizedAspect: number,
): DiscoveryVote =>
  normalizedAspect >= ASPECT_RATIO_MIDPOINT ? 'id-card' : 'passport';