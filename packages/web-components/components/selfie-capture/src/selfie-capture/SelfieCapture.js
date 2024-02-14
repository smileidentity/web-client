import { IMAGE_TYPE } from '../../../../domain/constants/src/Constants';
import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import styles from '../../../../styles/src/styles';
import { version as COMPONENTS_VERSION } from '../../../../package.json';

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
    ${styles}
  <style>
  :host {
    --color-active: #2D2B2A;
    --color-default: #001096;
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
    padding: .75rem 1.5rem;
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
    border-radius: .25rem;
    color: #4E6577;
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

  @keyframes fadeInOut {
    12.5% {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }

    87.5% {
      opacity: 0;
    }
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

  .video-container #smile-cta,
  .video-container video,
  .id-video-container.landscape video {
    left: 50%;
    min-width: auto;
    position: absolute;
    top: calc(50% - 3px);
    transform: translateX(-50%) translateY(50%);
  }

  .video-container #smile-cta {
    color: white;
    font-size: 2rem;
    font-weight: bold;
    opacity: 0;
    top: calc(50% - 3rem);
  }

  .video-container video {
    min-height: 100%;
    transform: scaleX(-1) translateX(50%) translateY(-50%);
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

  #id-review-screen .id-video-container,
  #back-of-id-review-screen .id-video-container {
    background-color: rgba(0, 0, 0, 1);
  }

  #id-review-screen .id-video-container.portrait, #back-of-id-review-screen .id-video-container.portrait {
    height: calc((200px * 1.4) + 100px);
  }
  #id-review-screen .id-video-container.portrait img, #back-of-id-review-screen .id-video-container.portrait img {
    height: 280px;
    width: 200px;
    padding-top: 14px;
    transform: none;
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

  #id-entry-screen,
  #back-of-id-entry-screen {
    block-size: 45rem;
    padding-block: 2rem;
    display: flex;
    flex-direction: column;
    max-block-size: 100%;
    max-inline-size: 40ch;
  }

  #id-entry-screen header p {
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
  <div id='camera-screen' class='flow center'>
    ${
  this.showNavigation
    ? `
      <div class="nav back-to-host-nav${this.hideBackToHost ? ' justify-right' : ''}">
        ${
  this.hideBackToHost
    ? ''
    : `
          <div class="back-wrapper back-to-host-wrapper">
            <button type='button' data-type='icon' id="back-button" class="back-button icon-btn back-button-exit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
        `
}
        <button data-type='icon' type='button' id='camera-screen-close' class='close-iframe icon-btn'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
            <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
            <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
          </svg>
          <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
        </button>
      </div>
    ` : ''}
    <h1 class='text-2xl color-digital-blue font-bold'>Take a Selfie</h1>

    <div class='section | flow'>
      <div class='video-container'>
        <div class='video'>
        </div>
        <svg id="image-outline" width="215" height="245" viewBox="0 0 215 245" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M210.981 122.838C210.981 188.699 164.248 241.268 107.55 241.268C50.853 241.268 4.12018 188.699 4.12018 122.838C4.12018 56.9763 50.853 4.40771 107.55 4.40771C164.248 4.40771 210.981 56.9763 210.981 122.838Z" stroke="var(--color-default)" stroke-width="7.13965"/>
        </svg>
        <p id='smile-cta' class='color-gray'>SMILE</p>
      </div>

      <small class='tips'>
        <svg width='44' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40">
          <path fill="#F8F8FA" fill-rule="evenodd" d="M17.44 0h4.2c4.92 0 7.56.68 9.95 1.96a13.32 13.32 0 015.54 5.54c1.27 2.39 1.95 5.02 1.95 9.94v4.2c0 4.92-.68 7.56-1.95 9.95a13.32 13.32 0 01-5.54 5.54c-2.4 1.27-5.03 1.95-9.95 1.95h-4.2c-4.92 0-7.55-.68-9.94-1.95a13.32 13.32 0 01-5.54-5.54C.68 29.19 0 26.56 0 21.64v-4.2C0 12.52.68 9.9 1.96 7.5A13.32 13.32 0 017.5 1.96C9.89.68 12.52 0 17.44 0z" clip-rule="evenodd"/>
          <path fill="#AEB6CB" d="M19.95 10.58a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.54 2.3a.71.71 0 000 1.43.71.71 0 000-1.43zm11.08 0a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.63 1.27a4.98 4.98 0 00-2.05 9.48v1.2a2.14 2.14 0 004.28 0v-1.2a4.99 4.99 0 00-2.23-9.48zm-7.75 4.27a.71.71 0 000 1.43.71.71 0 000-1.43zm15.68 0a.71.71 0 000 1.43.71.71 0 000-1.43z"/>
        </svg>
        <span>Tips: Put your face inside the oval frame and click to "take selfie"</span> </small>

      <button data-variant='solid' id='start-image-capture' class='button | center' type='button'>
        Take Selfie
      </button>

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

