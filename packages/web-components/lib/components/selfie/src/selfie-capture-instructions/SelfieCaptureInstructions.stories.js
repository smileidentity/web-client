import { setCurrentLocale } from '../../../../domain/localisation';
import './index';

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
  component: 'selfie-capture-instructions',
};

export default meta;

export const SelfieInstruction = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture-instructions
            show-navigation
            theme-color='${args['theme-color']}'
        >
        </selfie-capture-instructions>
    `;
  },
};
