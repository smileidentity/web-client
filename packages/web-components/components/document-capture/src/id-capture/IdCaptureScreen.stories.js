import SmartCamera from '../../../domain/camera/src/SmartCamera';
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
        video: {
          facingMode: 'environment',
          width: { min: 1280 },
          // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
          // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
          // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
          zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
        },
      }),
    }),
  ],
};
