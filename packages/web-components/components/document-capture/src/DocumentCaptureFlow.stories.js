import './index';

const meta = {
  component: 'document-capture-flow',
};

export default meta;

export const DocumentCapture = {
  render: () => `
        <document-capture-flow>
        </document-capture-flow>
    `,
};

export const DocumentCaptureHiddenInstructions = {
  render: () => `
        <document-capture-flow hide-instructions>
        </document-capture-flow>
    `,
};

export const DocumentCaptureHideBackOfId = {
  render: () => `
        <document-capture-flow
            hide-back-of-id
        >
        </document-capture-flow>
    `,
};

export const DocumentCaptureAllowAttributes = {
  render: () => `
        <document-capture-flow document-capture-flow-modes='camera,upload'>
        </document-capture-flow>
    `,
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: () => `
        <document-capture-flow hide-back-of-id hide-instructions>
        </document-capture-flow>
    `,
};
