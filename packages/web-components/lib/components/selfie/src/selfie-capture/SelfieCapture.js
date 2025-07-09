import { IMAGE_TYPE } from '../../../../domain/constants/src/Constants';
import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import styles from '../../../../styles/src/styles';
import packageJson from '../../../../../package.json';
import '../../../navigation/src';

const COMPONENTS_VERSION = packageJson.version;

const DEFAULT_NO_OF_LIVENESS_FRAMES = 8;

function hasMoreThanNColors(data, n = 16) {
  const colors = new Set();
  for (let i = 0; i < Math.min(data.length, 10000); i += 4) {
    // eslint-disable-next-line no-bitwise
    colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    if (colors.size > n) {
      return true;
    }
  }
  return false;
}

function getLivenessFramesIndices(
  totalNoOfFrames,
  numberOfFramesRequired = DEFAULT_NO_OF_LIVENESS_FRAMES,
) {
  const selectedFrames = [];

  if (totalNoOfFrames < numberOfFramesRequired) {
    throw new Error(
      'SmartCameraWeb: Minimum required no of frames is ',
      numberOfFramesRequired,
    );
  }

  const frameDivisor = numberOfFramesRequired - 1;
  const frameInterval = Math.floor(totalNoOfFrames / frameDivisor);

  // NOTE: when we have satisfied our required 8 frames, but have good
  // candidates, we need to start replacing from the second frame
  let replacementFrameIndex = 1;

  for (let i = 0; i < totalNoOfFrames; i += frameInterval) {
    if (selectedFrames.length < 8) {
      selectedFrames.push(i);
    } else {
      // ACTION: replace frame, then sort selectedframes
      selectedFrames[replacementFrameIndex] = i;
      selectedFrames.sort((a, b) => a - b);

      // ACTION: update replacement frame index
      replacementFrameIndex += 1;
    }
  }

  // INFO: if we don't satisfy our requirement, we add the last index
  const lastFrameIndex = totalNoOfFrames - 1;

  if (selectedFrames.length < 8 && !selectedFrames.includes(lastFrameIndex)) {
    selectedFrames.push(lastFrameIndex);
  }

  return selectedFrames;
}

