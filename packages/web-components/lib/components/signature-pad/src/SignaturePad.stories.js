import './SignaturePad';
import { setCurrentLocale } from '../../../domain/localisation';

const meta = {
  args: {
    'theme-color': '#001096',
    language: 'en',
  },
  argTypes: {
    'theme-color': { control: 'color' },
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
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
