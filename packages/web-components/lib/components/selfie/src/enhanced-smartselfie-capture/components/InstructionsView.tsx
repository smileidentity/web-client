import type { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { IconLoader2 } from '@tabler/icons-preact';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { t } from '../../../../../domain/localisation';
// eslint-disable-next-line import/no-unresolved
import activeLivenessSrc from '../assets/active_liveness_animation.lottie';
// Illustration cards are real Preact components — the brand-blue pill in
// the "Good" example takes `themeColor` as a prop, which avoids the
// previous `.svg?raw` + `dangerouslySetInnerHTML` recolour and keeps the
// markup inside Preact's normal reconciliation.
import {
  GoodIllustration,
  AccessoriesIllustration,
  MultipleFacesIllustration,
  PoorLightingIllustration,
} from '../assets/illustrations';

type IllustrationKind =
  | 'good'
  | 'accessories'
  | 'multipleFaces'
  | 'poorLighting';

interface Guideline {
  status: 'good' | 'bad';
  label: string;
  illustration: IllustrationKind;
}

const GUIDELINES: Guideline[] = [
  {
    status: 'good',
    label: 'selfie.ess.instructions.tile.good',
    illustration: 'good',
  },
  {
    status: 'bad',
    label: 'selfie.ess.instructions.tile.accessories',
    illustration: 'accessories',
  },
  {
    status: 'bad',
    label: 'selfie.ess.instructions.tile.multipleFaces',
    illustration: 'multipleFaces',
  },
  {
    status: 'bad',
    label: 'selfie.ess.instructions.tile.poorLighting',
    illustration: 'poorLighting',
  },
];

const ILLUSTRATION_COMPONENTS: Record<
  IllustrationKind,
  FunctionComponent<{ themeColor: string }>
> = {
  good: GoodIllustration,
  accessories: AccessoriesIllustration,
  multipleFaces: MultipleFacesIllustration,
  poorLighting: PoorLightingIllustration,
};

interface InstructionsViewProps {
  themeColor: string;
  hideAttribution: boolean;
  /**
   * When false, the Continue button shows a spinner and is disabled —
   * the camera + Mediapipe model are still loading in the background.
   */
  isReady?: boolean;
  onContinue: () => void;
  onBack?: () => void;
}

const HeroAnimation: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<DotLottie | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const anim = new DotLottie({
      canvas: canvasRef.current,
      src: activeLivenessSrc,
      loop: true,
      autoplay: true,
      renderConfig: { autoResize: true },
    });
    animRef.current = anim;
    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        width: '120%',
        height: '120%',
        display: 'block',
      }}
    />
  );
};

