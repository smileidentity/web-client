import { t, getDirection } from '../../../domain/localisation';

class Navigation extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const direction = getDirection();
    const hostPadding = '0px';
    const buttonSize = '40px';
    const buttonBackground = 'rgba(132, 130, 130, 0.9)';
    const buttonBorder = '1px solid rgba(255, 255, 255, 0.1)';
    const iconSize = '20px';
    const iconColor = this.hasThemeColor ? this.themeColor : '#FFFFFF';
    const focusColor = '#FFFFFF';

    const style = document.createElement('style');
    style.textContent = `
:host {
  display: flex;
  max-inline-size: 100%;
  justify-content: ${this.showBackButton ? 'space-between' : 'flex-end'};
  direction: ${direction};
  padding: var(--smileid-navigation-padding, ${hostPadding});
  gap: 1rem;
}

:host([dir="rtl"]) .back-button svg,
:host .back-button svg[data-rtl="true"] {
  transform: scaleX(-1);
}

button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: ${buttonSize};
  height: ${buttonSize};
  border-radius: 50%;
  background: var(--smileid-navigation-button-bg, ${buttonBackground});
  border: ${buttonBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--smileid-navigation-icon-color, ${iconColor});
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: box-shadow 0.15s ease;
}

button:hover {
  box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.15);
}

button:focus-visible {
  outline: 2px solid var(--smileid-navigation-focus-color, ${focusColor});
  outline-offset: 3px;
}

button svg {
  width: ${iconSize};
  height: ${iconSize};
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
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        data-rtl="${direction === 'rtl'}"
      >
        <path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span part="back-button-text" class="visually-hidden">${t('navigation.back')}</span>
    `;

    const closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'close-button');
    closeButton.setAttribute('part', 'close-button');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute(
      'aria-label',
      t('navigation.closeVerificationFrame'),
    );
    closeButton.innerHTML = `
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="currentColor"
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
