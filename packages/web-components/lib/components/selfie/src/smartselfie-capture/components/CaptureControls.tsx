import type { FunctionComponent } from 'preact';

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
        class="btn-primary"
        onClick={onStartCapture}
        disabled={isCapturing || hasFinishedCapture || !isReadyToCapture}
      >
        Start Capture
      </button>

      {allowAgentMode && (agentSupported || showAgentModeForTests) && (
        <button
          onClick={onSwitchCamera}
          className="agent-mode-btn"
          disabled={isCapturing || hasFinishedCapture}
        >
          {facingMode === 'user' ? 'Agent Mode Off' : 'Agent Mode On'}
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