function templateString() {
  return `
    ${styles(this.themeColor)}
  <style>
  :host {
    --theme-color: ${this.themeColor || '#001096'};
    --color-active: #001096;
    --color-default: #2D2B2A;
    --color-disabled: #848282;
  }

  * {
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
    color: #4E6577;
  }

  .color-richblue-shade {
    color: #0E1B42;
  }

  .color-digital-blue {
    color: #001096 !important;
  }

  .color-deep-blue {
    color: #001096;
  }

  .title-color {
    color: ${this.themeColor};
  }
  
  .theme-color {
    color: ${this.themeColor};
  }

  .center {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .font-size-small {
    font-size: .75rem;
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
    --button-color: ${this.themeColor};
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
    padding: .75rem 1.5rem;
    text-align: center;
  }

  .button:hover,
  .button:focus,
  .button:active {
    --button-color: var(--color-default);
  }

  .button:disabled {
    --button-color: var(--color-disabled);
  }

  .button[data-variant~='solid'] {
    background-color: var(--button-color);
    border: 2px solid var(--button-color);
  }

  .button[data-variant~='outline'] {
    color: var(--button-color);
    border: 2px solid var(--button-color);
  }

  .button[data-variant~='ghost'] {
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
    border-radius: .25rem;
    display: flex;
    justify-content: center;
    letter-spacing: .075em;
  }

  .powered-by {
    box-shadow: 0px 2.57415px 2.57415px rgba(0, 0, 0, 0.06);
    display: inline-flex;
    font-size: .5rem;
  }

  .tips {
    margin-left: auto;
    margin-right: auto;
    max-width: 17rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .tips > * + *,
  .powered-by > * + * {
    display: inline-block;
    margin-left: .5em;
  }

  .powered-by .company {
    color: #18406D;
    font-weight: 700;
    letter-spacing: .15rem;
  }

  .logo-mark {
    background-color: #004071;
    display: inline-block;
    padding: .25em .5em;
  }

  .logo-mark svg {
    height: auto;
    justify-self: center;
    width: .75em;
  }

  .id-video-container.portrait {
    width: 100%;
    position: relative;
    height: calc(200px * 1.4);
  }

  .id-video-container.portrait video {
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

  .video-container video,
  .id-video-container.landscape video {
    left: 50%;
    min-width: auto;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(50%);
  }

  .video-container #smile-cta-box {
    color: #fff;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding: 2rem 0;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }

  .video-container #smile-cta {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 0;
  }

  .video-container video {
    height: 150%;
    transform: scaleX(-1) translateX(50%) translateY(-50%);
  }

  .video-container video.agent-mode {
    min-height: 100%;
    transform: scaleX(1) translateX(-50%) translateY(-50%);
  }

  .video-container .video {
    background-color: black;
    position: absolute;
    left: 50%;
    height: calc(100% - 6px);
    clip-path: ellipse(101px 118px);
  }

  .id-video-container.landscape {
    min-height: calc((2 * 10rem) + 198px);
    height: auto;
  }

  .id-video-container.portrait .image-frame-portrait {
    border-width: 0.9rem;
    border-color: rgba(0, 0, 0, 0.7);
    border-style: solid;
    height: auto;
    position: absolute;
    top: 80px;
    left: 47px;
    z-index: 2;
    width: 200px;
    height: calc(200px * 1.4);
  }

  .id-video-container.landscape .image-frame {
    border-width: 10rem 1rem;
    border-color: rgba(0, 0, 0, 0.7);
    border-style: solid;
    height: auto;
    width: 90%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .id-video-container.landscape video {
    width: 100%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 1;
    height: 100%;
    block-size: 100%;
  }

  .id-video-container.landscape img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    max-width: 90%;
  }

  .actions {
    background-color: rgba(0, 0, 0, .7);
    bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    position: absolute;
    width: 90%;
    z-index: 2;
  }

  #back-of-id-camera-screen .id-video-container.portrait .actions,
  #id-camera-screen .id-video-container.portrait .actions {
    top: 145%;
    width: calc(200px * 1.4);
  }

  #back-of-id-camera-screen .section.portrait, #id-camera-screen .section.portrait {
    min-height: calc((200px * 1.4) + 260px);
  }

  #selfie-capture-screen,
  #back-of-id-entry-screen {
    block-size: 45rem;
    display: flex;
    flex-direction: column;
    max-block-size: 100%;
    max-inline-size: 40ch;
  }

  #selfie-capture-screen header p {
    margin-block: 0 !important;
  }

  .document-tips {
    margin-block-start: 1.5rem;
    display: flex;
    align-items: center;
    text-align: initial;
  }

  .document-tips svg {
    flex-shrink: 0;
    margin-inline-end: 1rem;
  }

  .document-tips p {
    margin-block: 0;
  }

  .document-tips p:first-of-type {
    font-size; 1.875rem;
    font-weight: bold
  }

  [type='file'] {
    display: none;
  }

  .document-tips > * + * {
    margin-inline-start; 1em;
  }
  </style>
  <div id='selfie-capture-screen' class='flow center'>
    <smileid-navigation theme-color='${this.themeColor}' ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>

    <div class='tips'>Fit your head inside the oval frame</div>

    <div className="error">
      ${this.cameraError ? `<p class="color-red">${this.cameraError}</p>` : ''}
    </div>
    <div class='section | flow' ${this.cameraError ? 'hidden' : ''}>
      <div class='video-container'>
        <div class='video'>
        </div>
        <svg id="image-outline" width="215" height="245" viewBox="0 0 215 245" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: relative;">
          <path d="M210.981 122.838C210.981 188.699 164.248 241.268 107.55 241.268C50.853 241.268 4.12018 188.699 4.12018 122.838C4.12018 56.9763 50.853 4.40771 107.55 4.40771C164.248 4.40771 210.981 56.9763 210.981 122.838Z" stroke="${this.themeColor}" stroke-width="7.13965"/>
        </svg>
        <div id="smile-cta-box">
          <div>
            <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="70 70 360 360" fill="currentColor">
              <path d="M354.02,247.69c4.12-12.26,6.39-24.53,6.39-35.75,0-54.63-50.19-99.08-111.88-99.08s-111.95,44.45-111.95,99.08c0,11.22,2.28,23.49,6.39,35.75-6.6,4.66-10.94,12.33-10.94,21.04,0,13.45,10.36,24.4,23.46,25.51.52,26.93,12.56,53.51,35.04,71.64v.73c.07.03.14.05.21.08,3.66,1.63,6.74,4.28,9.92,6.66.08.06.17.12.25.17,0-.08-.01-.16-.01-.25,15.23,9.12,32.95,13.89,51.85,12.96h0c15.54-.72,30.01-5.37,42.59-12.99,2.91-2.85,7.01-4.93,10.42-6.71.25-.16.51-.28.77-.43v-.76c20.36-16.83,33.62-42.32,34.85-71.11,13.15-1.05,23.57-12.03,23.57-25.53,0-8.7-4.35-16.38-10.94-21.04ZM155.53,283.54c-7.18-1.09-12.71-7.31-12.71-14.85s5.53-13.75,12.71-14.85v29.7ZM330.53,289.9c0,45.26-33.98,83.65-78.48,85.72-47.29,2.31-86.52-35.65-86.52-83.18v-40.7c15.63-4.03,38.45-15.61,65.91-46.31.08.59.13,1.21.11,1.87-.13,4.43-3.09,9.32-8.58,14.14-1.79,1.57-2.32,4.13-1.31,6.28,1.01,2.14,3.29,3.35,5.68,3,2.19-.35,48.6-8.13,71.88-38.36,3.84,13.25,12.48,33.59,31.31,48.79v48.75ZM339.42,234.31c-27.83-21.03-32.1-56.22-32.15-56.57-.26-2.37-2.08-4.28-4.43-4.67-2.33-.39-4.68.83-5.69,2.99-11.08,23.62-39.34,35.42-56.72,40.63,1.35-2.97,2.08-6,2.16-9.06.26-9.11-5.24-14.81-5.88-15.43-1.06-1.05-2.53-1.59-3.99-1.53-1.48.07-2.87.75-3.83,1.88-32.09,37.93-57.18,47.4-69.28,49.67-.68.13-1.29.39-1.84.74-.11,0-.18-.03-.29-.03-1.65,0-3.26.19-4.82.49-3.58-10.9-5.56-21.72-5.56-31.57,0-48.78,45.46-88.46,101.33-88.46s101.26,39.68,101.26,88.46c0,9.84-1.98,20.67-5.56,31.57-.85-.16-1.73-.19-2.61-.27v-4.6c0-1.67-.78-3.25-2.12-4.26ZM341.53,283.54v-29.7c7.18,1.09,12.72,7.3,12.72,14.85s-5.53,13.76-12.72,14.85Z"/>
              <path d="M259.05,305.3c2.08-2.08,2.08-5.46,0-7.55-2.09-2.08-5.47-2.07-7.54,0-1.75,1.75-4.79,1.75-6.54,0-2.08-2.08-5.45-2.09-7.54,0-2.08,2.08-2.08,5.46,0,7.55,5.98,5.98,15.65,5.98,21.63,0h0Z"/>
              <path id="mouth"
                  d="m 213.88314,319.4551 c -1.58,0.97 -0.35309,9.33393 1.50671,9.30586 6.05679,-0.0914 16.11631,0.17227 34.57066,0.13346 18.45435,-0.0388 28.15778,-0.0418 31.09964,-0.79956 1.80122,-0.46394 2.75061,-7.48365 1.16061,-8.45365 -1.6,-1.74874 -2.96432,-0.94348 -6.77747,-1.56441 -12.83012,0.04 -36.52534,0.50197 -41.29469,0.43262 -2.51525,-0.0713 -18.41588,-0.61 -20.01588,0.35 z m 57.29363,1.36599 c -9.24417,-2.23757 -8.08363,-2.42362 -20.78363,-2.42362 -12.7,0 -17.77931,2.69528 -26.84042,5.36549 12.57883,3.28731 33.57775,-4.29887 49.70067,2.24964 z">
                <animate
                  id="mouthAnim"
                  attributeName="d"
                  begin="indefinite"
                  dur="1s"
                  fill="freeze"
                  to="m 211.72,312.36 c -1.58,0.97 -2.56,2.86 -2.56,4.72 0,21.54 17.40021,38.7239 38.94021,38.7239 21.54,0 39.18979,-17.1739 39.18979,-39.0439 0,-1.86 -0.97,-3.59 -2.56,-4.56 -1.6,-0.97 -3.57,-1.03 -5.22,-0.18 -21.07,10.85 -41.53,10.85 -62.58,0 -1.65,-0.85 -3.62,-0.61 -5.22,0.35 z m 63.61,13.22 c -3.62,11.52 -14.4,19.9 -27.1,19.9 -12.7,0 -23.49,-8.38 -27.1,-19.9 18.03,6.94 36.2,6.94 54.2,0 z" />
              </path>
              <circle fill="none" stroke="currentColor" stroke-width="10px" cx="287.3" cy="263.68" r="14"/>
              <circle fill="none" stroke="currentColor" stroke-width="10px" cx="209.16" cy="263.68" r="14"/>
            </svg>
          </div>
          <div>
            <p id='smile-cta'>SMILE</p>
          </div>
        </div>
      </div>

      ${this.allowAgentMode ? `<button data-variant='outline small' id='switch-camera' class='button | center' type='button'>${this.inAgentMode ? 'Agent Mode On' : 'Agent Mode Off'}</button>` : ''}

      <button data-variant='solid' id='start-image-capture' class='button | center' type='button'>
        Take Selfie
      </button>

      ${this.hideAttribution ? '' : '<powered-by-smile-id></powered-by-smile-id>'}
    </div>
  </div>
  `;
}

