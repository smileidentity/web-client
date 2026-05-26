import './selfie-capture-instructions';
import './selfie-capture-review';
import './selfie-capture-wrapper/index.ts';
import { getMediapipeInstance } from './smartselfie-capture/utils/mediapipeManager.ts';
import SmartCamera from '../../../domain/camera/src/SmartCamera';
import styles from '../../../styles/src/styles';
import packageJson from '../../../../package.json';
import { JPEG_QUALITY } from '../../../domain/constants/src/Constants';

const COMPONENTS_VERSION = packageJson.version;

const smartCameraWeb = document.querySelector('smart-camera-web');

const cropImageFromDataUri = (dataUri, cropPercentX = 0, cropPercentY = 0) =>
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

        const croppedDataUri = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
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
            <div style="height: 100%;">
              <selfie-capture-instructions theme-color='${this.themeColor}' ${this.showNavigation} ${this.hideAttribution} ${this.hideBack} hidden></selfie-capture-instructions>
              <selfie-capture-wrapper theme-color='${this.themeColor}' ${this.showNavigation} ${this.allowAgentMode} ${this.allowAgentModeTests} ${this.hideAttribution} ${this.disableImageTests} ${this.allowLegacySelfieFallback} ${this.useStrictMode} ${this.hideConsent} ${this.partnerName} ${this.partnerLogo} ${this.policyUrl} key="${this._remountKey}" start-countdown="false" hidden></selfie-capture-wrapper>
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

    if (
      this.getAttribute('initial-screen') === 'selfie-capture' ||
      this.hideInstructions ||
      // In strict mode the modern `enhanced-smartselfie-capture` element
      // renders its own consent + instructions screens, so we skip the
      // legacy `selfie-capture-instructions` element entirely.
      this.isStrictMode
    ) {
      this.setActiveScreen(this.selfieCapture);
    } else {
      this.setActiveScreen(this.selfieInstruction);
    }

    this.setUpEventListeners();

    // Pre-warm MediaPipe as soon as the selfie flow starts so the heavy WASM +
    // model download (and on-device init) happens while the user reads the
    // instructions — not behind a blocking spinner on the capture screen. This
    // is fire-and-forget and idempotent: getMediapipeInstance() caches a single
    // in-flight promise / instance, so the wrapper (and any remount) reuses the
    // same load instead of starting a new one. Errors are handled by the
    // wrapper's own retry/fallback path, so swallow them here.
    //
    // Skipped under Cypress to match `SelfieCaptureWrapper`'s existing test
    // seam (`skipMediapipeForTests`). Specs rely on the wrapper short-circuiting
    // to the legacy `selfie-capture` fallback; pre-warming here would race with
    // that seam and (intermittently) flip the wrapper into the SmartSelfie path
    // by populating `window.__smileIdentityMediapipe` before the wrapper mounts.
    //
    // The parent check covers the embed Cypress context where this element runs
    // inside an iframe and window.Cypress is only set on the parent frame.
    const isCypress =
      !!window.Cypress ||
      (() => {
        try {
          return !!window.parent.Cypress;
        } catch {
          return false;
        }
      })() ||
      (window.navigator.userAgent.includes('Electron') && window.__Cypress);
    const forceMediapipeLoad = !!window.__SMILE_ID_TEST_FORCE_MEDIAPIPE_LOAD__;
    if (!isCypress || forceMediapipeLoad) {
      getMediapipeInstance().catch(() => {});
    }
  }

  getAgentMode() {
    return this.inAgentMode ? 'environment' : 'user';
  }

  disconnectedCallback() {
    SmartCamera.stopMedia();
    smartCameraWeb?.dispatchEvent(new CustomEvent('metadata.cleanup'));

    if (this._selfieWrapperListeners) {
      this._selfieWrapperListeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
      this._selfieWrapperListeners = null;
    }

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
        this.setActiveScreen(this.selfieCapture);
      },
    );
    this.selfieInstruction.addEventListener(
      'selfie-capture-instructions.cancelled',
      () => {
        this.handleBackEvents();
      },
    );
    this.setupSelfieWrapperEventListeners();

    this.selfieReview.addEventListener(
      'selfie-capture-review.rejected',
      async () => {
        smartCameraWeb?.dispatchEvent(
          new CustomEvent('metadata.selfie-capture-retry'),
        );
        this.selfieReview.removeAttribute('data-image');
        this.selfieReview.removeAttribute('mirror-image');
        this._data.images = [];

        await this.forceWrapperRemount();

        this.setActiveScreen(this.selfieCapture);
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
  async forceWrapperRemount() {
    SmartCamera.stopMedia();

    this._remountKey++;

    const container = this.querySelector('div');
    const oldWrapper = this.selfieCapture;

    if (oldWrapper && container) {
      // recreate wrapper element
      const newWrapper = document.createElement('selfie-capture-wrapper');

      // copy attributes from old wrapper, but skip key and start-countdown
      const attributesToCopy = Array.from(oldWrapper.attributes);

      attributesToCopy.forEach((attr) => {
        newWrapper.setAttribute(attr.name, attr.value);
      });
      oldWrapper.remove();
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      newWrapper.setAttribute('key', this._remountKey.toString());
      newWrapper.setAttribute('start-countdown', 'false');
      newWrapper.setAttribute('hidden', '');

      const reviewElement = container.querySelector('selfie-capture-review');
      if (reviewElement) {
        container.insertBefore(newWrapper, reviewElement);
      } else {
        container.appendChild(newWrapper);
      }

      this.selfieCapture = newWrapper;

      this.setupSelfieWrapperEventListeners();
    }

    // give time for the new component to initialize
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  // Return to a clean selfie capture screen. Used when navigating back from the
  // document flow. Previously this was driven by toggling the `initial-screen`
  // attribute on this element, which re-fired a full `connectedCallback()`
  // rebuild every time (even when the value was unchanged). We now swap in a
  // fresh `selfie-capture-wrapper` synchronously and navigate explicitly, so we
  // land on a clean capture screen — not the stale review — without rebuilding
  // the whole screen tree or depending on timers.
  restartSelfieCapture() {
    SmartCamera.stopMedia();

    const container = this.querySelector('div');
    const oldWrapper = this.selfieCapture;

    if (oldWrapper && container) {
      this._remountKey++;

      const newWrapper = document.createElement('selfie-capture-wrapper');
      Array.from(oldWrapper.attributes).forEach((attr) => {
        newWrapper.setAttribute(attr.name, attr.value);
      });
      newWrapper.setAttribute('key', this._remountKey.toString());
      newWrapper.setAttribute('start-countdown', 'false');
      newWrapper.setAttribute('hidden', '');

      const reviewElement = container.querySelector('selfie-capture-review');
      oldWrapper.remove();
      if (reviewElement) {
        container.insertBefore(newWrapper, reviewElement);
      } else {
        container.appendChild(newWrapper);
      }

      this.selfieCapture = newWrapper;
      this.setupSelfieWrapperEventListeners();
    }

    this.setActiveScreen(this.selfieCapture);
  }

  // Override setActiveScreen to enable countdown when selfie-capture is active
  setActiveScreen(screen) {
    if (this.activeScreen === screen) {
      return;
    }

    this.activeScreen?.setAttribute('hidden', '');
    screen.removeAttribute('hidden');
    this.activeScreen = screen;

    // If activating selfie-capture-wrapper, enable the countdown
    if (screen === this.selfieCapture) {
      screen.setAttribute('start-countdown', 'true');
    } else if (this.selfieCapture) {
      // Disable countdown when not on capture screen
      this.selfieCapture.setAttribute('start-countdown', 'false');
    }
  }

  setupSelfieWrapperEventListeners() {
    // Remove existing event listeners if they exist
    if (this._selfieWrapperListeners) {
      this._selfieWrapperListeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
    }
    // Also remove the previously-attached element-level publish handler so we
    // don't accumulate duplicates across remounts (each call to
    // setupSelfieWrapperEventListeners would otherwise add another listener,
    // causing multiple transitions to review / multiple metadata events on
    // navigating back from document capture).
    if (this._selfieWrapperPublishHandler) {
      this.removeEventListener(
        'selfie-capture.publish',
        this._selfieWrapperPublishHandler,
      );
    }

    // Create new event handlers
    const cancelledHandler = async () => {
      SmartCamera.stopMedia();

      // Force remount of selfie-capture-wrapper for clean state on next visit
      await this.forceWrapperRemount();

      if (this.hideInstructions || this.isStrictMode) {
        this.handleBackEvents();
        return;
      }

      this.setActiveScreen(this.selfieInstruction);
    };

    const closeHandler = async () => {
      SmartCamera.stopMedia();

      // Force remount of selfie-capture-wrapper for clean state on next visit
      await this.forceWrapperRemount();

      this.handleCloseEvent();
    };

    const publishHandler = async (event) => {
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );
      this._data.images = event.detail.images;
      SmartCamera.stopMedia();

      // In strict mode (Enhanced SmartSelfie), the ESS component already
      // shows its own review screen and only re-dispatches `publish` after
      // the user confirms. Skip the legacy `selfie-capture-review` step and
      // publish straight up to the host page.
      if (this.isStrictMode) {
        this._publishSelectedImages();
        return;
      }

      this.selfieReview.setAttribute(
        'data-image',
        await cropImageFromDataUri(event.detail.referenceImage, 20, 20),
      );
      const shouldMirror = event.detail.facingMode === 'user';
      this.selfieReview.setAttribute(
        'mirror-image',
        shouldMirror ? 'true' : 'false',
      );
      this.setActiveScreen(this.selfieReview);
    };

    // Store references to remove them later
    this._selfieWrapperListeners = [
      { event: 'selfie-capture.cancelled', handler: cancelledHandler },
      { event: 'selfie-capture.close', handler: closeHandler },
      { event: 'selfie-capture.publish', handler: publishHandler },
    ];

    // Add event listeners
    this._selfieWrapperListeners.forEach(({ event, handler }) => {
      window.addEventListener(event, handler);
    });

    // Also listen for the publish event on the parent SelfieCaptureScreens element
    // in case smartselfie-capture dispatches it there
    this._selfieWrapperPublishHandler = publishHandler;
    this.addEventListener('selfie-capture.publish', publishHandler);
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

  get allowLegacySelfieFallback() {
    return this.hasAttribute('allow-legacy-selfie-fallback')
      ? `allow-legacy-selfie-fallback='${this.getAttribute('allow-legacy-selfie-fallback')}'`
      : '';
  }

  get useStrictMode() {
    return this.hasAttribute('use-strict-mode') &&
      this.getAttribute('use-strict-mode') !== 'false'
      ? 'use-strict-mode="true"'
      : '';
  }

  /** Boolean form of `use-strict-mode` for runtime checks. */
  get isStrictMode() {
    return (
      this.hasAttribute('use-strict-mode') &&
      this.getAttribute('use-strict-mode') !== 'false'
    );
  }

  get hideConsent() {
    return this.hasAttribute('hide-consent') ? 'hide-consent=""' : '';
  }

  get partnerName() {
    return this.hasAttribute('partner-name')
      ? `partner-name='${this.getAttribute('partner-name')}'`
      : '';
  }

  get partnerLogo() {
    return this.hasAttribute('partner-logo')
      ? `partner-logo='${this.getAttribute('partner-logo')}'`
      : '';
  }

  get policyUrl() {
    return this.hasAttribute('policy-url')
      ? `policy-url='${this.getAttribute('policy-url')}'`
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
      'allow-agent-mode',
      'allow-legacy-selfie-fallback',
      'show-agent-mode-for-tests',
      'disable-image-tests',
      'use-strict-mode',
      'hide-consent',
      'partner-name',
      'partner-logo',
      'policy-url',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'title':
      case 'hidden':
      case 'initial-screen':
      case 'allow-agent-mode':
      case 'allow-legacy-selfie-fallback':
      case 'show-agent-mode-for-tests':
      case 'disable-image-tests':
      case 'use-strict-mode':
      case 'hide-consent':
      case 'partner-name':
      case 'partner-logo':
      case 'policy-url':
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
