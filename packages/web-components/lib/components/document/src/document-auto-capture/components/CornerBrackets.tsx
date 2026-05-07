/**
 * CornerBrackets — Four L-shaped corner markers around an element.
 * Use as an overlay on the image preview area.
 * @param {string} color — bracket color (default white)
 * @param {number} size — length of each bracket arm in px (default 24)
 * @param {number} thickness — bracket stroke width in px (default 3)
 */
export function CornerBrackets({ color = '#fff', size = 24, thickness = 3 }) {
  const style = (
    top: number | undefined,
    right: number | undefined,
    bottom: number | undefined,
    left: number | undefined,
    borderProps: Record<string, string>,
  ) => ({
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    top,
    right,
    bottom,
    left,
    ...borderProps,
    borderColor: color,
    pointerEvents: 'none',
  });

  const t = `${thickness}px solid`;

  return (
    <>
      {/* Top-left */}
      <div
        style={style(0, undefined, undefined, 0, {
          borderTop: t,
          borderLeft: t,
          borderRight: 'none',
          borderBottom: 'none',
          borderTopLeftRadius: `${thickness + 1}px`,
        })}
      />
      {/* Top-right */}
      <div
        style={style(0, 0, undefined, undefined, {
          borderTop: t,
          borderRight: t,
          borderLeft: 'none',
          borderBottom: 'none',
          borderTopRightRadius: `${thickness + 1}px`,
        })}
      />
      {/* Bottom-left */}
      <div
        style={style(undefined, undefined, 0, 0, {
          borderBottom: t,
          borderLeft: t,
          borderRight: 'none',
          borderTop: 'none',
          borderBottomLeftRadius: `${thickness + 1}px`,
        })}
      />
      {/* Bottom-right */}
      <div
        style={style(undefined, 0, 0, undefined, {
          borderBottom: t,
          borderRight: t,
          borderLeft: 'none',
          borderTop: 'none',
          borderBottomRightRadius: `${thickness + 1}px`,
        })}
      />
    </>
  );
}
