import './SelfieCaptureScreens';

const meta = {
  component: 'selfie-capture-screens',
};

export default meta;

export const SelfieCaptureFlow = {
  render: () => `
        <selfie-capture-screens>
        </selfie-capture-screens>
    `,
};

export const SelfieCaptureFlowHiddenInstructions = {
  render: () => `
        <selfie-capture-screens hide-instructions >
        </selfie-capture-screens>
    `,
};
