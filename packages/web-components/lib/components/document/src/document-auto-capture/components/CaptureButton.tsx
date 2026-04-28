// @ts-nocheck
// TODO(document-auto-capture): port to strict TypeScript.
import { theme } from '../theme';

/**
 * CaptureButton — circular shutter button with progress ring.
 * @param {number} progress — 0-100 auto-capture progress (0 = idle)
 * @param {boolean} disabled
 * @param {function} onClick — manual capture trigger
 * @param {'dark'|'light'} appearance
 */
export function CaptureButton({ progress = 0, disabled = false, onClick, appearance = 'dark' }) {
  const size = 72;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const isActive = progress > 0 && progress < 100;
  const isLight = appearance === 'light';

  const backgroundRingColor = isLight ? 'rgba(255,255,255,0.7)' : theme.colors.border;
  const innerColor = isActive
    ? theme.colors.success
    : (isLight ? '#f8fafc' : theme.colors.text);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        padding: 0,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Capture photo"
    >
      {/* Outer ring */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundRingColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        {isActive && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.colors.success}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        )}
      </svg>
      {/* Inner circle */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: `${size - 16}px`,
        height: `${size - 16}px`,
        borderRadius: '50%',
        backgroundColor: innerColor,
        border: isLight ? '1px solid rgba(15,23,42,0.18)' : 'none',
        transition: 'background-color 0.3s ease, transform 0.15s ease',
        transform: disabled ? 'scale(1)' : 'scale(1)',
      }} />
    </button>
  );
}
