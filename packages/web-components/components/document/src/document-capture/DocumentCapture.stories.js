import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import './index';

const meta = {
  component: 'document-capture',
  render: () => `
    <document-capture
        show-navigation
        document-capture-modes="camera,upload"
    >
    </document-capture>
`,
};

export default meta;

export const DocumentCapturePendingPermission = {
  loaders: [
    async () => ({
      'data-camera-ready': SmartCamera.stopMedia(),
    }),
  ],
};
export const DocumentCapture = {
  loaders: [
    async () => ({
      'data-camera-ready': await SmartCamera.getMedia({
        audio: false,
        video: SmartCamera.environmentOptions,
      }),
    }),
  ],
};
