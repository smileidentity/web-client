import type { FunctionComponent } from 'preact';

interface AlertDisplayProps {
  alertTitle: string;
}

export const AlertDisplay: FunctionComponent<AlertDisplayProps> = ({
  alertTitle,
}) => (
  alertTitle ? (
    <>
      <div className="alert-message">
        <div className="alert-title">{alertTitle}</div>
      </div>
      
      <style>{`
        .alert-message {
          margin-top: 1.5rem;
          color: #000;
          padding: 0.5rem 1.5rem;
          background: #e5e5e5;
          border: 1px solid #848282;
          border-radius: 4px;
          text-align: start;
          width: 100%;
        }

        .alert-title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }
      `}</style>
    </>
  ) : null
);
