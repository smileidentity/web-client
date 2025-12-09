import './EndUserConsent';
import { setCurrentLocale } from '../../../i18n';

const meta = {
  args: {
    'theme-color': '#001096',
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'end-user-consent',
};

export default meta;

export const EndUserConsent = {
  render: (args) => {
    setCurrentLocale(args.language);

    return `
        <end-user-consent
            country="NG"
            id-type="NATIONAL_ID"
            id-type-label="National ID"
            partner-id="007"
            partner-name="SmileID Stories"
            policy-url="https://usesmileid.com/privacy-policy"
            theme-color="${args['theme-color']}"
            partner-logo="https://portal.usesmileid.com/favicon.ico"
        >
        </end-user-consent>
    `;
  },
};
