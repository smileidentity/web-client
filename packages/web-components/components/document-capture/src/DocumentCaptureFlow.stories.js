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
<<<<<<<< HEAD:packages/web-components/components/document-capture/src/DocumentCaptureFlow.stories.js
        <document-capture-flow document-capture-flow-modes='camera,upload'>
========
        <document-capture-flow document-capture-modes='camera,upload'>
>>>>>>>> f9f5b59 (revert unintended changes):packages/web-components/components/document-capture/src/DocumentCaptureFlow.js.stories.js
        </document-capture-flow>
    `,
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: () => `
        <document-capture-flow hide-back-of-id hide-instructions>
        </document-capture-flow>
    `,
};
