'use strict';

const VERSION = '1.0.0-beta.1';

const DEFAULT_NO_OF_LIVENESS_FRAMES = 8;

function getLivenessFramesIndices(totalNoOfFrames, numberOfFramesRequired = DEFAULT_NO_OF_LIVENESS_FRAMES) {
  const selectedFrames = [];

  if (totalNoOfFrames < numberOfFramesRequired) {
    throw new Error('SmartCameraWeb: Minimum required no of frames is ', numberOfFramesRequired);
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
      selectedFrames.sort((a,b) => a - b);

      // ACTION: update replacement frame index
      replacementFrameIndex++;
    }
  }

  // INFO: if we don't satisfy our requirement, we add the last index
  const lastFrameIndex = totalNoOfFrames - 1;

  if (selectedFrames.length < 8 && !selectedFrames.includes(lastFrameIndex)) {
    selectedFrames.push(lastFrameIndex);
  }

  return selectedFrames;
};

const template = document.createElement('template');

template.innerHTML = `
<link rel="preconnect" href="https://fonts.gstatic.com"> 
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap" rel="stylesheet">

<style>
  * {
    font-family: 'Nunito Sans', sans-serif;
  }

  [hidden] {
    display: none !important;
  }

  [disabled] {
    cursor: not-allowed !important;
    filter: grayscale(75%);
  }

  img {
    max-width: 100%;
    transform: scaleX(-1);
  }

  video {
    background-color: black;
    object-fit: cover;
    transform: scaleX(-1);
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

  .flow > * + * {
    margin-top: 1.5rem;
  }

  .button {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 4rem;
    border: 0;
    color: #fff;
    cursor: pointer;
    display: block;
    font-size: 18px;
    font-weight: 600;
    padding: .75rem 1.5rem;
    text-align: center;
  }

  .button--primary {
    background-color: #17A3DC;
  }

  .button--secondary {
    background-color: #242F40;
  }

  .section {
    border: 1px solid #f4f4f4;
    border-radius: .5rem;
    margin-left: auto;
    margin-right: auto;
    max-width: 35ch;
    padding: 1rem;
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
    0% {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  .video-container {
    position: relative;
    width: 100%;
  }

  .video-container #smile-cta,
  .video-container video {
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
    clip-path: ellipse(101px 118px);
    transform: scaleX(-1) translateX(50%) translateY(-50%);
    z-index: -1;
  }
</style>

<div id='request-screen' class='flow center'>
  <div class='section | flow'>
    <p class='color-red' id='error'>
    </p>

    <p>
      <a href='https://smileidentity.com' class='powered-by text-transform-uppercase'>
        <span class='logo-mark'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 10">
            <path fill="#fff" d="M6.67 4V2.82c0-1.65-.9-2.6-2.46-2.6s-2.43.95-2.43 2.6v.3c0 .08.06.13.13.13.08 0 .13-.05.13-.13v-.3c0-.87.3-2.33 2.17-2.33C6.1.5 6.38 1.95 6.38 2.82V4H1.65a.85.85 0 00-.86.83L.97 8.4c0 .45.4.82.87.82h4.51c.47 0 .86-.37.86-.82l.19-3.56A.9.9 0 006.67 4zm.23 4.38c0 .33-.26.55-.57.55h-4.5a.57.57 0 01-.57-.55L1.08 4.8c0-.3.26-.55.57-.55h4.86c.31 0 .57.25.57.55L6.9 8.38z"/>
          </svg>
        </span>
        <span>Powered By</span>
        <span class='company'>Smile Identity</span>
      </a>
    </p>

    <button id='request-camera-access' class='button button--primary | center' type='button'>
      Request Camera Access
    </button>
  </div>
</div>

<div hidden id='camera-screen' class='flow center'>
  <h1>Take a Selfie</h1>

  <div class='section | flow'>
    <p>
      <a href='https://smileidentity.com' class='powered-by text-transform-uppercase'>
        <span class='logo-mark'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 10">
            <path fill="#fff" d="M6.67 4V2.82c0-1.65-.9-2.6-2.46-2.6s-2.43.95-2.43 2.6v.3c0 .08.06.13.13.13.08 0 .13-.05.13-.13v-.3c0-.87.3-2.33 2.17-2.33C6.1.5 6.38 1.95 6.38 2.82V4H1.65a.85.85 0 00-.86.83L.97 8.4c0 .45.4.82.87.82h4.51c.47 0 .86-.37.86-.82l.19-3.56A.9.9 0 006.67 4zm.23 4.38c0 .33-.26.55-.57.55h-4.5a.57.57 0 01-.57-.55L1.08 4.8c0-.3.26-.55.57-.55h4.86c.31 0 .57.25.57.55L6.9 8.38z"/>
          </svg>
        </span>
        <span>Powered By</span>
        <span class='company'>Smile Identity</span>
      </a>
    </p>

    <div class='video-container'>
      <svg width="215" height="245" viewBox="0 0 215 245" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M210.981 122.838C210.981 188.699 164.248 241.268 107.55 241.268C50.853 241.268 4.12018 188.699 4.12018 122.838C4.12018 56.9763 50.853 4.40771 107.55 4.40771C164.248 4.40771 210.981 56.9763 210.981 122.838Z" stroke="#17A3DC" stroke-width="7.13965"/>
      </svg>
      <p id='smile-cta' class='color-gray'>SMILE</p>
    </div>

    <small class='tips'>
      <svg width='2.75rem' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40">
        <path fill="#F8F8FA" fill-rule="evenodd" d="M17.44 0h4.2c4.92 0 7.56.68 9.95 1.96a13.32 13.32 0 015.54 5.54c1.27 2.39 1.95 5.02 1.95 9.94v4.2c0 4.92-.68 7.56-1.95 9.95a13.32 13.32 0 01-5.54 5.54c-2.4 1.27-5.03 1.95-9.95 1.95h-4.2c-4.92 0-7.55-.68-9.94-1.95a13.32 13.32 0 01-5.54-5.54C.68 29.19 0 26.56 0 21.64v-4.2C0 12.52.68 9.9 1.96 7.5A13.32 13.32 0 017.5 1.96C9.89.68 12.52 0 17.44 0z" clip-rule="evenodd"/>
        <path fill="#AEB6CB" d="M19.95 10.58a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.54 2.3a.71.71 0 000 1.43.71.71 0 000-1.43zm11.08 0a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.63 1.27a4.98 4.98 0 00-2.05 9.48v1.2a2.14 2.14 0 004.28 0v-1.2a4.99 4.99 0 00-2.23-9.48zm-7.75 4.27a.71.71 0 000 1.43.71.71 0 000-1.43zm15.68 0a.71.71 0 000 1.43.71.71 0 000-1.43z"/>
      </svg>
      <span>Tips: Put your face inside the oval frame and click to "take selfie"</span> </small>

    <button id='start-image-capture' class='button button--primary | center' type='button'>
      Take Selfie
    </button>
  </div>
</div>

<div hidden id='review-screen' class='flow center'>
  <h1>Review Selfie</h1>

  <div class='section | flow'>
    <img
      id='review-image'
      src=''
    />

    <p class='color-richblue-shade font-size-large'>
      Is this clear enough?
    </p>

    <p class='color-gray font-size-small'>
      Make sure your face is clear enough and the photo is not blurry
    </p>

    <button id='submit-images' class='button button--primary | center' type='button'>
      Yes, use this one
    </button>

    <button id='restart-image-capture' class='button button--secondary | center' type='button'>
      Re-take selfie
    </button>
  </div>
</div>

<div hidden id='thanks-screen' class='flow center'>
  <div class='section | flow'>
    <h1>Thank you</h1>

    <p>
      <a href='https://smileidentity.com' class='powered-by text-transform-uppercase'>
        <span class='logo-mark'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 10">
            <path fill="#fff" d="M6.67 4V2.82c0-1.65-.9-2.6-2.46-2.6s-2.43.95-2.43 2.6v.3c0 .08.06.13.13.13.08 0 .13-.05.13-.13v-.3c0-.87.3-2.33 2.17-2.33C6.1.5 6.38 1.95 6.38 2.82V4H1.65a.85.85 0 00-.86.83L.97 8.4c0 .45.4.82.87.82h4.51c.47 0 .86-.37.86-.82l.19-3.56A.9.9 0 006.67 4zm.23 4.38c0 .33-.26.55-.57.55h-4.5a.57.57 0 01-.57-.55L1.08 4.8c0-.3.26-.55.57-.55h4.86c.31 0 .57.25.57.55L6.9 8.38z"/>
          </svg>
        </span>
        <span>Powered By</span>
        <span class='company'>Smile Identity</span>
      </a>
    </p>
  </div>
</div>
`;

