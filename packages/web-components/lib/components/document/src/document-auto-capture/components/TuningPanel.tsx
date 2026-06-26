import { useState } from 'preact/hooks';
import type { FunctionComponent } from 'preact';

interface TuningSettings {
  deviceType: string;
  cropToCard: boolean;
  cropPadding: number;
  useDynamicBorder: boolean;
  edgeDensityThreshold: number;
  gridCellRatio: number;
  blurThreshold: number;
  glareThreshold: number;
  stabilityThreshold: number;
  cropToContour?: boolean;
  previewCropPadding?: number;
  minFillPercent?: number;
  maxFillPercent?: number;
  autoCannySigma?: number;
  chromaEdgeFusion?: boolean;
  chromaCannyLow?: number;
  chromaCannyHigh?: number;
  mobileRegionFallback?: boolean;
  idAspectTolerance?: number;
  bookDocAspectTolerance?: number;
  minFillRatio?: number;
  chromaContentGate?: boolean;
  minChromaContent?: number;
  seamRejectEnabled?: boolean;
  houghThreshold?: number;
  houghMinLengthRatio?: number;
  houghMaxLineGap?: number;
  [key: string]: unknown;
}

interface TuningDebugInfo {
  edgeDensity?: number | string;
  texture?: number | string;
  quadrants?: string;
  blur?: number;
  glare?: number | string;
  docFill?: number | string;
  canny?: string;
  contourSource?: string;
  aspect?: number | string;
  chroma?: number | string;
  quality?: number | string;
  houghLines?: number | string;
  seamRejected?: boolean | string;
  cvError?: string;
  cvErrors?: number | string;
  cvRecovery?: string;
  chromaError?: string;
  chromaStatus?: string;
  [key: string]: unknown;
}

interface TuningPanelProps {
  settings: TuningSettings;
  updateSetting: (key: string, value: unknown) => void;
  debugInfo?: TuningDebugInfo | null;
}