export const InstructionsView: FunctionComponent<InstructionsViewProps> = ({
  themeColor,
  hideAttribution,
  isReady = true,
  onContinue,
  onBack,
}) => {
  // Defensive scroll reset: ensures the instructions screen always starts
  // at the top, even if the parent page was scrolled by a previous view.
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="enhanced-instructions">
      {onBack && (
        <button
          type="button"
          className="back-button"
          aria-label={t('selfie.ess.back')}
          onClick={onBack}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      )}

      <h1 className="instructions-title">
        {t('selfie.ess.instructions.titlePrefix')}{' '}
        <span style={{ color: themeColor }}>
          {t('selfie.ess.instructions.titleAccent')}
        </span>
      </h1>

      <div className="hero-oval">
        <HeroAnimation />
      </div>

      <div className="guidelines-header">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={themeColor}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <span>{t('selfie.ess.instructions.guidelinesHeader')}</span>
      </div>

      <div className="guidelines-grid">
        {GUIDELINES.map((g) => {
          const Illustration = ILLUSTRATION_COMPONENTS[g.illustration];
          return (
            <div className="guideline-tile" key={g.label}>
              <div className="tile-illustration">
                <div className="tile-svg">
                  <Illustration themeColor={themeColor} />
                </div>
                <span
                  className={`tile-badge ${g.status === 'good' ? 'badge-good' : 'badge-bad'}`}
                  aria-hidden="true"
                >
                  {g.status === 'good' ? '✓' : '✕'}
                </span>
              </div>
              {/* Label sits below the artwork in HTML so it can be themed and translated. */}
              <span className="tile-label" style={{ color: themeColor }}>
                {t(g.label)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="instructions-footer">
        <button
          type="button"
          className="continue-button"
          style={{ background: themeColor, opacity: isReady ? 1 : 0.85 }}
          onClick={onContinue}
          disabled={!isReady}
          aria-busy={!isReady}
        >
          {isReady ? (
            t('selfie.ess.instructions.continue')
          ) : (
            <span className="continue-loading">
              <IconLoader2 size={20} stroke={2.5} color="white" />
              <span>{t('selfie.ess.instructions.settingUpCamera')}</span>
            </span>
          )}
        </button>
      </div>

      {!hideAttribution && (
        // @ts-expect-error preact-custom-element types
        <powered-by-smile-id />
      )}

      <style>{`
      :host { display: block; height: 100%; }
      .enhanced-instructions {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        overflow: hidden;
        padding: clamp(1.5rem, 3.5dvh, 2.25rem) clamp(0.75rem, 4vw, 1rem) 0;
        font-family: "DM Sans", system-ui, sans-serif;
        background: #F5F7FA;
        box-sizing: border-box;
      }
      .back-button {
        position: absolute;
        top: 2rem;
        left: 1rem;
        background: #1f1f1f;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .instructions-title {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: clamp(18px, 3dvh, 24px);
        font-style: normal;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: -0.6px;
        margin: clamp(0.25rem, 0.8dvh, 0.5rem) 0 clamp(0.15rem, 0.5dvh, 0.25rem);
        align-self: stretch;
        text-align: left;
        color: #0F172B;
        flex-shrink: 0;
      }
      /* Back button (absolute, top:1rem, 36px tall) ends at ~52px. The title
         starts after the container's top padding plus this margin, leaving
         roughly a 24px gap between the button's bottom edge and the title. */
      .back-button + .instructions-title {
        margin-top: 4rem;
      }
      .hero-oval {
        width: clamp(135px, 22dvh, 195px);
        height: clamp(160px, 26dvh, 230px);
        max-width: 100%;
        margin: clamp(0.5rem, 1.5dvh, 1rem) 0 0;
        border: 2px solid #C4C4C4;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F5F7FA;
        flex-shrink: 0;
      }
      .guidelines-header {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        align-self: flex-start;
        color: #0F172B;
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: clamp(10px, 1.4dvh, 11px);
        font-style: normal;
        font-weight: 700;
        line-height: 1.5;
        letter-spacing: 0.55px;
        text-transform: uppercase;
        margin: clamp(0.75rem, 2dvh, 1.25rem) 0 clamp(0.4rem, 1dvh, 0.75rem);
        flex-shrink: 0;
      }
      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: clamp(12px, 4vw, 44px);
        width: 100%;
        flex-shrink: 0;
      }
      .guideline-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .tile-illustration {
        position: relative;
        width: 100%;
        aspect-ratio: 47 / 79;
      }
      .tile-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .tile-svg svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .tile-label {
        margin-top: 0.5rem;
        text-align: center;
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        line-height: 10px;
        letter-spacing: 0.117px;
      }
      .tile-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: 700;
      }
      .badge-good { background: #1DB954; }
      .badge-bad  { background: #E5484D; }
      .instructions-footer {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        margin-top: clamp(16px, 3dvh, 28px);
        flex-shrink: 0;
      }
      .enhanced-instructions > powered-by-smile-id {
        display: block;
        width: 100%;
        margin-top: 0;
        padding: clamp(0.4rem, 1dvh, 0.6rem) 0;
        background: #F5F7FA;
        flex-shrink: 0;
      }
      .continue-button {
        width: 100%;
        padding: clamp(0.65rem, 1.6dvh, 1rem) 2rem;
        color: white;
        border: none;
        border-radius: 2.5rem;
        font-size: clamp(0.95rem, 1.8dvh, 1.05rem);
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
      .continue-button:disabled { cursor: progress; }
      .continue-loading {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
      }
      .continue-loading svg { animation: ess-instr-spin 1.1s linear infinite; }
      @keyframes ess-instr-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    </div>
  );
};

export default InstructionsView;
