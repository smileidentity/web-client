import './selfie-capture';
import './selfie-instructions';
import './selfie-review';
import SmartCamera from '../../../domain/camera/src/SmartCamera';
import styles from '../../../styles/src/styles';
import { version as COMPONENTS_VERSION } from '../../../package.json';

async function getPermissions(captureScreen) {
  try {
    await SmartCamera.getMedia({ audio: false, video: true });
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
      'SelfieReview::SelectImage',
      async () => {
        this._publishSelectedImages();
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

if ('customElements' in window && !customElements.get('liveness-capture-flow')) {
  customElements.define('liveness-capture-flow', SelfieCaptureFlow);
}

export default SelfieCaptureFlow;
