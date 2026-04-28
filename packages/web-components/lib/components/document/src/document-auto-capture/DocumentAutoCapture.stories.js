import { setCurrentLocale } from '../../../../domain/localisation';
import './index';

const meta = {
  args: {
    language: 'en',
    'theme-color': '#001096',
    'document-type': 'id-card',
    'capture-mode': 'autoCapture',
    'auto-capture-timeout': 10000,
    'side-of-id': 'Front',
    title: 'Submit Front of ID',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
    'document-type': {
      control: { type: 'select' },
      options: ['id-card', 'passport', 'greenbook'],
    },
    'capture-mode': {
      control: { type: 'select' },
      options: ['autoCapture', 'autoCaptureOnly', 'manualCaptureOnly'],
    },
    'auto-capture-timeout': { control: { type: 'number' } },
    'side-of-id': {
      control: { type: 'select' },
      options: ['Front', 'Back'],
    },
    title: { control: 'text' },
  },
  component: 'document-auto-capture',
  render: (args) => {
    setCurrentLocale(args.language);
    return `
    <document-auto-capture
        show-navigation
        document-type="${args['document-type']}"
        capture-mode="${args['capture-mode']}"
        auto-capture-timeout="${args['auto-capture-timeout']}"
        side-of-id="${args['side-of-id']}"
        theme-color='${args['theme-color']}'
        title='${args.title}'
    >
    </document-auto-capture>
`;
  },
};

export default meta;

export const DocumentAutoCapture = {};

export const Passport = {
  args: {
    'document-type': 'passport',
    title: 'Submit Passport Page',
  },
};

export const Greenbook = {
  args: {
    'document-type': 'greenbook',
    title: 'Submit Greenbook',
  },
};

export const ManualOnly = {
  args: {
    'capture-mode': 'manualCaptureOnly',
  },
};
