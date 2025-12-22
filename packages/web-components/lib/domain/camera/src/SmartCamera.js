import { t } from '../../localisation';

class SmartCamera {
  static stream = null;

  static async getMedia(constraints) {
    SmartCamera.stream = await navigator.mediaDevices.getUserMedia(constraints);
    return SmartCamera.stream;
  }

  static environmentOptions = {
    facingMode: 'environment',
    height: {
      ideal: 1080,
      max: 1440,
      min: 720,
    },
    width: {
      ideal: 1920,
      max: 2560,
      min: 1280,
    },
    // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
    // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
    // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
    zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
  };

  static stopMedia() {
    if (SmartCamera.stream) {
      SmartCamera.stream.getTracks().forEach((track) => track.stop());
      SmartCamera.stream = null;
    }
  }

  static async supportsAgentMode() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );

      let hasBackCamera = false;

      videoDevices.forEach((device) => {
        // Check if the device label or device ID indicates a back camera
        if (
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        ) {
          hasBackCamera = true;
          return true;
        }
        return false;
      });

      return hasBackCamera;
    } catch (error) {
      console.warn('Error accessing media devices: ', error);
      return false;
    }
  }

  static isSamsungMultiCameraDevice() {
    const matchedModelNumber = navigator.userAgent.match(/SM-[N|G]\d{3}/);
    if (!matchedModelNumber) {
      return false;
    }

    const modelNumber = parseInt(matchedModelNumber[0].match(/\d{3}/)[0], 10);
    const smallerModelNumber = 970; // S10e
    return !Number.isNaN(modelNumber) && modelNumber >= smallerModelNumber;
  }

  static handleCameraError(e) {
    switch (e.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return t('camera.error.notAllowed');
      case 'AbortError':
        return t('camera.error.abort');
      case 'NotReadableError':
        return t('camera.error.notReadable');
      case 'NotFoundError':
        return t('camera.error.notFound');
      case 'TypeError':
        return t('camera.error.insecure');
      default:
        return e.message;
    }
  }
}

export default SmartCamera;
