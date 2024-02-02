import SmartCamera from '@smileid/camera';
import './SelfieCapture';

const meta = {
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
  render: () => `
        <selfie-capture>
        </selfie-capture>
    `,
};
