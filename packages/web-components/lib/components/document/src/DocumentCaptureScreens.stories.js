import './index';
import { setCurrentLocale } from '../../../domain/localisation';

const meta = {
  args: {
    'hide-attribution': false,
    'theme-color': '#001096',
    language: 'en',
  },
  argTypes: {
    'hide-attribution': { control: 'boolean' },
    'theme-color': { control: 'color' },
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
  },
  component: 'document-capture-screens',
};

export default meta;

export const DocumentCapture = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </document-capture-screens>
    `;
  },
};

export const DocumentCaptureHiddenInstructions = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens hide-instructions theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </document-capture-screens>
    `;
  },
};

export const DocumentCaptureHideBackOfId = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens hide-back-of-id theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </document-capture-screens>
    `;
  },
};

export const DocumentCaptureAllowAttributes = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens document-capture-screens-modes='camera,upload' theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </document-capture-screens>
    `;
  },
};

export const DocumentCaptureHideInstructionNBackOfId = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens hide-back-of-id hide-instructions theme-color='${args['theme-color']}' ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </document-capture-screens>
    `;
  },
};

export const DocumentCapturePortraitMode = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-screens hide-back-of-id hide-instructions document-type="GREEN_BOOK">
        </document-capture-screens>
    `;
  },
};
