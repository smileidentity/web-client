import './EndUserConsent';

const meta = {
  component: 'end-user-consent',
};

export default meta;

export const EndUserConsent = {
  render: () => `
        <end-user-consent
            country="NG"
            id-type="NATIONAL_ID"
            id-type-label="National ID"
            partner-id="007"
            partner-name="SmileID Stories"
            policy-url="https://usesmileid.com/privacy-policy"
            theme-color="#001096"
            partner-logo="https://portal.smileidentity.com/favicon.ico"
        >
        </end-user-consent>
    `,
};
