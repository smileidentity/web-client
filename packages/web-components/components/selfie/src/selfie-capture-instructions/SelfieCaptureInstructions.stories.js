import './index';

const meta = {
  component: 'selfie-capture-instructions',
};

export default meta;

export const SelfieInstruction = {
  render: () => `
        <selfie-capture-instructions
            show-navigation
            selfie-capture-modes="camera,upload"
        >
        </selfie-capture-instructions>
    `,
};
