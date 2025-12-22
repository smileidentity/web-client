import { setCurrentLocale } from '../../../../domain/localisation';
import './SelfieCaptureReview';

const meta = {
  args: {
    language: 'en',
    'theme-color': '#001096',
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture-review',
};

export default meta;

export const SelfieCaptureReview = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture-review
            show-navigation
            data-image="https://placehold.co/600x400"
            theme-color='${args['theme-color']}'
        >
        </selfie-capture-review>
    `;
  },
};
