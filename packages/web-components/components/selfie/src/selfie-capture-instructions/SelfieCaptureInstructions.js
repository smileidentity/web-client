import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

function templateString() {
  return `
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style>
    :host {
        --color-active: #001096;
        --color-default: #2d2b2a;
        --color-disabled: #848282;
      }

      * {
        font-family: "DM Sans", sans-serif;
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

      img {
        height: auto;
        max-width: 100%;
        transform: scaleX(-1);
      }

      video {
        background-color: black;
      }

      a {
        color: currentColor;
        text-decoration: none;
      }

      svg {
        max-width: 100%;
      }

      .color-gray {
        color: #797979;
      }

      .color-red {
        color: red;
      }

      .color-richblue {
        color: #4e6577;
      }

      .color-richblue-shade {
        color: #0e1b42;
      }

      .color-digital-blue {
        color: #001096 !important;
      }

      .color-deep-blue {
        color: #001096;
      }

      .center {
        text-align: center;
        margin-left: auto;
        margin-right: auto;
      }

      .font-size-small {
        font-size: 0.75rem;
      }

      .font-size-large {
        font-size: 1.5rem;
      }

      .text-transform-uppercase {
        text-transform: uppercase;
      }

      [id*=-"screen"] {
        min-block-size: 100%;
      }

      [data-variant~="full-width"] {
        inline-size: 100%;
      }

      .flow > * + * {
        margin-top: 1rem;
      }

      .button {
        --button-color: var(--color-default);
        -webkit-appearance: none;
        appearance: none;
        border-radius: 2.5rem;
        border: 0;
        background-color: transparent;
        color: #fff;
        cursor: pointer;
        display: block;
        font-size: 18px;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        text-align: center;
      }

      .button:hover,
      .button:focus,
      .button:active {
        --button-color: var(--color-active);
      }

      .button:disabled {
        --button-color: var(--color-disabled);
      }

      .button[data-variant~="solid"] {
        background-color: var(--button-color);
        border: 2px solid var(--button-color);
      }

      .button[data-variant~="outline"] {
        color: var(--button-color);
        border: 2px solid var(--button-color);
      }

      .button[data-variant~="ghost"] {
        padding: 0px;
        color: var(--button-color);
        background-color: transparent;
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

      .back-button {
        display: block !important;
      }
      .back-button-text {
        font-size: 11px;
        line-height: 11px;
        color: rgb(21, 31, 114);
      }
      .section {
        border: 1px solid #f4f4f4;
        border-radius: 0.5rem;
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

      #selfie-capture-instruction-screen,
      #back-of-selfie-capture-instruction-screen {
        block-size: 45rem;
        padding-block: 2rem;
        display: flex;
        flex-direction: column;
        max-block-size: 100%;
        max-inline-size: 40ch;
      }

      #selfie-capture-instruction-screen header p {
        margin-block: 0 !important;
      }

      .instructions {
        margin-block-start: 1.5rem;
        display: flex;
        align-items: center;
        text-align: initial;
      }

      .instructions svg {
        flex-shrink: 0;
        margin-inline-end: 1rem;
      }

      .instructions p {
        margin-block: 0;
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

      .tip-header {
        color: var(--web-digital-blue, #001096);

        /* h2 */
        font-size: 1rem;
        font-style: normal;
        font-weight: 700;
      }
    </style>
    ${styles}
    <div id="selfie-capture-instruction-screen" class="flow center">
    <smileid-navigation ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>
    <header>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="51"
        height="78"
        fill="none"
      >
        <g clip-path="url(#clip-path)">
          <path
            fill="#7FCBF5"
            d="m37.806 75.563.15-52.06c0-1.625-1.145-3.581-2.53-4.394L4.126 1.054C3.435.632 2.772.602 2.32.874l-1.265.721c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.626 1.144 3.581 2.53 4.394L33.98 77.73c.934.541 1.958.09 1.807.18l1.266-.722c.451-.27.753-.843.753-1.625Zm-1.266.782c0 .392-.06.722-.18.963.12-.27.18-.602.18-.963Z"
          />
          <path
            fill="#7FCBF5"
            d="m39.07 74.84.151-52.06c0-1.625-1.144-3.58-2.53-4.393L5.39.361c-.692-.42-1.355-.45-1.807-.18L2.32.903c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.625 1.144 3.581 2.53 4.394l31.299 18.055c.934.542 1.958.09 1.807.181l1.266-.722c.451-.271.753-.843.753-1.625v-.03Zm-1.265.783c0 .391-.06.722-.18.963.12-.27.18-.602.18-.963Z"
          />
          <path
            fill="#3B3837"
            d="M13.19 40.626c-.873-.06-1.687.03-2.44.27 1.597 2.498 3.525 4.635 5.603 6.2-1.265-2.077-2.35-4.274-3.163-6.47Zm9.88 5.687c-.813 1.264-1.897 2.227-3.192 2.799 2.078.842 4.006.933 5.633.27a24.828 24.828 0 0 0-2.44-3.069Zm-5.542-4.393c-1.054-.542-2.109-.933-3.133-1.144a34.476 34.476 0 0 0 3.133 6.23V41.92Zm1.265.722v5.085c1.265-.511 2.32-1.384 3.133-2.587a21.086 21.086 0 0 0-3.133-2.498Zm-7.35-10.593-4.609-2.648c.12 3.16 1.205 6.65 3.043 9.99.873-.3 1.807-.39 2.801-.33-.753-2.438-1.175-4.785-1.265-6.982m6.115 3.521-4.88-2.829c.06 2.017.452 4.153 1.175 6.41 1.205.21 2.44.662 3.705 1.324V35.6Zm6.145 3.52-4.88-2.828v4.905c1.235.783 2.47 1.776 3.675 2.95.723-1.415 1.115-3.1 1.205-5.026Zm5.844 3.371-4.609-2.648c-.09 2.107-.512 3.972-1.295 5.507a30.696 30.696 0 0 1 2.802 3.581c1.867-1.204 2.952-3.43 3.102-6.44ZM14.154 25.73c-.904 1.504-1.416 3.43-1.506 5.627l4.88 2.829v-5.748c-1.145-.722-2.26-1.625-3.374-2.678m8.043 4.634a13.447 13.447 0 0 1-3.404-1.264v5.748l4.88 2.829c-.09-2.287-.572-4.815-1.476-7.313Zm-11.869-9.088c-2.078 1.084-3.343 3.49-3.524 6.68l4.609 2.649c.09-2.378.633-4.454 1.566-6.079a31.138 31.138 0 0 1-2.65-3.25Zm15.725 9.058c-.813.21-1.717.27-2.65.18.933 2.709 1.445 5.387 1.536 7.855l4.608 2.648c-.15-3.37-1.385-7.222-3.464-10.713m-8.465-7.613c-1.084.42-2.018 1.113-2.801 2.046a19.827 19.827 0 0 0 2.771 2.166v-4.212m1.265.722v4.213c.934.481 1.838.842 2.772 1.053a33.855 33.855 0 0 0-2.771-5.266Zm-2.38-2.137c-1.867-.722-3.614-.903-5.12-.451.723.963 1.476 1.896 2.289 2.738.783-1.023 1.747-1.805 2.862-2.317m3.524 2.016a34.581 34.581 0 0 1 2.832 5.567c.813.09 1.566.06 2.29-.12-1.507-2.197-3.254-4.063-5.122-5.477m-8.886 33.945s-.271-.271-.271-.452V55.16c0-.15.12-.24.27-.15l14.008 8.065s.271.27.271.451v1.595c0 .15-.12.24-.27.15l-14.008-8.064Zm0-4.093s-.271-.27-.271-.451v-1.595c0-.15.12-.241.27-.15l14.008 8.064s.271.27.271.451v1.595c0 .15-.12.241-.27.15l-14.008-8.064Zm4.308-38.037s-.272-.27-.272-.451V13.03c0-.15.12-.241.271-.15l7.772 4.332s.272.271.272.452v1.595c0 .15-.12.24-.271.15l-7.773-4.333Zm2.71 34.546s-.09-.06-.15-.09h-.06c-3.193-1.956-6.236-5.146-8.525-9.028-2.47-4.183-3.826-8.667-3.826-12.639 0-4.152 1.596-7.222 4.338-8.395 2.26-.963 5.12-.572 8.103 1.083h.06s.09.09.151.12c.06.03.09.06.15.09h.06c2.983 1.806 5.845 4.725 8.074 8.276 2.741 4.363 4.278 9.238 4.278 13.391 0 3.942-1.386 6.861-3.886 8.185-2.32 1.234-5.362.933-8.555-.872h-.06s-.091-.09-.151-.12Zm15.756-29.731L2.707 1.896c-1.416-.812-2.56-.15-2.56 1.445l-.151 51.94c0 1.625 1.114 3.58 2.53 4.393L33.735 77.67c1.416.813 2.56.151 2.56-1.444l.15-51.91c0-1.625-1.144-3.58-2.53-4.393"
          />
          <path
            fill="#7FCBF5"
            d="M16.353 47.096c-2.079-1.565-4.007-3.701-5.603-6.2.753-.24 1.566-.33 2.44-.27a35.724 35.724 0 0 0 3.163 6.47Zm3.494 2.016a7.52 7.52 0 0 0 3.193-2.799c.874.933 1.687 1.987 2.44 3.07-1.626.662-3.554.542-5.633-.27Zm-2.38-2.137a33.523 33.523 0 0 1-3.133-6.229c1.025.211 2.079.572 3.133 1.144v5.085Zm1.235.723v-5.086a19.828 19.828 0 0 1 3.163 2.498c-.813 1.203-1.897 2.076-3.163 2.588Zm-8.886-8.336c-1.838-3.31-2.922-6.8-3.043-9.99l4.61 2.648c.06 2.196.481 4.543 1.265 6.981a7.717 7.717 0 0 0-2.802.331m3.976-.21c-.692-2.227-1.084-4.394-1.174-6.41l4.88 2.828v4.905c-1.266-.662-2.5-1.113-3.706-1.324Zm8.646 4.995c-1.205-1.174-2.44-2.167-3.705-2.95v-4.904l4.91 2.828c-.09 1.926-.482 3.611-1.205 5.026Zm3.946 4.785a30.707 30.707 0 0 0-2.801-3.582c.783-1.564 1.205-3.4 1.295-5.507l4.609 2.649c-.15 3.009-1.235 5.236-3.103 6.44ZM12.647 31.296c.09-2.197.603-4.122 1.507-5.627 1.114 1.053 2.259 1.956 3.404 2.678v5.748l-4.91-2.829m6.115 3.521V29.04c1.174.602 2.29 1.024 3.434 1.264.873 2.528 1.386 5.026 1.476 7.313l-4.88-2.829m-11.96-6.891c.181-3.19 1.416-5.597 3.525-6.68a28.286 28.286 0 0 0 2.651 3.25c-.934 1.624-1.476 3.7-1.566 6.078l-4.61-2.648Zm18.105 10.442c-.09-2.468-.602-5.146-1.536-7.854.934.09 1.837 0 2.65-.18 2.08 3.49 3.314 7.342 3.465 10.712l-4.609-2.648m-7.35-11.435a19.841 19.841 0 0 1-2.772-2.167 6.523 6.523 0 0 1 2.802-2.046v4.213m1.235.722v-4.213a33.86 33.86 0 0 1 2.771 5.266c-.903-.21-1.837-.571-2.771-1.053Zm-5.212-4.032c-.813-.843-1.566-1.776-2.289-2.739 1.506-.451 3.284-.3 5.121.452-1.115.511-2.078 1.294-2.862 2.317m9.188 5.296a34.581 34.581 0 0 0-2.831-5.567c1.867 1.414 3.614 3.28 5.12 5.477-.722.15-1.476.18-2.289.12m-4.579-8.185s-.09-.06-.15-.09h-.06c-2.983-1.685-5.845-2.077-8.104-1.114-2.741 1.174-4.338 4.243-4.338 8.396 0 4.153 1.356 8.426 3.826 12.639 2.29 3.882 5.332 7.072 8.525 8.998h.06s.09.12.15.15c.061.03.091.06.152.09h.06c3.193 1.806 6.236 2.137 8.555.903 2.5-1.324 3.856-4.243 3.886-8.185 0-4.153-1.536-9.028-4.278-13.361-2.229-3.551-5.09-6.5-8.073-8.276h-.06s-.09-.09-.15-.12"
          />
          <path
            fill="#43C15F"
            d="M40.668 50.165h-.03c-5.723 0-10.363 4.635-10.363 10.352v.03c0 5.717 4.64 10.352 10.363 10.352h.03c5.723 0 10.363-4.635 10.363-10.352v-.03c0-5.717-4.64-10.352-10.363-10.352Z"
          />
          <path
            fill="#E5E7E7"
            d="m38.826 65.873-5.603-5.447 1.627-1.685 3.976 3.822 7.591-7.343 1.627 1.685-9.188 8.968h-.03Z"
          />
        </g>
        <defs>
          <clipPath id="clip-path">
            <path fill="#fff" d="M0 0h51v78H0z" />
          </clipPath>
        </defs>
      </svg>
      <h1 class='text-2xl color-digital-blue font-bold'>Next, we'll take a quick selfie</h1>
    </header>
    <div class="flow">
      <div class="instructions">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
        >
          <g clip-path="url(#clip0_604_670)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M31.8569 19C31.8569 21.5428 31.1029 24.0285 29.6902 26.1428C28.2774 28.2571 26.2695 29.9049 23.9203 30.878C21.571 31.8511 18.986 32.1057 16.492 31.6096C13.9981 31.1136 11.7072 29.8891 9.90919 28.091C8.11115 26.293 6.88668 24.0022 6.3906 21.5082C5.89452 19.0143 6.14913 16.4292 7.12222 14.08C8.09531 11.7307 9.74318 9.72279 11.8574 8.31008C13.9717 6.89737 16.4574 6.14334 19.0002 6.14334C22.41 6.14334 25.6802 7.49788 28.0913 9.90897C30.5024 12.3201 31.8569 15.5902 31.8569 19Z"
              fill="#001096"
            />
            <path
              d="M19.6064 4.5419H18.394L18.9912 0L19.6064 4.5419Z"
              fill="#001096"
            />
            <path
              d="M26.7541 6.77667L25.7046 6.17048L28.4913 2.54239L26.7541 6.77667Z"
              fill="#001096"
            />
            <path
              d="M31.8298 12.2957L31.2236 11.2462L35.4489 9.49097L31.8298 12.2957Z"
              fill="#001096"
            />
            <path
              d="M33.4674 19.6062V18.3938L38.0003 18.9909L33.4674 19.6062Z"
              fill="#001096"
            />
            <path
              d="M31.2236 26.7538L31.8298 25.7043L35.4579 28.491L31.2236 26.7538Z"
              fill="#001096"
            />
            <path
              d="M25.7046 31.8295L26.7541 31.2233L28.5094 35.4486L25.7046 31.8295Z"
              fill="#001096"
            />
            <path
              d="M18.394 33.4671H19.6064L19.0093 38L18.394 33.4671Z"
              fill="#001096"
            />
            <path
              d="M11.2464 31.2233L12.2959 31.8295L9.50928 35.4576L11.2464 31.2233Z"
              fill="#001096"
            />
            <path
              d="M6.17068 25.7043L6.77687 26.7538L2.55164 28.509L6.17068 25.7043Z"
              fill="#001096"
            />
            <path
              d="M4.54215 18.3938V19.6062L0.000244141 19.009L4.54215 18.3938Z"
              fill="#001096"
            />
            <path
              d="M6.77689 11.2462L6.1707 12.2957L2.5426 9.50903L6.77689 11.2462Z"
              fill="#001096"
            />
            <path
              d="M12.296 6.17047L11.2464 6.77666L9.49121 2.55142L12.296 6.17047Z"
              fill="#001096"
            />
          </g>
          <defs>
            <clipPath id="clip0_604_670">
              <rect
                width="38"
                height="38"
                fill="white"
                transform="translate(0.000244141)"
              />
            </clipPath>
          </defs>
        </svg>
        <div class="instruction">
          <p class="tip-header">Good Light</p>
          <p>
            Make sure you are in a well-lit environment where your face is
            clear and visible
          </p>
        </div>
      </div>
      <div class="instructions">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="36"
          viewBox="0 0 38 36"
          fill="none"
        >
          <g clip-path="url(#clip0_604_672)">
            <path
              d="M36.7211 12.6391H1.22537C1.06275 13.0909 0.910962 13.5427 0.77002 14.0055H37.1764C37.0463 13.5427 36.8946 13.0909 36.7211 12.6391Z"
              fill="#001096"
            />
            <path
              d="M37.3716 14.7438H0.574875C0.466458 15.1625 0.379725 15.5813 0.303833 16.011H37.6426C37.5667 15.5813 37.48 15.1625 37.3716 14.7438Z"
              fill="#001096"
            />
            <path
              d="M37.7727 16.8485H0.173703C0.119494 17.2342 0.0869685 17.6198 0.0544434 18.0055H37.892C37.8594 17.6198 37.8269 17.2342 37.7727 16.8485Z"
              fill="#001096"
            />
            <path
              d="M37.9462 19.4711C37.9462 19.2948 37.9462 19.1295 37.9353 18.9532H0.0110865C0.000244802 19.1295 0.000244141 19.2948 0.000244141 19.4711C0.000244141 19.6474 0.000244802 19.8347 0.0110865 20.011H37.9353C37.9462 19.8347 37.9462 19.6474 37.9462 19.4711Z"
              fill="#001096"
            />
            <path
              d="M37.8811 21.0579H0.0653076C0.086991 21.3774 0.119515 21.697 0.162882 22.0055H37.7836C37.8269 21.697 37.8595 21.3774 37.8811 21.0579Z"
              fill="#001096"
            />
            <path
              d="M37.5992 23.1625H0.347168C0.401376 23.449 0.466426 23.7245 0.531477 24H37.4149C37.48 23.7245 37.545 23.449 37.5992 23.1625Z"
              fill="#001096"
            />
            <path
              d="M37.0788 25.2672H0.867554C0.954287 25.5096 1.03018 25.7631 1.11691 26.0055H36.8295C36.9162 25.7631 37.0029 25.5096 37.0788 25.2672Z"
              fill="#001096"
            />
            <path
              d="M36.2874 27.3719H1.65906L1.95178 28H35.9947L36.2874 27.3719Z"
              fill="#001096"
            />
            <path
              d="M35.2032 29.4766H2.75403C2.84799 29.6529 2.95641 29.8292 3.07928 30.0055H34.878L35.2032 29.4766Z"
              fill="#001096"
            />
            <path
              d="M33.7396 31.5813H4.20679L4.54288 32H33.4035L33.7396 31.5813Z"
              fill="#001096"
            />
            <path
              d="M31.7989 33.6859H6.14746L6.49439 33.9945H31.452L31.7989 33.6859Z"
              fill="#001096"
            />
            <path
              d="M29.0993 35.7906H8.84705L9.18314 36H28.7632L29.0993 35.7906Z"
              fill="#001096"
            />
            <path
              d="M34.2384 8.01102C33.8914 7.53719 33.5228 7.07438 33.1325 6.63361C29.8258 2.60055 24.6977 0 18.9407 0C12.891 0 7.53525 2.86501 4.25021 7.26171H4.28274C4.08759 7.51515 3.89244 7.75757 3.70813 8.01102H34.2384Z"
              fill="#001096"
            />
            <path
              d="M34.531 8.44077H3.41533C3.06839 8.94765 2.74314 9.47658 2.43958 10.0165H35.5068C35.2124 9.47215 34.8866 8.94597 34.531 8.44077Z"
              fill="#001096"
            />
            <path
              d="M35.7887 10.5344H2.15776C1.9084 11.0193 1.68072 11.5151 1.47473 12.011H36.4717C36.2657 11.5151 36.0381 11.0193 35.7887 10.5344Z"
              fill="#001096"
            />
          </g>
          <defs>
            <clipPath id="clip0_604_672">
              <rect
                width="37.9459"
                height="36"
                fill="white"
                transform="translate(0.000244141)"
              />
            </clipPath>
          </defs>
        </svg>
        <div>
          <p class="tip-header">Clear Image</p>
          <p>
            Hold your phone steady so the selfie is clear and sharp. Don't
            take blurry images.
          </p>
        </div>
      </div>
      <div class="instructions">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
        >
          <path
            d="M18.9496 0C18.9496 0 13.9842 6.03205e-06 11.1469 1.09139C8.30957 2.18277 8.41092 4.46476 7.80292 6.15145C7.28787 7.56786 6.91455 9.02989 6.68824 10.517C6.68824 10.517 4.86424 11.3107 3.24291 12.2036C2.43378 12.6113 1.72475 13.1862 1.16487 13.8886C0.604986 14.5909 0.207618 15.404 0.000244141 16.2715C0.506911 21.4308 6.68824 23.6136 6.68824 23.6136C6.67321 21.7242 6.77473 19.8356 6.99225 17.9582C7.29625 16.47 7.90424 15.7754 10.4376 14.6841C12.9709 13.5927 18.9496 13.1958 18.9496 13.1958C18.9496 13.1958 24.9282 13.5927 27.4616 14.6841C29.9949 15.7754 30.7042 16.47 31.0082 17.9582C31.2258 19.8356 31.3273 21.7242 31.3122 23.6136C31.3122 23.6136 37.3922 21.4308 38.0002 16.2715C37.5126 14.5484 36.3463 13.0853 34.7576 12.2036L31.2109 10.517C30.9867 9.03874 30.6479 7.57936 30.1976 6.15145C29.4882 4.46476 28.4749 1.78591 26.8536 1.09139C25.2322 0.396873 18.9496 0 18.9496 0Z"
            fill="#001096"
          />
          <path
            d="M10.7416 21.53C12.8058 21.6524 14.8473 22.0188 16.8216 22.6214C18.6235 23.1643 20.5642 23.0588 22.2936 22.3238C24.8269 21.2324 27.5629 21.4308 30.1976 21.6292C30.7849 21.6319 31.3675 21.7326 31.9202 21.9269C32.4269 22.1253 32.4269 22.423 32.4269 23.2167C32.14 24.7237 31.6635 26.19 31.0083 27.5822C30.7799 28.1169 30.4019 28.5776 29.9179 28.9111C29.4338 29.2446 28.8634 29.4375 28.2723 29.4674C27.2359 29.6525 26.1773 29.6859 25.1309 29.5666C24.279 29.5405 23.4506 29.2863 22.736 28.8315C22.0214 28.3766 21.4478 27.7387 21.0776 26.987C20.8887 26.3594 20.6161 25.7589 20.2669 25.201C19.8616 24.705 19.5576 24.5065 19.0509 24.6057C18.7188 24.5693 18.3842 24.6489 18.1061 24.8304C17.828 25.0119 17.6243 25.2837 17.5309 25.5979C16.9229 27.0862 16.4162 28.6736 14.6936 29.2689C13.939 29.5055 13.1548 29.6391 12.3629 29.6658C11.2345 29.6928 10.1081 29.5591 9.01892 29.2689C7.39759 28.7728 6.89092 27.3838 6.38425 25.8956C6.24296 25.2819 6.03928 24.6836 5.77625 24.1096C5.57359 23.5143 5.37092 23.1175 5.67492 22.5222C5.97892 21.9269 6.18159 22.0261 6.68825 21.9269C8.02604 21.6866 9.38168 21.5538 10.7416 21.53ZM12.0589 28.8721C14.4909 28.5744 14.8963 28.5744 15.6056 27.3838C16.0105 26.8072 16.3184 26.1708 16.5176 25.4987C16.9229 24.3081 16.7203 23.7128 15.6056 23.2167C13.2959 22.2331 10.6949 22.127 8.30959 22.9191C8.07105 23.0198 7.85723 23.1693 7.68248 23.3575C7.50772 23.5458 7.37604 23.7684 7.29626 24.0105C7.12045 24.8478 7.19957 25.7172 7.52382 26.5109C7.84807 27.3046 8.40315 27.9876 9.12025 28.4752C10.0603 28.8088 11.0617 28.9441 12.0589 28.8721ZM25.7389 28.9713C26.8173 28.9934 27.8881 28.7904 28.8802 28.376C30.7042 27.5823 30.7043 25.7963 30.7043 24.1096C30.7043 22.423 29.9949 22.9191 29.2856 22.7206C27.3226 22.2044 25.2509 22.2387 23.3069 22.8198C23.0246 22.8282 22.7476 22.8972 22.4956 23.0221C22.2436 23.1469 22.0228 23.3245 21.8487 23.5423C21.6746 23.7601 21.5516 24.0127 21.4884 24.2822C21.4252 24.5517 21.4233 24.8315 21.4829 25.1018C21.6856 27.3838 23.1043 28.5744 25.7389 28.9713Z"
            fill="#001096"
          />
          <path
            d="M11.9576 24.4073C10.8429 24.4073 9.93091 25.1018 9.93091 25.7963V26.2924C9.9546 26.4062 10.0183 26.5082 10.1109 26.5807C10.2034 26.6532 10.319 26.6916 10.4376 26.6893C10.8429 26.6893 11.0456 26.4909 11.0456 26.2924V25.7963C11.0456 25.4987 11.4509 25.201 11.9576 25.201C12.4642 25.201 12.8696 25.4987 12.8696 25.7963V26.2924C12.8696 26.4909 13.1736 26.6893 13.4776 26.6893C13.5961 26.6916 13.7117 26.6532 13.8043 26.5807C13.8969 26.5082 13.9606 26.4062 13.9842 26.2924V25.7963C13.9842 25.1018 13.0722 24.4073 11.9576 24.4073Z"
            fill="#001096"
          />
          <path
            d="M26.1442 24.4073C24.9282 24.4073 24.0162 25.1018 24.0162 25.7963V26.2924C24.0162 26.4909 24.3202 26.6893 24.6242 26.6893C24.9282 26.6893 25.2322 26.4909 25.2322 26.2924V25.7963C25.2322 25.4987 25.6376 25.201 26.1442 25.201C26.6509 25.201 27.0562 25.4987 27.0562 25.7963V26.2924C27.0799 26.4062 27.1436 26.5082 27.2362 26.5807C27.3287 26.6532 27.4444 26.6916 27.5629 26.6893C27.8669 26.6893 28.1709 26.4909 28.1709 26.2924V25.7963C28.1709 25.1018 27.2589 24.4073 26.1442 24.4073Z"
            fill="#001096"
          />
        </svg>
        <div class="instruction">
          <p class="tip-header">Remove Obstructions</p>
          <p>
            Remove anything that covers your face, such glasses, masks, hats
            and scarves
          </p>
        </div>
      </div>
      <section class='flow' style='--flow-space: 2.5rem'>
        <button id='allow' data-variant='solid full-width' class='button'>
            Allow
        </button>
        <button id='cancel' data-variant='outline full-width' class="button" style='--flow-space: 1.5rem'>
            Cancel
        </button>
       </section>
    </div>
    ${
  this.hideAttribution
    ? ''
    : `
    <powered-by-smile-id></powered-by-smile-id>
    `
}
  </div>
  `;
}

class SelfieCaptureInstructions extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.pages = [];
    const template = document.createElement('template');
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.allowButton = this.shadowRoot.querySelector('#allow');
    this.navigation = this.shadowRoot.querySelector('smileid-navigation');

    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    if (this.allowButton) {
      this.allowButton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('selfie-capture-instructions.capture'));
      });
    }

    this.navigation.addEventListener(
      'navigation.close',
      () => {
        this.closeWindow();
      },
      false,
    );
  }

  get hideBack() {
    return this.hasAttribute('hide-back');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#043C93';
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution');
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('selfie-capture-instructions.cancelled'));
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation');
  }

  closeWindow() {
    const referenceWindow = window.parent;
    referenceWindow.postMessage('SmileIdentity::Close', '*');
  }
}

if ('customElements' in window && !window.customElements.get('selfie-capture-instruction')) {
  window.customElements.define('selfie-capture-instruction', SelfieCaptureInstructions);
}

export default SelfieCaptureInstructions;
