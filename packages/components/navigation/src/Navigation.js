class Navigation extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
:host {
  display: flex;
  max-inline-size: 100%;
  justify-content: ${this.showBackButton ? 'space-between' : 'flex-end'};
}

button {
  --button-color: var(--color-default);
  --flow-space: 3rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  align-items: center;
  appearance: none;
  background-color: transparent;
  border-radius: 2.5rem;
  border: none;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 20px;
  font-weight: 500;
  inline-size: 100%;
  justify-content: center;
  letter-spacing: 0.05ch;
  line-height: 1;
  padding: 1rem 2.5rem;
  text-align: center;
  text-decoration: none;
}

button[data-type="icon"] {
  align-items: center;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  padding: 0;
  width: auto;
}

:host::part(back-button) {
  display: flex;
  align-items: center;
}

:host::part(back-button-text) {
  line-height: 1;
  color: rgb(21, 31, 114) !important;
}

:host::part(close-button) {
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
    backButton.setAttribute('data-type', 'icon');
    backButton.setAttribute('part', 'back-button');
    backButton.setAttribute('type', 'button');
    backButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fill="#DBDBC4"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
          opacity=".4"
        />
        <path
          fill="#001096"
          d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"
        />
      </svg>
      <span part="back-button-text">Back</span>
    `;

    const closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'close-button');
    closeButton.setAttribute('data-type', 'icon');
    closeButton.setAttribute('part', 'close-button');
    closeButton.setAttribute('type', 'button');
    closeButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="40"
        height="40"
        fill="none"
      >
        <path
          fill="#DBDBC4"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
          opacity=".4"
        />
        <path
          fill="#91190F"
          d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"
        />
      </svg>
      <span class="visually-hidden"
        >Close SmileIdentity Verification frame</span
      >
    `;

    shadow.appendChild(style);
    if (this.showBackButton) shadow.appendChild(backButton);
    shadow.appendChild(closeButton);

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
    this.dispatchEvent(
      new CustomEvent('navigation.back'),
    );
  }

  handleClose() {
    this.dispatchEvent(
      new CustomEvent('navigation.close'),
    );
  }

  get showBackButton() {
    return !this.hasAttribute('hide-back');
  }
}

if ('customElements' in window) {
  window.customElements.define('smileid-navigation', Navigation);
}

export default Navigation;
