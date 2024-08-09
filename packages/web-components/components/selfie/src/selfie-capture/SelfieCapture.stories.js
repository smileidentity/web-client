import SmartCamera from '../../../../domain/camera/src/SmartCamera';
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

export const SelfieCaptureAgentMode = {
  render: () => `
        <selfie-capture allow-agent-mode='true' data-camera-ready>
        </selfie-capture>
    `,
};