export const TuningPanel: FunctionComponent<TuningPanelProps> = ({
  settings,
  updateSetting,
  debugInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Default is minimized for UX, expand for dev

  if (!isOpen) {
    return (
      <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 99 }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            padding: '8px 12px',
            borderRadius: '4px',
          }}
        >
          ⚙️ Settings
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(20,20,20,0.95)',
        padding: '20px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderTop: '1px solid #444',
        maxHeight: '40vh',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0, color: '#aaa' }}>
          Live Tuning
          <span
            style={{
              marginLeft: '10px',
              fontSize: '0.7rem',
              color: '#0f0',
              border: '1px solid #0f0',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {settings.deviceType}
          </span>
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '1.2rem',
          }}
        >
          ×
        </button>
      </div>

      {/* Live Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '0.8rem',
          color: '#888',
        }}
      >
        <div>
          Edge Density:{' '}
          <span style={{ color: '#fff' }}>
            {debugInfo?.edgeDensity ?? '0'}%
          </span>
        </div>
        <div>
          Texture:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.texture ?? '0'}</span>
        </div>
        <div>
          Doc Fill:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.docFill ?? '-'}%</span>
        </div>
        <div>
          Blur Variance:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.blur || 0}</span>
        </div>
        <div>
          Glare %:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.glare || 0}%</span>
        </div>
        <div>
          Canny (lo/hi):{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.canny ?? '—'}</span>
        </div>
        <div>
          Edge Src:{' '}
          <span style={{ color: '#fff' }}>
            {debugInfo?.contourSource ?? '—'}
          </span>
        </div>
        <div>
          Aspect:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.aspect ?? '—'}</span>
        </div>
        <div>
          Chroma:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.chroma ?? '—'}</span>
        </div>
        <div>
          Chroma Status:{' '}
          <span style={{ color: '#fff' }}>
            {debugInfo?.chromaStatus ?? '—'}
          </span>
        </div>
        <div>
          Quality:{' '}
          <span style={{ color: '#0f0' }}>{debugInfo?.quality ?? '—'}</span>
        </div>
        <div>
          Hough Lines:{' '}
          <span style={{ color: '#fff' }}>{debugInfo?.houghLines ?? '—'}</span>
        </div>
        <div>
          Seam Rejected:{' '}
          <span style={{ color: debugInfo?.seamRejected ? '#f55' : '#fff' }}>
            {debugInfo?.seamRejected == null
              ? '—'
              : String(debugInfo.seamRejected)}
          </span>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          Grid 3×3:{' '}
          <span style={{ color: '#fff', fontSize: '0.7rem' }}>
            {debugInfo?.quadrants ?? '-'}
          </span>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          CV Errors:{' '}
          <span style={{ color: '#fbb', fontSize: '0.7rem' }}>
            {debugInfo?.cvErrors ?? 0}
            {debugInfo?.cvRecovery ? ` (${debugInfo.cvRecovery})` : ''}
          </span>
        </div>
        {debugInfo?.cvError && (
          <div style={{ gridColumn: '1 / -1' }}>
            CV Error:{' '}
            <span
              style={{ color: '#f88', fontSize: '0.7rem', wordBreak: 'break-word' }}
            >
              {debugInfo.cvError}
            </span>
          </div>
        )}
        {debugInfo?.chromaError && (
          <div style={{ gridColumn: '1 / -1' }}>
            Chroma Error:{' '}
            <span
              style={{ color: '#f88', fontSize: '0.7rem', wordBreak: 'break-word' }}
            >
              {debugInfo.chromaError}
            </span>
          </div>
        )}
      </div>

      <hr style={{ borderColor: '#333', margin: '5px 0' }} />

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Crop to Card
        <input
          type="checkbox"
          checked={settings.cropToCard}
          onInput={(e) => updateSetting('cropToCard', e.target.checked)}
        />
      </label>

      {settings.cropToCard && (
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Crop Padding: {settings.cropPadding}%</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={settings.cropPadding}
            onInput={(e) =>
              updateSetting('cropPadding', Number(e.target.value))
            }
          />
        </label>
      )}

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Dynamic Border Detection
        <input
          type="checkbox"
          checked={settings.useDynamicBorder}
          onInput={(e) => updateSetting('useDynamicBorder', e.target.checked)}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Doc Presence (Edge %): {settings.edgeDensityThreshold}{' '}
          <em>(Lower = easier to pass)</em>
        </span>
        <input
          type="range"
          min="1"
          max="15"
          step="0.1"
          value={settings.edgeDensityThreshold}
          onInput={(e) =>
            updateSetting('edgeDensityThreshold', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Grid Cell Ratio: {settings.gridCellRatio}{' '}
          <em>(Higher = stricter occlusion check)</em>
        </span>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.gridCellRatio}
          onInput={(e) =>
            updateSetting('gridCellRatio', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Edge Sensitivity (σ): {settings.autoCannySigma}{' '}
          <em>(Lower = detect fainter borders on plain backgrounds)</em>
        </span>
        <input
          type="range"
          min="0"
          max="3"
          step="0.05"
          value={settings.autoCannySigma}
          onInput={(e) =>
            updateSetting('autoCannySigma', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          ID Aspect Tol: {settings.idAspectTolerance}{' '}
          <em>(Lower = stricter; rejects screens/odd rectangles)</em>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.35"
          step="0.01"
          value={settings.idAspectTolerance as number}
          onInput={(e) =>
            updateSetting('idAspectTolerance', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Book-Doc Aspect Tol: {settings.bookDocAspectTolerance}{' '}
          <em>(Passport/greenbook; lower rejects ID cards/screens)</em>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.35"
          step="0.01"
          value={settings.bookDocAspectTolerance as number}
          onInput={(e) =>
            updateSetting('bookDocAspectTolerance', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Min Fill Ratio: {settings.minFillRatio}{' '}
          <em>(Higher = stricter rectangularity)</em>
        </span>
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.01"
          value={settings.minFillRatio as number}
          onInput={(e) => updateSetting('minFillRatio', Number(e.target.value))}
        />
      </label>

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Chroma Edge Fusion
        <input
          type="checkbox"
          checked={Boolean(settings.chromaEdgeFusion)}
          onInput={(e) => updateSetting('chromaEdgeFusion', e.target.checked)}
        />
      </label>

      {Boolean(settings.chromaEdgeFusion) && (
        <>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Chroma Canny Low: {settings.chromaCannyLow}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.chromaCannyLow as number}
              onInput={(e) =>
                updateSetting('chromaCannyLow', Number(e.target.value))
              }
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Chroma Canny High: {settings.chromaCannyHigh}</span>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={settings.chromaCannyHigh as number}
              onInput={(e) =>
                updateSetting('chromaCannyHigh', Number(e.target.value))
              }
            />
          </label>
        </>
      )}

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Mobile Region Fallback
        <input
          type="checkbox"
          checked={Boolean(settings.mobileRegionFallback)}
          onInput={(e) =>
            updateSetting('mobileRegionFallback', e.target.checked)
          }
        />
      </label>

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Chroma Content Gate
        <input
          type="checkbox"
          checked={Boolean(settings.chromaContentGate)}
          onInput={(e) => updateSetting('chromaContentGate', e.target.checked)}
        />
      </label>

      {Boolean(settings.chromaContentGate) && (
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>
            Min Chroma Content: {settings.minChromaContent}{' '}
            <em>(Higher = reject more monochrome objects, e.g. keyboards)</em>
          </span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={settings.minChromaContent as number}
            onInput={(e) =>
              updateSetting('minChromaContent', Number(e.target.value))
            }
          />
        </label>
      )}

      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
        Seam Rejection{' '}
        <em>(reject quads framed by straight lines, e.g. parquet)</em>
        <input
          type="checkbox"
          checked={Boolean(settings.seamRejectEnabled)}
          onInput={(e) => updateSetting('seamRejectEnabled', e.target.checked)}
        />
      </label>

      {Boolean(settings.seamRejectEnabled) && (
        <>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>
              Hough Threshold: {settings.houghThreshold}{' '}
              <em>(Higher = only stronger straight lines count)</em>
            </span>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={settings.houghThreshold as number}
              onInput={(e) =>
                updateSetting('houghThreshold', Number(e.target.value))
              }
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>
              Hough Min Length Ratio: {settings.houghMinLengthRatio}{' '}
              <em>(min line length as fraction of ROI short side)</em>
            </span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.houghMinLengthRatio as number}
              onInput={(e) =>
                updateSetting('houghMinLengthRatio', Number(e.target.value))
              }
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Hough Max Line Gap: {settings.houghMaxLineGap}</span>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={settings.houghMaxLineGap as number}
              onInput={(e) =>
                updateSetting('houghMaxLineGap', Number(e.target.value))
              }
            />
          </label>
        </>
      )}

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Sharpness Threshold: {settings.blurThreshold}</span>
        <input
          type="range"
          min="10"
          max="300"
          value={settings.blurThreshold}
          onInput={(e) =>
            updateSetting('blurThreshold', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Glare Limit (%): {settings.glareThreshold}</span>
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.1"
          value={settings.glareThreshold}
          onInput={(e) =>
            updateSetting('glareThreshold', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Stability Frames: {settings.stabilityThreshold}</span>
        <input
          type="range"
          min="2"
          max="30"
          value={settings.stabilityThreshold}
          onInput={(e) =>
            updateSetting('stabilityThreshold', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Min Fill (%): {settings.minFillPercent}</span>
        <input
          type="range"
          min="20"
          max="95"
          step="1"
          value={settings.minFillPercent}
          onInput={(e) =>
            updateSetting('minFillPercent', Number(e.target.value))
          }
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Max Fill (%): {settings.maxFillPercent}</span>
        <input
          type="range"
          min="50"
          max="100"
          step="1"
          value={settings.maxFillPercent}
          onInput={(e) =>
            updateSetting('maxFillPercent', Number(e.target.value))
          }
        />
      </label>
    </div>
  );
};
