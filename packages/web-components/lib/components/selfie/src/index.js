// Commented out selfie-capture components - replaced with selfie-booth
// import SelfieCaptureScreens from './SelfieCaptureScreens';
// import SelfieCapture from './selfie-capture/SelfieCapture';

import { SelfieBooth, ImageType } from './selfie-booth/index';

// Export SelfieBooth as the default instead of SelfieCaptureScreens
export default SelfieBooth;
export { SelfieBooth, ImageType };

// Commented out legacy exports - functionality now provided by SelfieBooth
// export { SelfieCapture, SelfieCaptureScreens };
