import type { FunctionComponent } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import register from 'preact-custom-element';
import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import { JPEG_QUALITY } from '../../../../domain/constants/src/Constants';
import { getBoolProp } from '../../../../utils/props';
import { getDirection } from '../../../../domain/localisation';

// ── Types ────────────────────────────────────────────────────────────────────

type DocumentVariant = 'id-card' | 'passport' | 'greenbook';
type CaptureState = 'idle' | 'aligning' | 'capturing' | 'error';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDocumentVariant(documentType: string): DocumentVariant {
  const n = (documentType || '').trim().toLowerCase().replace(/_/g, ' ');
  if (n.includes('green') && n.includes('book')) return 'greenbook';
  if (n.includes('passport')) return 'passport';
  return 'id-card';
}

/** Checks if a pixel sample contains enough distinct colours to indicate a
 *  real document is in the frame (as opposed to a blank background). */
function hasSufficientDetail(
  data: Uint8ClampedArray,
  threshold = 32,
): boolean {
  const colors = new Set<number>();
  // Sample roughly 2 500 pixels spread across the buffer
  const step = Math.max(4, Math.floor(data.length / 2500)) * 4;
  for (let i = 0; i < data.length; i += step) {
    // Quantise to 5-bit channels to reduce noise sensitivity
    const r = data[i] >> 3;
    const g = data[i + 1] >> 3;
    const b = data[i + 2] >> 3;
    colors.add((r << 10) | (g << 5) | b);
    if (colors.size > threshold) return true;
  }
  return false;
}

// ── Inline icons ─────────────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="white"
        stroke-width="1.8"
      />
      <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
      <path
        d="M3 15l5-5 4 4 3-3 6 5"
        stroke="white"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

// ── Document guide overlay SVG ────────────────────────────────────────────────
// Uses SVG even-odd fill to punch a transparent "hole" in the dark overlay,
// giving the document guide cutout effect.

function CaptureGuideOverlay({
  variant,
  isCapturing,
}: {
  variant: DocumentVariant;
  isCapturing: boolean;
}) {
  const strokeColor = isCapturing ? '#2CC05C' : 'rgba(255,255,255,0.75)';
  const sw = isCapturing ? 2 : 1.5;
  const filterId = `cap-glow-${variant}`;

  if (variant === 'greenbook') {
    // Portrait frame — drawn in a 100 × 178 coordinate space (≈ 9:16)
    const gx = 10,
      gy = 8,
      gw = 80,
      gh = 70;
    return (
      <svg
        class="doc-cap-guide-svg"
        viewBox="0 0 100 178"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {isCapturing && (
          <defs>
            <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        {/* Dark overlay with guide cutout */}
        <path
          fill-rule="evenodd"
          fill="rgba(0,0,0,0.55)"
          d={`M0,0 H100 V178 H0 Z M${gx},${gy} H${gx + gw} V${gy + gh} H${gx} Z`}
        />
        {/* Guide border */}
        <rect
          x={gx}
          y={gy}
          width={gw}
          height={gh}
          rx="3"
          fill="none"
          stroke={strokeColor}
          stroke-width={sw}
          filter={isCapturing ? `url(#${filterId})` : undefined}
        />
        {/* Document internals — photo area */}
        <rect
          x={gx + 4}
          y={gy + 4}
          width="16"
          height="20"
          rx="1.5"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.2)"
          stroke-width="0.7"
        />
        {/* Text lines */}
        <rect
          x={gx + 24}
          y={gy + 5}
          width="35"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.28)"
        />
        <rect
          x={gx + 24}
          y={gy + 11}
          width="25"
          height="2"
          rx="1"
          fill="rgba(255,255,255,0.18)"
        />
        <rect
          x={gx + 24}
          y={gy + 15}
          width="28"
          height="2"
          rx="1"
          fill="rgba(255,255,255,0.18)"
        />
        {/* MRZ lines */}
        <rect
          x={gx + 4}
          y={gy + gh - 10}
          width={gw - 8}
          height="2"
          rx="1"
          fill="rgba(255,255,255,0.13)"
        />
        <rect
          x={gx + 4}
          y={gy + gh - 6}
          width={gw - 8}
          height="2"
          rx="1"
          fill="rgba(255,255,255,0.13)"
        />
      </svg>
    );
  }

  // Landscape overlay — drawn in a 100 × 56.25 coordinate space (16:9)
  const isPassport = variant === 'passport';
  const gx = 8;
  const gy = isPassport ? 4 : 6;
  const gw = 84;
  const gh = isPassport ? 49 : 44;

  return (
    <svg
      class="doc-cap-guide-svg"
      viewBox="0 0 100 56.25"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {isCapturing && (
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Dark overlay with guide cutout */}
      <path
        fill-rule="evenodd"
        fill="rgba(0,0,0,0.55)"
        d={`M0,0 H100 V56.25 H0 Z M${gx},${gy} H${gx + gw} V${gy + gh} H${gx} Z`}
      />
      {/* Guide border */}
      <rect
        x={gx}
        y={gy}
        width={gw}
        height={gh}
        rx="2.5"
        fill="none"
        stroke={strokeColor}
        stroke-width={sw}
        filter={isCapturing ? `url(#${filterId})` : undefined}
      />

      {/* ID card internals */}
      {variant === 'id-card' && (
        <>
          {/* Photo placeholder */}
          <rect
            x={gx + 2.5}
            y={gy + 3.5}
            width="11"
            height="15"
            rx="1"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.22)"
            stroke-width="0.5"
          />
          {/* Name/title line */}
          <rect
            x={gx + 16}
            y={gy + 5}
            width="28"
            height="2.5"
            rx="1.25"
            fill="rgba(255,255,255,0.28)"
          />
          {/* Detail lines */}
          <rect
            x={gx + 16}
            y={gy + 10}
            width="20"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.18)"
          />
          <rect
            x={gx + 16}
            y={gy + 14}
            width="24"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.18)"
          />
          {/* MRZ lines at bottom */}
          <rect
            x={gx + 2.5}
            y={gy + gh - 8}
            width={gw - 5}
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.13)"
          />
          <rect
            x={gx + 2.5}
            y={gy + gh - 4.5}
            width={gw - 5}
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.13)"
          />
        </>
      )}

      {/* Passport internals */}
      {variant === 'passport' && (
        <>
          {/* Photo placeholder */}
          <rect
            x={gx + 2.5}
            y={gy + 3}
            width="12"
            height="17"
            rx="1"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.22)"
            stroke-width="0.5"
          />
          {/* Name/title line */}
          <rect
            x={gx + 17}
            y={gy + 3.5}
            width="22"
            height="2.5"
            rx="1.25"
            fill="rgba(255,255,255,0.28)"
          />
          {/* Detail lines */}
          <rect
            x={gx + 17}
            y={gy + 8.5}
            width="30"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.18)"
          />
          <rect
            x={gx + 17}
            y={gy + 12.5}
            width="24"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.18)"
          />
          {/* MRZ lines x2 at bottom */}
          <rect
            x={gx + 2.5}
            y={gy + gh - 9}
            width={gw - 5}
            height="2.5"
            rx="1.25"
            fill="rgba(255,255,255,0.13)"
          />
          <rect
            x={gx + 2.5}
            y={gy + gh - 5}
            width={gw - 5}
            height="2.5"
            rx="1.25"
            fill="rgba(255,255,255,0.13)"
          />
        </>
      )}
    </svg>
  );
}

