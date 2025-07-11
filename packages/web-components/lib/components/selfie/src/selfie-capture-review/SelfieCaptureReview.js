import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

function templateString() {
  return `
    <style>
      .retake-photo.button[data-variant~="ghost"] {
        color: #FF5805;
      }

      #selfie-capture-review-screen {
        display: flex;
        flex-direction: column;
        padding: 1rem;
      }

      #selfie-capture-review-screen .selfie-review-container.landscape {
        height: auto;
      }

      #selfie-capture-review-screen header p {
        margin-block: 0 !important;
      }

      .selfie-review-container.portrait {
        width: 100%;
        position: relative;
        height: calc(200px * 1.4);
      }

      .selfie-review-container.portrait img {
        width: calc(213px + 0.9rem);
        height: 100%;
        position: absolute;
        top: 239px;
        left: 161px;
        padding-bottom: calc((214px * 1.4) / 3);
        padding-top: calc((191px * 1.4) / 3);
        object-fit: cover;
    
        transform: translateX(-50%) translateY(-50%);
        z-index: 1;
        block-size: 100%;
      }

      h1 {
        color: var(--web-digital-blue, #001096);
        text-align: center;
        /* h1 */
        font-size: 1.25rem;
        font-style: normal;
        font-weight: 700;
        line-height: 36px; /* 150% */
        margin-top: 0;
      }
    </style>
    ${styles(this.themeColor)}
    <div id='selfie-capture-review-screen' class='center'>
    <smileid-navigation ${this.showNavigation ? 'show-navigation' : ''} hide-back></smileid-navigation>
    <h1 class="header-title title-color font-bold">
      Is your whole face clear?
    </h1>
    <div class='section | flow'>
      <div class='selfie-review-container ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
        ${
          this.imageSrc
            ? `<img
        alt='your ID card'
        id='document-capture-review-image'
        src='${this.imageSrc}'
        width='396'
        style='max-width: 90%; transform: scaleX(-1);'
      />`
            : ''
        }
      </div>
      <div class='flow action-buttons'>
        <button data-variant='solid full-width' class='button' type='button' id='select-id-image'>
          Yes, use this
        </button>
        <button data-variant='ghost full-width' class='button  retake-photo' type='button' id='re-capture-image'>
          No, Retake Selfie
        </button>
      </div>
      ${
        this.hideAttribution
          ? ''
          : `
        <powered-by-smile-id></powered-by-smile-id>
      `
      }
    </div>
  </div>
  `;
}

class SelfieCaptureReview extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = this.render();
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setUpEventListeners();
  }

  static get observedAttributes() {
    return ['hide-back-to-host', 'show-navigation', 'data-image'];
  }

  get hideBack() {
    return this.hasAttribute('hide-back-to-host');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#001096';
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution');
  }

  get imageSrc() {
    return this.getAttribute('data-image');
  }

  get title() {
    return this.getAttribute('title') || 'Submit Front of ID';
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('selfie-capture-review.cancelled'));
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent('selfie-capture-review.close'));
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'data-image':
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
    this.selectImage = this.shadowRoot.querySelector('#select-id-image');
    this.reCaptureImage = this.shadowRoot.querySelector('#re-capture-image');
    this.navigation = this.shadowRoot.querySelector('smileid-navigation');

    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });
    this.navigation.addEventListener('navigation.close', () => {
      this.handleCloseEvents();
    });

    this.selectImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('selfie-capture-review.accepted', {
          detail: {},
        }),
      );
    });
    this.reCaptureImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('selfie-capture-review.rejected', {
          detail: {},
        }),
      );
    });
  }
}

if (
  'customElements' in window &&
  !customElements.get('selfie-capture-review')
) {
  window.customElements.define('selfie-capture-review', SelfieCaptureReview);
}

export default SelfieCaptureReview;
