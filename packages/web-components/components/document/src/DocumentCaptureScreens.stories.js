import './index';

const meta = {
  component: 'document-capture-screens',
};

export default meta;

export const DocumentCapture = {
  render: () => `
        <document-capture-screens>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHiddenInstructions = {
  render: () => `
        <document-capture-screens hide-instructions>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHideBackOfId = {
  render: () => `
        <document-capture-screens
            hide-back-of-id
        >
        </document-capture-screens>
    `,
};

export const DocumentCaptureAllowAttributes = {
  render: () => `
        <document-capture-screens document-capture-screens-modes='camera,upload'>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: () => `
        <document-capture-screens hide-back-of-id hide-instructions>
        </document-capture-screens>
    `,
};