// ── SmileID attribution (inline SVG, same as instructions screen) ─────────────

function PoweredBySmileIdLogo() {
  return (
    <svg
      viewBox="0 0 90 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Powered by SmileID"
      style={{ width: '90px', height: '9px' }}
    >
      <path
        d="M0.544 7V1.4H2.616C3.064 1.4 3.43467 1.47467 3.728 1.624C4.02133 1.77333 4.24 1.97867 4.384 2.24C4.528 2.50133 4.6 2.79467 4.6 3.12C4.6 3.42933 4.53067 3.71467 4.392 3.976C4.25333 4.232 4.03733 4.44 3.744 4.6C3.45067 4.75467 3.07467 4.832 2.616 4.832H1.568V7H0.544ZM1.568 4H2.552C2.90933 4 3.16533 3.92267 3.32 3.768C3.48 3.608 3.56 3.392 3.56 3.12C3.56 2.84267 3.48 2.62667 3.32 2.472C3.16533 2.312 2.90933 2.232 2.552 2.232H1.568V4ZM7.08025 7.096C6.69625 7.096 6.34958 7.008 6.04025 6.832C5.73625 6.656 5.49358 6.41333 5.31225 6.104C5.13625 5.78933 5.04825 5.42667 5.04825 5.016C5.04825 4.60533 5.13892 4.24533 5.32025 3.936C5.50158 3.62133 5.74425 3.376 6.04825 3.2C6.35758 3.024 6.70425 2.936 7.08825 2.936C7.46692 2.936 7.80825 3.024 8.11225 3.2C8.42158 3.376 8.66425 3.62133 8.84025 3.936C9.02158 4.24533 9.11225 4.60533 9.11225 5.016C9.11225 5.42667 9.02158 5.78933 8.84025 6.104C8.66425 6.41333 8.42158 6.656 8.11225 6.832C7.80292 7.008 7.45892 7.096 7.08025 7.096ZM7.08025 6.208C7.34692 6.208 7.57892 6.10933 7.77625 5.912C7.97358 5.70933 8.07225 5.41067 8.07225 5.016C8.07225 4.62133 7.97358 4.32533 7.77625 4.128C7.57892 3.92533 7.34958 3.824 7.08825 3.824C6.81625 3.824 6.58158 3.92533 6.38425 4.128C6.19225 4.32533 6.09625 4.62133 6.09625 5.016C6.09625 5.41067 6.19225 5.70933 6.38425 5.912C6.58158 6.10933 6.81358 6.208 7.08025 6.208ZM10.6632 7L9.50319 3.032H10.5192L11.2072 5.888L12.0072 3.032H13.1432L13.9432 5.888L14.6392 3.032H15.6552L14.4872 7H13.4232L12.5752 4.032L11.7272 7H10.6632ZM18.0886 7.096C17.6886 7.096 17.334 7.01067 17.0246 6.84C16.7153 6.66933 16.4726 6.42933 16.2966 6.12C16.1206 5.81067 16.0326 5.45333 16.0326 5.048C16.0326 4.63733 16.118 4.272 16.2886 3.952C16.4646 3.632 16.7046 3.384 17.0086 3.208C17.318 3.02667 17.6806 2.936 18.0966 2.936C18.486 2.936 18.83 3.02133 19.1286 3.192C19.4273 3.36267 19.6593 3.59733 19.8246 3.896C19.9953 4.18933 20.0806 4.51733 20.0806 4.88C20.0806 4.93867 20.078 5 20.0726 5.064C20.0726 5.128 20.07 5.19467 20.0646 5.264H17.0486C17.07 5.57333 17.1766 5.816 17.3686 5.992C17.566 6.168 17.8033 6.256 18.0806 6.256C18.2886 6.256 18.462 6.21067 18.6006 6.12C18.7446 6.024 18.8513 5.90133 18.9206 5.752H19.9606C19.886 6.00267 19.7606 6.232 19.5846 6.44C19.414 6.64267 19.2006 6.80267 18.9446 6.92C18.694 7.03733 18.4086 7.096 18.0886 7.096ZM18.0966 3.768C17.846 3.768 17.6246 3.84 17.4326 3.984C17.2406 4.12267 17.118 4.336 17.0646 4.624H19.0406C19.0246 4.36267 18.9286 4.15467 18.7526 4C18.5766 3.84533 18.358 3.768 18.0966 3.768ZM20.9419 7V3.032H21.8539L21.9499 3.776C22.0939 3.52 22.2885 3.31733 22.5339 3.168C22.7845 3.01333 23.0779 2.936 23.4139 2.936V4.016H23.1259C22.9019 4.016 22.7019 4.05067 22.5259 4.12C22.3499 4.18933 22.2112 4.30933 22.1099 4.48C22.0139 4.65067 21.9659 4.888 21.9659 5.192V7H20.9419ZM25.9714 7.096C25.5714 7.096 25.2168 7.01067 24.9074 6.84C24.5981 6.66933 24.3554 6.42933 24.1794 6.12C24.0034 5.81067 23.9154 5.45333 23.9154 5.048C23.9154 4.63733 24.0008 4.272 24.1714 3.952C24.3474 3.632 24.5874 3.384 24.8914 3.208C25.2008 3.02667 25.5634 2.936 25.9794 2.936C26.3688 2.936 26.7128 3.02133 27.0114 3.192C27.3101 3.36267 27.5421 3.59733 27.7074 3.896C27.8781 4.18933 27.9634 4.51733 27.9634 4.88C27.9634 4.93867 27.9608 5 27.9554 5.064C27.9554 5.128 27.9528 5.19467 27.9474 5.264H24.9314C24.9528 5.57333 25.0594 5.816 25.2514 5.992C25.4488 6.168 25.6861 6.256 25.9634 6.256C26.1714 6.256 26.3448 6.21067 26.4834 6.12C26.6274 6.024 26.7341 5.90133 26.8034 5.752H27.8434C27.7688 6.00267 27.6434 6.232 27.4674 6.44C27.2968 6.64267 27.0834 6.80267 26.8274 6.92C26.5768 7.03733 26.2914 7.096 25.9714 7.096ZM25.9794 3.768C25.7288 3.768 25.5074 3.84 25.3154 3.984C25.1234 4.12267 25.0008 4.336 24.9474 4.624H26.9234C26.9074 4.36267 26.8114 4.15467 26.6354 4C26.4594 3.84533 26.2408 3.768 25.9794 3.768ZM30.6487 7.096C30.2754 7.096 29.942 7.00533 29.6487 6.824C29.3554 6.64267 29.1234 6.39467 28.9527 6.08C28.782 5.76533 28.6967 5.408 28.6967 5.008C28.6967 4.608 28.782 4.25333 28.9527 3.944C29.1234 3.62933 29.3554 3.384 29.6487 3.208C29.942 3.02667 30.2754 2.936 30.6487 2.936C30.9474 2.936 31.2087 2.992 31.4327 3.104C31.6567 3.216 31.838 3.37333 31.9767 3.576V1.24H33.0007V7H32.0887L31.9767 6.432C31.8487 6.608 31.678 6.76267 31.4647 6.896C31.2567 7.02933 30.9847 7.096 30.6487 7.096ZM30.8647 6.2C31.1954 6.2 31.4647 6.09067 31.6727 5.872C31.886 5.648 31.9927 5.36267 31.9927 5.016C31.9927 4.66933 31.886 4.38667 31.6727 4.168C31.4647 3.944 31.1954 3.832 30.8647 3.832C30.5394 3.832 30.27 3.94133 30.0567 4.16C29.8434 4.37867 29.7367 4.66133 29.7367 5.008C29.7367 5.35467 29.8434 5.64 30.0567 5.864C30.27 6.088 30.5394 6.2 30.8647 6.2ZM38.3017 7.096C38.003 7.096 37.7417 7.04 37.5177 6.928C37.2937 6.816 37.1124 6.65867 36.9737 6.456L36.8617 7H35.9497V1.24H36.9737V3.6C37.1017 3.424 37.2697 3.26933 37.4777 3.136C37.691 3.00267 37.9657 2.936 38.3017 2.936C38.675 2.936 39.0084 3.02667 39.3017 3.208C39.595 3.38933 39.827 3.63733 39.9977 3.952C40.1684 4.26667 40.2537 4.624 40.2537 5.024C40.2537 5.424 40.1684 5.78133 39.9977 6.096C39.827 6.40533 39.595 6.65067 39.3017 6.832C39.0084 7.008 38.675 7.096 38.3017 7.096ZM38.0857 6.2C38.411 6.2 38.6804 6.09067 38.8937 5.872C39.107 5.65333 39.2137 5.37067 39.2137 5.024C39.2137 4.67733 39.107 4.392 38.8937 4.168C38.6804 3.944 38.411 3.832 38.0857 3.832C37.755 3.832 37.483 3.944 37.2697 4.168C37.0617 4.38667 36.9577 4.66933 36.9577 5.016C36.9577 5.36267 37.0617 5.648 37.2697 5.872C37.483 6.09067 37.755 6.2 38.0857 6.2ZM41.3051 8.76L42.2251 6.736H41.9851L40.4411 3.032H41.5531L42.6651 5.824L43.8251 3.032H44.9131L42.3931 8.76H41.3051Z"
        fill="rgba(255,255,255,0.75)"
      />
      <g clip-path="url(#clip0_dc_1)">
        <path
          d="M58.5141 6.02913C58.5644 6.37005 58.8092 6.77098 59.4839 6.77098C60.0578 6.77098 60.336 6.56623 60.336 6.23338C60.336 5.90053 60.142 5.75579 59.788 5.71292L58.5988 5.58482C57.5612 5.47387 56.9539 4.86819 56.9539 3.87872C56.9539 2.77779 57.7801 2.04401 59.4335 2.04401C61.2135 2.04401 61.9221 2.88874 61.9894 3.88679H60.3195C60.2687 3.51157 59.965 3.27253 59.442 3.27253C58.9783 3.27253 58.6577 3.44349 58.6577 3.75062C58.6577 3.99774 58.8097 4.18534 59.2141 4.21964L60.1844 4.30486C61.4918 4.41582 62.0397 5.04672 62.0397 6.0962C62.0397 7.21377 61.3477 7.999 59.4504 7.999C57.5532 7.999 56.9534 7.02667 56.8691 6.02862H58.5141V6.02913Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M70.1965 5.28736V7.85484H68.5431V5.56019C68.5431 5.09925 68.3746 4.80069 67.9194 4.80069C67.4212 4.80069 67.2108 5.11639 67.2108 5.78159V7.85484H65.5824V5.56019C65.5824 5.09925 65.4133 4.80069 64.9581 4.80069C64.4605 4.80069 64.2496 5.11639 64.2496 5.78159V7.85484H62.5967V3.58932H64.2496V4.24644C64.5113 3.75171 64.9581 3.45265 65.6586 3.45265C66.3592 3.45265 66.8309 3.7855 67.0587 4.35689C67.3285 3.80265 67.7842 3.45265 68.5351 3.45265C69.6735 3.45265 70.197 4.16928 70.197 5.28736H70.1965Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M70.9785 3.8535V2.18118H72.6319V3.8535H70.9785ZM70.9785 7.85476V4.2504H72.6319V7.85476H70.9785Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M73.4121 7.85475V2.18167H75.065V7.85525H73.4121V7.85475Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M78.7264 6.53958H80.3579C80.1968 7.3243 79.5696 7.99151 78.0179 7.99151C76.2294 7.99151 75.6221 6.8568 75.6221 5.71351C75.6221 4.48499 76.3391 3.45265 78.0179 3.45265C79.8653 3.45265 80.3629 4.59594 80.3629 5.77302C80.3629 5.91776 80.3539 6.05443 80.3374 6.13966H77.2336C77.3178 6.68583 77.5881 6.89059 78.0518 6.89059C78.3729 6.89059 78.6083 6.73526 78.7269 6.53908L78.7264 6.53958ZM77.2416 5.21877H78.8022C78.7519 4.77497 78.5404 4.52785 78.0428 4.52785C77.5791 4.52785 77.3348 4.70689 77.2416 5.21877Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M83.5907 7.85476H81.8994L81.9034 2.18118H83.5902L83.5912 7.85476H83.5907Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M89.9995 5.00535C89.9995 6.46434 89.1474 7.85475 87.3345 7.85475H84.3652V2.18167H87.3345C89.1479 2.18167 89.9995 3.54686 89.9995 5.00535ZM86.9376 6.5067C87.8401 6.5067 88.2364 5.99482 88.2364 5.00535C88.2364 4.01588 87.8226 3.52971 86.9376 3.52971H86.06V6.5067H86.9376Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M52.2123 3.88737H48V7.86846H52.2123V3.88737Z"
          fill="rgba(255,255,255,0.75)"
        />
        <path
          d="M53.2359 0C53.2165 0 53.1975 0.00201727 53.1786 0.00252159C53.1591 0.00252159 53.1402 0 53.1207 0C52.0457 0 51.0869 0.708567 51.0869 2.27044V3.8888H55.2882V2.27044C55.2882 0.708567 54.3174 0 53.2359 0Z"
          fill="#FF9B00"
        />
      </g>
      <defs>
        <clipPath id="clip0_dc_1">
          <rect
            width="42"
            height="8"
            fill="white"
            transform="translate(48)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  dir?: string;
  hidden?: string | boolean;
  'document-type'?: string;
  'document-name'?: string;
  'side-of-id'?: string;
  title?: string;
  'hide-attribution'?: string | boolean;
  'hide-back-to-host'?: string | boolean;
  'show-navigation'?: string | boolean;
  'theme-color'?: string;
  'document-capture-modes'?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const DocumentCapture: FunctionComponent<Props> = ({
  dir,
  hidden: hiddenProp = false,
  'document-type': documentType = '',
  'document-name': _documentName = '',
  'side-of-id': sideOfId = 'front',
  title = '',
  'hide-attribution': hideAttributionProp = false,
  'hide-back-to-host': hideBackToHostProp = false,
  'show-navigation': _showNavigation = false,
  'theme-color': _themeColor = '#001096',
  'document-capture-modes': documentCaptureModes = 'camera',
}) => {
  const hideAttribution = getBoolProp(hideAttributionProp);
  const hideBack = getBoolProp(hideBackToHostProp);
  // `hidden=""` (empty string) means the attribute is present → hidden
  const isElementHidden =
    hiddenProp === '' || hiddenProp === 'true' || hiddenProp === true;
  const supportBothModes =
    (documentCaptureModes || '').includes('camera') &&
    (documentCaptureModes || '').includes('upload');

  const variant = getDocumentVariant(documentType);
  const isPortraitCapture = variant === 'greenbook';

  const textDirection =
    dir === 'rtl' || dir === 'ltr' ? dir : getDirection() === 'rtl' ? 'rtl' : 'ltr';

  // ── Refs ───────────────────────────────────────────────────────────────────
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const qualityPassRef = useRef(0);
  const hasCapturedRef = useRef(false);

  // ── State ──────────────────────────────────────────────────────────────────
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ── Event dispatch ─────────────────────────────────────────────────────────
  const dispatchOnHost = useCallback(
    (eventName: string, detail?: Record<string, unknown>) => {
      const rootNode = rootRef.current?.getRootNode();
      const shadowHost = (rootNode as ShadowRoot)?.host as
        | HTMLElement
        | undefined;
      const hostElement =
        rootRef.current?.closest('document-capture') || shadowHost;
      hostElement?.dispatchEvent(
        new CustomEvent(eventName, detail ? { detail } : undefined),
      );
    },
    [],
  );

  // ── Frame drawing ──────────────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(drawFrame);
      return;
    }
    if (video.paused || video.ended || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    // Resize canvas to match its CSS display size (with DPR for sharpness)
    const dpr = window.devicePixelRatio || 1;
    const dw = canvas.offsetWidth;
    const dh = canvas.offsetHeight;
    if (dw && dh) {
      if (canvas.width !== dw * dpr || canvas.height !== dh * dpr) {
        canvas.width = dw * dpr;
        canvas.height = dh * dpr;
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const isPortraitVideo = vw < vh;

    if (isPortraitVideo && !isPortraitCapture) {
      // Portrait camera → landscape canvas: crop the vertical centre
      const cropH = vw * (canvas.height / canvas.width);
      const sy = (vh - cropH) / 2;
      ctx.drawImage(video, 0, sy, vw, cropH, 0, 0, canvas.width, canvas.height);
    } else if (!isPortraitVideo && isPortraitCapture) {
      // Landscape camera → portrait canvas: crop the horizontal centre
      const cropW = vh * (canvas.width / canvas.height);
      const sx = (vw - cropW) / 2;
      ctx.drawImage(video, sx, 0, cropW, vh, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, vw, vh, 0, 0, canvas.width, canvas.height);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [isPortraitCapture]);

  // ── Capture logic ──────────────────────────────────────────────────────────
  const performCapture = useCallback(
    (isManual = false) => {
      if (hasCapturedRef.current) return;
      hasCapturedRef.current = true;

      const video = videoRef.current;
      if (!video || !video.videoWidth) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const isPortraitVideo = vw < vh;

      const captureCanvas = document.createElement('canvas');
      const ctx = captureCanvas.getContext('2d');
      if (!ctx) return;

      if (isPortraitCapture) {
        // Portrait document (greenbook): capture as portrait
        if (isPortraitVideo) {
          captureCanvas.width = vw;
          captureCanvas.height = vh;
          ctx.drawImage(video, 0, 0, vw, vh, 0, 0, vw, vh);
        } else {
          // Landscape camera for portrait doc: crop centre vertically
          const cropW = Math.round(vh * (9 / 16));
          const sx = (vw - cropW) / 2;
          captureCanvas.width = cropW;
          captureCanvas.height = vh;
          ctx.drawImage(video, sx, 0, cropW, vh, 0, 0, cropW, vh);
        }
      } else {
        // Landscape document (id-card, passport): output at 2240 wide
        captureCanvas.width = 2240;
        if (isPortraitVideo) {
          // Crop portrait camera to landscape
          const cropH = vw * (9 / 16);
          const sy = (vh - cropH) / 2;
          captureCanvas.height = Math.round(
            (2240 / vw) * cropH,
          );
          ctx.drawImage(
            video,
            0,
            sy,
            vw,
            cropH,
            0,
            0,
            captureCanvas.width,
            captureCanvas.height,
          );
        } else {
          captureCanvas.height = Math.round(2240 / (vw / vh));
          ctx.drawImage(
            video,
            0,
            0,
            vw,
            vh,
            0,
            0,
            captureCanvas.width,
            captureCanvas.height,
          );
        }
      }

      const image = captureCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = Math.max(1, Math.round(captureCanvas.width / 4));
      previewCanvas.height = Math.max(1, Math.round(captureCanvas.height / 4));
      previewCanvas
        .getContext('2d')
        ?.drawImage(
          captureCanvas,
          0,
          0,
          previewCanvas.width,
          previewCanvas.height,
        );
      const previewImage = previewCanvas.toDataURL('image/jpeg', 0.75);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      SmartCamera.stopMedia();

      dispatchOnHost('document-capture.publish', {
        image,
        previewImage,
        originalWidth: captureCanvas.width,
        originalHeight: captureCanvas.height,
      });
    },
    [isPortraitCapture, dispatchOnHost],
  );

  // ── Start camera when element becomes visible ──────────────────────────────
  useEffect(() => {
    if (isElementHidden) {
      // Element is hidden — stop any running camera and reset for next show
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      SmartCamera.stopMedia();
      hasCapturedRef.current = false;
      qualityPassRef.current = 0;
      setCaptureState('idle');
      setCameraError(null);
      return;
    }

    let mounted = true;

    async function startCamera() {
      try {
        if (SmartCamera.stream) SmartCamera.stopMedia();

        await SmartCamera.getMedia({
          audio: false,
          video: {
            ...SmartCamera.environmentOptions,
            aspectRatio: { ideal: isPortraitCapture ? 9 / 16 : 16 / 9 },
          },
        });

        if (!mounted) return;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = SmartCamera.stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        if (mounted) {
          setCaptureState('aligning');
          rafRef.current = requestAnimationFrame(drawFrame);
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg =
            SmartCamera.handleCameraError(err) ||
            'Camera unavailable. Please check permissions.';
          setCameraError(msg);
          setCaptureState('error');
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      SmartCamera.stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isElementHidden]);

  // ── Auto-capture quality check (runs while in 'aligning' state) ───────────
  useEffect(() => {
    if (captureState !== 'aligning') {
      qualityPassRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.width) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sw = Math.min(canvas.width, 320);
      const sh = Math.min(canvas.height, 240);
      const imageData = ctx.getImageData(0, 0, sw, sh);

      if (hasSufficientDetail(imageData.data)) {
        qualityPassRef.current += 1;
        if (qualityPassRef.current >= 2) {
          setCaptureState('capturing');
        }
      } else {
        qualityPassRef.current = 0;
      }
    }, 800);

    return () => clearInterval(interval);
  }, [captureState]);

  // ── Auto-capture timer (fires 1.5 s after entering 'capturing' state) ─────
  useEffect(() => {
    if (captureState !== 'capturing') return;

    const timer = setTimeout(() => {
      performCapture(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [captureState, performCapture]);

  // ── Button handlers ────────────────────────────────────────────────────────
  function handleShutter() {
    if (hasCapturedRef.current) return;
    setCaptureState('capturing');
    // Short visual feedback before capture
    setTimeout(() => performCapture(true), 250);
  }

  function handleGallery() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d')?.drawImage(img, 0, 0);
        const image = c.toDataURL('image/jpeg', JPEG_QUALITY);

        const pc = document.createElement('canvas');
        pc.width = Math.max(1, Math.round(img.width / 4));
        pc.height = Math.max(1, Math.round(img.height / 4));
        pc.getContext('2d')?.drawImage(img, 0, 0, pc.width, pc.height);
        const previewImage = pc.toDataURL('image/jpeg', 0.75);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        SmartCamera.stopMedia();

        dispatchOnHost('document-capture.publish', {
          image,
          previewImage,
          originalWidth: img.width,
          originalHeight: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleBack() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    SmartCamera.stopMedia();
    dispatchOnHost('document-capture.cancelled');
  }

  function handleClose() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    SmartCamera.stopMedia();
    dispatchOnHost('document-capture.close');
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const isCapturing = captureState === 'capturing';
  const isIdle = captureState === 'idle';
  const displayTitle =
    title ||
    (sideOfId?.toLowerCase() === 'back' ? 'Back of document' : 'Front of document');

  // ── Shared capture UI (canvas + overlay + controls) ───────────────────────
  // Rendered inside either `.doc-cap-landscape-inner` or `.doc-cap-portrait-inner`
  // The parent div's CSS drives the orientation transform.

  return (
    <div ref={rootRef} class="doc-cap-root" dir={textDirection}>
      {/* Hidden video element — source for canvas frames */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        class="doc-cap-video"
        playsinline
        muted
        autoplay
        aria-hidden="true"
      />

      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        class="doc-cap-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Inner wrapper — landscape rotated for id-card/passport, portrait for greenbook */}
      <div class={isPortraitCapture ? 'doc-cap-inner doc-cap-inner--portrait' : 'doc-cap-inner doc-cap-inner--landscape'}>

        {/* ── Camera canvas ──────────────────────────────────── */}
        <canvas
          ref={canvasRef}
          class={`doc-cap-canvas${isIdle ? ' doc-cap-canvas--idle' : ''}`}
          aria-hidden="true"
        />

        {/* ── Shimmer placeholder (idle state) ───────────────── */}
        {isIdle && <div class="doc-cap-shimmer" aria-hidden="true" />}

        {/* ── Document guide overlay ─────────────────────────── */}
        <CaptureGuideOverlay variant={variant} isCapturing={isCapturing} />

        {/* ── Status pill ────────────────────────────────────── */}
        <div
          class={`doc-cap-status-pill${isCapturing ? ' doc-cap-status-pill--capturing' : ''}`}
          aria-live="polite"
        >
          {isCapturing ? (
            <>
              <span class="doc-cap-pill-spinner" aria-hidden="true" />
              <span>Capturing document…</span>
            </>
          ) : captureState === 'error' ? (
            <span>{cameraError || 'Camera error'}</span>
          ) : (
            <span>
              {isIdle ? 'Starting camera…' : `Align ${displayTitle} in frame`}
            </span>
          )}
        </div>

        {/* ── Top controls: back + close ─────────────────────── */}
        <div class="doc-cap-controls-top">
          {!hideBack && (
            <button
              class="doc-cap-icon-btn"
              type="button"
              aria-label="Go back"
              onClick={handleBack}
            >
              <BackArrowIcon />
            </button>
          )}
          <div class="doc-cap-spacer" />
          <button
            class="doc-cap-icon-btn"
            type="button"
            aria-label="Close"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Bottom controls: gallery + shutter ─────────────── */}
        <div class="doc-cap-controls-bottom">
          {/* Left slot: gallery button (when both capture modes enabled) */}
          {supportBothModes ? (
            <button
              class="doc-cap-gallery-btn"
              type="button"
              aria-label="Upload from gallery"
              onClick={handleGallery}
            >
              <GalleryIcon />
            </button>
          ) : (
            <div class="doc-cap-btn-slot" />
          )}

          {/* Centre: shutter button */}
          <button
            class={`doc-cap-shutter-btn${isCapturing ? ' doc-cap-shutter-btn--capturing' : ''}`}
            type="button"
            aria-label="Capture document"
            onClick={handleShutter}
            disabled={isCapturing || captureState === 'error'}
          >
            {isCapturing ? (
              <span class="doc-cap-shutter-spinner" aria-hidden="true" />
            ) : (
              <span class="doc-cap-shutter-inner" aria-hidden="true" />
            )}
          </button>

          {/* Right slot: balances the gallery button */}
          <div class="doc-cap-btn-slot" />
        </div>

        {/* ── Attribution ────────────────────────────────────── */}
        {!hideAttribution && (
          <div class="doc-cap-attribution">
            <PoweredBySmileIdLogo />
          </div>
        )}
      </div>

      {/* ── Scoped styles ──────────────────────────────────────── */}
      <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* ─ Root container (always portrait, fills the host) ─ */
        .doc-cap-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }

        /* Hidden video element */
        .doc-cap-video {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        /* Hidden file input */
        .doc-cap-file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        /* ─ Landscape inner ──────────────────────────────────── */
        /*   Sized to viewport dimensions in landscape orientation,
             then rotated -90 ° so it fills a portrait screen.
             The user sees a landscape UI and intuitively rotates
             their phone clockwise to align with the document guide. */
        .doc-cap-inner--landscape {
          position: absolute;
          top: 50%;
          left: 50%;
          /* Flip width/height so the element is landscape-sized */
          width: 100vh;
          height: 100vw;
          transform: translate(-50%, -50%) rotate(-90deg);
          overflow: hidden;
          background: #111;
        }

        /* ─ Portrait inner (greenbook) ───────────────────────── */
        .doc-cap-inner--portrait {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #111;
        }

        /* ─ Camera canvas ────────────────────────────────────── */
        .doc-cap-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* In idle state the canvas is invisible; the shimmer sits on top */
        .doc-cap-canvas--idle {
          opacity: 0;
        }

        /* ─ Shimmer placeholder ──────────────────────────────── */
        @keyframes doc-cap-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .doc-cap-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #1a1a1a 25%,
            #2a2a2a 50%,
            #1a1a1a 75%
          );
          background-size: 200% 100%;
          animation: doc-cap-shimmer 1.6s ease-in-out infinite;
        }

        /* ─ Guide overlay SVG ────────────────────────────────── */
        .doc-cap-guide-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* ─ Status pill ──────────────────────────────────────── */
        .doc-cap-status-pill {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 7px 14px;
          border-radius: 20px;
          white-space: nowrap;
          pointer-events: none;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.3s ease;
        }

        .doc-cap-status-pill--capturing {
          background: rgba(44, 192, 92, 0.22);
          border: 1px solid rgba(44, 192, 92, 0.55);
          color: #2CC05C;
        }

        /* Pill spinner (tiny rotating arc) */
        @keyframes doc-cap-pill-spin {
          to { transform: rotate(360deg); }
        }

        .doc-cap-pill-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(44, 192, 92, 0.3);
          border-top-color: #2CC05C;
          border-radius: 50%;
          animation: doc-cap-pill-spin 0.75s linear infinite;
          flex-shrink: 0;
        }

        /* ─ Top controls (back + close) ──────────────────────── */
        .doc-cap-controls-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .doc-cap-spacer {
          flex: 1;
        }

        /* ─ Icon button (back / close) ───────────────────────── */
        .doc-cap-icon-btn {
          pointer-events: auto;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(45, 43, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s ease;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .doc-cap-icon-btn:hover  { opacity: 0.85; }
        .doc-cap-icon-btn:active { transform: scale(0.95); }
        .doc-cap-icon-btn:focus-visible {
          outline: 2px solid #151f72;
          outline-offset: 3px;
        }

        /* ─ Bottom controls (gallery + shutter) ─────────────── */
        .doc-cap-controls-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 14px 24px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        /* Equal-width slot to balance the row */
        .doc-cap-btn-slot {
          width: 48px;
          flex-shrink: 0;
        }

        /* ─ Gallery button ───────────────────────────────────── */
        .doc-cap-gallery-btn {
          pointer-events: auto;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #151f72;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        .doc-cap-gallery-btn:hover  { opacity: 0.88; }
        .doc-cap-gallery-btn:active { transform: scale(0.96); }
        .doc-cap-gallery-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }

        /* ─ Shutter button ───────────────────────────────────── */
        .doc-cap-shutter-btn {
          pointer-events: auto;
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: transparent;
          border: 3px solid rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.25s ease, transform 0.1s ease;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
        }

        .doc-cap-shutter-btn--capturing {
          border-color: #2CC05C;
          box-shadow: 0 0 0 2px rgba(44, 192, 92, 0.3),
                      0 0 16px rgba(44, 192, 92, 0.25);
        }

        .doc-cap-shutter-btn:active:not(:disabled) {
          transform: scale(0.94);
        }

        .doc-cap-shutter-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }

        .doc-cap-shutter-btn:disabled {
          cursor: default;
        }

        /* Inner filled circle for the 'ready' state */
        .doc-cap-shutter-inner {
          display: block;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
        }

        /* Spinner inside shutter button while capturing */
        @keyframes doc-cap-shutter-spin {
          to { transform: rotate(360deg); }
        }

        .doc-cap-shutter-spinner {
          display: block;
          width: 32px;
          height: 32px;
          border: 3px solid rgba(44, 192, 92, 0.25);
          border-top-color: #2CC05C;
          border-radius: 50%;
          animation: doc-cap-shutter-spin 0.75s linear infinite;
        }

        /* ─ Attribution ──────────────────────────────────────── */
        .doc-cap-attribution {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

// ── Register as custom element ────────────────────────────────────────────────

if (window.customElements && !window.customElements.get('document-capture')) {
  register(DocumentCapture, 'document-capture', [
    'dir',
    'hidden',
    'document-type',
    'document-name',
    'side-of-id',
    'title',
    'hide-attribution',
    'hide-back-to-host',
    'show-navigation',
    'theme-color',
    'document-capture-modes',
  ]);
}

export default DocumentCapture;
