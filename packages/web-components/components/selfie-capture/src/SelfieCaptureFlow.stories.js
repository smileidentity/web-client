import './SelfieCaptureFlow';

const meta = {
  component: 'selfie-capture-flow',
};

export default meta;

export const SelfieCaptureFlow = {
  render: () => `
        <selfie-capture-flow>
        </selfie-capture-flow>
    `,
};

export const SelfieCaptureFlowHiddenInstructions = {
  render: () => `
        <selfie-capture-flow hide-instructions >
        </selfie-capture-flow>
    `,
};