async function getPermissions(captureScreen) {
  try {
    await SmartCamera.getMedia({
      audio: false,
      video: true,
    });
    captureScreen?.removeAttribute('data-camera-error');
    captureScreen?.setAttribute('data-camera-ready', true);
  } catch (error) {
    captureScreen?.removeAttribute('data-camera-ready');
    captureScreen?.setAttribute(
      'data-camera-error',
      SmartCamera.handleError(error),
    );
  }
}

class SelfieCaptureScreen extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.videoContainer = this.shadowRoot.querySelector(
      '.video-container > .video',
    );
    this.init();
    this.setUpEventListeners();
  }

  async init() {
    this._videoStreamDurationInMS = 7800;
    this._imageCaptureIntervalInMS = 200;

    this._data = {
      images: [],
      meta: {
        libraryVersion: COMPONENTS_VERSION,
      },
    };
    this._rawImages = [];
  }

  reset() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  _startImageCapture() {
    this.startImageCapture.disabled = true;

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

    this.smileCTA.style.animation = `fadeInOut ease ${this._videoStreamDurationInMS / 1000}s`;

    this._imageCaptureInterval = setInterval(() => {
      this._capturePOLPhoto();
    }, this._imageCaptureIntervalInMS);

    this._videoStreamTimeout = setTimeout(() => {
      this._stopVideoStream();
    }, this._videoStreamDurationInMS);
  }

  _stopVideoStream() {
    try {
      clearTimeout(this._videoStreamTimeout);
      clearInterval(this._imageCaptureInterval);
      clearInterval(this._drawingInterval);
      this.smileCTA.style.animation = 'none';

      this._capturePOLPhoto(); // NOTE: capture the last photo
      this._captureReferencePhoto();
      SmartCamera.stopMedia();

      const totalNoOfFrames = this._rawImages.length;
      this._data.referenceImage = this._referenceImage;

      const livenessFramesIndices = getLivenessFramesIndices(totalNoOfFrames);

      this._data.images = this._data.images.concat(
        livenessFramesIndices.map((imageIndex) => ({
          image: this._rawImages[imageIndex].split(',')[1],
          image_type_id: IMAGE_TYPE.LIVENESS_IMAGE_BASE64,
        })),
      );

      this._publishImages();
    } catch (error) {
      // Todo: handle error
    }
  }

  _capturePOLPhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = (canvas.width * this._video.videoHeight) / this._video.videoWidth;

    // NOTE: we do not want to test POL images
    this._drawImage(canvas, false);

    this._rawImages.push(canvas.toDataURL('image/jpeg'));
  }

  _captureReferencePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = (canvas.width * this._video.videoHeight) / this._video.videoWidth;

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
      new CustomEvent('SelfieCapture::ImageCaptured', {
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
    video.play();
    this._video = video;
    const videoContainer = this.shadowRoot.querySelector(
      '.video-container > .video',
    );
    this._data.permissionGranted = true;

    video.onloadedmetadata = () => {
      // this.shadowRoot.querySelector('.actions').hidden = false;
      // this.shadowRoot.querySelector('#loader').hidden = true;
      // this.shadowRoot.querySelector('.video-section').hidden = false;
    };

    if (!videoExists) {
      videoContainer.prepend(video);
    }
  }

  setUpEventListeners() {
    this.backButton = this.shadowRoot.querySelector('#back-button');
    this.startImageCapture = this.shadowRoot.querySelector(
      '#start-image-capture',
    );
    this.imageOutline = this.shadowRoot.querySelector('#image-outline path');
    this.smileCTA = this.shadowRoot.querySelector('#smile-cta');

    this.startImageCapture.addEventListener('click', () => {
      this._startImageCapture();
    });

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

    if (SmartCamera.stream) {
      this.handleStream(SmartCamera.stream);
    } else if (this.hasAttribute('data-camera-ready')) {
      getPermissions(this);
    }
  }

  disconnectedCallback() {
    SmartCamera.stopMedia();
    clearTimeout(this._videoStreamTimeout);
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

  get supportBothCaptureModes() {
    const value = this.documentCaptureModes;
    return value.includes('camera') && value.includes('upload');
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

  static get observedAttributes() {
    return [
      'title',
      'hidden',
      'show-navigation',
      'hide-back-to-host',
      'data-camera-ready',
      'data-camera-error',
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
    case 'title':
    case 'data-camera-ready':
    case 'data-camera-error':
    case 'hidden':
      this.shadowRoot.innerHTML = this.render();
      this.setUpEventListeners();
      break;
    default:
      break;
    }
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('SmileIdentity::Exit'));
  }

  closeWindow() {
    const referenceWindow = window.parent;
    referenceWindow.postMessage('SmileIdentity::Close', '*');
  }
}

if ('customElements' in window && !customElements.get('selfie-capture')) {
  window.customElements.define('selfie-capture', SelfieCaptureScreen);
}

export default SelfieCaptureScreen;
