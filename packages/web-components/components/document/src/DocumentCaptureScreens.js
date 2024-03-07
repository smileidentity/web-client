import { IMAGE_TYPE } from '../../../domain/constants/src/Constants';
import styles from '../../../styles/src/styles';
import SmartCamera from '../../../domain/camera/src/SmartCamera';

import './document-capture';
import './document-review';
import './document-instructions';
import { version as COMPONENTS_VERSION } from '../../../package.json';

async function getPermissions(captureScreen) {
  try {
    await SmartCamera.getMedia({
      audio: false,
      video: SmartCamera.environmentOptions,
    });
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

class DocumentCaptureScreens extends HTMLElement {
  constructor() {
    super();
    this.activeScreen = null;
  }

  connectedCallback() {
    this.innerHTML = `
      ${styles}
      <div>
      <document-capture-instructions ${this.title} ${this.documentCaptureModes} ${this.showNavigation} ${this.hideInstructions ? 'hidden' : ''}></document-capture-instructions>
      <document-capture side-of-id='Front'
      ${this.title} ${this.showNavigation} ${this.hideInstructions ? '' : 'hidden'} 
      ${this.documentCaptureModes}
      ></document-capture>
      <document-capture-instructions id='document-capture-instructions-back' title='Submit Back of ID' ${this.documentCaptureModes} ${this.showNavigation} hidden></document-capture-instructions>
      <document-capture id='back-of-id' side-of-id='Back' ${this.title} ${this.showNavigation}
      ${this.documentCaptureModes}
      hidden 
      ></document-capture>
      <document-review hidden></document-review>
      <document-review id='back-of-document-review' hidden></document-review>
      </div>
    `;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };

    this.documentInstruction = this.querySelector('document-capture-instructions');
    this.documentInstructionBack = this.querySelector(
      '#document-capture-instructions-back',
    );
    this.idCapture = this.querySelector('document-capture');
    this.idReview = this.querySelector('document-review');
    this.idCaptureBack = this.querySelector('#back-of-id');
    this.backOfIdReview = this.querySelector('#back-of-document-review');
    this.thankYouScreen = this.querySelector('thank-you');

    if (this.hideInstructions) {
      getPermissions(this.idCapture);
      this.setActiveScreen(this.idCapture);
    } else {
      this.setActiveScreen(this.documentInstruction);
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
    this.documentInstruction.addEventListener(
      'DocumentInstruction::StartCamera',
      async () => {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      },
    );
    this.documentInstruction.addEventListener(
      'DocumentInstruction::DocumentChange',
      async (event) => {
        this.idReview.setAttribute('data-image', event.detail.image);
        this._data.images.push({
          image: event.detail.image.split(',')[1],
          image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
        });
        this.setActiveScreen(this.idReview);
      },
    );

    this.idCapture.addEventListener('IDCapture::ImageCaptured', (event) => {
      this.idReview.setAttribute('data-image', event.detail.image);
      this._data.images.push({
        image: event.detail.image.split(',')[1],
        image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
      });
      SmartCamera.stopMedia();
      this.setActiveScreen(this.idReview);
    });

    this.idReview.addEventListener('IdReview::ReCaptureID', async () => {
      this.idReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      } else {
        this.setActiveScreen(this.documentInstruction);
      }
    });

    this.idReview.addEventListener('IdReview::SelectImage', async () => {
      if (this.hideBackOfId) {
        this._publishSelectedImages();
      } else if (this.hideInstructions) {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      } else {
        this.setActiveScreen(this.documentInstructionBack);
      }
    });

    this.documentInstructionBack.addEventListener(
      'DocumentInstruction::StartCamera',
      async () => {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      },
    );

    this.documentInstructionBack.addEventListener(
      'DocumentInstruction::DocumentChange',
      async (event) => {
        this.idReview.setAttribute('data-image', event.detail.image);
        this._data.images.push({
          image: event.detail.image.split(',')[1],
          image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
        });
        this.setActiveScreen(this.backOfIdReview);
      },
    );
    this.idCaptureBack.addEventListener('IDCapture::ImageCaptured', (event) => {
      this.backOfIdReview.setAttribute('data-image', event.detail.image);
      this._data.images.push({
        image: event.detail.image.split(',')[1],
        image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
      });
      this.setActiveScreen(this.backOfIdReview);
      SmartCamera.stopMedia();
    });

    this.backOfIdReview.addEventListener('IdReview::ReCaptureID', async () => {
      this.backOfIdReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      } else {
        this.setActiveScreen(this.documentInstructionBack);
      }
    });

    this.backOfIdReview.addEventListener('IdReview::SelectImage', () => {
      this._publishSelectedImages();
    });
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

  get title() {
    return this.hasAttribute('title')
      ? `title=${this.getAttribute('title')}`
      : '';
  }

  get documentCaptureModes() {
    return this.hasAttribute('document-capture-modes')
      ? `document-capture-modes='${this.getAttribute('document-capture-modes')}'`
      : '';
  }

  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;
  }
}

if ('customElements' in window && !customElements.get('document-capture-screens')) {
  customElements.define('document-capture-screens', DocumentCaptureScreens);
}

export default DocumentCaptureScreens;
