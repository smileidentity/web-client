import styles from '../../../styles/src/styles';
import SmartCamera from '../../../domain/camera/src/SmartCamera';

import '../../document/src';
import '../../selfie/src';
import '../../camera-permission/CameraPermission';
import packageJson from '../../../../package.json';

const COMPONENTS_VERSION = packageJson.version;

function scwTemplateString() {
  return `
  ${styles(this.themeColor)}
  <div>
    <camera-permission ${this.applyComponentThemeColor} ${this.title} ${this.showNavigation} ${this.hideInstructions ? '' : 'hidden'} ${this.hideAttribution}></camera-permission>
    <selfie-capture-screens ${this.applyComponentThemeColor} ${this.title} ${this.showNavigation} ${this.disableImageTests} ${this.hideAttribution} ${this.hideInstructions} hidden
      ${this.hideBackToHost} ${this.allowAgentMode} ${this.allowAgentModeTests}
    ></selfie-capture-screens>
    <document-capture-screens ${this.applyComponentThemeColor} document-type=${this.documentType} ${this.title} ${this.documentCaptureModes} ${this.showNavigation}  ${this.hideAttribution}
     ${this.hideBackOfId} ${this.applyComponentThemeColor} hidden></document-capture-screens>
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

    if (
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices
    ) {
      this.setUpEventListeners();
    } else {
      this.shadowRoot.innerHTML =
        '<h1 class="error-message">Your browser does not support this integration</h1>';
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
    return [
      'allow-agent-mode',
      'disable-image-tests',
      'document-capture-modes',
      'document-type',
      'hide-attribution',
      'hide-back-of-id',
      'hide-back-to-host',
      'show-navigation',
      'theme-color',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'allow-agent-mode':
      case 'disable-image-tests':
      case 'document-capture-modes':
      case 'document-type':
      case 'hide-attribution':
      case 'hide-back-of-id':
      case 'hide-back-to-host':
      case 'show-navigation':
      case 'theme-color':
        this.disconnectedCallback();
        this.shadowRoot.innerHTML = this.render();
        this.setUpEventListeners();
        break;
      default:
        break;
    }
  }

  setUpEventListeners() {
    this.cameraPermission = this.shadowRoot.querySelector('camera-permission');
    this.SelfieCaptureScreens = this.shadowRoot.querySelector(
      'selfie-capture-screens',
    );
    this.documentCapture = this.shadowRoot.querySelector(
      'document-capture-screens',
    );

    if (this.hideInstructions) {
      this.setActiveScreen(this.cameraPermission);
    } else {
      this.setActiveScreen(this.SelfieCaptureScreens);
    }
    this.cameraPermission.addEventListener('camera-permission.granted', () => {
      this.setActiveScreen(this.SelfieCaptureScreens);
      this.SelfieCaptureScreens.removeAttribute('data-camera-error');
      this.SelfieCaptureScreens.setAttribute('data-camera-ready', true);
    });

    this.SelfieCaptureScreens.addEventListener(
      'selfie-capture-screens.publish',
      (event) => {
        this._data.images = event.detail.images;
        if (!this.captureId) {
          this._publishSelectedImages();
        } else {
          this.setActiveScreen(this.documentCapture);
        }
      },
    );

    this.SelfieCaptureScreens.addEventListener(
      'selfie-capture-screens.cancelled',
      () => {
        if (this.hideInstructions) {
          this.setActiveScreen(this.cameraPermission);
        } else {
          this.handleBackEvents();
        }
      },
    );
    this.SelfieCaptureScreens.addEventListener(
      'selfie-capture-screens.back',
      () => {
        if (!this.hideInstructions) {
          this.setActiveScreen(this.cameraPermission);
        }
      },
    );

    this.documentCapture.addEventListener(
      'document-capture-screens.publish',
      (event) => {
        this._data.images = [...this._data.images, ...event.detail.images];
        this._publishSelectedImages();
      },
    );

    this.documentCapture.addEventListener(
      'document-capture-screens.cancelled',
      () => {
        this.SelfieCaptureScreens.setAttribute(
          'initial-screen',
          'selfie-capture',
        );
        this.setActiveScreen(this.SelfieCaptureScreens);
        this.SelfieCaptureScreens.removeAttribute('data-camera-error');
        this.SelfieCaptureScreens.setAttribute('data-camera-ready', true);
      },
    );

    [
      this.cameraPermission,
      this.SelfieCaptureScreens,
      this.documentCapture,
    ].forEach((screen) => {
      screen.addEventListener(`${screen.nodeName.toLowerCase()}.close`, () =>
        this.handleCloseEvent(),
      );
    });
    this.documentCapture.addEventListener(
      'document-capture-screens.back',
      () => {
        this.setActiveScreen(this.SelfieCaptureScreens);
        this.reset();
      },
    );
  }

  reset() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('smart-camera-web.cancelled'));
  }

  _publishSelectedImages() {
    this.dispatchEvent(
      new CustomEvent('smart-camera-web.publish', { detail: this._data }),
    );
  }

  get captureId() {
    return this.hasAttribute('capture-id');
  }

  get documentType() {
    return this.getAttribute('document-type');
  }

  get isPortraitCaptureView() {
    return this.getAttribute('document-type') === 'GREEN_BOOK';
  }

  get hideInstructions() {
    return this.hasAttribute('hide-instructions') ? 'hide-instructions' : '';
  }

  get hideBackOfId() {
    return this.hasAttribute('hide-back-of-id') ? 'hide-back-of-id' : '';
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation') ? 'show-navigation' : '';
  }

  get hideBackToHost() {
    return this.hasAttribute('hide-back-to-host') ||
      this.hasAttribute('hide-back')
      ? 'hide-back'
      : '';
  }

  get allowAgentMode() {
    return this.hasAttribute('allow-agent-mode')
      ? `allow-agent-mode=${this.getAttribute('allow-agent-mode')}`
      : '';
  }

  get allowAgentModeTests() {
    return this.hasAttribute('show-agent-mode-for-tests')
      ? 'show-agent-mode-for-tests'
      : '';
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
    return this.hasAttribute('disable-image-tests')
      ? 'disable-image-tests'
      : '';
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution') ? 'hide-attribution' : '';
  }

  get hasThemeColor() {
    return (
      this.hasAttribute('theme-color') &&
      ![null, undefined, 'null', 'undefined'].includes(
        this.getAttribute('theme-color'),
      )
    );
  }

  get themeColor() {
    return this.hasThemeColor ? this.getAttribute('theme-color') : '#001096';
  }

  get applyComponentThemeColor() {
    return this.hasThemeColor ? `theme-color='${this.themeColor}'` : '';
  }

  setActiveScreen(screen) {
    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;
  }

  handleCloseEvent() {
    this.dispatchEvent(new CustomEvent('smart-camera-web.close'));
  }
}

if ('customElements' in window && !customElements.get('smart-camera-web')) {
  customElements.define('smart-camera-web', SmartCameraWeb);
}

export default SmartCameraWeb;
