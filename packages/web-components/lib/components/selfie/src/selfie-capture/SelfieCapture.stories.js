import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import { setCurrentLocale } from '../../../../domain/localisation';
import './SelfieCapture';

const meta = {
  args: {
    language: 'en',
    'theme-color': '#001096',
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture',
};

export default meta;

export const SelfieCapture = {
  loaders: [
    async () => ({
      permissionGranted: await SmartCamera.getMedia({
        audio: false,
        video: true,
      }),
    }),
  ],
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture theme-color='${args['theme-color']}'>
        </selfie-capture>
    `;
  },
};

export const SelfieCaptureAgentMode = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <selfie-capture allow-agent-mode='true' data-camera-ready show-agent-mode-for-tests>
        </selfie-capture>
    `;
  },
};
