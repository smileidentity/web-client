import { useEffect, useRef } from 'preact/hooks';

interface OvalProgressProps {
  progress: number;
  duration?: number;
  themeColor?: string;
}

const OvalProgress = ({
  progress,
  duration = 1000,
  themeColor = '#001096',
}: OvalProgressProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const prevProgress = useRef(progress);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const pathLength = path.getTotalLength();
    path.style.opacity = progress > 0 ? '1' : '0';
    const fromOffset = pathLength * (1 - prevProgress.current);
    const toOffset = pathLength * (1 - progress);

    // If no change, skip
    if (fromOffset === toOffset) return;

    path.style.transition = 'none';
    path.style.strokeDasharray = `${pathLength} ${pathLength}`;
    path.style.strokeDashoffset = `${fromOffset}`;

    // Force style flush
    path.getBoundingClientRect();

    path.style.transition = `stroke-dashoffset ${duration}ms ease-out`;
    path.style.strokeDashoffset = `${toOffset}`;

    prevProgress.current = progress;
  }, [progress, duration]);

  return (
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
        viewBox="0 0 285 380"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        {/* id is referenced by parent */}
        <clipPath id="selfie-clip-path" clipPathUnits="objectBoundingBox">
          <path d="M0.085 0.382 C0.087 0.357 0.092 0.294 0.131 0.236 C0.200 0.133 0.340 0.063 0.501 0.063 C0.730 0.063 0.915 0.205 0.915 0.382 C0.915 0.424 0.899 0.513 0.891 0.549 C0.882 0.588 0.871 0.626 0.857 0.664 C0.792 0.825 0.639 0.937 0.501 0.937 C0.314 0.937 0.182 0.755 0.144 0.666 C0.126 0.624 0.110 0.557 0.107 0.547 C0.092 0.485 0.081 0.439 0.085 0.382 Z" />
        </clipPath>
        <path
          d="M142.693 24C208.319 24 261 77.97 261 145.008C261 160.97 256.319 194.788 254.129 208.356C251.64 223.188 248.348 237.875 244.27 252.35C225.747 313.203 182.328 356 142.693 356C89.414 356 51.871 286.667 41.016 252.948C35.937 236.987 31.356 211.748 30.559 207.857C26.277 184.114 22.991 166.556 24.285 145.008C24.883 135.631 26.277 111.789 37.431 89.742C57.049 50.636 96.983 24 142.693 24Z"
          stroke={themeColor}
          fill="none"
          style={{ strokeWidth: '8' }}
        />
        <path
          ref={pathRef}
          d="M142.693 24C208.319 24 261 77.97 261 145.008C261 160.97 256.319 194.788 254.129 208.356C251.64 223.188 248.348 237.875 244.27 252.35C225.747 313.203 182.328 356 142.693 356C89.414 356 51.871 286.667 41.016 252.948C35.937 236.987 31.356 211.748 30.559 207.857C26.277 184.114 22.991 166.556 24.285 145.008C24.883 135.631 26.277 111.789 37.431 89.742C57.049 50.636 96.983 24 142.693 24Z"
          stroke="#22c55e"
          style={{ strokeWidth: '8' }}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default OvalProgress;
