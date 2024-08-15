import './index';

const meta = {
  args: {
    'theme-color': '#001096',
  },
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'document-capture-screens',
};

export default meta;

export const DocumentCapture = {
  render: (args) => `
        <document-capture-screens theme-color='${args['theme-color']}'>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHiddenInstructions = {
  render: (args) => `
        <document-capture-screens hide-instructions theme-color='${args['theme-color']}'>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHideBackOfId = {
  render: (args) => `
        <document-capture-screens hide-back-of-id theme-color='${args['theme-color']}'>
        </document-capture-screens>
    `,
};

export const DocumentCaptureAllowAttributes = {
  render: (args) => `
        <document-capture-screens document-capture-screens-modes='camera,upload' theme-color='${args['theme-color']}'>
        </document-capture-screens>
    `,
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: (args) => `
        <document-capture-screens hide-back-of-id hide-instructions theme-color='${args['theme-color']}'>
        </document-capture-screens>
    `,
};

export const DocumentCapturePortraitMode = {
  render: () => `
        <document-capture-screens hide-back-of-id hide-instructions document-type="GREEN_BOOK">
        </document-capture-screens>
    `,
};
