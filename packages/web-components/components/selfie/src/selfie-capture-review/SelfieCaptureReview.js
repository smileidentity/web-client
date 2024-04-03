import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

function templateString() {
  return `
  ${styles}
    <style>
      .retake-photo.button[data-variant~="ghost"] {
        color: #FF5805;
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
      .section {
        border-radius: .5rem;
        margin-left: auto;
        margin-right: auto;
        max-width: 35ch;
        padding: 1rem;
      }
      .selfie-capture-review-image {
        overflow: hidden;
        aspect-ratio: 1/1;
      }
      #review-image {
        scale: 1.75;
      }
      @media (max-aspect-ratio: 1/1) {
        #review-image {
          transform: scaleX(-1) translateY(-10%);
        }
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
      #selfie-capture-review-screen {
        block-size: 45rem;
        padding-block: 2rem;
        display: flex;
        flex-direction: column;
        max-block-size: 100%;
        max-inline-size: 40ch;
      }
      #selfie-capture-review-screen .id-video-container.landscape {
        height: auto;
      }
      #selfie-capture-review-screen header p {
        margin-block: 0 !important;
      }
      .id-video-container.portrait {
        width: 100%;
        position: relative;
        height: calc(200px * 1.4);
      }
    
      .id-video-container.portrait img {
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
    
      .video-container,
      .id-video-container.landscape {
        position: relative;
        z-index: 1;
        width: 100%;
      }

      .video-container img {
        background-color: black;
        position: absolute;
        left: 50%;
        height: calc(100% - 6px);
        clip-path: ellipse(101px 118px);
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
    ${styles}
    <div id='selfie-capture-review-screen' class='flow center'>
    <smileid-navigation ${this.showNavigation ? 'show-navigation' : ''} hide-back></smileid-navigation>
    <h1 class="header-title text-2xl color-digital-blue font-bold">
      Is your whole face visible and clear in this photo?
    </h1>
    <p class="description">Make sure all corners of the document 
    are visible and there is no glare</p>
    <div class='section | flow'>
      <div class='id-video-container ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
        ${
  this.imageSrc
    ? `<img
        alt='your ID card'
        id='document-capture-review-image'
        src='${this.imageSrc}'
        width='396'
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
    this.dispatchEvent(new CustomEvent('selfie-review.cancelled'));
  }

  closeWindow() {
    this.dispatchEvent(new CustomEvent('selfie-review.close'));
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
    const CloseIframeButtons = this.shadowRoot.querySelectorAll('.close-iframe');

    if (this.backButton) {
      this.backButton.addEventListener('click', (e) => {
        this.handleBackEvents(e);
      });
    }
    CloseIframeButtons.forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          this.closeWindow();
        },
        false,
      );
    });

    this.selectImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('selfie-review.accepted', {
          detail: {},
        }),
      );
    });
    this.reCaptureImage.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('selfie-review.rejected', {
          detail: {},
        }),
      );
    });
  }
}

if ('customElements' in window && !customElements.get('selfie-capture-review')) {
  window.customElements.define('selfie-capture-review', SelfieCaptureReview);
}

export default SelfieCaptureReview;
