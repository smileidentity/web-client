import './SelfieCaptureFlow';

const meta = {
  component: 'selfie-capture-flow',
};

export default meta;

export const LivenessCapture = {
  render: () => `
        <selfie-capture-flow>
        </selfie-capture-flow>
    `,
};

export const LivenessCaptureHiddenInstructions = {
  render: () => `
        <selfie-capture-flow hide-instructions >
        </selfie-capture-flow>
    `,
};