class SmartCameraWeb extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.shadowRoot.querySelector('#request-camera-access').addEventListener('click', e => this.init(e));
    } else {
      const heading = document.createElement('h1');
      heading.classList.add('error-message');
      heading.textContent = 'Your browser does not support this integration';

      this.shadowRoot.appendChild(heading);
    }
  }

  handleSuccess(stream) {
    const video = document.createElement('video');
    const videoTracks = stream.getVideoTracks();

    video.autoplay = true;
    video.playsInline = true;

    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }

    this.videoContainer.appendChild(video);

    this._data.partner_params.permissionGranted = true;

    this.requestScreen.hidden = true;
    this.cameraScreen.hidden = false;

    this._stream = stream;
    this._video = video;
  }

  handleError(e) {
    if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
      this.errorMessage.textContent = `
        Looks like camera access was not granted, or was blocked by a browser
        level setting / extension. Please follow the prompt from the URL bar,
        or extensions, and enable access.

        You may need to refresh to start all over again
        `;
    }

    if (e.name === 'AbortError') {
      this.errorMessage.textContent = `
        Oops! Something happened, and we lost access to your stream.

        Please refresh to start all over again
        `;
    }

    if (e.name === 'NotReadableError') {
      this.errorMessage.textContent = `
        There seems to be a problem with your device's camera, or its connection.

        Please check this, and when resolved, try again. Or try another device.
        `;
    }

    if (e.name === 'NotFoundError') {
      this.errorMessage.textContent = `
        We are unable to find a video stream.

        You may need to refresh to start all over again
        `;
    }

    if (e.name === 'TypeError') {
      this.errorMessage.textContent = `
        This site is insecure, and as such cannot have access to your camera.

        Try to navigate to a secure version of this page, or contact the owner.
      `
    }
  }

  init(e) {
    this.errorMessage = this.shadowRoot.querySelector('#error');

    this.requestScreen = this.shadowRoot.querySelector('#request-screen');
    this.cameraScreen = this.shadowRoot.querySelector('#camera-screen');
    this.reviewScreen = this.shadowRoot.querySelector('#review-screen');
    this.thanksScreen = this.shadowRoot.querySelector('#thanks-screen');

    this.videoContainer = this.shadowRoot.querySelector('.video-container');
    this.smileCTA = this.shadowRoot.querySelector('#smile-cta');
    this.startImageCapture = this.shadowRoot.querySelector('#start-image-capture');
    this.reviewImage = this.shadowRoot.querySelector('#review-image');

    this.reStartImageCapture = this.shadowRoot.querySelector('#restart-image-capture');
    this.submitImages = this.shadowRoot.querySelector('#submit-images');

    this.startImageCapture.addEventListener('click', () => {
      this._startImageCapture();
    });

    this.submitImages.addEventListener('click', () => {
      this._publishSelectedImages();
    });

    this.reStartImageCapture.addEventListener('click', () => {
      this._reStartImageCapture();
    });

    this._videoStreamDurationInMS = 7600;
    this._imageCaptureIntervalInMS = 200;

    this._data = {
      partner_params: {
        libraryVersion: VERSION,
        permissionGranted: false,
      },
      images: []
    };
    this._rawImages = [];

    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream => {
        this.handleSuccess(stream);
      })
      .catch(e => {
        this.handleError(e)
      });
  }

  _startImageCapture() {
    this.startImageCapture.disabled = true;
    this.smileCTA.style.animation = `fadeInOut ease ${this._videoStreamDurationInMS / 1000}s`;

    this._imageCaptureInterval = setInterval(() => {
      this._capturePOLPhoto();
    }, this._imageCaptureIntervalInMS);

    this._videoStreamTimeout = setTimeout(() => {
      this._stopVideoStream(this._stream);
    }, this._videoStreamDurationInMS);
  }

  _capturePOLPhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;

    const context = canvas.getContext('2d');

    const aspectRatio = this._video.videoWidth / this._video.videoHeight;

    // NOTE: aspectRatio is greater than 1 in landscape mode, less in portrait
    if (aspectRatio > 1) {
      context.drawImage(
        this._video,
        ((this._video.videoWidth - this._video.videoHeight) / 2), 0,
        this._video.videoHeight, this._video.videoHeight,
        0, 0,
        canvas.width, canvas.height
      );
    } else if (aspectRatio < 1) {
      context.drawImage(
        this._video,
        0, ((this._video.videoHeight - this._video.videoWidth) / 2),
        this._video.videoWidth, this._video.videoWidth,
        0, 0,
        canvas.width, canvas.height
      );
    } else {
      context.drawImage(this._video, 0, 0, canvas.width, canvas.height);
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      // red
      data[i] = brightness;
      // green
      data[i + 1] = brightness;
      // blue
      data[i + 2] = brightness;
    }

    context.putImageData(imageData, 0, 0);

    this._rawImages.push(canvas.toDataURL('image/jpeg'));
  }

  _captureReferencePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this._video.videoWidth;
    canvas.height = this._video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(this._video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg');

    // TODO: figure out how to display reference image at completion of capture
    this._referenceImage = image;

    this._data.images.push({
      image_type_id: 2,
      file: '',
      image: image.split(',')[1]
    });
  }

  _stopVideoStream(stream) {
    clearTimeout(this._videoStreamTimeout);
    clearInterval(this._imageCaptureInterval);
    clearInterval(this._drawingInterval);
    this.smileCTA.style.animation = 'none';

    this._capturePOLPhoto(); // NOTE: capture the last photo
    this._captureReferencePhoto();
    stream.getTracks().forEach(track => track.stop());

    this.reviewImage.src = this._referenceImage;

    const totalNoOfFrames = this._rawImages.length;

    const livenessFramesIndices = getLivenessFramesIndices(totalNoOfFrames);

    this._data.images = this._data.images.concat(livenessFramesIndices.map(imageIndex => ({
      image_type_id: 6,
      image: this._rawImages[imageIndex].split(',')[1],
      file: ''
    })));

    this.cameraScreen.hidden = true;
    this.reviewScreen.hidden = false;
  }

  _publishSelectedImages() {
    this.dispatchEvent(
      new CustomEvent('imagesComputed', { detail: this._data })
    );

    this.reviewScreen.hidden = true;
    this.thanksScreen.hidden = false;
  }

  async _reStartImageCapture() {
    this.reviewScreen.hidden = true;
    this.startImageCapture.disabled = false;

    this._data.images = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      });

      this.handleSuccess(stream);
    } catch (e) {
      this.handleError(e);
    }
  }
}

window.customElements.define('smart-camera-web', SmartCameraWeb);
