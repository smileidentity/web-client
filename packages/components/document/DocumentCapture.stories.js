import './index';

const meta = {
  component: 'document-capture',
};

export default meta;

export const DocumentCapture = {
  render: () => `
        <document-capture>
        </document-capture>
    `,
};

export const DocumentCaptureHiddenInstructions = {
  render: () => `
        <document-capture hide-instructions>
        </document-capture>
    `,
};

export const DocumentCaptureHideBackOfId = {
  render: () => `
        <document-capture
            hide-back-of-id
        >
        </document-capture>
    `,
};

export const DocumentCaptureAllowAttributes = {
  render: () => `
        <document-capture document-capture-modes='camera,upload'>
        </document-capture>
    `,
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: () => `
        <document-capture hide-back-of-id hide-instructions>
        </document-capture>
    `,
};
