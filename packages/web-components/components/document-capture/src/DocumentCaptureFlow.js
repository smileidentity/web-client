import { IMAGE_TYPE } from '../../../domain/constants/src/Constants';
import styles from '../../../styles/src/styles';
import SmartCamera from '../../../domain/camera/src/SmartCamera';

import './id-capture';
import './id-review';
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
    console.error(error);
    captureScreen.removeAttribute('data-camera-ready');
    captureScreen.setAttribute(
      'data-camera-error',
      SmartCamera.handleCameraError(error),
    );
  }
}

class DocumentCaptureFlow extends HTMLElement {
  constructor() {
    super();
    this.activeScreen = null;
  }

  connectedCallback() {
    this.innerHTML = `
      ${styles}
      <div>
      <document-instruction ${this.title} ${this.documentCaptureModes} ${this.showNavigation} ${this.hideInstructions ? 'hidden' : ''}></document-instruction>
      <id-capture side-of-id='Front'
      ${this.title} ${this.showNavigation} ${this.hideInstructions ? '' : 'hidden'} 
      ${this.documentCaptureModes}
      ></id-capture>
      <document-instruction id='document-instruction-back' title='Submit Back of ID' ${this.documentCaptureModes} ${this.showNavigation} hidden></document-instruction>
      <id-capture id='back-of-id' side-of-id='Back' ${this.title} ${this.showNavigation}
      ${this.documentCaptureModes}
      hidden 
      ></id-capture>
      <id-review hidden></id-review>
      <id-review id='back-of-id-review' hidden></id-review>
      </div>
    `;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };

    this.documentInstruction = this.querySelector('document-instruction');
    this.documentInstructionBack = this.querySelector(
      '#document-instruction-back',
    );
    this.idCapture = this.querySelector('id-capture');
    this.idReview = this.querySelector('id-review');
    this.idCaptureBack = this.querySelector('#back-of-id');
    this.backOfIdReview = this.querySelector('#back-of-id-review');
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
      'document-capture-instructions.capture',
      async () => {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      },
    );
    this.documentInstruction.addEventListener(
      'document-capture-instructions.upload',
      async (event) => {
        this.idReview.setAttribute('data-image', event.detail.image);
        this._data.images.push({
          image: event.detail.image.split(',')[1],
          image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
        });
        this.setActiveScreen(this.idReview);
      },
    );

    this.idCapture.addEventListener('document-capture.publish', (event) => {
      this.idReview.setAttribute('data-image', event.detail.image);
      this._data.images.push({
        image: event.detail.image.split(',')[1],
        image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
      });
      SmartCamera.stopMedia();
      this.setActiveScreen(this.idReview);
    });

    this.idReview.addEventListener('document-review.rejected', async () => {
      this.idReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      } else {
        this.setActiveScreen(this.documentInstruction);
      }
    });

    this.idReview.addEventListener('document-review.accepted', async () => {
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
      'document-capture-instructions.capture',
      async () => {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      },
    );

    this.documentInstructionBack.addEventListener(
      'document-capture-instructions.upload',
      async (event) => {
        this.idReview.setAttribute('data-image', event.detail.image);
        this._data.images.push({
          image: event.detail.image.split(',')[1],
          image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
        });
        this.setActiveScreen(this.backOfIdReview);
      },
    );
    this.idCaptureBack.addEventListener('document-capture.publish', (event) => {
      this.backOfIdReview.setAttribute('data-image', event.detail.image);
      this._data.images.push({
        image: event.detail.image.split(',')[1],
        image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
      });
      this.setActiveScreen(this.backOfIdReview);
      SmartCamera.stopMedia();
    });

    this.backOfIdReview.addEventListener('document-review.rejected', async () => {
      this.backOfIdReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      } else {
        this.setActiveScreen(this.documentInstructionBack);
      }
    });

    this.backOfIdReview.addEventListener('document-review.accepted', () => {
      this._publishSelectedImages();
    });
  }

  _publishSelectedImages() {
    this.dispatchEvent(
      new CustomEvent('document-capture-screens.publish', { detail: this._data }),
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

if ('customElements' in window && !customElements.get('document-capture-flow')) {
  customElements.define('document-capture-flow', DocumentCaptureFlow);
}

export default DocumentCaptureFlow;
