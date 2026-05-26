import { t } from '../../../../../domain/localisation';

export const MESSAGES = {
  'no-face': () => t('selfie.smart.alert.noFace'),
  'out-of-bounds': () => t('selfie.smart.alert.outOfBounds'),
  'too-close': () => t('selfie.smart.alert.tooClose'),
  'too-far': () => t('selfie.smart.alert.tooFar'),
  'neutral-expression': () => t('selfie.smart.alert.neutralExpression'),
  'smile-required': () => t('selfie.smart.alert.smileRequired'),
  'open-mouth-smile': () => t('selfie.smart.alert.openMouthSmile'),
  'too-dark': () => t('selfie.smart.alert.tooDark'),
  'too-blurry': () => t('selfie.smart.alert.tooBlurry'),
  'face-not-centered': () => t('selfie.smart.alert.faceNotCentered'),
  'turn-head-left': () => t('selfie.smart.alert.turnHeadLeft'),
  'turn-head-right': () => t('selfie.smart.alert.turnHeadRight'),
  'tilt-head-up': () => t('selfie.smart.alert.tiltHeadUp'),
  initializing: () => t('selfie.smart.alert.initializing'),
};

export type MessageKey = keyof typeof MESSAGES;
