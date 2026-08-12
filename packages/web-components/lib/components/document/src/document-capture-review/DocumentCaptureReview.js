import styles from '../../../../styles/src/styles';
import '../../../navigation/src';
import { t, getDirection } from '../../../../domain/localisation';

function templateString() {
  return `
  <style>
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    #document-capture-review-screen {
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 100%;
      position: relative;
      overflow: hidden;
    }

    /* ── Navigation (top) ─────────────────────────────────── */
    .review-nav {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      z-index: 10;
    }

    /* ── Captured image area ──────────────────────────────── */
    .review-image-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 72px 24px 16px;
      min-height: 0;
    }

    .review-image {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      border-radius: 12px;
      display: block;
      object-fit: contain;
    }

    /* ── Bottom card ──────────────────────────────────────── */
    .review-footer {
      padding: 0 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .review-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08),
        0px 4px 6px -2px rgba(16, 24, 40, 0.03);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
    }

    .review-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: ${this.themeColor};
    }

    .review-description {
      margin: 0 0 8px;
      font-size: 0.8125rem;
      font-weight: 400;
      line-height: 1.3;
      color: #5b6b7b;
    }

    /* ── Circular action buttons ──────────────────────────── */
    .review-actions {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      justify-content: center;
      margin-top: 4px;
    }

    .circle-btn {
      appearance: none;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s ease, opacity 0.15s ease;
    }

    .circle-btn:active .circle {
      transform: scale(0.95);
    }

    .circle-btn.retake .circle {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
    }

    .circle-btn.confirm .circle {
      background: #e7f9ee;
      border: 1.5px solid #2cc05c;
    }

    .circle-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #90a1b9;
    }

    .circle-label.confirm-label {
      color: #12b76a;
    }

    .circle-btn:focus-visible {
      outline: 2px solid ${this.themeColor};
      outline-offset: 3px;
      border-radius: 8px;
    }

    .review-attribution {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (min-width: 640px) {
      .review-image-area {
        padding-top: 80px;
      }
      .review-close {
        top: 28px;
        right: 28px;
      }
    }

    /* Short landscape viewport (e.g. a phone turned to landscape with
       rotation-lock off, ~390-430px tall). The portrait column stack has no
       vertical room there, so the captured image collapses to 0 height and the
       confirm card overflows. Lay the screen out as two columns instead —
       captured image on the left, confirm card on the right, both vertically
       centred — so the image stays visible and the card fits. Gated on
       max-height (the actual cause) rather than pointer type: a normal desktop
       window is tall enough to never match, so its centred-card layout (and the
       min-width:640 rule above) is unaffected; taller tablets in landscape keep
       the stack too. Ordered after the min-width:640 rule so it wins padding on
       a landscape phone (width >= 640). */
    @media (orientation: landscape) and (max-height: 520px) {
      #document-capture-review-screen {
        flex-direction: row;
        align-items: center;
      }
      .review-image-area {
        padding: 16px 8px 16px 16px;
        height: 100%;
      }
      .review-footer {
        flex-direction: column;
        justify-content: center;
        flex-shrink: 0;
        width: 45%;
        max-width: 440px;
        height: 100%;
        padding: 16px 16px 16px 8px;
      }
      .review-card {
        padding: 16px 20px;
      }
    }
  </style>
  ${styles(this.themeColor)}
  <div id='document-capture-review-screen' dir='${this.direction}'>
    ${
      this.showNavigation
        ? `<div class='review-nav'>
            <smileid-navigation theme-color='${this.themeColor}' show-navigation hide-back></smileid-navigation>
          </div>`
        : ''
    }

    <div class='review-image-area'>
      ${this.imageSrc ? `<img class='review-image' alt='${t('document.submission.imageAlt')}' id='document-capture-review-image' src='${this.imageSrc.replace(/'/g, '&#39;').replace(/</g, '&lt;')}' />` : ''}
    </div>

    <div class='review-footer'>
      <div class='review-card'>
        <h1 class='review-title'>${t('document.review.confirmTitle')}</h1>
        <p class='review-description'>${t('document.review.confirmBody')}</p>
        <div class='review-actions'>
          <button class='circle-btn retake' type='button' id='re-capture-id-image' aria-label='${t('document.review.retake')}'>
            <span class='circle'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#90A1B9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
                <polyline points='1 4 1 10 7 10'></polyline>
                <path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10'></path>
              </svg>
            </span>
            <span class='circle-label'>${t('document.review.retake')}</span>
          </button>
          <button class='circle-btn confirm' type='button' id='select-id-image' aria-label='${t('document.review.confirm')}'>
            <span class='circle'>
              <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='#12B76A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
                <polyline points='20 6 9 17 4 12'></polyline>
              </svg>
            </span>
            <span class='circle-label confirm-label'>${t('document.review.confirm')}</span>
          </button>
        </div>
      </div>

      ${this.hideAttribution ? '' : '<div class="review-attribution"><powered-by-smile-id></powered-by-smile-id></div>'}
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
    this.navigation?.addEventListener('navigation.close', () => {
      this.handleCloseEvents();
    });
    this.navigation?.addEventListener('navigation.back', () => {
      this.handleBackEvents();
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
