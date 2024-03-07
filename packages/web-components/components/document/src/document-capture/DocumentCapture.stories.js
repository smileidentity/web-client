import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import './index';

const meta = {
  component: 'id-capture',
  render: () => `
    <id-capture
        show-navigation
        document-capture-modes="camera,upload"
    >
    </id-capture>
`,
};

export default meta;

export const IdCaptureScreenPendingPermission = {
  loaders: [
    async () => ({
      'data-camera-ready': SmartCamera.stopMedia(),
    }),
  ],
};
export const IdCaptureScreen = {
  loaders: [
    async () => ({
      'data-camera-ready': await SmartCamera.getMedia({
        audio: false,
        video: SmartCamera.environmentOptions,
      }),
    }),
  ],
};
