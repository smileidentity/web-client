import type { FunctionComponent } from 'preact';

interface OvalProgressProps {
  /**
   * Colour of the static oval border. Defaults to the neutral grey used in the
   * Enhanced SmartSelfie design; callers can pass an error tint (e.g. red)
   * when a quality check fails (too dark, too blurry, no face, etc.).
   */
  borderColor?: string;
  /**
   * When set to a side, render a coloured arc over that quarter of the oval
   * to highlight which side of the frame the user needs to fix. Use 'all' to
   * tint the whole border (e.g. too-close, too-far, too-dark).
   */
  errorSide?: 'top' | 'right' | 'bottom' | 'left' | 'all' | null;
  /** Colour of the error arc / full border. Defaults to red. */
  errorColor?: string;
}

// Pre-computed end-points for each side-arc on the 311×418 ellipse
// (cx=155.5, cy=209, rx=153.5, ry=207). Each "side" is the 90° arc centred on
// that compass point, i.e. top spans the upper quadrant between the
// 45°/135° parametric angles. Drawing each side as its own <path> avoids the
// rendering artefacts of the previous stroke-dash trick (round end-caps on a
// thicker stroke produced visible bulges where the highlight met the base
// border).
const SIDE_ARCS: Record<'top' | 'right' | 'bottom' | 'left', string> = {
  // 135° → 45°, sweeping clockwise across the top.
  top: 'M 46.95 62.63 A 153.5 207 0 0 1 264.05 62.63',
  // 45° → -45°, clockwise down the right side.
  right: 'M 264.05 62.63 A 153.5 207 0 0 1 264.05 355.37',
  // -45° → -135°, clockwise across the bottom.
  bottom: 'M 264.05 355.37 A 153.5 207 0 0 1 46.95 355.37',
  // -135° → 135°, clockwise up the left side.
  left: 'M 46.95 355.37 A 153.5 207 0 0 1 46.95 62.63',
};

const OvalProgress: FunctionComponent<OvalProgressProps> = ({
  borderColor = '#C4C4C4',
  errorSide = null,
  errorColor = '#EF4343',
}) => (
  <div
    style={{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }}
  >
    <svg
      viewBox="0 0 311 418"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
    >
      {/*
        Base ellipse border. Authored as a single closed path (rather than
        <ellipse>) so the shape definition lives next to the side-arc paths
        below and any future tweaks stay co-located.
        cx=155.5 cy=209 rx=153.5 ry=207 — i.e. a 311×418 ellipse inset by the
        2px stroke so the border sits inside the wrapper bounds.
      */}
      <path
        d="M 155.5 2 A 153.5 207 0 0 1 309 209 A 153.5 207 0 0 1 155.5 416 A 153.5 207 0 0 1 2 209 A 153.5 207 0 0 1 155.5 2 Z"
        stroke={errorSide === 'all' ? errorColor : borderColor}
        fill="none"
        style={{ strokeWidth: '4', transition: 'stroke 200ms ease-out' }}
      />
      {errorSide && errorSide !== 'all' && (
        <path
          d={SIDE_ARCS[errorSide]}
          stroke={errorColor}
          fill="none"
          strokeLinecap="butt"
          style={{
            strokeWidth: '4',
            transition: 'stroke 200ms ease-out',
          }}
        />
      )}
    </svg>
  </div>
);

export default OvalProgress;
