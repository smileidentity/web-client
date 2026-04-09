import type { FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import register from 'preact-custom-element';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { getBoolProp } from '../../../../utils/props';
import { getDirection, t } from '../../../../domain/localisation';

// ── Visual assets ────────────────────────────────────────────────────────────
const HERO_ID_CARD_LOTTIE_URL = new URL(
  '../assets/lottie/taking photo of ID.lottie',
  import.meta.url,
).href;

const HERO_PASSPORT_LOTTIE_URL = new URL(
  '../assets/lottie/taking photo of passport 2.lottie',
  import.meta.url,
).href;

const HERO_GREENBOOK_LOTTIE_URL = new URL(
  '../assets/lottie/taking photo of green book passport.lottie',
  import.meta.url,
).href;

const HERO_IMAGE_FALLBACK_URL =
  'https://www.figma.com/api/mcp/asset/be898e16-cf3f-4c91-86ed-fbd2aa436e49';

type DocumentVariant = 'id-card' | 'passport' | 'greenbook';

interface HeroAssetConfig {
  animationSrc: string;
  fallbackAlt: string;
  fallbackSrc: string;
}

const HERO_ASSETS: Record<DocumentVariant, HeroAssetConfig> = {
  'id-card': {
    animationSrc: HERO_ID_CARD_LOTTIE_URL,
    fallbackAlt: 'Phone capturing an ID card on a desk',
    fallbackSrc: HERO_IMAGE_FALLBACK_URL,
  },
  passport: {
    animationSrc: HERO_PASSPORT_LOTTIE_URL,
    fallbackAlt: 'Phone capturing a passport on a desk',
    fallbackSrc: HERO_IMAGE_FALLBACK_URL,
  },
  greenbook: {
    animationSrc: HERO_GREENBOOK_LOTTIE_URL,
    fallbackAlt: 'Phone capturing a green book passport on a desk',
    fallbackSrc: HERO_IMAGE_FALLBACK_URL,
  },
};

function getDocumentVariant(idType: string): DocumentVariant {
  const normalized = idType.trim().toLowerCase();

  if (
    normalized.includes('greenbook')
    || (normalized.includes('green') && normalized.includes('book'))
  ) {
    return 'greenbook';
  }

  if (normalized.includes('passport')) {
    return 'passport';
  }

  return 'id-card';
}

function getTextDirection(dir?: string): 'ltr' | 'rtl' | 'auto' {
  if (dir === 'rtl' || dir === 'ltr' || dir === 'auto') {
    return dir;
  }

  return getDirection() === 'rtl' ? 'rtl' : 'ltr';
}

interface HeroLottieProps {
  animationSrc: string;
  fallbackSrc: string;
  fallbackAlt: string;
}

function HeroLottie({
  animationSrc,
  fallbackSrc,
  fallbackAlt,
}: HeroLottieProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (!canvasRef.current) {
      return undefined;
    }

    let isMounted = true;
    const animation = new DotLottie({
      autoplay: true,
      canvas: canvasRef.current,
      loop: true,
      layout: {
        align: [0.5, 0.5],
        fit: 'cover',
      },
      renderConfig: {
        autoResize: true,
        devicePixelRatio: window.devicePixelRatio || 1,
      },
      src: animationSrc,
    });

    animation.addEventListener('loadError', () => {
      if (isMounted) {
        setHasError(true);
      }
    });

    animation.addEventListener('renderError', () => {
      if (isMounted) {
        setHasError(true);
      }
    });

    return () => {
      isMounted = false;
      animation.destroy();
    };
  }, [animationSrc]);

  return (
    <div class="dui-hero-media">
      <img
        class="dui-hero-img"
        src={fallbackSrc}
        alt={fallbackAlt}
        loading="eager"
        decoding="async"
      />
      {!hasError && (
        <canvas
          ref={canvasRef}
          class="dui-hero-canvas"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ── Inline SVG helpers ───────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
        stroke="white"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function GuidelinesIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="#0f172b" stroke-width="1.4" />
      <path
        d="M8 5v3.5M8 11v.5"
        stroke="#0f172b"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 5l2.25 2.5L8 3"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 2.5l5 5M7.5 2.5l-5 5"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

// ── ID Card illustration used inside each guideline tile ────────────────────
function IdCardThumbnail({
  blurred = false,
  reflective = false,
  cropped = false,
}: {
  blurred?: boolean;
  reflective?: boolean;
  cropped?: boolean;
}) {
  return (
    <div
      class="id-card-thumb"
      style={{
        overflow: cropped ? 'hidden' : 'visible',
        filter: blurred ? 'blur(1.5px)' : 'none',
      }}
    >
      {/* Card body – scaled up when cropped so it overflows the clipped container */}
      <div
        class="id-card-body"
        style={cropped ? { transform: 'scale(1.4)', transformOrigin: 'right center' } : undefined}
      >
        {/* Photo placeholder */}
        <div class="id-card-photo">
          {/* Simplified face silhouette */}
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="9" cy="8" rx="5" ry="6" fill="#c5d4e0" />
            <path
              d="M1 22c0-4 3.6-7 8-7s8 3 8 7"
              fill="#c5d4e0"
            />
          </svg>
        </div>
        {/* Text lines */}
        <div class="id-card-lines">
          <div class="id-card-line long" />
          <div class="id-card-line medium" />
          <div class="id-card-line short" />
        </div>
      </div>
      {/* Reflective glare overlay */}
      {reflective && (
        <div class="id-card-glare" />
      )}
    </div>
  );
}

function BookletThumbnail({
  blurred = false,
  reflective = false,
  cropped = false,
}: {
  blurred?: boolean;
  reflective?: boolean;
  cropped?: boolean;
}) {
  return (
    <div
      class="booklet-thumb"
      style={{
        overflow: cropped ? 'hidden' : 'visible',
        filter: blurred ? 'blur(1.5px)' : 'none',
      }}
    >
      <div
        class="booklet-inner"
        style={cropped ? { transform: 'scale(1.33)', transformOrigin: 'right center' } : undefined}
      >
        <div class="booklet-page booklet-page--left">
          <div class="booklet-line long" />
          <div class="booklet-line medium" />
          <div class="booklet-line short" />
        </div>
        <div class="booklet-spine" />
        <div class="booklet-page booklet-page--right">
          <div class="booklet-photo" />
          <div class="booklet-lines">
            <div class="booklet-line long" />
            <div class="booklet-line medium" />
          </div>
        </div>
      </div>
      {reflective && <div class="booklet-glare" />}
    </div>
  );
}

function GreenbookThumbnail({
  blurred = false,
  reflective = false,
  cropped = false,
}: {
  blurred?: boolean;
  reflective?: boolean;
  cropped?: boolean;
}) {
  return (
    <div
      class="greenbook-thumb"
      style={{
        overflow: cropped ? 'hidden' : 'visible',
        filter: blurred ? 'blur(1.5px)' : 'none',
      }}
    >
      <div
        class="greenbook-inner"
        style={cropped ? { transform: 'scale(1.33)', transformOrigin: 'right center' } : undefined}
      >
        <div class="greenbook-cover">
          <div class="greenbook-emblem" />
          <div class="greenbook-cover-line" />
        </div>
        <div class="greenbook-spine" />
        <div class="greenbook-page">
          <div class="greenbook-photo" />
          <div class="greenbook-lines">
            <div class="greenbook-line long" />
            <div class="greenbook-line medium" />
            <div class="greenbook-line short" />
          </div>
        </div>
      </div>
      {reflective && <div class="greenbook-glare" />}
    </div>
  );
}

function GuidelineThumbnail({
  variant,
  blurred,
  reflective,
  cropped,
}: {
  variant: DocumentVariant;
  blurred?: boolean;
  reflective?: boolean;
  cropped?: boolean;
}) {
  if (variant === 'id-card') {
    return (
      <IdCardThumbnail
        blurred={blurred}
        reflective={reflective}
        cropped={cropped}
      />
    );
  }

  if (variant === 'greenbook') {
    return (
      <GreenbookThumbnail
        blurred={blurred}
        reflective={reflective}
        cropped={cropped}
      />
    );
  }

  return (
    <BookletThumbnail
      blurred={blurred}
      reflective={reflective}
      cropped={cropped}
    />
  );
}

interface GuidelineItem {
  label: string;
  valid: boolean;
  blurred?: boolean;
  reflective?: boolean;
  cropped?: boolean;
}

// ── SmileID attribution SVG (inline to avoid external web component dep) ────
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
        d="M0.544 7V1.4H2.616C3.064 1.4 3.43467 1.47467 3.728 1.624C4.02133 1.77333 4.24 1.97867 4.384 2.24C4.528 2.50133 4.6 2.79467 4.6 3.12C4.6 3.42933 4.53067 3.71467 4.392 3.976C4.25333 4.232 4.03733 4.44 3.744 4.6C3.45067 4.75467 3.07467 4.832 2.616 4.832H1.568V7H0.544ZM1.568 4H2.552C2.90933 4 3.16533 3.92267 3.32 3.768C3.48 3.608 3.56 3.392 3.56 3.12C3.56 2.84267 3.48 2.62667 3.32 2.472C3.16533 2.312 2.90933 2.232 2.552 2.232H1.568V4ZM7.08025 7.096C6.69625 7.096 6.34958 7.008 6.04025 6.832C5.73625 6.656 5.49358 6.41333 5.31225 6.104C5.13625 5.78933 5.04825 5.42667 5.04825 5.016C5.04825 4.60533 5.13892 4.24533 5.32025 3.936C5.50158 3.62133 5.74425 3.376 6.04825 3.2C6.35758 3.024 6.70425 2.936 7.08825 2.936C7.46692 2.936 7.80825 3.024 8.11225 3.2C8.42158 3.376 8.66425 3.62133 8.84025 3.936C9.02158 4.24533 9.11225 4.60533 9.11225 5.016C9.11225 5.42667 9.02158 5.78933 8.84025 6.104C8.66425 6.41333 8.42158 6.656 8.11225 6.832C7.80292 7.008 7.45892 7.096 7.08025 7.096ZM7.08025 6.208C7.34692 6.208 7.57892 6.10933 7.77625 5.912C7.97358 5.70933 8.07225 5.41067 8.07225 5.016C8.07225 4.62133 7.97358 4.32533 7.77625 4.128C7.57892 3.92533 7.34958 3.824 7.08825 3.824C6.81625 3.824 6.58158 3.92533 6.38425 4.128C6.19225 4.32533 6.09625 4.62133 6.38425 5.912C6.58158 6.10933 6.81358 6.208 7.08025 6.208ZM10.6632 7L9.50319 3.032H10.5192L11.2072 5.888L12.0072 3.032H13.1432L13.9432 5.888L14.6392 3.032H15.6552L14.4872 7H13.4232L12.5752 4.032L11.7272 7H10.6632ZM18.0886 7.096C17.6886 7.096 17.334 7.01067 17.0246 6.84C16.7153 6.66933 16.4726 6.42933 16.2966 6.12C16.1206 5.81067 16.0326 5.45333 16.0326 5.048C16.0326 4.63733 16.118 4.272 16.2886 3.952C16.4646 3.632 16.7046 3.384 17.0086 3.208C17.318 3.02667 17.6806 2.936 18.0966 2.936C18.486 2.936 18.83 3.02133 19.1286 3.192C19.4273 3.36267 19.6593 3.59733 19.8246 3.896C19.9953 4.18933 20.0806 4.51733 20.0806 4.88C20.0806 4.93867 20.078 5 20.0726 5.064C20.0726 5.128 20.07 5.19467 20.0646 5.264H17.0486C17.07 5.57333 17.1766 5.816 17.3686 5.992C17.566 6.168 17.8033 6.256 18.0806 6.256C18.2886 6.256 18.462 6.21067 18.6006 6.12C18.7446 6.024 18.8513 5.90133 18.9206 5.752H19.9606C19.886 6.00267 19.7606 6.232 19.5846 6.44C19.414 6.64267 19.2006 6.80267 18.9446 6.92C18.694 7.03733 18.4086 7.096 18.0886 7.096ZM18.0966 3.768C17.846 3.768 17.6246 3.84 17.4326 3.984C17.2406 4.12267 17.118 4.336 17.0646 4.624H19.0406C19.0246 4.36267 18.9286 4.15467 18.7526 4C18.5766 3.84533 18.358 3.768 18.0966 3.768ZM20.9419 7V3.032H21.8539L21.9499 3.776C22.0939 3.52 22.2885 3.31733 22.5339 3.168C22.7845 3.01333 23.0779 2.936 23.4139 2.936V4.016H23.1259C22.9019 4.016 22.7019 4.05067 22.5259 4.12C22.3499 4.18933 22.2112 4.30933 22.1099 4.48C22.0139 4.65067 21.9659 4.888 21.9659 5.192V7H20.9419ZM25.9714 7.096C25.5714 7.096 25.2168 7.01067 24.9074 6.84C24.5981 6.66933 24.3554 6.42933 24.1794 6.12C24.0034 5.81067 23.9154 5.45333 23.9154 5.048C23.9154 4.63733 24.0008 4.272 24.1714 3.952C24.3474 3.632 24.5874 3.384 24.8914 3.208C25.2008 3.02667 25.5634 2.936 25.9794 2.936C26.3688 2.936 26.7128 3.02133 27.0114 3.192C27.3101 3.36267 27.5421 3.59733 27.7074 3.896C27.8781 4.18933 27.9634 4.51733 27.9634 4.88C27.9634 4.93867 27.9608 5 27.9554 5.064C27.9554 5.128 27.9528 5.19467 27.9474 5.264H24.9314C24.9528 5.57333 25.0594 5.816 25.2514 5.992C25.4488 6.168 25.6861 6.256 25.9634 6.256C26.1714 6.256 26.3448 6.21067 26.4834 6.12C26.6274 6.024 26.7341 5.90133 26.8034 5.752H27.8434C27.7688 6.00267 27.6434 6.232 27.4674 6.44C27.2968 6.64267 27.0834 6.80267 26.8274 6.92C26.5768 7.03733 26.2914 7.096 25.9714 7.096ZM25.9794 3.768C25.7288 3.768 25.5074 3.84 25.3154 3.984C25.1234 4.12267 25.0008 4.336 24.9474 4.624H26.9234C26.9074 4.36267 26.8114 4.15467 26.6354 4C26.4594 3.84533 26.2408 3.768 25.9794 3.768ZM30.6487 7.096C30.2754 7.096 29.942 7.00533 29.6487 6.824C29.3554 6.64267 29.1234 6.39467 28.9527 6.08C28.782 5.76533 28.6967 5.408 28.6967 5.008C28.6967 4.608 28.782 4.25333 28.9527 3.944C29.1234 3.62933 29.3554 3.384 29.6487 3.208C29.942 3.02667 30.2754 2.936 30.6487 2.936C30.9474 2.936 31.2087 2.992 31.4327 3.104C31.6567 3.216 31.838 3.37333 31.9767 3.576V1.24H33.0007V7H32.0887L31.9767 6.432C31.8487 6.608 31.678 6.76267 31.4647 6.896C31.2567 7.02933 30.9847 7.096 30.6487 7.096ZM30.8647 6.2C31.1954 6.2 31.4647 6.09067 31.6727 5.872C31.886 5.648 31.9927 5.36267 31.9927 5.016C31.9927 4.66933 31.886 4.38667 31.6727 4.168C31.4647 3.944 31.1954 3.832 30.8647 3.832C30.5394 3.832 30.27 3.94133 30.0567 4.16C29.8434 4.37867 29.7367 4.66133 29.7367 5.008C29.7367 5.35467 29.8434 5.64 30.0567 5.864C30.27 6.088 30.5394 6.2 30.8647 6.2ZM38.3017 7.096C38.003 7.096 37.7417 7.04 37.5177 6.928C37.2937 6.816 37.1124 6.65867 36.9737 6.456L36.8617 7H35.9497V1.24H36.9737V3.6C37.1017 3.424 37.2697 3.26933 37.4777 3.136C37.691 3.00267 37.9657 2.936 38.3017 2.936C38.675 2.936 39.0084 3.02667 39.3017 3.208C39.595 3.38933 39.827 3.63733 39.9977 3.952C40.1684 4.26667 40.2537 4.624 40.2537 5.024C40.2537 5.424 40.1684 5.78133 39.9977 6.096C39.827 6.40533 39.595 6.65067 39.3017 6.832C39.0084 7.008 38.675 7.096 38.3017 7.096ZM38.0857 6.2C38.411 6.2 38.6804 6.09067 38.8937 5.872C39.107 5.65333 39.2137 5.37067 39.2137 5.024C39.2137 4.67733 39.107 4.392 38.8937 4.168C38.6804 3.944 38.411 3.832 38.0857 3.832C37.755 3.832 37.483 3.944 37.2697 4.168C37.0617 4.38667 36.9577 4.66933 36.9577 5.016C36.9577 5.36267 37.0617 5.648 37.2697 5.872C37.483 6.09067 37.755 6.2 38.0857 6.2ZM41.3051 8.76L42.2251 6.736H41.9851L40.4411 3.032H41.5531L42.6651 5.824L43.8251 3.032H44.9131L42.3931 8.76H41.3051Z"
        fill="#001096"
      />
      <g clip-path="url(#clip0_du_1)">
        <path
          d="M58.5141 6.02913C58.5644 6.37005 58.8092 6.77098 59.4839 6.77098C60.0578 6.77098 60.336 6.56623 60.336 6.23338C60.336 5.90053 60.142 5.75579 59.788 5.71292L58.5988 5.58482C57.5612 5.47387 56.9539 4.86819 56.9539 3.87872C56.9539 2.77779 57.7801 2.04401 59.4335 2.04401C61.2135 2.04401 61.9221 2.88874 61.9894 3.88679H60.3195C60.2687 3.51157 59.965 3.27253 59.442 3.27253C58.9783 3.27253 58.6577 3.44349 58.6577 3.75062C58.6577 3.99774 58.8097 4.18534 59.2141 4.21964L60.1844 4.30486C61.4918 4.41582 62.0397 5.04672 62.0397 6.0962C62.0397 7.21377 61.3477 7.999 59.4504 7.999C57.5532 7.999 56.9534 7.02667 56.8691 6.02862H58.5141V6.02913Z"
          fill="#001096"
        />
        <path
          d="M70.1965 5.28736V7.85484H68.5431V5.56019C68.5431 5.09925 68.3746 4.80069 67.9194 4.80069C67.4212 4.80069 67.2108 5.11639 67.2108 5.78159V7.85484H65.5824V5.56019C65.5824 5.09925 65.4133 4.80069 64.9581 4.80069C64.4605 4.80069 64.2496 5.11639 64.2496 5.78159V7.85484H62.5967V3.58932H64.2496V4.24644C64.5113 3.75171 64.9581 3.45265 65.6586 3.45265C66.3592 3.45265 66.8309 3.7855 67.0587 4.35689C67.3285 3.80265 67.7842 3.45265 68.5351 3.45265C69.6735 3.45265 70.197 4.16928 70.197 5.28736H70.1965Z"
          fill="#001096"
        />
        <path
          d="M70.9785 3.8535V2.18118H72.6319V3.8535H70.9785ZM70.9785 7.85476V4.2504H72.6319V7.85476H70.9785Z"
          fill="#001096"
        />
        <path
          d="M73.4121 7.85475V2.18167H75.065V7.85525H73.4121V7.85475Z"
          fill="#001096"
        />
        <path
          d="M78.7264 6.53958H80.3579C80.1968 7.3243 79.5696 7.99151 78.0179 7.99151C76.2294 7.99151 75.6221 6.8568 75.6221 5.71351C75.6221 4.48499 76.3391 3.45265 78.0179 3.45265C79.8653 3.45265 80.3629 4.59594 80.3629 5.77302C80.3629 5.91776 80.3539 6.05443 80.3374 6.13966H77.2336C77.3178 6.68583 77.5881 6.89059 78.0518 6.89059C78.3729 6.89059 78.6083 6.73526 78.7269 6.53908L78.7264 6.53958ZM77.2416 5.21877H78.8022C78.7519 4.77497 78.5404 4.52785 78.0428 4.52785C77.5791 4.52785 77.3348 4.70689 77.2416 5.21877Z"
          fill="#001096"
        />
        <path
          d="M83.5907 7.85476H81.8994L81.9034 2.18118H83.5902L83.5912 7.85476H83.5907Z"
          fill="#001096"
        />
        <path
          d="M89.9995 5.00535C89.9995 6.46434 89.1474 7.85475 87.3345 7.85475H84.3652V2.18167H87.3345C89.1479 2.18167 89.9995 3.54686 89.9995 5.00535ZM86.9376 6.5067C87.8401 6.5067 88.2364 5.99482 88.2364 5.00535C88.2364 4.01588 87.8226 3.52971 86.9376 3.52971H86.06V6.5067H86.9376Z"
          fill="#001096"
        />
        <path
          d="M52.2123 3.88737H48V7.86846H52.2123V3.88737Z"
          fill="#001096"
        />
        <path
          d="M53.2359 0C53.2165 0 53.1975 0.00201727 53.1786 0.00252159C53.1591 0.00252159 53.1402 0 53.1207 0C52.0457 0 51.0869 0.708567 51.0869 2.27044V3.8888H55.2882V2.27044C55.2882 0.708567 54.3174 0 53.2359 0Z"
          fill="#FF9B00"
        />
      </g>
      <defs>
        <clipPath id="clip0_du_1">
          <rect width="42" height="8" fill="white" transform="translate(48)" />
        </clipPath>
      </defs>
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  dir?: string;
  'id-type'?: string;
  title?: string;
  'hide-attribution'?: string | boolean;
  'hide-back'?: string | boolean;
  'hide-back-to-host'?: string | boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

const DocumentCaptureInstructions: FunctionComponent<Props> = ({
  dir,
  'id-type': idType = '',
  title = '',
  'hide-attribution': hideAttributionProp = false,
  'hide-back': hideBackProp = false,
  'hide-back-to-host': hideBackToHostProp = false,
}) => {
  const hideAttribution = getBoolProp(hideAttributionProp);
  const hideBack = getBoolProp(hideBackProp) || getBoolProp(hideBackToHostProp);
  const displayDocumentType = idType || title;
  const documentVariant = getDocumentVariant(displayDocumentType);
  const direction = getTextDirection(dir);
  const heroAsset = HERO_ASSETS[documentVariant];
  const guidelineItems: GuidelineItem[] = [
    { label: t('document.instructions.guidelines.good'), valid: true },
    {
      label: t('document.instructions.guidelines.notCropped'),
      valid: false,
      cropped: true,
    },
    {
      label: t('document.instructions.guidelines.notBlurry'),
      valid: false,
      blurred: true,
    },
    {
      label: t('document.instructions.guidelines.notReflective'),
      valid: false,
      reflective: true,
    },
  ];

  const handleBack = () => {
    const host = document.querySelector('document-capture-instructions');
    host?.dispatchEvent(
      new CustomEvent('document-capture-instructions.cancelled', {
        bubbles: true,
      }),
    );
  };

  const handleStartCapture = () => {
    const host = document.querySelector('document-capture-instructions');
    host?.dispatchEvent(
      new CustomEvent('document-capture-instructions.capture', {
        bubbles: true,
      }),
    );
  };

  return (
    <div class="dui-root" dir={direction}>
      {/* ── Back button ──────────────────────────────────────── */}
      {!hideBack && (
        <button
          class="dui-back-btn"
          type="button"
          aria-label="Go back"
          onClick={handleBack}
        >
          <BackArrowIcon />
        </button>
      )}

      {/* ── Scrollable content ───────────────────────────────── */}
      <div class="dui-scroll">
        {/* ── Title ─────────────────────────────────────────── */}
        <div class="dui-title-block">
          <h1 class="dui-title">
            <span class="dui-title-regular">{t('document.instructions.captureTitlePrefix')} </span>
            <span class="dui-title-type">{displayDocumentType || '<ID Type>'}</span>
          </h1>
        </div>

        {/* ── Hero illustration ─────────────────────────────── */}
        <div class="dui-hero-card" aria-hidden="true">
          <HeroLottie
            animationSrc={heroAsset.animationSrc}
            fallbackSrc={heroAsset.fallbackSrc}
            fallbackAlt={heroAsset.fallbackAlt}
          />
        </div>

        {/* ── Capture guidelines ────────────────────────────── */}
        <div class="dui-guidelines">
          <div class="dui-guidelines-header">
            <GuidelinesIcon />
            <span class="dui-guidelines-label">{t('document.instructions.captureGuidelines')}</span>
          </div>

          <div class="dui-guidelines-grid">
            {guidelineItems.map((item) => (
              <div class="dui-guide-item" key={item.label}>
                <div class="dui-guide-thumb-wrap">
                  <GuidelineThumbnail
                    variant={documentVariant}
                    blurred={item.blurred}
                    reflective={item.reflective}
                    cropped={item.cropped}
                  />
                  <div
                    class={`dui-guide-badge ${item.valid ? 'dui-guide-badge--valid' : 'dui-guide-badge--invalid'}`}
                  >
                    {item.valid ? <CheckIcon /> : <XIcon />}
                  </div>
                </div>
                <p class="dui-guide-caption">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA button ───────────────────────────────────────── */}
      <div class="dui-footer">
        <button
          class="dui-start-btn"
          type="button"
          onClick={handleStartCapture}
        >
          <span>{t('document.instructions.startCapture')}</span>
          <ArrowRightIcon />
        </button>

        {/* ── Attribution ───────────────────────────────────── */}
        {!hideAttribution && (
          <div class="dui-attribution">
            <PoweredBySmileIdLogo />
          </div>
        )}
      </div>

      {/* ── Scoped styles ────────────────────────────────────── */}
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

        .dui-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-height: 100%;
          position: relative;
          overflow: hidden;
        }

        /* ── Back button ─────────────────────────────────────── */
        .dui-back-btn {
          position: absolute;
          top: 24px;
          left: 20px;
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #2d2b2a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s ease;
        }

        .dui-back-btn:hover {
          opacity: 0.85;
        }

        .dui-back-btn:focus-visible {
          outline: 2px solid #151f72;
          outline-offset: 3px;
        }

        /* ── Scrollable area ──────────────────────────────────── */
        .dui-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 88px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Title ───────────────────────────────────────────── */
        .dui-title-block {
          width: 100%;
        }

        .dui-title {
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.025em;
        }

        .dui-title-regular {
          color: #0f172b;
        }

        .dui-title-type {
          display: block;
          color: #151f72;
        }

        /* ── Hero card ───────────────────────────────────────── */
        .dui-hero-card {
          width: 100%;
          background: #f9f0e7;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: inset 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(241, 245, 249, 0.5);
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dui-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: inherit;
        }

        .dui-hero-media {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .dui-hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* ── Guidelines ──────────────────────────────────────── */
        .dui-guidelines {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dui-guidelines-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 4px;
        }

        .dui-guidelines-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #0f172b;
        }

        .dui-guidelines-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        /* ── Guide item ──────────────────────────────────────── */
        .dui-guide-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .dui-guide-thumb-wrap {
          position: relative;
          width: 100%;
        }

        /* ── ID card thumbnail ───────────────────────────────── */
        .id-card-thumb {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1),
            0px 1px 2px 0px rgba(0, 0, 0, 0.06);
          width: 100%;
          aspect-ratio: 3 / 2;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .id-card-body {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px;
          width: 100%;
        }

        .id-card-photo {
          width: 28px;
          height: 34px;
          background: #f8fafc;
          border: 0.5px solid #cbd5e1;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .id-card-lines {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .id-card-line {
          height: 3px;
          background: #e2e8f0;
          border-radius: 999px;
        }

        .id-card-line.long  { width: 100%; }
        .id-card-line.medium { width: 75%; }
        .id-card-line.short  { width: 50%; }

        .id-card-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 35% 35%,
            rgba(255, 255, 255, 0.97) 0%,
            rgba(255, 255, 255, 0.8) 25%,
            rgba(255, 255, 255, 0.35) 55%,
            rgba(255, 255, 255, 0) 75%
          );
          pointer-events: none;
        }

        .booklet-thumb {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1),
            0px 1px 2px 0px rgba(0, 0, 0, 0.06);
          width: 100%;
          aspect-ratio: 3 / 2;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .booklet-inner {
          display: grid;
          grid-template-columns: 1fr 4px 1fr;
          width: 100%;
          height: 100%;
        }

        .booklet-page {
          padding: 6px 4px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          background: #ffffff;
        }

        .booklet-page--left {
          background: #f8fafc;
        }

        .booklet-page--right {
          flex-direction: row;
          align-items: center;
          gap: 4px;
        }

        .booklet-spine {
          background: linear-gradient(180deg, #d9e1ea 0%, #c7d1dc 100%);
        }

        .booklet-photo {
          width: 14px;
          height: 18px;
          border-radius: 2px;
          border: 0.5px solid #cbd5e1;
          background: #d5e1ec;
          flex-shrink: 0;
        }

        .booklet-lines {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .booklet-line {
          height: 3px;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .booklet-line.long {
          width: 100%;
        }

        .booklet-line.medium {
          width: 72%;
        }

        .booklet-line.short {
          width: 54%;
        }

        .booklet-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 35% 35%,
            rgba(255, 255, 255, 0.97) 0%,
            rgba(255, 255, 255, 0.8) 25%,
            rgba(255, 255, 255, 0.35) 55%,
            rgba(255, 255, 255, 0) 75%
          );
          pointer-events: none;
        }

        .greenbook-thumb {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1),
            0px 1px 2px 0px rgba(0, 0, 0, 0.06);
          width: 100%;
          aspect-ratio: 3 / 2;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .greenbook-inner {
          display: grid;
          grid-template-columns: 1fr 4px 1fr;
          width: 100%;
          height: 100%;
        }

        .greenbook-cover {
          background: linear-gradient(160deg, #2f7a4f 0%, #1f5a37 100%);
          padding: 6px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .greenbook-emblem {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
        }

        .greenbook-cover-line {
          width: 60%;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
        }

        .greenbook-spine {
          background: linear-gradient(180deg, #244f35 0%, #1a3e2a 100%);
        }

        .greenbook-page {
          padding: 6px 4px;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          background: #ffffff;
        }

        .greenbook-photo {
          width: 14px;
          height: 18px;
          border-radius: 2px;
          border: 0.5px solid #cbd5e1;
          background: #d5e1ec;
          flex-shrink: 0;
        }

        .greenbook-lines {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .greenbook-line {
          height: 3px;
          border-radius: 999px;
          background: #d9e4ed;
        }

        .greenbook-line.long {
          width: 100%;
        }

        .greenbook-line.medium {
          width: 72%;
        }

        .greenbook-line.short {
          width: 54%;
        }

        .greenbook-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 35% 35%,
            rgba(255, 255, 255, 0.97) 0%,
            rgba(255, 255, 255, 0.8) 25%,
            rgba(255, 255, 255, 0.35) 55%,
            rgba(255, 255, 255, 0) 75%
          );
          pointer-events: none;
        }

        /* ── Guide badge ─────────────────────────────────────── */
        .dui-guide-badge {
          position: absolute;
          top: -6px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid #ffffff;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1),
            0px 1px 2px 0px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dui-guide-badge--valid   { background: #00c950; }
        .dui-guide-badge--invalid { background: #fb2c36; }

        /* ── Caption ─────────────────────────────────────────── */
        .dui-guide-caption {
          font-size: 9px;
          font-weight: 500;
          color: #151f72;
          text-align: center;
          letter-spacing: 0.01em;
          line-height: 1.2;
          white-space: nowrap;
        }

        /* ── Footer / CTA ────────────────────────────────────── */
        .dui-footer {
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .dui-start-btn {
          width: 100%;
          max-width: 400px;
          height: 56px;
          background: #151f72;
          color: #ffffff;
          border: none;
          border-radius: 32px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0px 8px 10px 0px #e2e8f0;
          transition: opacity 0.15s ease, transform 0.1s ease;
          letter-spacing: 0.01em;
        }

        .dui-start-btn:hover {
          opacity: 0.9;
        }

        .dui-start-btn:active {
          transform: scale(0.98);
        }

        .dui-start-btn:focus-visible {
          outline: 2px solid #151f72;
          outline-offset: 3px;
        }

        /* ── Attribution ─────────────────────────────────────── */
        .dui-attribution {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Responsive – desktop breakpoint ─────────────────── */
        @media (min-width: 640px) {
          .dui-scroll {
            padding-top: 96px;
            padding-left: 32px;
            padding-right: 32px;
          }

          .dui-footer {
            padding-left: 32px;
            padding-right: 32px;
          }

          .dui-back-btn {
            top: 28px;
            left: 28px;
          }

          .dui-hero-card {
            border-radius: 32px;
          }

          .dui-guide-caption {
            font-size: 10px;
          }
        }

        /* ── Very small screens (< 360px) ────────────────────── */
        @media (max-width: 360px) {
          .dui-guidelines-grid {
            gap: 4px;
          }

          .dui-guide-caption {
            font-size: 8px;
          }

          .dui-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

// ── Register as custom element ───────────────────────────────────────────────

if (
  window.customElements
  && !window.customElements.get('document-capture-instructions')
) {
  register(DocumentCaptureInstructions, 'document-capture-instructions', [
    'dir',
    'id-type',
    'title',
    'hide-attribution',
    'hide-back',
    'hide-back-to-host',
  ]);
}

export default DocumentCaptureInstructions;
