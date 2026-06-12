import { setCurrentLocale } from '../../../../domain/localisation';
import './index.ts';

const meta = {
  args: {
    'auto-capture': 'autoCapture',
    'auto-capture-timeout': 10000,
    'document-type': 'id-card',
    language: 'en',
    'side-of-id': 'Front',
    'theme-color': '#001096',
    title: 'Submit Front of ID',
  },
  argTypes: {
    'auto-capture': {
      control: { type: 'select' },
      options: ['autoCapture', 'autoCaptureOnly', 'manualCaptureOnly'],
    },
    'auto-capture-timeout': { control: { type: 'number' } },
    'document-type': {
      control: { type: 'select' },
      options: ['id-card', 'passport', 'greenbook'],
    },
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
    'side-of-id': {
      control: { type: 'select' },
      options: ['Front', 'Back'],
    },
    'theme-color': { control: 'color' },
    title: { control: 'text' },
  },
  component: 'document-auto-capture',
  render: (args) => {
    setCurrentLocale(args.language);
    return `
    <document-auto-capture
        show-navigation
        document-type="${args['document-type']}"
      auto-capture="${args['auto-capture']}"
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
    'auto-capture': 'manualCaptureOnly',
  },
};
