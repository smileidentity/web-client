import { describe, it, expect } from 'vitest';
import { MESSAGES, type MessageKey } from '../alertMessages';

describe('alertMessages', () => {
  it('does not contain a multiple-faces key', () => {
    expect('multiple-faces' in MESSAGES).toBe(false);
  });

  it('contains all expected alert keys', () => {
    const expectedKeys: MessageKey[] = [
      'no-face',
      'out-of-bounds',
      'too-close',
      'too-far',
      'neutral-expression',
      'smile-required',
      'open-mouth-smile',
      'initializing',
    ];
    expectedKeys.forEach((key) => {
      expect(MESSAGES).toHaveProperty(key);
    });
  });

  it('exports each message as a function', () => {
    Object.values(MESSAGES).forEach((fn) => {
      expect(typeof fn).toBe('function');
    });
  });
});
