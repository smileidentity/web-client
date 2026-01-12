import type { FunctionComponent } from 'preact';
import { t } from '../../../../../domain/localisation';

interface CaptureControlsProps {
  isCapturing: boolean;
  hasFinishedCapture: boolean;
  isReadyToCapture: boolean;
  allowAgentMode: boolean;
  agentSupported: boolean;
  showAgentModeForTests: boolean;
  facingMode: 'user' | 'environment';
  themeColor?: string;
  onStartCapture: () => void;
  onSwitchCamera: () => void;
}

export const CaptureControls: FunctionComponent<CaptureControlsProps> = ({
  isCapturing,
  hasFinishedCapture,
  isReadyToCapture,
  allowAgentMode,
  agentSupported,
  showAgentModeForTests,
  facingMode,
  themeColor = '#001096',
  onStartCapture,
  onSwitchCamera,
}) => (
  <>
    <div className="controls">
      <button
        id="start-image-capture"
        class="btn-primary"
        onClick={onStartCapture}
        disabled={isCapturing || hasFinishedCapture || !isReadyToCapture}
      >
        {t('selfie.capture.button.startCapture')}
      </button>

      {allowAgentMode && (agentSupported || showAgentModeForTests) && (
        <button
          id="switch-camera"
          onClick={onSwitchCamera}
          className="agent-mode-btn"
          disabled={isCapturing || hasFinishedCapture}
        >
          {facingMode === 'user'
            ? t('selfie.capture.agentMode.off')
            : t('selfie.capture.agentMode.on')}
        </button>
      )}
    </div>

    <style>{`
      .controls {
        margin: 1.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        max-width: 356px;
        margin: 0 auto;
      }

      .agent-mode-btn {
        padding: 8px 16px;
        font-size: 14px;
        background: ${themeColor};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .agent-mode-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `}</style>
  </>
);
