import { t } from '../../../../../domain/localisation';

export const MESSAGES = {
  'multiple-faces': () => t('selfie.smart.alert.multipleFaces'),
  'no-face': () => t('selfie.smart.alert.noFace'),
  'out-of-bounds': () => t('selfie.smart.alert.outOfBounds'),
  'too-close': () => t('selfie.smart.alert.tooClose'),
  'too-far': () => t('selfie.smart.alert.tooFar'),
  'neutral-expression': () => t('selfie.smart.alert.neutralExpression'),
  'smile-required': () => t('selfie.smart.alert.smileRequired'),
  'open-mouth-smile': () => t('selfie.smart.alert.openMouthSmile'),
  initializing: () => t('selfie.smart.alert.initializing'),
};

export type MessageKey = keyof typeof MESSAGES;