async function getPermissions(
  captureScreen,
  constraints = { facingMode: 'user' },
) {
  try {
    const stream = await SmartCamera.getMedia({
      audio: false,
      video: constraints,
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevice = devices.find(
      (device) =>
        device.kind === 'videoinput' &&
        stream.getVideoTracks()[0].getSettings().deviceId === device.deviceId,
    );
    window.dispatchEvent(
      new CustomEvent('metadata.camera-name', {
        detail: { cameraName: videoDevice?.label },
      }),
    );
    captureScreen?.removeAttribute('data-camera-error');
    captureScreen?.setAttribute('data-camera-ready', true);
  } catch (error) {
    captureScreen?.removeAttribute('data-camera-ready');
    captureScreen?.setAttribute(
      'data-camera-error',
      SmartCamera.handleCameraError(error),
    );
  }
}

class SelfieCaptureScreen extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
    this.facingMode = 'user';
    if (this.allowAgentMode) {
      this.facingMode = 'environment';
    }
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = this.render();
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.videoContainer = this.shadowRoot.querySelector(
      '.video-container > .video',
    );
    this.init();
  }

  init() {
    this._videoStreamDurationInMS = 7800;
    this._imageCaptureIntervalInMS = 200;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };
    this._rawImages = [];

    this.setUpEventListeners();
  }

  reset() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  _startImageCapture() {
    this.startImageCapture.disabled = true;
    if (this.switchCamera) {
      this.switchCamera.disabled = true;
    }

    /**
     * this was culled from https://jakearchibald.com/2013/animated-line-drawing-svg/
     */
    // NOTE: initialise image outline
    const imageOutlineLength = this.imageOutline.getTotalLength();
    // Clear any previous transition
    this.imageOutline.style.transition = 'none';
    // Set up the starting positions
    this.imageOutline.style.strokeDasharray = `${imageOutlineLength} ${imageOutlineLength}`;
    this.imageOutline.style.strokeDashoffset = imageOutlineLength;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    this.imageOutline.getBoundingClientRect();
    // Define our transition
    this.imageOutline.style.transition = `stroke-dashoffset ${this._videoStreamDurationInMS / 1000}s ease-in-out`;
    // Go!
    this.imageOutline.style.strokeDashoffset = '0';

    setTimeout(() => {
      this.smileCTABox.style.opacity = 1;
      this.mouthAnim.beginElement();
    }, 1500);

    setTimeout(() => {
      this.smileCTABox.style.opacity = 0;
    }, 3500);

    setTimeout(() => {
      this.smileCTABox.style.opacity = 1;
      this.smileCTA.textContent = 'BIGGER SMILE';
      this.mouth.setAttribute(
        'd',
        'm 213.88314,319.4551 c -1.58,0.97 -0.35309,9.33393 1.50671,9.30586 6.05679,-0.0914 16.11631,0.17227 34.57066,0.13346 18.45435,-0.0388 28.15778,-0.0418 31.09964,-0.79956 1.80122,-0.46394 2.75061,-7.48365 1.16061,-8.45365 -1.6,-1.74874 -2.96432,-0.94348 -6.77747,-1.56441 -12.83012,0.04 -36.52534,0.50197 -41.29469,0.43262 -2.51525,-0.0713 -18.41588,-0.61 -20.01588,0.35 z m 57.29363,1.36599 c -9.24417,-2.23757 -8.08363,-2.42362 -20.78363,-2.42362 -12.7,0 -17.77931,2.69528 -26.84042,5.36549 12.57883,3.28731 33.57775,-4.29887 49.70067,2.24964 z',
      );
      this.mouthAnim.beginElement();
    }, 4000);

    this._imageCaptureInterval = setInterval(() => {
      this._capturePOLPhoto();
    }, this._imageCaptureIntervalInMS);

    this._videoStreamTimeout = setTimeout(() => {
      this._stopVideoStream();
    }, this._videoStreamDurationInMS);
  }

  async _switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    if (this.facingMode === 'user') {
      this.shadowRoot.querySelector('video').classList.remove('agent-mode');
    } else {
      this.shadowRoot.querySelector('video').classList.add('agent-mode');
    }
    this.startImageCapture.disabled = true;
    this.switchCamera.disabled = true;
    SmartCamera.stopMedia();
    await getPermissions(this, { facingMode: this.facingMode });
    this.handleStream(SmartCamera.stream);
  }

  _stopVideoStream() {
    try {
      clearTimeout(this._videoStreamTimeout);
      clearInterval(this._imageCaptureInterval);
      clearInterval(this._drawingInterval);

      this._capturePOLPhoto(); // NOTE: capture the last photo
      this._captureReferencePhoto();
      SmartCamera.stopMedia();

      const totalNoOfFrames = this._rawImages.length;
      this._data.referenceImage = this._referenceImage;
      this._data.previewImage = this._referenceImage;

      const livenessFramesIndices = getLivenessFramesIndices(totalNoOfFrames);

      this._data.images = this._data.images.concat(
        livenessFramesIndices.map((imageIndex) => ({
          image: this._rawImages[imageIndex].split(',')[1],
          image_type_id: IMAGE_TYPE.LIVENESS_IMAGE_BASE64,
        })),
      );

      this._publishImages();
    } catch (error) {
      console.error(error);
      // Todo: handle error
    }
  }

  _capturePOLPhoto() {
    const canvas = document.createElement('canvas');
    // Determine orientation of the video
    const isPortrait = this._video.videoHeight > this._video.videoWidth;

    // Set dimensions based on orientation, ensuring minimums
    if (isPortrait) {
      // Portrait orientation (taller than wide)
      canvas.width = 240;
      canvas.height = Math.max(
        320,
        (canvas.width * this._video.videoHeight) / this._video.videoWidth,
      );
    } else {
      // Landscape orientation (wider than tall)
      canvas.height = 240;
      canvas.width = Math.max(
        320,
        (canvas.height * this._video.videoWidth) / this._video.videoHeight,
      );
    }

    // NOTE: we do not want to test POL images
    this._drawImage(canvas, false);

    this._rawImages.push(canvas.toDataURL('image/jpeg'));
  }

  _captureReferencePhoto() {
    const canvas = document.createElement('canvas');
    // Determine orientation of the video
    const isPortrait = this._video.videoHeight > this._video.videoWidth;

    // Set dimensions based on orientation, ensuring minimums
    if (isPortrait) {
      // Portrait orientation (taller than wide)
      canvas.width = 480;
      canvas.height = Math.max(
        640,
        (canvas.width * this._video.videoHeight) / this._video.videoWidth,
      );
    } else {
      // Landscape orientation (wider than tall)
      canvas.height = 480;
      canvas.width = Math.max(
        640,
        (canvas.height * this._video.videoWidth) / this._video.videoHeight,
      );
    }

    // NOTE: we want to test the image quality of the reference photo
    this._drawImage(canvas, !this.disableImageTests);

    const image = canvas.toDataURL('image/jpeg');

    this._referenceImage = image;

    this._data.images.push({
      image: image.split(',')[1],
      image_type_id: IMAGE_TYPE.SELFIE_IMAGE_BASE64,
    });
  }

  _publishImages() {
    this.dispatchEvent(
      new CustomEvent('selfie-capture.publish', {
        detail: this._data,
      }),
    );
  }

  resetErrorMessage() {
    this.errorMessage.textContent = '';
  }

  _drawImage(canvas, enableImageTests = true, video = this._video) {
    // this.resetErrorMessage();
    const context = canvas.getContext('2d');

    context.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    if (enableImageTests) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const hasEnoughColors = hasMoreThanNColors(imageData.data);

      if (hasEnoughColors) {
        return context;
      }
      throw new Error(
        'Unable to capture webcam images - Please try another device',
      );
    } else {
      return context;
    }
  }

  handleStream(stream) {
    try {
      const videoExists = this.shadowRoot.querySelector('video');
      let video = null;
      if (videoExists) {
        video = this.shadowRoot.querySelector('video');
      } else {
        video = document.createElement('video');
      }

      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;

      if ('srcObject' in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }

      video.onloadedmetadata = () => {
        video.play();
      };

      this._video = video;
      const videoContainer = this.shadowRoot.querySelector(
        '.video-container > .video',
      );
      this._data.permissionGranted = true;

      if (!videoExists) {
        videoContainer.prepend(video);
      }
    } catch (error) {
      this.setAttribute(
        'data-camera-error',
        SmartCamera.handleCameraError(error),
      );
      if (error.name !== 'AbortError') {
        console.error(error);
      }
      SmartCamera.stopMedia();
    }
  }

  setUpEventListeners() {
    this.navigation = this.shadowRoot.querySelector('smileid-navigation');

    this.startImageCapture = this.shadowRoot.querySelector(
      '#start-image-capture',
    );

    this.switchCamera = this.shadowRoot.querySelector('#switch-camera');
    this.imageOutline = this.shadowRoot.querySelector('#image-outline path');
    this.smileCTABox = this.shadowRoot.querySelector('#smile-cta-box');
    this.smileCTA = this.shadowRoot.querySelector('#smile-cta');
    this.mouth = this.shadowRoot.querySelector('#mouth');
    this.mouthAnim = this.shadowRoot.querySelector('#mouthAnim');

    this.startImageCapture.addEventListener('click', () => {
      this._startImageCapture();
    });

    this.switchCamera?.addEventListener('click', () => {
      this._switchCamera();
    });

    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    this.navigation.addEventListener('navigation.close', () => {
      this.closeWindow();
    });

    if (SmartCamera.stream) {
      this.handleStream(SmartCamera.stream);
    } else if (this.hasAttribute('data-camera-ready')) {
      getPermissions(this, { facingMode: this.facingMode });
    }

    this.setupAgentMode();
  }

  disconnectedCallback() {
    SmartCamera.stopMedia();
    clearTimeout(this._videoStreamTimeout);
  }

  get hideBack() {
    return this.hasAttribute('hide-back');
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

  async setupAgentMode() {
    if (!this.allowAgentMode) {
      return;
    }

    const supportAgentMode = await SmartCamera.supportsAgentMode();

    if (supportAgentMode || this.hasAttribute('show-agent-mode-for-tests')) {
      this.switchCamera.hidden = false;
      if (this.facingMode === 'user') {
        this.shadowRoot.querySelector('video')?.classList?.remove('agent-mode');
      } else {
        this.shadowRoot.querySelector('video')?.classList?.add('agent-mode');
      }
    } else {
      this.switchCamera.hidden = true;
    }
  }

  get hasAgentSupport() {
    return this.hasAttribute('has-agent-support');
  }

  get title() {
    return this.getAttribute('title') || 'Submit Front of ID';
  }

  get hidden() {
    return this.getAttribute('hidden');
  }

  get cameraError() {
    return this.getAttribute('data-camera-error');
  }

  get disableImageTests() {
    return this.hasAttribute('disable-image-tests');
  }

  get allowAgentMode() {
    return this.getAttribute('allow-agent-mode') === 'true';
  }

  get inAgentMode() {
    return this.facingMode === 'environment';
  }

  static get observedAttributes() {
    return [
      'allow-agent-mode',
      'data-camera-error',
      'data-camera-ready',
      'disable-image-tests',
      'hidden',
      'hide-back-to-host',
      'show-navigation',
      'title',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'data-camera-error':
      case 'data-camera-ready':
      case 'hidden':
      case 'title':
        this.shadowRoot.innerHTML = this.render();
        this.init();
        break;
      case 'allow-agent-mode':
        if (this.allowAgentMode) {
          this.facingMode = 'environment';
        } else {
          this.facingMode = 'user';
        }
        this.shadowRoot.innerHTML = this.render();
        this.init();
        break;
      default:
        break;
    }
  }

  handleBackEvents() {
    this.stopMedia();
    this.dispatchEvent(new CustomEvent('selfie-capture.cancelled'));
  }

  closeWindow() {
    this.stopMedia();
    this.dispatchEvent(new CustomEvent('selfie-capture.close'));
  }

  stopMedia() {
    this.removeAttribute('data-camera-ready');
    SmartCamera.stopMedia();
  }
}

if ('customElements' in window && !customElements.get('selfie-capture')) {
  window.customElements.define('selfie-capture', SelfieCaptureScreen);
}

export default SelfieCaptureScreen;
