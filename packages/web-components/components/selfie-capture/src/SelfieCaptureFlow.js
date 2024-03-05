import './selfie-capture';
import './selfie-review';
import './selfie-instructions';
import SmartCamera from '../../../domain/camera/src/SmartCamera';
import styles from '../../../styles/src/styles';
import { version as COMPONENTS_VERSION } from '../../../package.json';

async function getPermissions(captureScreen) {
  try {
    await SmartCamera.getMedia({
      audio: false,
      video: {
        facingMode: 'environment',
        width: { min: 1280 },
        // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
        // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
        // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
        zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
      },
    });
    captureScreen.removeAttribute('data-camera-error');
    captureScreen.setAttribute('data-camera-ready', true);
  } catch (error) {
    captureScreen.removeAttribute('data-camera-ready');
    captureScreen.setAttribute(
      'data-camera-error',
      SmartCamera.handleError(error),
    );
  }
}

class SelfieCaptureFlow extends HTMLElement {
  constructor() {
    super();
    this.activeScreen = null;
  }

  connectedCallback() {
    this.innerHTML = `
            ${styles}
            <div>
            <selfie-instruction ${this.showNavigation} ${this.hideInstructions ? 'hidden' : ''}></selfie-instruction>
            <selfie-capture hidden></selfie-capture>
            <selfie-review hidden></selfie-review>
            </div>
        `;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };

    this.selfieInstruction = this.querySelector('selfie-instruction');
    this.selfieCapture = this.querySelector('selfie-capture');
    this.selfieReview = this.querySelector('selfie-review');

    if (this.hideInstructions) {
      getPermissions(this.selfieCapture);
      this.setActiveScreen(this.selfieCapture);
    } else {
      this.setActiveScreen(this.selfieInstruction);
    }

    this.setUpEventListeners();
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
      'SelfieInstruction::StartCamera',
      async () => {
        await getPermissions(this.selfieCapture);
        this.setActiveScreen(this.selfieCapture);
      },
    );

    this.selfieCapture.addEventListener(
      'SelfieCapture::ImageCaptured',
      (event) => {
        this.selfieReview.setAttribute(
          'data-image',
          event.detail.referenceImage,
        );
        this._data.images = event.detail.images;
        SmartCamera.stopMedia();
        this.setActiveScreen(this.selfieReview);
      },
    );

    this.selfieReview.addEventListener('SelfieReview::ReCapture', async () => {
      this.selfieReview.removeAttribute('data-image');
      this._data.images = [];
      if (this.hideInstructions) {
        this.setActiveScreen(this.selfieCapture);
        await getPermissions(this.selfieCapture);
      } else {
        this.setActiveScreen(this.selfieInstruction);
      }
    });

    this.selfieReview.addEventListener(
      'selfieReview::SelectImage',
      async () => {
        if (this.hideBackOfId) {
          this._publishSelectedImages();
        } else if (this.hideInstructions) {
          this.setActiveScreen(this.selfieCaptureBack);
          await getPermissions(this.selfieCaptureBack);
        } else {
          this.setActiveScreen(this.selfieInstructionBack);
        }
      },
    );
  }

  _publishSelectedImages() {
    this.dispatchEvent(
      new CustomEvent('imagesComputed', { detail: this._data }),
    );
  }

  get hideInstructions() {
    return this.hasAttribute('hide-instructions');
  }

  get hideBackOfId() {
    return this.hasAttribute('hide-back-of-id');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation') ? 'show-navigation' : '';
  }

  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;
  }
}

if ('customElements' in window && !customElements.get('selfie-capture-flow')) {
  customElements.define('selfie-capture-flow', SelfieCaptureFlow);
}

export default SelfieCaptureFlow;
