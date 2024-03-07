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
      SmartCamera.handleCameraError(error),
    );
  }
}

class SelfieCaptureScreens extends HTMLElement {
  constructor() {
    super();
    this.activeScreen = null;
  }

  connectedCallback() {
    this.innerHTML = `
            ${styles}
            <div>
            <selfie-capture-instruction ${this.showNavigation} ${this.hideAttribution} ${this.hideInstructions ? 'hidden' : ''}></selfie-capture-instruction>
            <selfie-capture ${this.showNavigation} ${this.hideAttribution} ${this.disableImageTests} hidden></selfie-capture>
            <selfie-review ${this.showNavigation} ${this.hideAttribution} hidden></selfie-review>
            </div>
        `;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };

    this.selfieInstruction = this.querySelector('selfie-capture-instruction');
    this.selfieCapture = this.querySelector('selfie-capture');
    this.selfieReview = this.querySelector('selfie-review');

    if (this.hideInstructions && !this.hasAttribute('hidden')) {
      getPermissions(this.selfieCapture);
    }

    if (this.hideInstructions) {
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

  get hideAttribution() {
    return this.hasAttribute('hide-attribution') ? 'hide-attribution' : '';
  }

  get hideBackOfId() {
    return this.hasAttribute('hide-back-of-id');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation') ? 'show-navigation' : '';
  }

  get disableImageTests() {
    return this.hasAttribute('disable-image-tests') ? 'disable-image-tests' : '';
  }

  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;
  }

  static get observedAttributes() {
    return [
      'title',
      'hidden',
      'show-navigation',
      'hide-back-to-host',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
    case 'title':
    case 'hidden':
      this.connectedCallback();
      break;
    default:
      break;
    }
  }
}

if ('customElements' in window && !customElements.get('selfie-capture-screens')) {
  customElements.define('selfie-capture-screens', SelfieCaptureScreens);
}

export default SelfieCaptureScreens;
