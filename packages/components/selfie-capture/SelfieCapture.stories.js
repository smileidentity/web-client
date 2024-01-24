import SmartCamera from '../domain/camera/SmartCamera';
import './SelfieCapture';

const meta = {
  component: 'selfie-capture',
};

export default meta;

export const SelfieCapture = {
  loaders: [
    async () => ({
      permissionGranted: await SmartCamera.getMedia({ audio: false, video: true }),
    }),
  ],
  render: () => `
        <selfie-capture>
        </selfie-capture>
    `,
};
