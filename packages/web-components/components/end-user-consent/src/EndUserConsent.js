import styles from "../../../styles/src/styles";
import "../../totp-consent/src/TotpConsent";

function templateString() {
  return `
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :host {
        --flow-space: 1.5rem;

        --color-dark: #404040;
        --color-grey: #555B69;

        --color-success: #1EB244;
        --color-failure: #FFEDEB;
        --color-failure-tint: #F86B58;
        --color-danger: #FF5805;
       
        --color-primary-blue: #151F72;
        --color-richblue: #043C93;
        --color-theme: ${this.themeColor};
      }

      html {
        font-family: 'DM Sans', sans-serif;
      }

      [hidden] {
        display: none !important;
      }

      [disabled] {
        cursor: not-allowed !important;
        filter: grayscale(75%);
      }

      .visually-hidden {
        border: 0;
        clip: rect(1px 1px 1px 1px);
        clip: rect(1px, 1px, 1px, 1px);
        height: auto;
        margin: 0;
        overflow: hidden;
        padding: 0;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

      .color-dark {
        color: var(--color-dark);
      }

      .color-grey {
        color: var(--color-grey);
      }

      .flow > * + * {
        margin-top: var(--flow-space);
      }

      .center {
        margin-left: auto;
        margin-right: auto;

        text-align: center;
      }

      h1 {
        font-size: 20px;
        font-weight: 400;
      }

      ol[role=list], ul[role=list] {
        list-style: none;
        padding-left: 0;
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
        letter-spacing: .05ch;
        line-height: 1;
        padding: 1rem 2.5rem;
        text-align: center;
        text-decoration: none;
      }

      button[data-variant='solid'] {
        background-color: var(--button-color);
        border: 2px solid var(--button-color);
      }

      button[data-variant='outline'] {
        color: var(--button-color);
        border: 2px solid var(--button-color);
      }

      button[data-variant='ghost'] {
        color: var(--button-color);
      }

      button:hover,
      button:focus,
      button:active {
        --button-color: var(--color-active);
      }

      button:disabled {
        --button-color: var(--color-disabled);
      }

      button[data-type='icon'] {
        align-items: center;
        background-color: transparent;
        border: 0;
        cursor: pointer;
        display: flex;
        padding: 0;
      }

      button[data-type='icon'] {
        height: 2rem;
        padding: 0;
        width: 2rem;
        background: transparent;
      }

      .nav {
        display: flex;
        justify-content: space-between;
      }

      .justify-right {
        justify-content: end !important;
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

      img {
        border-radius: 50%;
        position: relative;
      }

      img::before {
        background-color: #ffffff;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .demo-tip {
        align-items: center;
        background-color: #f5fcff;
        border-radius: .75rem;
        border: 1px solid #A9D1E8;
        color: inherit;
        display: flex;
        font-size: .875rem;
        max-width: 36rem;
        padding: 1rem;
        text-align: left;
        text-decoration: none;
      }

      .demo-tip > * + * {
        margin-left: .5rem;
      }

      .callout {
        font-size: .875rem;
        padding: 1rem 1.5rem;
        max-width: 20.6875rem;
      }

      .processing-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        padding-top: 2rem;

      }

      .processing-list__items {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .processing-list__items > * + p {
        margin-left: 1rem;
      }

      .processing-list__items-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .processing-list__item__title {
        color: #151F72;
      }

      .processing-list__items-item__description {
        width: 269px
      }

      .theme {
        font-weight: 700;
        color: var(--color-theme);
      }

      .tooltip {
        position: relative;
      }

      .tooltip__trigger {
      }

      .tooltip__trigger:focus + .tooltip__content,
      .tooltip__trigger:hover + .tooltip__content {
        display: flex;
      }

      .tooltip__content {
        align-items: flex-start;
        background-color: #ffffff;
        border-radius: .5rem;
        box-shadow: 0px 12px 36px rgba(0, 0, 0, 0.08);
        display: none;
        padding: 1.25rem;
        position: absolute;
        right: 20px;
        bottom: -50px;
        width: 200px;
      }

      .tooltip__content > :last-child {
        margin-left: 1rem;
      }

      .tooltip__content .title {
        font-size: .75rem;
        font-weight: 700;
      }

      .tooltip__content .description {
        --flow-space: .25rem;
        font-size: .625rem;
        color: #6B7280;
      }

      svg {
        flex-shrink: 0;
      }

      [disabled] {
        cursor: not-allowed;
        filter: opacity(.7);
      }

      .credits {
        --flow-space: 2rem;
        margin-inline: auto;
        max-inline-size: 10rem;
      }

      .company-name {
        text-transform: uppercase;
        letter-spacing: .1rem;
        border-left: 1px solid #cecece;
        margin-left: .75rem;
        padding-left: .75rem;
        display: inline-flex;
        align-items: center;
      }

      .company-name svg {
        margin-right: .5rem;
      }
      #cancel {
        color: var(--color-danger);
      }
    </style>
    ${styles}
    <div id='consent-screen'>
      <section class='flow center'>
        <div class="nav ${this.hideBack ? "justify-right" : ""}">
          <div class="back-wrapper" ${this.hideBack ? "hidden" : ""}>
            <button type='button' data-type='icon' id="back-button" class="back-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
          <button data-type='icon' type='button' class='close-iframe'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
        <img alt='' width='50' height='50' src='${this.partnerLogoURL}' />
        <p class='demo-tip' ${this.demoMode ? "" : "hidden"}>
          <svg aria-hidden='true' width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4.46045" y="4.46069" width="47.7205" height="47.7205" rx="23.8603" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M35.1578 25.7487H34.2813V23.1195C34.2813 20.2273 31.915 17.861 29.0229 17.861C26.1307 17.861 23.7644 20.2273 23.7644 23.1195V25.7487H22.888C21.3981 25.7487 20.2588 26.888 20.2588 28.3779V34.5128C20.2588 36.0027 21.3981 37.142 22.888 37.142H35.1578C36.6476 37.142 37.787 36.0027 37.787 34.5128V28.3779C37.787 26.888 36.6476 25.7487 35.1578 25.7487ZM25.5171 23.1194C25.5171 21.1913 27.0946 19.6138 29.0227 19.6138C30.9508 19.6138 32.5283 21.1913 32.5283 23.1194V25.7487H25.5171V23.1194ZM35.1577 35.3892C35.6836 35.3892 36.0342 35.0386 36.0342 34.5128V28.3779C36.0342 27.8521 35.6836 27.5015 35.1577 27.5015H22.888C22.3622 27.5015 22.0116 27.8521 22.0116 28.3779V34.5128C22.0116 35.0386 22.3622 35.3892 22.888 35.3892H35.1577Z" fill="#2D9CDB"/>
            <rect x="4.46045" y="4.46069" width="47.7205" height="47.7205" rx="23.8603" stroke="#DDF2F7" stroke-width="7.15808"/>
          </svg>

          <span>
            This consent screen is for illustrative purposes only. Demo App does not collect personal ID data.
          </span>
        </p>
        <h1 class='text-base font-bold'>
          <span class='theme'>${this.partnerName}</span>
          wants to access your
          <span class='theme'>${this.idTypeLabel}</span>
          information
        </h1>
        <p class='text-base font-normal'>
          This will allow ${this.partnerName} to:
        </p>
      </section>

      <ul role='list' class='processing-list flow' style='--flow-space: 0rem; margin: var(--flow-space) auto;'>
        <li class='processing-list__items'>
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.4" d="M9.49983 0C13.0841 0 15.9894 2.90479 15.9894 6.4883C15.9894 10.0718 13.0841 12.9766 9.49983 12.9766C5.91561 12.9766 3.01025 10.0718 3.01025 6.4883C3.01025 2.90479 5.91561 0 9.49983 0Z" fill="#5E646E"/>
            <path d="M1.47086 20.2288H17.5251C18.0342 20.2288 18.5313 20.1561 19 20.0227C18.3413 15.3646 14.3409 11.7811 9.50001 11.7811C4.65909 11.7811 0.658656 15.3646 0 20.0227C0.468737 20.1561 0.961716 20.2288 1.4749 20.2288" fill="#151F72"/>
            <path d="M14.9238 19.0148L13.8262 17.931C13.8262 17.931 13.6341 17.7956 13.5244 17.7956C13.4146 17.7956 13.3049 17.8498 13.2226 17.931C13.1402 18.0123 13.0854 18.1207 13.0854 18.2291C13.0854 18.3374 13.1402 18.4458 13.2226 18.5271L14.622 19.9089C14.622 19.9089 14.814 20.0443 14.9238 20.0443C15.0335 20.0443 15.1433 19.9901 15.2256 19.9089L17.8323 17.335C17.8323 17.335 17.9421 17.1724 17.9421 17.0369C17.9421 16.9015 17.9146 16.8202 17.8323 16.7389C17.75 16.6576 17.6677 16.6305 17.5579 16.6305C17.4482 16.6305 17.3384 16.6576 17.2835 16.7389L15.0061 18.9877L14.9238 19.0148ZM15.5 24C15.5 24 15.4177 24 15.3902 24C15.3628 24 15.3354 24 15.3079 24C14.0457 23.6207 13.0305 22.8621 12.2073 21.7241C11.4116 20.5862 11 19.3128 11 17.931V15.2217C11 15.0591 11.0549 14.8965 11.1646 14.734C11.2744 14.5714 11.4116 14.4901 11.5488 14.4089L15.1982 13.0542C15.1982 13.0542 15.3902 13 15.5 13C15.6098 13 15.6921 13 15.8018 13.0542L19.4512 14.4089C19.6159 14.4631 19.753 14.5714 19.8354 14.734C19.9177 14.8965 20 15.032 20 15.2217V17.931C20 19.3128 19.5884 20.5862 18.7927 21.7241C17.9969 22.8621 16.9543 23.6478 15.6921 24H15.5Z" fill="#2CC05C"/>
          </svg>        
          <div class='processing-list__items-item'>
            <p class='font-medium text-base processing-list__item__title'>Process your personal details</p>
            <p class='text-xs font-medium processing-list__items-item__description'>Partner can process your names, DoB and gender</p>
          </div
        </li>
        <li class='processing-list__items'>
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0226 7.222C14.8323 7.222 14.642 7.152 14.4918 7.002L12.4888 5.002C12.3491 4.86086 12.2708 4.67043 12.2708 4.472C12.2708 4.27357 12.3491 4.08313 12.4888 3.942C12.7792 3.652 13.2599 3.652 13.5504 3.942L15.0226 5.412L18.4978 1.952C18.7882 1.662 19.269 1.662 19.5594 1.952C19.8498 2.242 19.8498 2.722 19.5594 3.012L15.5534 7.012C15.4032 7.142 15.2129 7.222 15.0226 7.222Z" fill="#2CC05C"/>
            <path opacity="0.4" d="M9.80472 12.71L6.5298 15.98C6.16926 15.66 5.81874 15.33 5.47822 14.99C4.46547 13.972 3.5314 12.8789 2.68403 11.72C1.8628 10.58 1.2018 9.44 0.721083 8.31C0.240361 7.17 0 6.08 0 5.04C0 4.36 0.12018 3.71 0.360541 3.11C0.600902 2.5 0.981474 1.94 1.51227 1.44C2.15323 0.81 2.85429 0.5 3.5954 0.5C3.87582 0.5 4.15624 0.56 4.40662 0.68C4.66701 0.8 4.89735 0.98 5.07762 1.24L7.40111 4.51C7.58138 4.76 7.71158 4.99 7.80171 5.21C7.89185 5.42 7.94192 5.63 7.94192 5.82C7.94192 6.06 7.87182 6.3 7.73161 6.53C7.60141 6.76 7.41113 7 7.17077 7.24L6.40962 8.03C6.29946 8.14 6.24938 8.27 6.24938 8.43C6.24938 8.51 6.2594 8.58 6.27943 8.66C6.30947 8.74 6.33952 8.8 6.35955 8.86C6.53982 9.19 6.85028 9.62 7.29095 10.14C7.74162 10.66 8.22234 11.19 8.74313 11.72C9.10367 12.07 9.45419 12.41 9.80472 12.71Z" fill="#5E646E"/>
            <path d="M20 16.83C19.9987 17.2074 19.9131 17.5798 19.7496 17.92C19.5794 18.28 19.359 18.62 19.0686 18.94C18.5779 19.48 18.037 19.87 17.4261 20.12C17.4161 20.12 17.4061 20.13 17.3961 20.13C16.8052 20.37 16.1642 20.5 15.4732 20.5C14.4517 20.5 13.36 20.26 12.2083 19.77C11.0566 19.28 9.90483 18.62 8.76312 17.79C8.37253 17.5 7.98195 17.21 7.61139 16.9L10.8863 13.63C11.1667 13.84 11.4171 14 11.6274 14.11C11.6775 14.13 11.7376 14.16 11.8077 14.19C11.8878 14.22 11.9679 14.23 12.0581 14.23C12.2283 14.23 12.3585 14.17 12.4687 14.06L13.2298 13.31C13.4802 13.06 13.7206 12.87 13.9509 12.75C14.1813 12.61 14.4116 12.54 14.662 12.54C14.8523 12.54 15.0526 12.58 15.2729 12.67C15.4932 12.76 15.7236 12.89 15.9739 13.06L19.2889 15.41C19.5493 15.59 19.7296 15.8 19.8397 16.05C19.9399 16.3 20 16.55 20 16.83Z" fill="#151F72"/>
          </svg>
          <div class='processing-list__items-item'>
            <p class='font-medium text-base processing-list__item__title'>Process your contact information</p>
            <p class='text-xs font-medium processing-list__items-item__description'>Partner can process your phone numbers and address</p>
          </div
        </li>
        <li class='processing-list__items'>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect opacity="0.4" y="2" width="19" height="16" rx="4" fill="#5E646E"/>
            <path d="M0 8H19V14C19 16.2091 17.2091 18 15 18H4C1.79086 18 0 16.2091 0 14V8Z" fill="#151F72"/>
            <path d="M4.66669 9C5.77129 9 6.66669 9.89539 6.66669 11C6.66669 12.1046 5.77129 13 4.66669 13C3.56208 13 2.66669 12.1046 2.66669 11C2.66669 9.89539 3.56208 9 4.66669 9Z" fill="#2CC05C"/>
            <path d="M2.41287 15H6.91933C7.06224 15 7.20176 14.9771 7.33333 14.935C7.14845 13.4645 6.02552 12.3333 4.66667 12.3333C3.30781 12.3333 2.18489 13.4645 2 14.935C2.13158 14.9771 2.26996 15 2.41401 15" fill="#2CC05C"/>
            <rect x="10" y="10" width="7" height="1" rx="0.5" fill="#2CC05C"/>
            <rect x="10" y="12" width="5.25" height="1" rx="0.5" fill="#2CC05C"/>
            <rect x="10" y="14" width="3.5" height="1" rx="0.5" fill="#2CC05C"/>
            <g clip-path="url(#clip0_641_419)">
              <path d="M17.7221 0.583344H15.2779C14.2162 0.583344 13.5833 1.21626 13.5833 2.27793V4.71918C13.5833 5.78376 14.2162 6.41668 15.2779 6.41668H17.7191C18.7808 6.41668 19.4137 5.78376 19.4137 4.72209V2.27793C19.4166 1.21626 18.7837 0.583344 17.7221 0.583344Z" fill="#151F72"/>
              <path d="M16.0859 4.54474C16.0279 4.54469 15.9723 4.52161 15.9313 4.48058L15.1059 3.65516C15.0652 3.614 15.0424 3.55845 15.0424 3.50058C15.0424 3.4427 15.0652 3.38716 15.1059 3.34599C15.1904 3.26141 15.3304 3.26141 15.415 3.34599L16.0859 4.01683L17.585 2.51766C17.6696 2.43308 17.8096 2.43308 17.8942 2.51766C17.9788 2.60224 17.9788 2.74224 17.8942 2.82683L16.2404 4.48058C16.1995 4.52161 16.1439 4.54469 16.0859 4.54474Z" fill="#2CC05C"/>
            </g>
            <defs>
              <clipPath id="clip0_641_419">
              <rect width="7" height="7" fill="white" transform="translate(13)"/>
              </clipPath>
            </defs>
          </svg>
          <div class='processing-list__items-item'>
            <p class='font-medium text-base processing-list__item__title'>Process your document information</p>
            <p class='text-xs font-medium processing-list__items-item__description'>Partner can process your photo, ID expiration date, country of issuance and document number</p>
          </div
        </li>
      </ul>

      <section class='callout | flow center' style='--flow-space: 2rem; margin: var(--flow-space) auto;'>
        <p>
          You can view <span class='theme'>${this.partnerName}</span>'s privacy policy
          <a class='theme' href='${
            this.partnerPolicyURL
          }' rel='noreferer noopener' target='_blank'>here</a>
        </p>

        <p style='--flow-space: .75rem'>
          By choosing "Allow", you grant
          <span class='theme'>${this.partnerName}</span>
          consent to process your personal data to offer you this service
        </p>
      </section>

      <section class='flow' style='--flow-space: 2.5rem'>
        <button id='allow' data-variant='solid'>
          Allow
        </button>

        <button id='cancel' data-variant='ghost' class='color-danger' style='--flow-space: 1.5rem'>
          Cancel
        </button>
      </section>
    </div>

    <totp-consent
      hidden
      base-url='${this.baseUrl}'
      country='${this.country}'
      id-hint='${this.idHint}'
      id-regex='${this.idRegex}'
      id-type='${this.idType}'
      id-type-label='${this.idTypeLabel}'
      partner-id='${this.partnerId}'
      partner-name='${this.partnerName}'
      token='${this.token}'
    >
    </totp-consent>

    <div hidden id='consent-rejected-screen' class='flow'>
      <section class='flow center'>
        <svg xmlns="http://www.w3.org/2000/svg" width="185" height="138" fill="none">
          <g filter="url(#a)">
            <path fill="url(#b)" d="M115.503 88.266H70.86a3.443 3.443 0 0 1-3.445-3.444V23.59a3.443 3.443 0 0 1 3.445-3.444h44.643a3.443 3.443 0 0 1 3.444 3.444v61.232a3.443 3.443 0 0 1-3.444 3.444Z"/>
          </g>
          <path fill="#D5DDEA" d="M98.982 71.746H87.38a2.33 2.33 0 0 1-2.334-2.334 2.33 2.33 0 0 1 2.334-2.334h11.603a2.33 2.33 0 0 1 2.334 2.334 2.33 2.33 0 0 1-2.334 2.334Zm5.326 5.054H82.032c-.68 0-1.224-.544-1.224-1.224 0-.68.544-1.224 1.224-1.224h22.276c.68 0 1.224.544 1.224 1.224 0 .657-.544 1.223-1.224 1.223Z"/>
          <path fill="#D9DEEA" d="M108.41 44.439c0 4.578-2.017 8.68-5.213 11.467a15.186 15.186 0 0 1-10.016 3.739 15.09 15.09 0 0 1-10.016-3.762 15.17 15.17 0 0 1-5.212-11.467c0-8.407 6.82-15.228 15.228-15.228 8.407 0 15.229 6.844 15.229 15.251Z"/>
          <path fill="#fff" d="M103.197 55.906a15.187 15.187 0 0 1-10.016 3.739 15.09 15.09 0 0 1-10.016-3.762c1.11-.43 2.56-.997 4.51-1.79a1.87 1.87 0 0 0 .996-.952 1.8 1.8 0 0 0 .159-.77v-3.649c-.068-.068-.113-.159-.159-.227a3.648 3.648 0 0 1-.589-1.586l-.317-.158c-.93.226-.861-.771-1.11-2.697-.091-.793.022-.952.385-1.088l.294-.408c-1.813-4.079-.906-6.64.884-7.546-.59-1.292-.635-1.768-.635-1.768s3.808.635 5.1.386c1.654-.34 4.214.067 5.166 2.266 1.586.611 2.198 1.631 2.334 2.696.136.998-.158 2.085-.453 2.924a1.077 1.077 0 0 1-.068.158c0 .023-.023.046-.023.068-.045.114-.068.204-.113.295-.023.045-.023.09-.045.136-.023.09-.068.181-.09.25 0 .022 0 .022-.023.044l-.069.204a2.466 2.466 0 0 1-.068.227c.023.023.023.068.046.09.25.114.34.34.25 1.043-.228 1.836-.16 2.946-1.111 2.697l-.839 1.45c-.022.159-.045.25-.068.34-.022.272-.022.816-.022 3.807 0 .363.113.703.294.997.204.317.499.59.861.748 0 0 .023 0 .023.023 1.971.838 3.422 1.382 4.532 1.813Z"/>
          <path fill="url(#c)" d="M99.254 42.92c.068-.453-.136-1.042-.294-1.427-.023-.068-.068-.136-.091-.204-.725-1.45-2.357-2.062-3.898-2.153-3.943-.204-4.328.544-5.552-.589.386.567.408 1.496-.181 2.629-.408.793-1.201 1.155-1.926 1.382-1.813-4.079-.907-6.64.883-7.546-.589-1.292-.634-1.768-.634-1.768s3.807.635 5.099.386c1.654-.34 4.215.067 5.167 2.266 1.586.611 2.198 1.631 2.334 2.696.272 1.7-.725 3.58-.907 4.329Z"/>
          <path fill="url(#d)" d="M97.804 53.368v.702h-9.156v-.929a1.8 1.8 0 0 0 .16-.77v-3.649c-.069-.068-.114-.159-.16-.227v-.226c.204.34.454.634.748.906l2.856 2.017c.657.567 1.631.567 2.311.023l2.674-2.402c.09-.068.181-.159.272-.25-.023.272-.023.816-.023 3.807.046.363.136.703.318.998Z"/>
          <g filter="url(#e)">
            <path fill="url(#f)" d="M54.86 77.728H26.15a3.443 3.443 0 0 1-3.445-3.444V34.128a3.443 3.443 0 0 1 3.445-3.445h28.71a3.443 3.443 0 0 1 3.444 3.445v40.179a3.424 3.424 0 0 1-3.444 3.421Z"/>
          </g>
          <path fill="#D5DDEA" d="M44.504 66.33h-8.022a1.615 1.615 0 0 1-1.609-1.61c0-.883.725-1.608 1.609-1.608h8.022c.884 0 1.61.725 1.61 1.609s-.726 1.609-1.61 1.609Zm3.694 3.49H32.811a.837.837 0 0 1-.838-.839c0-.476.385-.838.838-.838h15.387c.476 0 .839.385.839.838a.851.851 0 0 1-.839.839Z"/>
          <path fill="#D9DEEA" d="M51.008 47.453a10.52 10.52 0 0 1-3.603 7.931 10.5 10.5 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.911-2.584a10.52 10.52 0 0 1-3.604-7.931c0-5.801 4.714-10.515 10.515-10.515 5.802 0 10.515 4.714 10.515 10.515Z"/>
          <path fill="#fff" d="M47.405 55.385a10.5 10.5 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.912-2.584a87.84 87.84 0 0 0 3.105-1.246c.317-.136.544-.363.68-.658.068-.158.113-.34.113-.543v-2.516a.69.69 0 0 1-.113-.158 2.36 2.36 0 0 1-.408-1.088l-.227-.113c-.634.158-.589-.544-.77-1.859-.068-.544.023-.657.25-.748l.203-.271c-1.246-2.833-.612-4.6.612-5.213-.408-.883-.43-1.223-.43-1.223s2.628.43 3.535.272c1.155-.227 2.9.045 3.557 1.563 1.088.43 1.519 1.133 1.61 1.858.09.703-.114 1.428-.295 2.017-.023.046-.023.068-.045.114 0 .022-.023.022-.023.045l-.068.204c-.023.023-.023.068-.045.09-.023.069-.046.114-.068.182v.023c-.023.045-.046.09-.046.136-.022.068-.045.113-.045.158.023.023.023.045.023.068.18.09.226.227.158.703-.158 1.269-.113 2.04-.77 1.858l-.567 1.02c-.022.113-.045.158-.045.249-.023.181-.023.567-.023 2.629 0 .249.068.475.204.68.136.226.34.407.59.498h.022c1.405.59 2.402.974 3.15 1.27Z"/>
          <path fill="url(#g)" d="M44.708 46.41c.046-.317-.09-.702-.204-.997l-.068-.136c-.498-.997-1.631-1.427-2.696-1.473-2.72-.136-2.992.386-3.83-.407.272.407.294 1.02-.113 1.813-.295.543-.839.793-1.315.951-1.246-2.832-.612-4.6.612-5.212-.408-.884-.43-1.224-.43-1.224s2.628.431 3.535.272c1.155-.226 2.9.046 3.557 1.564 1.088.43 1.519 1.133 1.61 1.858.135 1.179-.544 2.47-.658 2.992Z"/>
          <path fill="url(#h)" d="M43.711 53.64v.498H37.39v-.657a1.37 1.37 0 0 0 .113-.544v-2.515a.69.69 0 0 1-.113-.16v-.135c.136.227.317.453.52.612l1.972 1.382a1.264 1.264 0 0 0 1.61.023l1.858-1.654a.689.689 0 0 0 .18-.182c-.022.181-.022.567-.022 2.629 0 .25.068.498.204.703Z"/>
          <g filter="url(#i)">
            <path fill="url(#j)" d="M159.533 77.728h-28.712a3.443 3.443 0 0 1-3.444-3.444V34.128a3.443 3.443 0 0 1 3.444-3.445h28.712a3.443 3.443 0 0 1 3.445 3.445v40.179a3.424 3.424 0 0 1-3.445 3.421Z"/>
          </g>
          <path fill="#D5DDEA" d="M149.177 66.33h-8.022a1.616 1.616 0 0 1-1.609-1.61c0-.883.726-1.608 1.609-1.608h8.022c.884 0 1.609.725 1.609 1.609.023.884-.702 1.609-1.609 1.609Zm3.694 3.49h-15.387a.836.836 0 0 1-.838-.839c0-.476.385-.838.838-.838h15.387c.476 0 .839.385.839.838a.837.837 0 0 1-.839.839Z"/>
          <path fill="#D9DEEA" d="M155.704 47.453c0 3.172-1.405 6.005-3.604 7.931a10.498 10.498 0 0 1-6.911 2.584c-2.652 0-5.076-.975-6.912-2.584a10.52 10.52 0 0 1-3.603-7.931c0-5.801 4.713-10.515 10.515-10.515 5.801 0 10.515 4.714 10.515 10.515Z"/>
          <path fill="#fff" d="M152.101 55.385a10.501 10.501 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.912-2.584a87.84 87.84 0 0 0 3.105-1.246c.317-.136.544-.363.68-.658.068-.158.113-.34.113-.543v-2.516a.677.677 0 0 1-.113-.158 2.352 2.352 0 0 1-.408-1.088l-.227-.113c-.634.158-.589-.544-.77-1.859-.068-.544.022-.657.249-.748l.204-.271c-1.246-2.833-.612-4.6.612-5.213-.408-.883-.431-1.223-.431-1.223s2.629.43 3.535.272c1.156-.227 2.901.045 3.558 1.563 1.088.43 1.519 1.133 1.609 1.858.091.703-.113 1.428-.294 2.017-.023.046-.023.068-.046.114 0 .022-.022.022-.022.045l-.068.204c-.023.023-.023.068-.046.09-.022.069-.045.114-.068.182v.023c-.022.045-.045.09-.045.136-.023.068-.045.113-.045.158.022.023.022.045.022.068.182.09.227.227.159.703-.159 1.269-.113 2.04-.77 1.858l-.567 1.02c-.023.113-.045.158-.045.249-.023.181-.023.567-.023 2.629 0 .249.068.475.204.68.136.226.34.407.589.498h.023c1.382.59 2.379.974 3.15 1.27Z"/>
          <path fill="url(#k)" d="M149.382 46.41c.045-.317-.091-.702-.204-.997l-.068-.136c-.499-.997-1.632-1.427-2.697-1.473-2.719-.136-2.991.386-3.83-.407.272.407.295 1.02-.113 1.813-.295.543-.839.793-1.315.951-1.246-2.832-.611-4.6.612-5.212-.408-.884-.43-1.224-.43-1.224s2.628.431 3.535.272c1.156-.226 2.901.046 3.558 1.564 1.088.43 1.518 1.133 1.609 1.858.136 1.179-.521 2.47-.657 2.992Z"/>
          <path fill="url(#l)" d="M148.385 53.64v.498h-6.323v-.657a1.37 1.37 0 0 0 .113-.544v-2.515a.71.71 0 0 1-.113-.16v-.135c.136.227.317.453.521.612l1.972 1.382a1.264 1.264 0 0 0 1.609.023l1.858-1.654a.683.683 0 0 0 .181-.182c-.022.181-.022.567-.022 2.629 0 .25.068.498.204.703Z"/>
          <path fill="#F97B6A" d="M154.163 120.944 125.496 92.3l6.572-6.572 28.644 28.667-6.549 6.549Z"/>
          <path fill="#F97B6A" d="m168.44 135.334-21.982-21.982a4.72 4.72 0 0 1 0-6.662 4.719 4.719 0 0 1 6.663 0l21.981 21.981a4.719 4.719 0 0 1 0 6.663 4.72 4.72 0 0 1-6.662 0Z"/>
          <path fill="url(#m)" d="m166.876 136.739-28.282-28.282c-.657-.657-.657-1.722 0-2.402l7.229-7.229a1.71 1.71 0 0 1 2.403 0l28.281 28.282c.657.657.657 1.722 0 2.402l-7.229 7.229c-.68.657-1.745.657-2.402 0Z"/>
          <path fill="url(#n)" d="M93.045 0c-30.004 0-54.32 24.316-54.32 54.32 0 29.98 24.316 54.319 54.297 54.319 30.004 0 54.32-24.316 54.32-54.32C147.342 24.316 123.026 0 93.045 0Zm0 98.577c-24.09 0-43.6-19.829-43.6-44.28 0-24.452 19.51-44.258 43.6-44.258 24.089 0 43.6 19.829 43.6 44.28 0 24.452-19.534 44.258-43.6 44.258Z"/>
          <defs>
            <linearGradient id="b" x1="93.164" x2="93.164" y1="18.57" y2="89.001" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDFEFF"/>
              <stop offset=".996" stop-color="#ECF0F5"/>
            </linearGradient>
            <linearGradient id="c" x1="86.316" x2="100.21" y1="38.084" y2="38.084" gradientUnits="userSpaceOnUse">
              <stop stop-color="#B0BACC"/>
              <stop offset="1" stop-color="#969EAE"/>
            </linearGradient>
            <linearGradient id="d" x1="93.229" x2="93.229" y1="54.105" y2="50.91" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fff"/>
              <stop offset="1" stop-color="#E2E5EC"/>
            </linearGradient>
            <linearGradient id="f" x1="40.493" x2="40.493" y1="29.595" y2="78.236" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDFEFF"/>
              <stop offset=".996" stop-color="#ECF0F5"/>
            </linearGradient>
            <linearGradient id="g" x1="35.801" x2="45.385" y1="43.069" y2="43.069" gradientUnits="userSpaceOnUse">
              <stop stop-color="#B0BACC"/>
              <stop offset="1" stop-color="#969EAE"/>
            </linearGradient>
            <linearGradient id="h" x1="40.552" x2="40.552" y1="54.162" y2="51.953" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fff"/>
              <stop offset="1" stop-color="#E2E5EC"/>
            </linearGradient>
            <linearGradient id="j" x1="145.166" x2="145.166" y1="29.595" y2="78.236" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDFEFF"/>
              <stop offset=".996" stop-color="#ECF0F5"/>
            </linearGradient>
            <linearGradient id="k" x1="140.474" x2="150.059" y1="43.069" y2="43.069" gradientUnits="userSpaceOnUse">
              <stop stop-color="#B0BACC"/>
              <stop offset="1" stop-color="#969EAE"/>
            </linearGradient>
            <linearGradient id="l" x1="145.225" x2="145.225" y1="54.162" y2="51.953" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fff"/>
              <stop offset="1" stop-color="#E2E5EC"/>
            </linearGradient>
            <linearGradient id="m" x1="138.084" x2="177.007" y1="117.787" y2="117.787" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF6551"/>
              <stop offset="1" stop-color="#FF9F92"/>
            </linearGradient>
            <linearGradient id="n" x1="38.676" x2="147.361" y1="54.331" y2="54.331" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF6551"/>
              <stop offset="1" stop-color="#FF9F92"/>
            </linearGradient>
            <filter id="a" width="95.532" height="112.12" x="45.415" y="9.146" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
              <feOffset dy="11"/>
              <feGaussianBlur stdDeviation="11"/>
              <feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
            </filter>
            <filter id="e" width="79.601" height="91.045" x=".704" y="19.683" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
              <feOffset dy="11"/>
              <feGaussianBlur stdDeviation="11"/>
              <feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
            </filter>
            <filter id="i" width="79.601" height="91.045" x="105.377" y="19.683" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
              <feOffset dy="11"/>
              <feGaussianBlur stdDeviation="11"/>
              <feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
            </filter>
          </defs>
        </svg>

        <h1 style='font-size: 36px; line-height: 1; font-weight: 500; --flow-space: 1.5rem'>
          Consent Denied
        </h1>

        <p class='color-grey' style='--flow-space: 1rem'>
          We cannot verify you without your consent
        </p>

        <p>
          Wish to correct that?
        </p>
      </section>

      <button data-variant='solid' type='button' id='back-to-consent'>
        <svg style='transform: rotate(.5turn);' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Go Back
      </button>

      <button data-variant='outline' id='confirm-consent-rejection' style='--flow-space: 1rem; border-radius: 2rem'>
        No, Cancel Verification
      </button>

      <p class='center credits'>
        <span class='visually-hidden'>Powered by SmileID</span>
        <svg aria-hidden='true' viewBox="0 0 90 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <symbol id='attribution'>
            <path d="M0.544 7V1.4H2.616C3.064 1.4 3.43467 1.47467 3.728 1.624C4.02133 1.77333 4.24 1.97867 4.384 2.24C4.528 2.50133 4.6 2.79467 4.6 3.12C4.6 3.42933 4.53067 3.71467 4.392 3.976C4.25333 4.232 4.03733 4.44 3.744 4.6C3.45067 4.75467 3.07467 4.832 2.616 4.832H1.568V7H0.544ZM1.568 4H2.552C2.90933 4 3.16533 3.92267 3.32 3.768C3.48 3.608 3.56 3.392 3.56 3.12C3.56 2.84267 3.48 2.62667 3.32 2.472C3.16533 2.312 2.90933 2.232 2.552 2.232H1.568V4ZM7.08025 7.096C6.69625 7.096 6.34958 7.008 6.04025 6.832C5.73625 6.656 5.49358 6.41333 5.31225 6.104C5.13625 5.78933 5.04825 5.42667 5.04825 5.016C5.04825 4.60533 5.13892 4.24533 5.32025 3.936C5.50158 3.62133 5.74425 3.376 6.04825 3.2C6.35758 3.024 6.70425 2.936 7.08825 2.936C7.46692 2.936 7.80825 3.024 8.11225 3.2C8.42158 3.376 8.66425 3.62133 8.84025 3.936C9.02158 4.24533 9.11225 4.60533 9.11225 5.016C9.11225 5.42667 9.02158 5.78933 8.84025 6.104C8.66425 6.41333 8.42158 6.656 8.11225 6.832C7.80292 7.008 7.45892 7.096 7.08025 7.096ZM7.08025 6.208C7.34692 6.208 7.57892 6.10933 7.77625 5.912C7.97358 5.70933 8.07225 5.41067 8.07225 5.016C8.07225 4.62133 7.97358 4.32533 7.77625 4.128C7.57892 3.92533 7.34958 3.824 7.08825 3.824C6.81625 3.824 6.58158 3.92533 6.38425 4.128C6.19225 4.32533 6.09625 4.62133 6.09625 5.016C6.09625 5.41067 6.19225 5.70933 6.38425 5.912C6.58158 6.10933 6.81358 6.208 7.08025 6.208ZM10.6632 7L9.50319 3.032H10.5192L11.2072 5.888L12.0072 3.032H13.1432L13.9432 5.888L14.6392 3.032H15.6552L14.4872 7H13.4232L12.5752 4.032L11.7272 7H10.6632ZM18.0886 7.096C17.6886 7.096 17.334 7.01067 17.0246 6.84C16.7153 6.66933 16.4726 6.42933 16.2966 6.12C16.1206 5.81067 16.0326 5.45333 16.0326 5.048C16.0326 4.63733 16.118 4.272 16.2886 3.952C16.4646 3.632 16.7046 3.384 17.0086 3.208C17.318 3.02667 17.6806 2.936 18.0966 2.936C18.486 2.936 18.83 3.02133 19.1286 3.192C19.4273 3.36267 19.6593 3.59733 19.8246 3.896C19.9953 4.18933 20.0806 4.51733 20.0806 4.88C20.0806 4.93867 20.078 5 20.0726 5.064C20.0726 5.128 20.07 5.19467 20.0646 5.264H17.0486C17.07 5.57333 17.1766 5.816 17.3686 5.992C17.566 6.168 17.8033 6.256 18.0806 6.256C18.2886 6.256 18.462 6.21067 18.6006 6.12C18.7446 6.024 18.8513 5.90133 18.9206 5.752H19.9606C19.886 6.00267 19.7606 6.232 19.5846 6.44C19.414 6.64267 19.2006 6.80267 18.9446 6.92C18.694 7.03733 18.4086 7.096 18.0886 7.096ZM18.0966 3.768C17.846 3.768 17.6246 3.84 17.4326 3.984C17.2406 4.12267 17.118 4.336 17.0646 4.624H19.0406C19.0246 4.36267 18.9286 4.15467 18.7526 4C18.5766 3.84533 18.358 3.768 18.0966 3.768ZM20.9419 7V3.032H21.8539L21.9499 3.776C22.0939 3.52 22.2885 3.31733 22.5339 3.168C22.7845 3.01333 23.0779 2.936 23.4139 2.936V4.016H23.1259C22.9019 4.016 22.7019 4.05067 22.5259 4.12C22.3499 4.18933 22.2112 4.30933 22.1099 4.48C22.0139 4.65067 21.9659 4.888 21.9659 5.192V7H20.9419ZM25.9714 7.096C25.5714 7.096 25.2168 7.01067 24.9074 6.84C24.5981 6.66933 24.3554 6.42933 24.1794 6.12C24.0034 5.81067 23.9154 5.45333 23.9154 5.048C23.9154 4.63733 24.0008 4.272 24.1714 3.952C24.3474 3.632 24.5874 3.384 24.8914 3.208C25.2008 3.02667 25.5634 2.936 25.9794 2.936C26.3688 2.936 26.7128 3.02133 27.0114 3.192C27.3101 3.36267 27.5421 3.59733 27.7074 3.896C27.8781 4.18933 27.9634 4.51733 27.9634 4.88C27.9634 4.93867 27.9608 5 27.9554 5.064C27.9554 5.128 27.9528 5.19467 27.9474 5.264H24.9314C24.9528 5.57333 25.0594 5.816 25.2514 5.992C25.4488 6.168 25.6861 6.256 25.9634 6.256C26.1714 6.256 26.3448 6.21067 26.4834 6.12C26.6274 6.024 26.7341 5.90133 26.8034 5.752H27.8434C27.7688 6.00267 27.6434 6.232 27.4674 6.44C27.2968 6.64267 27.0834 6.80267 26.8274 6.92C26.5768 7.03733 26.2914 7.096 25.9714 7.096ZM25.9794 3.768C25.7288 3.768 25.5074 3.84 25.3154 3.984C25.1234 4.12267 25.0008 4.336 24.9474 4.624H26.9234C26.9074 4.36267 26.8114 4.15467 26.6354 4C26.4594 3.84533 26.2408 3.768 25.9794 3.768ZM30.6487 7.096C30.2754 7.096 29.942 7.00533 29.6487 6.824C29.3554 6.64267 29.1234 6.39467 28.9527 6.08C28.782 5.76533 28.6967 5.408 28.6967 5.008C28.6967 4.608 28.782 4.25333 28.9527 3.944C29.1234 3.62933 29.3554 3.384 29.6487 3.208C29.942 3.02667 30.2754 2.936 30.6487 2.936C30.9474 2.936 31.2087 2.992 31.4327 3.104C31.6567 3.216 31.838 3.37333 31.9767 3.576V1.24H33.0007V7H32.0887L31.9767 6.432C31.8487 6.608 31.678 6.76267 31.4647 6.896C31.2567 7.02933 30.9847 7.096 30.6487 7.096ZM30.8647 6.2C31.1954 6.2 31.4647 6.09067 31.6727 5.872C31.886 5.648 31.9927 5.36267 31.9927 5.016C31.9927 4.66933 31.886 4.38667 31.6727 4.168C31.4647 3.944 31.1954 3.832 30.8647 3.832C30.5394 3.832 30.27 3.94133 30.0567 4.16C29.8434 4.37867 29.7367 4.66133 29.7367 5.008C29.7367 5.35467 29.8434 5.64 30.0567 5.864C30.27 6.088 30.5394 6.2 30.8647 6.2ZM38.3017 7.096C38.003 7.096 37.7417 7.04 37.5177 6.928C37.2937 6.816 37.1124 6.65867 36.9737 6.456L36.8617 7H35.9497V1.24H36.9737V3.6C37.1017 3.424 37.2697 3.26933 37.4777 3.136C37.691 3.00267 37.9657 2.936 38.3017 2.936C38.675 2.936 39.0084 3.02667 39.3017 3.208C39.595 3.38933 39.827 3.63733 39.9977 3.952C40.1684 4.26667 40.2537 4.624 40.2537 5.024C40.2537 5.424 40.1684 5.78133 39.9977 6.096C39.827 6.40533 39.595 6.65067 39.3017 6.832C39.0084 7.008 38.675 7.096 38.3017 7.096ZM38.0857 6.2C38.411 6.2 38.6804 6.09067 38.8937 5.872C39.107 5.65333 39.2137 5.37067 39.2137 5.024C39.2137 4.67733 39.107 4.392 38.8937 4.168C38.6804 3.944 38.411 3.832 38.0857 3.832C37.755 3.832 37.483 3.944 37.2697 4.168C37.0617 4.38667 36.9577 4.66933 36.9577 5.016C36.9577 5.36267 37.0617 5.648 37.2697 5.872C37.483 6.09067 37.755 6.2 38.0857 6.2ZM41.3051 8.76L42.2251 6.736H41.9851L40.4411 3.032H41.5531L42.6651 5.824L43.8251 3.032H44.9131L42.3931 8.76H41.3051Z" fill="#001096"/>
            <g clipPath="url(#clip0_1923_23296)">
                <path d="M58.5141 6.02913C58.5644 6.37005 58.8092 6.77098 59.4839 6.77098C60.0578 6.77098 60.336 6.56623 60.336 6.23338C60.336 5.90053 60.142 5.75579 59.788 5.71292L58.5988 5.58482C57.5612 5.47387 56.9539 4.86819 56.9539 3.87872C56.9539 2.77779 57.7801 2.04401 59.4335 2.04401C61.2135 2.04401 61.9221 2.88874 61.9894 3.88679H60.3195C60.2687 3.51157 59.965 3.27253 59.442 3.27253C58.9783 3.27253 58.6577 3.44349 58.6577 3.75062C58.6577 3.99774 58.8097 4.18534 59.2141 4.21964L60.1844 4.30486C61.4918 4.41582 62.0397 5.04672 62.0397 6.0962C62.0397 7.21377 61.3477 7.999 59.4504 7.999C57.5532 7.999 56.9534 7.02667 56.8691 6.02862H58.5141V6.02913Z" fill="#001096" />
                <path d="M70.1965 5.28736V7.85484H68.5431V5.56019C68.5431 5.09925 68.3746 4.80069 67.9194 4.80069C67.4212 4.80069 67.2108 5.11639 67.2108 5.78159V7.85484H65.5824V5.56019C65.5824 5.09925 65.4133 4.80069 64.9581 4.80069C64.4605 4.80069 64.2496 5.11639 64.2496 5.78159V7.85484H62.5967V3.58932H64.2496V4.24644C64.5113 3.75171 64.9581 3.45265 65.6586 3.45265C66.3592 3.45265 66.8309 3.7855 67.0587 4.35689C67.3285 3.80265 67.7842 3.45265 68.5351 3.45265C69.6735 3.45265 70.197 4.16928 70.197 5.28736H70.1965Z" fill="#001096" />
                <path d="M70.9785 3.8535V2.18118H72.6319V3.8535H70.9785ZM70.9785 7.85476V4.2504H72.6319V7.85476H70.9785Z" fill="#001096" />
                <path d="M73.4121 7.85475V2.18167H75.065V7.85525H73.4121V7.85475Z" fill="#001096" />
                <path d="M78.7264 6.53958H80.3579C80.1968 7.3243 79.5696 7.99151 78.0179 7.99151C76.2294 7.99151 75.6221 6.8568 75.6221 5.71351C75.6221 4.48499 76.3391 3.45265 78.0179 3.45265C79.8653 3.45265 80.3629 4.59594 80.3629 5.77302C80.3629 5.91776 80.3539 6.05443 80.3374 6.13966H77.2336C77.3178 6.68583 77.5881 6.89059 78.0518 6.89059C78.3729 6.89059 78.6083 6.73526 78.7269 6.53908L78.7264 6.53958ZM77.2416 5.21877H78.8022C78.7519 4.77497 78.5404 4.52785 78.0428 4.52785C77.5791 4.52785 77.3348 4.70689 77.2416 5.21877Z" fill="#001096" />
                <path d="M83.5907 7.85476H81.8994L81.9034 2.18118H83.5902L83.5912 7.85476H83.5907Z" fill="#001096" />
                <path d="M89.9995 5.00535C89.9995 6.46434 89.1474 7.85475 87.3345 7.85475H84.3652V2.18167H87.3345C89.1479 2.18167 89.9995 3.54686 89.9995 5.00535ZM86.9376 6.5067C87.8401 6.5067 88.2364 5.99482 88.2364 5.00535C88.2364 4.01588 87.8226 3.52971 86.9376 3.52971H86.06V6.5067H86.9376Z" fill="#001096" />
                <path d="M52.2123 3.88737H48V7.86846H52.2123V3.88737Z" fill="#001096" />
                <path d="M53.2359 0C53.2165 0 53.1975 0.00201727 53.1786 0.00252159C53.1591 0.00252159 53.1402 0 53.1207 0C52.0457 0 51.0869 0.708567 51.0869 2.27044V3.8888H55.2882V2.27044C55.2882 0.708567 54.3174 0 53.2359 0Z" fill="#FF9B00" />
            </g>
            <defs>
                <clipPath id="clip0_1923_23296">
                    <rect width="42" height="8" fill="white" transform="translate(48)" />
                </clipPath>
            </defs>
          </symbol>
          <use href='#attribution' />
        </svg>
      </p>
    </div>
  `;
}

