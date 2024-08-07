import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import './SelfieCapture';

const meta = {
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture',
};

export default meta;

export const SelfieCapture = {
  args: {
    'theme-color': '#001096',
  },
  loaders: [
    async () => ({
      permissionGranted: await SmartCamera.getMedia({
        audio: false,
        video: true,
      }),
    }),
  ],
  render: (args) => `
        <selfie-capture theme-color='${args['theme-color']}'>
        </selfie-capture>
    `,
};
