import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

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
        height: 100vh;
        justify-content: center;
      }

      .video-overlay {
        position: absolute;
        border-width: 1rem;
        border-color: white;
        border-style: solid;
        inset: 0px;
      }

      img {
        clip-path: polygon(10% 10%, 90% 10%, 90% 85%, 10% 85%);
      }
    }
    
    .id-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
    }

    .id-image {
      max-width: fit-content;
      height: auto;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    img {
      height: 100%;
      min-height: 100px;
      clip-path: polygon(5% 5%, 95% 5%, 95% 90%, 5% 90%);
    }

    .video-overlay .inner-border {
      position: absolute;
      border-width: 1rem;
      border-color: #9394ab;
      border-style: solid;
      border-radius: 1rem;
      inset: -8px;
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
      block-size: 45rem;
      padding-block: 2rem;
      display: flex;
      flex-direction: column;
      max-block-size: 100%;
      max-inline-size: 40ch;
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
      font-size: 1.5rem;
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
  <div id='document-capture-review-screen' class='flow center'>
  <smileid-navigation ${this.showNavigation ? 'show-navigation' : ''} hide-back></smileid-navigation>
    <h1 class="header-title title-color">
      Is the document clear and readable?
    </h1>
    <p class="description">Make sure all corners of the document 
    are visible and there is no glare</p>
    <div class='section | flow'>
      <div class='id-image-container'>
        <div class='id-image'>
          <div class='video-overlay'></div>
          ${this.imageSrc ? `<img alt='your ID card' id='document-capture-review-image' src='${this.imageSrc}' width='396' />` : ''}
          </div>
        <div class='flow action-buttons'>
          <button data-variant='solid full-width' class='button' type='button' id='select-id-image'>
            Yes, my ID is readable
          </button>
          <button data-variant='ghost full-width' class='button  retake-photo' type='button' id='re-capture-id-image'>
            No, retake photo
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
    return this.getAttribute('theme-color') || '#043C93';
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
    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    this.navigation.addEventListener('navigation.close', () => {
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
