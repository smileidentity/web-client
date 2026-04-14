import { t, getDirection } from '../../../domain/localisation';

class Navigation extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const direction = getDirection();

    const style = document.createElement('style');
    style.textContent = `
:host {
  display: flex;
  max-inline-size: 100%;
  justify-content: ${this.showBackButton ? 'space-between' : 'flex-end'};
  direction: ${direction};
}

:host([dir="rtl"]) .back-button svg,
:host .back-button svg[data-rtl="true"] {
  transform: scaleX(-1);
}

button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}

button:hover {
  background: rgba(0, 0, 0, 0.15);
}

button:focus-visible {
  outline: 2px solid #151f72;
  outline-offset: 3px;
}

button svg {
  width: 24px;
  height: 24px;
}

:host::part(back-button) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:host::part(close-button) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  block-size: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  inline-size: 1px;
}
    `;

    const backButton = document.createElement('button');
    backButton.setAttribute('class', 'back-button');
    backButton.setAttribute('part', 'back-button');
    backButton.setAttribute('type', 'button');
    backButton.setAttribute('aria-label', t('navigation.back'));
    backButton.innerHTML = `
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        data-rtl="${direction === 'rtl'}"
      >
        <path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    const closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'close-button');
    closeButton.setAttribute('part', 'close-button');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', t('navigation.closeVerificationFrame'));
    closeButton.innerHTML = `
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    shadow.appendChild(style);
    if (this.showBackButton) shadow.appendChild(backButton);
    shadow.appendChild(closeButton);

    // Set language direction attribute on host for CSS selectors
    this.setAttribute('dir', direction);

    // Back Button Controls
    this.backButton = backButton;
    this.backButton.addEventListener('click', () => this.handleBack());

    // Close Button Controls
    this.closeButton = closeButton;
    this.closeButton.addEventListener('click', () => this.handleClose());
  }

  disconnectedCallback() {
    this.backButton.removeEventListener('click', () => this.handleBack());
    this.closeButton.removeEventListener('click', () => this.handleClose());
  }

  handleBack() {
    this.dispatchEvent(new CustomEvent('navigation.back'));
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent('navigation.close'));
  }

  get showBackButton() {
    return !this.hasAttribute('hide-back');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#001096';
  }

  get hasThemeColor() {
    return this.getAttribute('theme-color')?.trim();
  }
}

if (
  'customElements' in window &&
  !window.customElements.get('smileid-navigation')
) {
  window.customElements.define('smileid-navigation', Navigation);
}

export default Navigation;
