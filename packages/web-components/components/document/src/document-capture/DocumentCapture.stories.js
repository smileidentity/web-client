import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import './index';

const meta = {
  component: 'document-capture',
  render: () => `
    <document-capture
        show-navigation
        document-capture-modes="camera,upload"
        title="Driver's License"
        side-of-id="Front"
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
    async () => {
      console.warn('attemp to get media');
      try {
        const result = await SmartCamera.getMedia({
          audio: false,
          video: SmartCamera.environmentOptions,
        });
        return {
          'data-camera-ready': result,
        };
      } catch (error) {
        console.error(error);
        return {
          'data-camera-error': SmartCamera.handleCameraError(error),
        };
      }
    },
  ],
};
