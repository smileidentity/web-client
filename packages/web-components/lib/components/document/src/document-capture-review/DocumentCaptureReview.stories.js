import './index';
import { setCurrentLocale } from '../../../../domain/localisation';

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
  component: 'document-capture-review',
};

export default meta;

export const IdReview = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-review
          show-navigation
          data-image="https://placehold.co/600x400"
          theme-color='${args['theme-color']}'
        >
        </document-capture-review>
    `;
  },
};
