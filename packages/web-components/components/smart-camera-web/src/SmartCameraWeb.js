import styles from '../../../styles/src/styles';
import SmartCamera from '../../../domain/camera/src/SmartCamera';

import '../../document-capture/src';
import '../../selfie-capture/src';
import '../../camera-permission/CameraPermission';

import { version as COMPONENTS_VERSION } from '../../../package.json';

function scwTemplateString() {
  return `
  ${styles}
  <div>
    <camera-permission ${this.showNavigation} ${this.hideBackToHost} ${this.hideAttribution} hidden></camera-permission>
    <liveness-capture ${this.title} ${this.showNavigation} ${this.disableImageTests} ${this.hideAttribution} hidden ></liveness-capture>
    <document-capture ${this.title} ${this.documentCaptureModes} ${this.showNavigation}  ${this.hideAttribution} hidden></document-instruction>
  </div>
`;
}
class SmartCameraWeb extends HTMLElement {
  constructor() {
    super();
    this.scwTemplateString = scwTemplateString.bind(this);
    this.render = () => this.scwTemplateString();
    this.attachShadow({ mode: 'open' });
    this.activeScreen = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.render();

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };

    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      this.setUpEventListeners();
    } else {
      this.shadowRoot.innerHTML = '<h1 class="error-message">Your browser does not support this integration</h1>';
    }
  }

  disconnectedCallback() {
    SmartCamera.stopMedia();
    if (this.activeScreen) {
      this.activeScreen.removeAttribute('hidden');
    }
    this.activeScreen = null;
    this.shadowRoot.innerHTML = '';
  }

  static get observedAttributes() {
    return ['document-capture-modes', 'document-type', 'hide-back-to-host', 'show-navigation'];
  }

  attributeChangedCallback(name) {
    switch (name) {
    case 'document-capture-modes':
    case 'document-type':
    case 'hide-back-to-host':
    case 'show-navigation':
      this.shadowRoot.innerHTML = this.render();
      this.setUpEventListeners();
      break;
    default:
      break;
    }
  }

  setUpEventListeners() {
    this.cameraPermission = this.shadowRoot.querySelector('camera-permission');
    this.livenessCapture = this.shadowRoot.querySelector('liveness-capture');
    this.documentCapture = this.shadowRoot.querySelector('document-capture');

    if (SmartCamera.stream) {
      this.setActiveScreen(this.livenessCapture);
    } else {
      this.setActiveScreen(this.cameraPermission);
    }
    this.cameraPermission.addEventListener('camera-permission-granted', () => {
      this.setActiveScreen(this.livenessCapture);
      this.livenessCapture.removeAttribute('data-camera-error');
      this.livenessCapture.setAttribute('data-camera-ready', true);
    });

    this.livenessCapture.addEventListener('imagesComputed', (event) => {
      this._data.images = event.detail.images;
      this.setActiveScreen(this.documentCapture);
    });

    this.documentCapture.addEventListener('imagesComputed', (event) => {
      this._data.images = [...this._data.images, ...event.detail.images];
    });
  }

  reset() {
    this.disconnectedCallback();
    this.connectedCallback();
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

  get hideBackToHost() {
    return this.hasAttribute('hide-back-to-host') ? 'hide-back-to-host' : '';
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

  get disableImageTests() {
    return this.hasAttribute('disable-image-tests') ? 'disable-image-tests' : '';
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution') ? 'hide-attribution' : '';
  }

  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;
  }
}

if ('customElements' in window && !customElements.get('smart-camera-web')) {
  customElements.define('smart-camera-web', SmartCameraWeb);
}

export default SmartCameraWeb;
