export const MESSAGES = {
  'multiple-faces': 'Ensure only one face is visible',
  'no-face': 'Position your face in the oval',
  'out-of-bounds': 'Position your face in the oval',
  'too-close': 'Move farther away',
  'too-far': 'Move closer',
  'neutral-expression': 'Neutral expression',
  'smile-required': 'Smile!',
  'open-mouth-smile': 'Big smile - teeth visible',
  initializing: 'Initializing...',
};

export type MessageKey = keyof typeof MESSAGES;
