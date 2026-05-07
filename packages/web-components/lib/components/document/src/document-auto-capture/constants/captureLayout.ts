export const FULLSCREEN_CAPTURE_LAYOUT = {
  reservedVerticalPx: 90,
  maxGuideWidthPx: 600,
  widthRatio: 1.0,
  minHeightRatio: 0.55,
  minGuideWidthPx: 220,
  defaultHorizontalInsetPx: 4,
  sideControlsInsetPx: 132,
};

export interface FullscreenGuideSizeParams {
  aspectRatio?: number;
  displayHeight?: number;
  displayWidth?: number;
  horizontalInsetPx?: number;
  reservedVerticalPx?: number;
}

export function getFullscreenGuideSize({
  aspectRatio,
  displayHeight,
  displayWidth,
  horizontalInsetPx = FULLSCREEN_CAPTURE_LAYOUT.defaultHorizontalInsetPx,
  reservedVerticalPx = FULLSCREEN_CAPTURE_LAYOUT.reservedVerticalPx,
}: FullscreenGuideSizeParams) {
  const width = Math.max(1, displayWidth || 0);
  const height = Math.max(1, displayHeight || 0);
  const ratio = Math.max(0.2, aspectRatio || 1.585);

  const availableGuideHeight = Math.max(
    height - reservedVerticalPx,
    height * FULLSCREEN_CAPTURE_LAYOUT.minHeightRatio
  );

  const maxWidthFromHeight = availableGuideHeight * ratio;
  const maxWidthFromInsets = Math.max(
    FULLSCREEN_CAPTURE_LAYOUT.minGuideWidthPx,
    width - (horizontalInsetPx * 2)
  );

  const guideWidth = Math.max(
    FULLSCREEN_CAPTURE_LAYOUT.minGuideWidthPx,
    Math.min(
      width * FULLSCREEN_CAPTURE_LAYOUT.widthRatio,
      FULLSCREEN_CAPTURE_LAYOUT.maxGuideWidthPx,
      maxWidthFromHeight,
      maxWidthFromInsets
    )
  );

  const guideHeight = guideWidth / ratio;

  return {
    guideWidth,
    guideHeight,
    reservedVerticalPx,
  };
}
