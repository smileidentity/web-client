import './SelfieCaptureScreens';

const meta = {
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture-screens',
};

export default meta;

export const SelfieCaptureFlow = {
  args: {
    'theme-color': '#d72c2c',
  },
  render: (args) => `
        <selfie-capture-screens theme-color='${args['theme-color']}'>
        </selfie-capture-screens>
    `,
};

export const SelfieCaptureFlowHiddenInstructions = {
  args: {
    'theme-color': '#d72c2c',
  },
  render: (args) => `
        <selfie-capture-screens hide-instructions theme-color='${args['theme-color']}'>
        </selfie-capture-screens>
    `,
};
