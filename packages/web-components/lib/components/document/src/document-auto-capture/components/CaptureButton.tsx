import { theme } from '../theme';

/**
 * CaptureButton — circular shutter button with progress ring.
 * @param {number} progress — 0-100 auto-capture progress (0 = idle)
 * @param {boolean} disabled
 * @param {function} onClick — manual capture trigger
 * @param {'dark'|'light'} appearance — kept for API compat; the new icon is
 *   self-styled, so this only affects the background ring color.
 */
export function CaptureButton({
  progress = 0,
  disabled = false,
  onClick,
  appearance = 'dark',
}) {
  const size = 72;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const isActive = progress > 0 && progress < 100;
  const isLight = appearance === 'light';

  const backgroundRingColor = isLight
    ? 'rgba(255,255,255,0.7)'
    : theme.colors.border;

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
      {/* Outer progress ring — sits on top of the SVG's white outer stroke. */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
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
      {/* Shutter face: white circle + navy camera icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <circle
          cx="33.829"
          cy="33.8288"
          r="27.387"
          fill="white"
          stroke="white"
          strokeWidth="0.91441"
        />
        <path
          d="M33.6426 40.9145C32.3841 40.9145 31.1539 40.5413 30.1076 39.8422C29.0612 39.143 28.2457 38.1493 27.7641 36.9867C27.2825 35.824 27.1565 34.5447 27.402 33.3104C27.6476 32.0762 28.2536 30.9424 29.1434 30.0526C30.0333 29.1627 31.167 28.5567 32.4012 28.3112C33.6355 28.0657 34.9148 28.1917 36.0775 28.6733C37.2401 29.1549 38.2339 29.9704 38.933 31.0168C39.6322 32.0631 40.0053 33.2933 40.0053 34.5517C40.0053 36.2393 39.335 37.8577 38.1417 39.0509C36.9485 40.2442 35.3301 40.9145 33.6426 40.9145ZM33.6426 30.0069C32.7437 30.0069 31.865 30.2735 31.1176 30.7728C30.3702 31.2722 29.7877 31.982 29.4437 32.8125C29.0997 33.643 29.0097 34.5568 29.1851 35.4384C29.3604 36.32 29.7933 37.1298 30.4289 37.7654C31.0645 38.401 31.8743 38.8339 32.7559 39.0093C33.6375 39.1846 34.5513 39.0946 35.3818 38.7506C36.2123 38.4066 36.9221 37.8241 37.4215 37.0767C37.9209 36.3293 38.1874 35.4506 38.1874 34.5517C38.1874 33.3464 37.7086 32.1904 36.8562 31.3381C36.0039 30.4857 34.8479 30.0069 33.6426 30.0069Z"
          fill="#151F72"
        />
        <path
          d="M41.8235 31.8248C42.3255 31.8248 42.7325 31.4178 42.7325 30.9158C42.7325 30.4138 42.3255 30.0068 41.8235 30.0068C41.3215 30.0068 40.9146 30.4138 40.9146 30.9158C40.9146 31.4178 41.3215 31.8248 41.8235 31.8248Z"
          fill="#151F72"
        />
        <path
          d="M41.8233 44.5503H25.4618C24.2565 44.5503 23.1005 44.0715 22.2481 43.2192C21.3958 42.3669 20.917 41.2109 20.917 40.0055V30.9158C20.917 29.7105 21.3958 28.5545 22.2481 27.7021C23.1005 26.8498 24.2565 26.371 25.4618 26.371H26.1526C26.322 26.3722 26.4884 26.326 26.633 26.2376C26.7775 26.1493 26.8945 26.0223 26.9707 25.871L27.2798 25.2439C27.6576 24.4899 28.2377 23.8559 28.9553 23.4129C29.6728 22.9698 30.4995 22.7351 31.3429 22.7351H35.9422C36.7856 22.7351 37.6122 22.9698 38.3298 23.4129C39.0474 23.8559 39.6275 24.4899 40.0053 25.2439L40.3144 25.871C40.3906 26.0223 40.5076 26.1493 40.6521 26.2376C40.7967 26.326 40.963 26.3722 41.1324 26.371H41.8233C43.0286 26.371 44.1846 26.8498 45.0369 27.7021C45.8893 28.5545 46.3681 29.7105 46.3681 30.9158V40.0055C46.3681 41.2109 45.8893 42.3669 45.0369 43.2192C44.1846 44.0715 43.0286 44.5503 41.8233 44.5503ZM25.4618 28.1889C24.7386 28.1889 24.045 28.4762 23.5336 28.9876C23.0222 29.499 22.7349 30.1926 22.7349 30.9158V40.0055C22.7349 40.7287 23.0222 41.4223 23.5336 41.9337C24.045 42.4451 24.7386 42.7324 25.4618 42.7324H41.8233C42.5465 42.7324 43.2401 42.4451 43.7515 41.9337C44.2629 41.4223 44.5502 40.7287 44.5502 40.0055V30.9158C44.5502 30.1926 44.2629 29.499 43.7515 28.9876C43.2401 28.4762 42.5465 28.1889 41.8233 28.1889H41.1324C40.6248 28.1899 40.127 28.0492 39.695 27.7826C39.263 27.5161 38.914 27.1342 38.6873 26.68L38.3783 26.0619C38.1522 25.6091 37.8046 25.2282 37.3744 24.9617C36.9442 24.6952 36.4483 24.5537 35.9422 24.553H31.3429C30.8368 24.5537 30.3409 24.6952 29.9107 24.9617C29.4804 25.2282 29.1329 25.6091 28.9068 26.0619L28.5978 26.68C28.371 27.1342 28.022 27.5161 27.5901 27.7826C27.1581 28.0492 26.6603 28.1899 26.1526 28.1889H25.4618Z"
          fill="#151F72"
        />
      </svg>
    </button>
  );
}
