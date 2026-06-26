export const CHROMA_DISABLE_ERROR_THRESHOLD = 3;
export const CV_ERROR_FALLBACK_THRESHOLD = 6;

type RecoveryInput = {
  errorStreak: number;
  chromaUnavailable: boolean;
  chromaDisableThreshold?: number;
  fallbackThreshold?: number;
};

type RecoveryAction = {
  nextErrorStreak: number;
  shouldDisableChroma: boolean;
  shouldClearProcessingError: boolean;
  shouldActivateFallback: boolean;
  shouldSuspendDetection: boolean;
};

export function nextCvErrorRecoveryAction({
  errorStreak,
  chromaUnavailable,
  chromaDisableThreshold = CHROMA_DISABLE_ERROR_THRESHOLD,
  fallbackThreshold = CV_ERROR_FALLBACK_THRESHOLD,
}: RecoveryInput): RecoveryAction {
  const nextErrorStreak = errorStreak + 1;
  const shouldDisableChroma =
    !chromaUnavailable && nextErrorStreak >= chromaDisableThreshold;
  const chromaUnavailableAfterError =
    chromaUnavailable || shouldDisableChroma;

  const shouldActivateFallback =
    chromaUnavailableAfterError && nextErrorStreak >= fallbackThreshold;

  return {
    nextErrorStreak,
    shouldDisableChroma,
    shouldClearProcessingError: shouldDisableChroma,
    shouldActivateFallback,
    shouldSuspendDetection: shouldActivateFallback,
  };
}