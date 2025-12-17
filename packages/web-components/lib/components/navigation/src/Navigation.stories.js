import './Navigation';
import { setCurrentLocale } from '../../../domain/localisation';

const meta = {
  args: {
    language: 'en',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
  },
  component: 'smileid-navigation',
};

export default meta;

export const Navigation = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <smileid-navigation
        >
        </smileid-navigation>
    `;
  },
};

export const NavigationWithBackHidden = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <smileid-navigation
          hide-back
        >
        </smileid-navigation>
    `;
  },
};
