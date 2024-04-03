import { IMAGE_TYPE } from '../../../domain/constants/src/Constants';
import styles from '../../../styles/src/styles';
import SmartCamera from '../../../domain/camera/src/SmartCamera';

import './document-capture';
import './document-capture-review';
import './document-capture-instructions';
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
      <document-capture-instructions id='document-capture-instructions-front' ${this.title} ${this.documentCaptureModes} ${this.showNavigation} ${this.hideInstructions ? 'hidden' : ''}></document-capture-instructions>
      <document-capture id='document-capture-front' side-of-id='Front'
      ${this.title} ${this.showNavigation} ${this.hideInstructions ? '' : 'hidden'} 
      ${this.documentCaptureModes}
      ></document-capture>
      <document-capture-instructions id='document-capture-instructions-back' title='Submit Back of ID' ${this.documentCaptureModes} ${this.showNavigation} hidden></document-capture-instructions>
      <document-capture id='document-capture-back' side-of-id='Back' ${this.title} ${this.showNavigation}
      ${this.documentCaptureModes}
      hidden 
      ></document-capture>
      <document-capture-review id='front-of-document-capture-review' hidden></document-capture-review>
      <document-capture-review id='back-of-document-capture-review' hidden></document-capture-review>
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
    this.idCapture = this.querySelector('#document-capture-front');
    this.idReview = this.querySelector('#front-of-document-capture-review');
    this.idCaptureBack = this.querySelector('#document-capture-back');
    this.backOfIdReview = this.querySelector('#back-of-document-capture-review');
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
    this.documentInstruction.addEventListener('document-capture-instructions.cancelled', () => {
      this.handleBackEvents();
    });

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

    this.idCapture.addEventListener('document-capture.cancelled', () => {
      if (this.hideInstructions) {
        this.handleBackEvents();
      } else {
        this.setActiveScreen(this.documentInstruction);
      }
    });

    this.idReview.addEventListener('document-capture-review.rejected', async () => {
      this.idReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      } else {
        this.setActiveScreen(this.documentInstruction);
      }
    });

    this.idReview.addEventListener('document-capture-review.accepted', async () => {
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
      'document-capture-instructions.cancelled',
      async () => {
        this.idReview.removeAttribute('data-image');
        this._data.images.pop();
        if (this.hideInstructions) {
          this.setActiveScreen(this.idCapture);
          await getPermissions(this.idCapture);
        } else {
          this.setActiveScreen(this.documentInstruction);
        }
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

    this.idCaptureBack.addEventListener('document-capture.cancelled', async () => {
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCapture);
        await getPermissions(this.idCapture);
      } else {
        this.setActiveScreen(this.documentInstructionBack);
      }
    });

    this.backOfIdReview.addEventListener('document-capture-review.rejected', async () => {
      this.backOfIdReview.removeAttribute('data-image');
      this._data.images.pop();
      if (this.hideInstructions) {
        this.setActiveScreen(this.idCaptureBack);
        await getPermissions(this.idCaptureBack);
      } else {
        this.setActiveScreen(this.documentInstructionBack);
      }
    });

    this.backOfIdReview.addEventListener('document-capture-review.accepted', () => {
      this._publishSelectedImages();
    });

    const screens = [
      this.documentInstruction,
      this.idCapture,
      this.documentInstructionBack,
      this.idCaptureBack,
      this.idReview,
      this.backOfIdReview,
    ];

    screens.forEach((screen) => {
      screen.addEventListener(`${screen.nodeName.toLowerCase()}.close`, () => this.handleCloseEvents());
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

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('document-capture-screens.cancelled'));
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent('document-capture-screens.close'));
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