class EndUserConsent extends HTMLElement {
  constructor() {
    super();

    this.idRequiresTotpConsent = ["BVN_MFA"];
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.pages = [];
    const template = document.createElement("template");
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.consentScreen = this.shadowRoot.querySelector("#consent-screen");
    this.totpConsentApp = this.shadowRoot.querySelector("totp-consent");
    this.consentRejectedScreen = this.shadowRoot.querySelector(
      "#consent-rejected-screen",
    );

    this.allowButton = this.shadowRoot.querySelector("#allow");
    this.rejectButton = this.shadowRoot.querySelector("#cancel");
    this.backToConsentButton =
      this.shadowRoot.querySelector("#back-to-consent");
    this.confirmConsentRejectionButton = this.shadowRoot.querySelector(
      "#confirm-consent-rejection",
    );
    this.backButton = this.shadowRoot.querySelector("#back-button");
    const CloseIframeButtons =
      this.shadowRoot.querySelectorAll(".close-iframe");

    this.allowButton.addEventListener("click", (e) =>
      this.handleConsentGrant(e),
    );
    this.rejectButton.addEventListener("click", (e) =>
      this.handleConsentGrant(e),
    );

    this.backToConsentButton.addEventListener("click", () =>
      this.setActiveScreen(this.consentScreen),
    );
    this.confirmConsentRejectionButton.addEventListener("click", (e) =>
      this.handleConsentRejection(e),
    );

    this.totpConsentApp.addEventListener(
      "end-user-consent.totp.denied.contact-methods-outdated",
      (e) => this.handleTotpConsentEvents(e),
    );
    this.totpConsentApp.addEventListener("end-user-consent.totp.granted", (e) =>
      this.handleTotpConsentEvents(e),
    );
    this.totpConsentApp.addEventListener(
      "end-user-consent.totp.cancelled",
      (e) => this.handleBackEvents(e),
    );

    this.backButton.addEventListener("click", (e) => {
      this.handleBackEvents(e);
    });

    CloseIframeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.closeWindow();
        },
        false,
      );
    });

    this.activeScreen = this.consentScreen;
  }

  setActiveScreen(screen) {
    this.activeScreen.hidden = true;
    screen.hidden = false;
    this.activeScreen = screen;
  }

  get baseUrl() {
    return this.getAttribute("base-url");
  }

  get country() {
    return this.getAttribute("country");
  }

  get demoMode() {
    return !!this.hasAttribute("demo-mode");
  }

  get hideBack() {
    return this.hasAttribute("hide-back-to-host");
  }

  get idHint() {
    return this.getAttribute("id-hint") || "Your BVN should be 11 digits long";
  }

  get idRegex() {
    return this.getAttribute("id-regex");
  }

  get idType() {
    return this.getAttribute("id-type");
  }

  get idTypeLabel() {
    return this.getAttribute("id-type-label");
  }

  get partnerId() {
    return this.getAttribute("partner-id");
  }

  get partnerName() {
    return this.getAttribute("partner-name");
  }

  get partnerLogoURL() {
    return this.getAttribute("partner-logo");
  }

  get partnerPolicyURL() {
    return this.getAttribute("policy-url");
  }

  get themeColor() {
    return this.getAttribute("theme-color") || "#151F72";
  }

  get token() {
    return this.getAttribute("token");
  }

  handleConsentGrant(e) {
    const granted = e.target === this.allowButton;

    if (granted) {
      if (this.idRequiresTotpConsent.includes(this.idType)) {
        this.setActiveScreen(this.totpConsentApp);
        this.pages.push(this.consentScreen);
      } else {
        this.dispatchEvent(
          new CustomEvent("end-user-consent.granted", {
            detail: {
              consented: {
                contact_information: granted,
                document_information: granted,
                personal_details: granted,
              },
            },
          }),
        );
      }
    } else {
      this.setActiveScreen(this.consentRejectedScreen);
    }
  }

  handleConsentRejection() {
    this.dispatchEvent(new CustomEvent("end-user-consent.denied"));
  }

  handleTotpConsentEvents(e) {
    const customEvent = new CustomEvent(e.type, {
      detail: {
        ...e.detail,
      },
    });
    this.dispatchEvent(customEvent);
  }

  handleBackEvents() {
    const page = this.pages.pop();
    if (page) {
      this.setActiveScreen(page);
    } else {
      this.dispatchEvent(new CustomEvent("end-user-consent.cancelled"));
    }
  }

  closeWindow() {
    const referenceWindow = window.parent;
    referenceWindow.postMessage("SmileIdentity::Close", "*");
  }
}

if ("customElements" in window) {
  window.customElements.define("end-user-consent", EndUserConsent);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  EndUserConsent,
};
