import './index';
import { setCurrentLocale } from '../../../../domain/localisation';

const meta = {
  args: {
    language: 'en',
    title: '',
    'side-of-id': 'front',
    'document-capture-modes': 'camera,upload',
    'hide-attribution': false,
    'hide-back-to-host': false,
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
    'side-of-id': {
      control: { type: 'select' },
      options: ['front', 'back'],
    },
    'document-capture-modes': {
      control: { type: 'select' },
      options: ['camera', 'upload', 'camera,upload'],
    },
    'hide-attribution': { control: 'boolean' },
    'hide-back-to-host': { control: 'boolean' },
  },
  component: 'document-capture-instructions',
};

export default meta;

const renderElement = (args) => {
  setCurrentLocale(args.language);
  return `
    <document-capture-instructions
      ${args.title ? `title="${args.title}"` : ''}
      side-of-id="${args['side-of-id']}"
      document-capture-modes="${args['document-capture-modes']}"
      ${args['hide-attribution'] ? 'hide-attribution' : ''}
      ${args['hide-back-to-host'] ? 'hide-back-to-host' : ''}
    ></document-capture-instructions>
  `;
};

export const DocumentInstruction = {
  render: renderElement,
};

export const BackOfId = {
  args: { 'side-of-id': 'back' },
  render: renderElement,
};

export const NoBack = {
  args: { 'hide-back-to-host': true },
  render: renderElement,
};

export const NoAttribution = {
  args: { 'hide-attribution': true },
  render: renderElement,
};

export const CameraOnly = {
  args: { 'document-capture-modes': 'camera' },
  render: renderElement,
};

export const UploadOnly = {
  args: { 'document-capture-modes': 'upload' },
  render: renderElement,
};

export const Desktop = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
  render: renderElement,
};

export const Arabic = {
  args: { language: 'ar' },
  render: (args) => {
    setCurrentLocale(args.language);
    return `
      <document-capture-instructions
        dir="rtl"
        side-of-id="${args['side-of-id']}"
        document-capture-modes="${args['document-capture-modes']}"
        ${args['hide-attribution'] ? 'hide-attribution' : ''}
        ${args['hide-back-to-host'] ? 'hide-back-to-host' : ''}
      ></document-capture-instructions>
    `;
  },
};
