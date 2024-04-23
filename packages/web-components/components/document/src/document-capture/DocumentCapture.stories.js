import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import './index';

const meta = {
  component: 'document-capture',
  render: ({ documentType }) => `
    <document-capture
        show-navigation
        document-capture-modes="camera,upload"
        document-name="Driver's License"
        side-of-id="Front"
        document-type="${documentType}"
    >
    </document-capture>
`,
};

export default meta;

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

export const DocumentCapturePortraitMode = {
  args: {
    documentType: 'GREEN_BOOK',
  },
  loaders: [
    async () => {
      try {
        const result = await SmartCamera.getMedia({
          audio: false,
          video: SmartCamera.environmentOptions,
        });
        return {
          'data-camera-ready': result,
        };
      } catch (error) {
        return {
          'data-camera-error': SmartCamera.handleCameraError(error),
        };
      }
    },
  ],
};

export const DocumentCapturePendingPermission = {
  loaders: [
    async () => ({
      'data-camera-ready': SmartCamera.stopMedia(),
    }),
  ],
};
