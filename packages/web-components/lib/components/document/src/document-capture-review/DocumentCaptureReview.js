import styles from '../../../../styles/src/styles';
import '../../../navigation/src';
import { t, getDirection } from '../../../../domain/localisation';

function templateString() {
  return `
  <style>
    .retake-photo.button[data-variant~="ghost"] {
      color: #FF5805;
    }


    @media (max-width: 600px) {
      .id-camera-screen {
        width: 100%;
        height: 100vh;
      }
    
      .section {
        width: 100%;
        justify-content: center;
      }
    }
    
    .id-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
    }

    .id-image {
        width: 100%;
        text-align: center;
        position: relative;
        background: white;
    }
    img {
      height: 100%;
      min-height: 100px;
      width: 98%;
    }

    .action-buttons {
      width: 80%;
    }


    .icon-btn {
      appearance: none;
      background: none;
      border: none;
      color: hsl(0deg 0% 94%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
    }
    .justify-right {
      justify-content: end !important;
    }
    .nav {
      display: flex;
      justify-content: space-between;
    }

    .back-wrapper {
      display: flex;
      align-items: center;
    }

    .back-button-text {
      font-size: 11px;
      line-height: 11px;
      color: rgb(21, 31, 114);
    }



    .tips,
    .powered-by {
      align-items: center;
      border-radius: 0.25rem;
      color: #4e6577;
      display: flex;
      justify-content: center;
      letter-spacing: 0.075em;
    }

    .powered-by {
      box-shadow: 0px 2.57415px 2.57415px rgba(0, 0, 0, 0.06);
      display: inline-flex;
      font-size: 0.5rem;
    }

    .tips {
      margin-left: auto;
      margin-right: auto;
      max-width: 17rem;
    }

    .tips > * + *,
    .powered-by > * + * {
      display: inline-block;
      margin-left: 0.5em;
    }

    .powered-by .company {
      color: #18406d;
      font-weight: 700;
      letter-spacing: 0.15rem;
    }

    .logo-mark {
      background-color: #004071;
      display: inline-block;
      padding: 0.25em 0.5em;
    }

    .logo-mark svg {
      height: auto;
      justify-self: center;
      width: 0.75em;
    }
    
    #document-capture-review-screen {
      display: flex;
      flex-direction: column;
      max-block-size: 100%;
      max-inline-size: 40ch;
      padding: 1rem;
    }

    #document-capture-review-screen .id-image-container.landscape {
    height: auto;
    }

    #document-capture-review-screen header p {
      margin-block: 0 !important;
    }

    .description {
      color: var(--neutral-off-black, #2D2B2A);
      text-align: center;

      /* p */
      font-family: DM Sans;
      font-size: 0.875rem;
      font-style: normal;
      font-weight: 400;
      line-height: 18px;
    }

    .padding-bottom-2 {
      padding-bottom: 2rem;
    }
    img {
        border-width: 0.25rem;
        border-color: #9394ab;
        border-style: solid;
        border-radius: 0.25rem;
      }

    .instructions-wrapper {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2rem;
      margin-block-start: 2rem;
      margin-block-end: 4rem;
    }
    .instructions {
      display: flex;
      align-items: center;
      text-align: initial;
    }

    .instructions svg {
      flex-shrink: 0;
      margin-inline-end: 2rem;
    }

    .instructions p {
      margin-block: 0;
    }

    .instruction-body {
      font-size: 0.75rem;
    }

    h1 {
      color: var(--web-digital-blue, #001096);
      text-align: center;

      /* h1 */
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 700;
      line-height: 36px; /* 150% */
    }

    .p2 {
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 1rem;
    }

    .instruction-header {
      color: var(--web-digital-blue, #001096);
    }

    .h2 {
      font-size: 1rem;
      font-style: normal;
      font-weight: 700;
      line-height: 1.5rem;
    }
  </style>
  ${styles(this.themeColor)}
  <div id='document-capture-review-screen' class='flow center' dir='${this.direction}'>
  ${this.showNavigation ? `<smileid-navigation show-navigation hide-back></smileid-navigation>` : ''}
    <h1 class="header-title title-color">
      ${t('document.review.question')}
    </h1>
    <p class="description">${t('document.review.description')}</p>
    <div class='section | flow'>
      <div class='id-image-container'>
        <div class='id-image'>
          <div class='video-overlay'></div>
          ${this.imageSrc ? `<img alt='your ID card' id='document-capture-review-image' src='${this.imageSrc}' />` : ''}
          </div>
        <div class='flow action-buttons'>
          <button data-variant='solid full-width' class='button' type='button' id='select-id-image'>
            ${t('document.review.acceptButton')}
          </button>
          <button data-variant='ghost full-width' class='button  retake-photo' type='button' id='re-capture-id-image'>
            ${t('document.review.retakeButton')}
          </button>
        </div>
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

class IdReview extends HTMLElement {
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
    return this.getAttribute('title') || t('document.title.front');
  }

  get direction() {
    return this.getAttribute('dir') || getDirection() || 'ltr';
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('document-capture-review.cancelled'));
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent('document-capture-review.close'));
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
    this.selectIDImage = this.shadowRoot.querySelector('#select-id-image');
    this.reCaptureIDImage = this.shadowRoot.querySelector(
      '#re-capture-id-image',
    );
    this.navigation = this.shadowRoot.querySelector('smileid-navigation');
    this.navigation?.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    this.navigation?.addEventListener('navigation.close', () => {
      this.handleCloseEvents();
    });

    this.selectIDImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('document-capture-review.accepted', {
          detail: {},
        }),
      );
    });
    this.reCaptureIDImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('document-capture-review.rejected', {
          detail: {},
        }),
      );
    });
  }
}

if (
  'customElements' in window &&
  !customElements.get('document-capture-review')
) {
  window.customElements.define('document-capture-review', IdReview);
}

export default IdReview;
