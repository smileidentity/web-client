import './SelfieCaptureScreens';

const meta = {
  args: {
    'hide-attribution': false,
    'theme-color': '#001096',
  },
  argTypes: {
    'hide-attribution': { control: 'boolean' },
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture-screens',
};

export default meta;

export const SelfieCaptureFlow = {
  render: (args) => `
        <selfie-capture-screens theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </selfie-capture-screens>
    `,
};

export const SelfieCaptureFlowHiddenInstructions = {
  render: (args) => `
        <selfie-capture-screens hide-instructions theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </selfie-capture-screens>
    `,
};
