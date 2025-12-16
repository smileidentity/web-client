import './SignaturePad';
import { setCurrentLocale } from "@smileid/web-components/lib/domain/localisation/localisation";

const meta = {
  args: {
    language: 'en',
    'theme-color': '#001096',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'smileid-signature-pad',
};

export default meta;

export const SignaturePad = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <smileid-signature-pad
        theme-color='${args['theme-color']}'
        >
        </smileid-signature-pad>
    `;
  },
};

export const SignaturePadWithUploads = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <smileid-signature-pad
          allow-upload
          theme-color='${args['theme-color']}'
        >
        </smileid-signature-pad>
    `;
  },
};
