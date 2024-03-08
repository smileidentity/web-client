import './index';

const meta = {
  component: 'selfie-capture-instruction',
};

export default meta;

export const SelfieInstruction = {
  render: () => `
        <selfie-capture-instruction
            show-navigation
            selfie-capture-modes="camera,upload"
        >
        </selfie-capture-instruction>
    `,
};
