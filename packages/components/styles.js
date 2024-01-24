import typography from './typography';

const styles = `<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
  rel="stylesheet"
/>
<style>
${typography}
:host {
    --color-active: #001096;
    --color-default: #2d2b2a;
    --color-disabled: #848282;
    --web-digital-blue: #001096;
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
    margin-top: var(--flow-space, 1rem);
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

  .back-button-text {
    font-size: 11px;
    line-height: 11px;
    color: rgb(21, 31, 114);
  }


  .selfie-review-image {
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

  #document-instruction-screen,
  #back-of-document-instruction-screen {
    38rem
    padding-block: 2rem;
    display: flex;
    flex-direction: column;
    max-block-size: 100%;
    max-inline-size: 40ch;
    justify-content: space-between;
  }

  #document-instruction-screen header p {
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

  .instruction-header {
    color: var(--web-digital-blue, #001096);
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  @keyframes spin {
    0% {
        transform: translate3d(-50%, -50%, 0) rotate(0deg);
    }
    100% {
        transform: translate3d(-50%, -50%, 0) rotate(360deg);
    }
}

.spinner {
    animation: 1.5s linear infinite spin;
    animation-play-state: inherit;
    border: solid 5px #cfd0d1;
    border-bottom-color: var(--color-active);
    border-radius: 50%;
    content: "";
    display: block;
    height: 25px;
    width: 25px;
    will-change: transform;
    position: relative;
    top: .675rem;
    left: 1.25rem;
    }

</style>`;

export default styles;
