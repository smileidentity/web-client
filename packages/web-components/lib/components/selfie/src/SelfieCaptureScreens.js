import './selfie-capture-instructions';
import './selfie-capture-review';
import './selfie-capture-wrapper/index.ts';
import SmartCamera from '../../../domain/camera/src/SmartCamera';
import styles from '../../../styles/src/styles';
import packageJson from '../../../../package.json';

const COMPONENTS_VERSION = packageJson.version;

const smartCameraWeb = document.querySelector('smart-camera-web');

async function getPermissions(captureScreen, facingMode = 'user') {
  try {
    const stream = await SmartCamera.getMedia({
      audio: false,
      video: { facingMode },
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevice = devices.find(
      (device) =>
        device.kind === 'videoinput' &&
        stream.getVideoTracks()[0].getSettings().deviceId === device.deviceId,
    );
    smartCameraWeb?.dispatchEvent(
      new CustomEvent('metadata.camera-name', {
        detail: { cameraName: videoDevice?.label },
      }),
    );
    captureScreen.removeAttribute('data-camera-error');
    captureScreen.setAttribute('data-camera-ready', true);
  } catch (error) {
    captureScreen.removeAttribute('data-camera-ready');
    captureScreen.setAttribute(
      'data-camera-error',
      SmartCamera.handleCameraError(error),
    );
  }
}

const cropImageFromDataUri = (
  dataUri,
  cropPercentX = 0,
  cropPercentY = 0,
  quality = 0.9,
) =>
  new Promise((resolve, reject) => {
    if (!dataUri || typeof dataUri !== 'string') {
      reject(new Error('Invalid data URI provided'));
      return;
    }

    if (
      cropPercentX < 0 ||
      cropPercentX >= 99 ||
      cropPercentY < 0 ||
      cropPercentY >= 99
    ) {
      reject(new Error('Crop percentages must be between 0 and 99'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const originalWidth = img.width;
        const originalHeight = img.height;
        const cropAmountX = (originalWidth * cropPercentX) / 100;
        const cropAmountY = (originalHeight * cropPercentY) / 100;

        const newWidth = originalWidth - cropAmountX * 2;
        const newHeight = originalHeight - cropAmountY * 2;
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(
          img,
          cropAmountX,
          cropAmountY,
          newWidth,
          newHeight,
          0,
          0,
          newWidth,
          newHeight,
        );

        const croppedDataUri = canvas.toDataURL('image/jpeg', quality);
        resolve(croppedDataUri);
      } catch (error) {
        reject(new Error(`Failed to process image: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image from data URI'));
    };

    img.src = dataUri;
  });

class SelfieCaptureScreens extends HTMLElement {
  constructor() {
    super();
    this.activeScreen = null;
    this._remountKey = 0; // Counter for forcing wrapper remounts
    smartCameraWeb?.dispatchEvent(new CustomEvent('metadata.initialize'));
  }

  connectedCallback() {
    this.innerHTML = `
            ${styles(this.themeColor)}
            <div>
              <selfie-capture-instructions theme-color='${this.themeColor}' ${this.showNavigation} ${this.hideAttribution} ${this.hideBack} hidden></selfie-capture-instructions>
              <selfie-capture-wrapper theme-color='${this.themeColor}' ${this.showNavigation} ${this.allowAgentMode} ${this.allowAgentModeTests} ${this.hideAttribution} ${this.disableImageTests} key="${this._remountKey}" start-countdown="false" hidden></selfie-capture-wrapper>
              <selfie-capture-review theme-color='${this.themeColor}' ${this.showNavigation} ${this.hideAttribution} hidden></selfie-capture-review>
            </div>
        `;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };
    this.selfieInstruction = this.querySelector('selfie-capture-instructions');
    this.selfieCapture = this.querySelector('selfie-capture-wrapper');
    this.selfieReview = this.querySelector('selfie-capture-review');

    if (this.hideInstructions && !this.hasAttribute('hidden')) {
      getPermissions(this.selfieCapture, this.getAgentMode());
    }

    // If the initial screen is selfie-capture, we need to get permissions
    if (this.getAttribute('initial-screen') === 'selfie-capture') {
      getPermissions(this.selfieCapture, this.getAgentMode()).then(() =>
        this.setActiveScreen(this.selfieCapture),
      );
    } else if (this.hideInstructions) {
      this.setActiveScreen(this.selfieCapture);
    } else {
      this.setActiveScreen(this.selfieInstruction);
    }

    this.setUpEventListeners();
  }

  getAgentMode() {
    return this.inAgentMode ? 'environment' : 'user';
  }

  disconnectedCallback() {
    SmartCamera.stopMedia();
    if (this.activeScreen) {
      this.activeScreen.removeAttribute('hidden');
    }
    this.activeScreen = null;
    this.innerHTML = '';
  }

  setUpEventListeners() {
    this.selfieInstruction.addEventListener(
      'selfie-capture-instructions.capture',
      async () => {
        await getPermissions(this.selfieCapture, this.getAgentMode()).then(() =>
          this.setActiveScreen(this.selfieCapture),
        );
        smartCameraWeb?.dispatchEvent(
          new CustomEvent('metadata.selfie-capture-start'),
        );
        smartCameraWeb?.dispatchEvent(
          new CustomEvent('metadata.selfie-origin', {
            detail: {
              imageOrigin: {
                environment: 'back_camera',
                user: 'front_camera',
              }[this.getAgentMode()],
            },
          }),
        );
      },
    );
    this.selfieInstruction.addEventListener(
      'selfie-capture-instructions.cancelled',
      () => {
        this.handleBackEvents();
      },
    );
    // Setup selfie-wrapper event listeners
    this.setupSelfieWrapperEventListeners();

    this.selfieReview.addEventListener(
      'selfie-capture-review.rejected',
      async () => {
        smartCameraWeb?.dispatchEvent(
          new CustomEvent('metadata.selfie-capture-retry'),
        );
        this.selfieReview.removeAttribute('data-image');
        this._data.images = [];

        // Force remount by incrementing key
        this.forceWrapperRemount();

        if (this.hideInstructions) {
          this.setActiveScreen(this.selfieCapture);
          await getPermissions(this.selfieCapture, this.getAgentMode());
        } else {
          this.setActiveScreen(this.selfieInstruction);
        }
      },
    );

    this.selfieReview.addEventListener(
      'selfie-capture-review.accepted',
      async () => {
        this._publishSelectedImages();
      },
    );

    [this.selfieInstruction, this.selfieCapture, this.selfieReview].forEach(
      (screen) => {
        screen.addEventListener(
          `${screen.nodeName.toLowerCase()}.close`,
          () => {
            this.handleCloseEvent();
          },
        );
      },
    );
  }

  // Force remount of selfie-capture-wrapper component for clean state
  forceWrapperRemount() {
    this._remountKey++;
    const container = this.querySelector('div');
    const oldSelfieCapture = this.selfieCapture;

    // Create new selfie-capture-wrapper element with same attributes
    const newSelfieCapture = document.createElement('selfie-capture-wrapper');
    newSelfieCapture.setAttribute('theme-color', this.themeColor);
    newSelfieCapture.setAttribute('key', this._remountKey.toString());
    newSelfieCapture.setAttribute('start-countdown', 'false');

    // Copy all the correct attributes based on the getter logic
    const showNav = this.hasAttribute('show-navigation');
    const allowAgent = this.getAttribute('allow-agent-mode') === 'true';
    const allowAgentTests = this.hasAttribute('show-agent-mode-for-tests');
    const hideAttr = this.hasAttribute('hide-attribution');
    const disableTests = this.hasAttribute('disable-image-tests');

    if (showNav) newSelfieCapture.setAttribute('show-navigation', '');
    if (allowAgent) newSelfieCapture.setAttribute('allow-agent-mode', 'true');
    if (allowAgentTests)
      newSelfieCapture.setAttribute('show-agent-mode-for-tests', '');
    if (hideAttr) newSelfieCapture.setAttribute('hide-attribution', '');
    if (disableTests) newSelfieCapture.setAttribute('disable-image-tests', '');
    newSelfieCapture.setAttribute('hidden', '');

    // Replace old element with new one
    container.replaceChild(newSelfieCapture, oldSelfieCapture);

    // Update reference
    this.selfieCapture = newSelfieCapture;

    // Re-add event listeners for the new element
    this.setupSelfieWrapperEventListeners();
  }

  // Override setActiveScreen to enable countdown when selfie-capture is active
  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;

    // If activating selfie-capture-wrapper, enable the countdown and ensure permissions
    if (screen === this.selfieCapture) {
      screen.setAttribute('start-countdown', 'true');
      getPermissions(this.selfieCapture, this.getAgentMode());
    } else if (this.selfieCapture) {
      // Disable countdown when not on capture screen
      this.selfieCapture.setAttribute('start-countdown', 'false');
    }
  }

  setupSelfieWrapperEventListeners() {
    window.addEventListener('selfie-capture.cancelled', () => {
      SmartCamera.stopMedia();

      // Force remount of selfie-capture-wrapper for clean state on next visit
      this.forceWrapperRemount();

      if (this.hideInstructions) {
        this.handleBackEvents();
        return;
      }

      this.setActiveScreen(this.selfieInstruction);
    });

    // Add specific close event handler for selfie-capture-wrapper
    window.addEventListener('selfie-capture.close', () => {
      SmartCamera.stopMedia();

      // Force remount of selfie-capture-wrapper for clean state on next visit
      this.forceWrapperRemount();

      this.handleCloseEvent();
    });

    window.addEventListener('selfie-capture.publish', async (event) => {
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );
      this.selfieReview.setAttribute(
        'data-image',
        await cropImageFromDataUri(event.detail.referenceImage, 20, 20),
      );
      this._data.images = event.detail.images;
      SmartCamera.stopMedia();
      this.setActiveScreen(this.selfieReview);
    });

    // Also listen for the publish event on the parent SelfieCaptureScreens element
    // in case smartselfie-capture dispatches it there
    this.addEventListener('selfie-capture.publish', async (event) => {
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );
      this.selfieReview.setAttribute(
        'data-image',
        await cropImageFromDataUri(event.detail.referenceImage, 20, 20),
      );
      this._data.images = event.detail.images;
      SmartCamera.stopMedia();
      this.setActiveScreen(this.selfieReview);
    });
  }

  _publishSelectedImages() {
    this.dispatchEvent(
      new CustomEvent('selfie-capture-screens.publish', { detail: this._data }),
    );
  }

  get hideInstructions() {
    return this.hasAttribute('hide-instructions');
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution') ? 'hide-attribution=""' : '';
  }

  get hideBackOfId() {
    return this.hasAttribute('hide-back-of-id');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation') ? 'show-navigation=""' : '';
  }

  get inAgentMode() {
    return this.getAttribute('allow-agent-mode') === 'true';
  }

  get allowAgentMode() {
    return this.inAgentMode ? 'allow-agent-mode="true"' : '';
  }

  get allowAgentModeTests() {
    return this.hasAttribute('show-agent-mode-for-tests')
      ? 'show-agent-mode-for-tests=""'
      : '';
  }

  get hideBack() {
    return this.hasAttribute('hide-back-to-host') ||
      this.hasAttribute('hide-back')
      ? 'hide-back=""'
      : '';
  }

  get disableImageTests() {
    return this.hasAttribute('disable-image-tests')
      ? 'disable-image-tests=""'
      : '';
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#001096';
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('selfie-capture-screens.cancelled'));
  }

  handleCloseEvent() {
    this.dispatchEvent(new CustomEvent('selfie-capture-screens.close'));
  }

  static get observedAttributes() {
    return [
      'title',
      'hidden',
      'show-navigation',
      'hide-back-to-host',
      'initial-screen',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'title':
      case 'hidden':
      case 'initial-screen':
        this.connectedCallback();
        break;
      default:
        break;
    }
  }
}

if (
  'customElements' in window &&
  !customElements.get('selfie-capture-screens')
) {
  customElements.define('selfie-capture-screens', SelfieCaptureScreens);
}

export default SelfieCaptureScreens;
