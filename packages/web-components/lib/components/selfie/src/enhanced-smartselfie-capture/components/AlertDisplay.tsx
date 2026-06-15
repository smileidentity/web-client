import type { FunctionComponent } from 'preact';

interface AlertDisplayProps {
  alertTitle: string;
  themeColor?: string;
}

export const AlertDisplay: FunctionComponent<AlertDisplayProps> = ({
  alertTitle,
  themeColor = '#151F72',
}) =>
  alertTitle ? (
    <>
      <div className="alert-message">
        <div className="alert-title" style={{ color: themeColor }}>
          {alertTitle}
        </div>
      </div>

      <style>{`
        .alert-message {
          margin-top: clamp(12px, 2.5dvh, 24px);
          padding: 0 16px;
          text-align: center;
          width: 100%;
        }

        .alert-title {
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 14px;
          font-style: normal;
          font-weight: 700;
          line-height: 20px;
          text-align: center;
        }
      `}</style>
    </>
  ) : null;
