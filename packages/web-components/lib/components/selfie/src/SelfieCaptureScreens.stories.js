import { setCurrentLocale } from '../../../domain/localisation';
import './SelfieCaptureScreens';

const meta = {
  args: {
    'hide-attribution': false,
    language: 'en',
    'theme-color': '#001096',
  },
  argTypes: {
    'hide-attribution': { control: 'boolean' },
    language: {
      control: 'select',
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture-screens',
};

export default meta;

export const SelfieCaptureFlow = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture-screens theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </selfie-capture-screens>
    `;
  },
};

export const SelfieCaptureFlowHiddenInstructions = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture-screens hide-instructions theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </selfie-capture-screens>
    `;
  },
};
