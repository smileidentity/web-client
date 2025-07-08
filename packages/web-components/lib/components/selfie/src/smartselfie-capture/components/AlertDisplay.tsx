import type { FunctionComponent } from 'preact';

interface AlertDisplayProps {
  alertTitle: string;
}

export const AlertDisplay: FunctionComponent<AlertDisplayProps> = ({
  alertTitle,
}) =>
  alertTitle ? (
    <>
      <div className="alert-message">
        <div className="alert-title">{alertTitle}</div>
      </div>

      <style>{`
        .alert-message {
          margin-top: 1.5rem;
          color: #000;
          color: #151F72;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          text-align: start;
          width: 100%;
        }

        .alert-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }
      `}</style>
    </>
  ) : null;
