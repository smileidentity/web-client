import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

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

function templateString() {
  return `
    <style>
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

      .mobile-camera-screen video {
        display: block;
        object-fit: cover;
        object-position: center;
        width: 100%;
      }

     .id-video.mobile-camera-screen {
        display: flex;
        align-items: stretch;
        justify-content: center;
        max-height: 300px;
        height: 15rem;
        width: 100%;
        overflow: visible;
        margin: 0 auto;
      }
      
      @media (max-width: 600px) {
        .section {
          width: 99%;
          height: 100vh;
          justify-content: center;
        }
      }



      #document-capture-screen,
      #back-of-document-capture-screen {
        block-size: 45rem;
        padding-block: 2rem;
        display: flex;
        flex-direction: column;
        max-block-size: 100%;
        max-inline-size: 40ch;
      }

      #document-capture-screen header p {
        margin-block: 0 !important;
      }

      .padding-bottom-2 {
        padding-bottom: 2rem;
      }
      @media (min-width: 600px) {
        video {
          object-fit: contain;
          -webkit-tap-highlight-color: transparent;
          content: normal;
        }
      
        .id-video {
          width: 99%;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .id-video-container {
          margin: auto;
          padding: 0px;
        }
      }
      .id-video-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .id-video {
        width: 100%;
        text-align: center;
        position: relative;
        background: white;
      }
      .video-overlay {
        position: absolute;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.48);
        box-sizing: border-box;
        inset: 0px;
      }
      
      .video-overlay .inner-border {
        position: absolute;
        border-width: 0.25rem;
        border-color: #9394ab;
        border-style: solid;
        border-radius: 0.25rem;
        inset: -1px;
      }
      canvas {
        border-width: 0.25rem;
        border-color: #9394ab;
        border-style: solid;
        border-radius: 0.25rem;
      }
      
      .description {
        align-self: center;
        padding-bottom: 1.75rem;
      }
      .reset-margin-block {
        margin-block: 0;
      }
      .align-items-center {
        align-items: center;
      }
      .id-side {
        padding-bottom: 0.5rem;
      }
      
      .circle-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 10rem;
      }

     .portrait .sticky {
        position: -webkit-sticky; /* Safari */
        position: sticky;
        bottom: 0;
      }
      .video-footer {
        background-color: rgba(255, 255, 255, 0.17);
        padding-top: 10px;
      }
  </style>
  ${styles(this.themeColor)}
  <div id='document-capture-screen' class='flow center flex-column'>
  <smileid-navigation theme-color='${this.themeColor}' ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>
    <h2 class='text-base font-bold title-color'>${this.documentName}</h2>
    <div class="circle-progress" id="loader">
        ${this.cameraError ? '' : '<p class="spinner"></p>'}
        ${this.cameraError ? `<p style="--flow-space: 4rem" class='color-red | center'>${this.cameraError}</p>` : '<p style="--flow-space: 4rem">Checking permissions</p>'}
    </div>
    <div class='section | flow ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
      <div class='id-video-container'>
        <div class='id-video ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}' hidden>
        </div>
        <div class='video-footer sticky'>
          <h2 class='text-base font-bold title-color reset-margin-block id-side'>${this.title}</h2>
          <h4 class='text-base font-normal title-color description reset-margin-block'>Make sure all corners are visible and there is no glare.</h4>
          <div class='actions' hidden>
            <button id='capture-id-image' class='button icon-btn | center' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM61 35C61 49.3594 49.3594 61 35 61C20.6406 61 9 49.3594 9 35C9 20.6406 20.6406 9 35 9C49.3594 9 61 20.6406 61 35ZM65 35C65 51.5685 51.5685 65 35 65C18.4315 65 5 51.5685 5 35C5 18.4315 18.4315 5 35 5C51.5685 5 65 18.4315 65 35Z" fill="${this.themeColor}"/>
              </svg>
              <span class='visually-hidden'>Capture Document</span>
            </button>
          </div>
          ${this.hideAttribution ? '' : '<powered-by-smile-id></powered-by-smile-id>'}
        </div>
      </div>
    </div>
  </div>
  `;
}

const documentCaptureScale = 0.6;

class DocumentCapture extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
    this.IdSides = {
      back: 'Back',
      front: 'Front',
    };
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = this.render();
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setUpEventListeners();
  }

  async getUserMedia() {
    if (SmartCamera.stream) {
      return;
    }
    if (!this.hasAttribute('data-camera-error')) return;

    try {
      await SmartCamera.getMedia({
        audio: false,
        video: {
          ...SmartCamera.environmentOptions,
          aspectRatio: { ideal: 16 / 9 },
        },
      });
    } catch (error) {
      console.error(error.constraint);
      console.error(error.message);
    }

    this.handleIDStream(SmartCamera.stream);
  }

  _captureIDImage() {
    const imageDetails = this._drawIDImage();
    this._stopIDVideoStream();

    this.dispatchEvent(
      new CustomEvent('document-capture.publish', {
        detail: {
          ...imageDetails,
        },
      }),
    );
  }

  _drawIDImage(video = this._IDVideo) {
    const canvas = document.createElement('canvas');
    if (this.isPortraitCaptureView) {
      canvas.width = video.videoWidth;
      canvas.height = (canvas.width * 16) / 9;

      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;

      this.updatePortraitId(canvas, video, 1, 1);
      this.updatePortraitId(previewCanvas, video);
      const image = canvas.toDataURL('image/jpeg');
      const previewImage = previewCanvas.toDataURL('image/jpeg');
      return {
        image,
        originalHeight: canvas.height,
        originalWidth: canvas.width,
        previewImage,
        ...this.idCardRegion,
      };
    }

    canvas.width = 2240;
    canvas.height = 1260;

    const height = canvas.width / (video.videoWidth / video.videoHeight);
    canvas.height = height;

    const previewCanvas = document.createElement('canvas');
    previewCanvas.height = canvas.height;
    previewCanvas.width = canvas.width;
    const isPortrait = video.videoWidth < video.videoHeight;
    if (isPortrait) {
      const intermediateCanvas = document.createElement('canvas');
      previewCanvas.height = canvas.width / 1.75;
      canvas.width = 2240;
      canvas.height = canvas.width / 1.77;
      this._capturePortraitToLandscapeImage(intermediateCanvas, video);
      this._drawLandscapeImageFromCanvas(canvas, intermediateCanvas, 1, 1);
      this._drawLandscapeImageFromCanvas(previewCanvas, intermediateCanvas);
    } else {
      this._drawLandscapeImage(canvas, video, 1, 1);
      this._drawLandscapeImage(previewCanvas, video);
    }
    const image = canvas.toDataURL('image/jpeg');

    const previewImage = previewCanvas.toDataURL('image/jpeg');
    return {
      image,
      originalHeight: canvas.height,
      originalWidth: canvas.width,
      previewImage,
      ...this.idCardRegion,
    };
  }

  _drawImage(canvas, enableImageTests = true, video = SmartCamera.stream) {
    this.resetErrorMessage();
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

  handleIDStream(stream) {
    try {
      const videoExists = this.shadowRoot.querySelector('canvas');
      if (videoExists) {
        // remove canvas
        videoExists.remove();
      }
      let video = null;
      let canvas = null;
      video = document.createElement('video');
      canvas = document.createElement('canvas');
      const videoContainer = this.shadowRoot.querySelector(
        '.id-video-container',
      );

      video.muted = true;
      video.setAttribute('muted', 'true');

      video.autoplay = true;
      video.playsInline = true;
      if ('srcObject' in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }

      canvas.width = videoContainer.clientWidth;
      canvas.height = (videoContainer.clientWidth * 9) / 16;
      if (this.isPortraitCaptureView) {
        canvas.height = (videoContainer.clientWidth * 16) / 9;
      }

      video.onloadedmetadata = () => {
        video.play();

        this.shadowRoot.querySelector('#loader').hidden = true;
        this.shadowRoot.querySelector('.id-video').hidden = false;
        this.shadowRoot.querySelector('.actions').hidden = false;
        if (!videoExists) {
          videoContainer.prepend(canvas);
        }
      };

      const onVideoStart = () => {
        if (video.paused || video.ended) return;
        video.removeEventListener('playing', onVideoStart);
        const aspectRatio = video.videoWidth / video.videoHeight;
        const portrait = aspectRatio < 1;
        if (this.isPortraitCaptureView) {
          this.updatePortraitId(canvas, video);
          requestAnimationFrame(onVideoStart);
          return;
        }

        if (portrait) {
          videoContainer.classList.add('mobile-camera-screen');
          const intermediateCanvas = document.createElement('canvas');
          this._capturePortraitToLandscapeImage(intermediateCanvas, video);
          this._drawLandscapeImageFromCanvas(canvas, intermediateCanvas);
        } else {
          this._drawLandscapeImage(canvas, video);
        }
        requestAnimationFrame(onVideoStart);
      };

      video.addEventListener('playing', onVideoStart);

      this._IDStream = stream;
      this._IDVideo = video;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
      if (stream) {
        this._stopIDVideoStream(stream);
      }
    }
  }

  _drawLandscapeImage(
    canvas,
    video = this._IDVideo,
    scaleHeight = documentCaptureScale,
    scaleWidth = documentCaptureScale,
  ) {
    const heightScaleFactor = this.height
      ? this.height / video.videoHeight
      : scaleHeight;
    const widthScaleFactor = this.width
      ? this.width / video.videoWidth
      : scaleWidth;
    const scaleHeightOffset = (1 - scaleHeight) / 2;
    const scaleWidthOffset = (1 - scaleWidth) / 2;
    const width = video.videoWidth * widthScaleFactor;
    const height = video.videoHeight * heightScaleFactor;
    const startX = video.videoWidth * scaleWidthOffset;
    const startY = video.videoHeight * scaleHeightOffset;

    canvas
      .getContext('2d')
      .drawImage(
        video,
        startX,
        startY,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
  }

  _capturePortraitToLandscapeImage(canvas, video = this._IDVideo) {
    const { videoHeight, videoWidth } = video;
    const cropWidth = videoWidth;
    const cropHeight = (videoWidth * 9) / 16; // convert to landscape aspect ratio
    const startX = 0;
    const startY = (videoHeight - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    canvas
      .getContext('2d')
      .drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
  }

  _drawLandscapeImageFromCanvas(
    canvas,
    sourceCanvas,
    scaleHeight = documentCaptureScale,
    scaleWidth = documentCaptureScale,
  ) {
    const heightScaleFactor = this.height
      ? this.height / sourceCanvas.height
      : scaleHeight;
    const widthScaleFactor = this.width
      ? this.width / sourceCanvas.width
      : scaleWidth;
    const scaleHeightOffset = (1 - scaleHeight) / 2;
    const scaleWidthOffset = (1 - scaleWidth) / 2;
    const width = sourceCanvas.width * widthScaleFactor;
    const height = sourceCanvas.height * heightScaleFactor;
    const startX = sourceCanvas.width * scaleWidthOffset;
    const startY = sourceCanvas.height * scaleHeightOffset;

    canvas
      .getContext('2d')
      .drawImage(
        sourceCanvas,
        startX,
        startY,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
  }

  _drawPortraitToLandscapeImage(canvas, video = this._IDVideo) {
    const { videoHeight, videoWidth } = video;
    const cropWidth = 600;
    const cropHeight = 400;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const startX = (videoWidth - cropWidth) / 2;
    const startY = (videoHeight - cropHeight) / 2;

    canvas
      .getContext('2d')
      .drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
  }

  updatePortraitId(
    destinationCanvas,
    video = this._IDVideo,
    scaleHeight = documentCaptureScale,
    scaleWidth = documentCaptureScale,
  ) {
    const { videoWidth, videoHeight } = video;

    if (videoWidth && videoHeight) {
      const intermediateCanvas = document.createElement('canvas');
      const aspectRatio = 9 / 16;
      let cropWidth;
      let cropHeight;
      let offsetX;
      let offsetY;

      if (videoWidth / videoHeight > aspectRatio) {
        // we scale the canvas to portrait aspect ratio
        cropHeight = videoHeight;
        cropWidth = cropHeight * aspectRatio;
        offsetX = (videoWidth - cropWidth) / 2;
        offsetY = 0;
      } else {
        // video already has portrait aspect ratio
        cropWidth = videoWidth;
        cropHeight = cropWidth;
        offsetX = 0;
        offsetY = 0;
      }

      intermediateCanvas.height = cropHeight;
      intermediateCanvas.width = cropWidth;
      // draw the video frame onto the intermediate canvas
      intermediateCanvas
        .getContext('2d')
        .drawImage(
          video,
          offsetX,
          offsetY,
          cropWidth,
          cropHeight,
          0,
          0,
          intermediateCanvas.width,
          intermediateCanvas.height,
        );

      // draw the intermediate canvas onto the destination canvas
      // we scale image based on the scaleHeight and scaleWidth
      const heightScaleFactor = this.height
        ? this.height / cropWidth
        : scaleHeight;
      const widthScaleFactor = this.width
        ? this.width / cropHeight
        : scaleWidth;
      const scaleHeightOffset = (1 - scaleHeight) / 2;
      const scaleWidthOffset = (1 - scaleWidth) / 2;
      const width = cropWidth * widthScaleFactor;
      const height = cropHeight * heightScaleFactor;
      const startX = cropWidth * scaleWidthOffset;
      const startY = cropHeight * scaleHeightOffset;
      destinationCanvas
        .getContext('2d')
        .drawImage(
          intermediateCanvas,
          startX,
          startY,
          width,
          height,
          0,
          0,
          destinationCanvas.width,
          destinationCanvas.height,
        );
    }
  }

  _stopIDVideoStream(stream = this._IDStream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  setUpEventListeners() {
    this.captureIDImage = this.shadowRoot.querySelector('#capture-id-image');
    this.navigation = this.shadowRoot.querySelector('smileid-navigation');

    if (SmartCamera.stream) {
      this.handleIDStream(SmartCamera.stream);
    }

    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    this.navigation.addEventListener('navigation.close', () => {
      this.handleCloseEvents();
    });

    this.captureIDImage.addEventListener('click', () => {
      this._captureIDImage();
    });

    this.getUserMedia();
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

  get documentCaptureModes() {
    return this.getAttribute('document-capture-modes') || 'camera';
  }

  get supportBothCaptureModes() {
    const value = this.documentCaptureModes;
    return value.includes('camera') && value.includes('upload');
  }

  get title() {
    return (
      this.getAttribute('title') ||
      `${this.IdSides[this.sideOfId]} of ${this.documentName}`
    );
  }

  get height() {
    return this.getAttribute('height');
  }

  get width() {
    return this.getAttribute('width');
  }

  get hidden() {
    return this.getAttribute('hidden');
  }

  get sideOfId() {
    return (this.getAttribute('side-of-id') || 'front').toLowerCase();
  }

  get isFrontOfId() {
    return this.sideOfId === 'front';
  }

  get isBackOfId() {
    return !this.isFrontOfId;
  }

  get documentType() {
    return this.getAttribute('document-type') || '';
  }

  get documentName() {
    return this.getAttribute('document-name') || 'Document';
  }

  get isPortraitCaptureView() {
    return this.getAttribute('document-type') === 'GREEN_BOOK';
  }

  get cameraError() {
    return this.getAttribute('data-camera-error');
  }

  static get observedAttributes() {
    return [
      'data-camera-error',
      'data-camera-ready',
      'document-name',
      'document-type',
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
      case 'document-name':
      case 'document-type':
      case 'hidden':
      case 'title':
        this.connectedCallback();
        break;
      default:
        break;
    }
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('document-capture.cancelled'));
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent('document-capture.close'));
  }
}

if ('customElements' in window && !customElements.get('document-capture')) {
  window.customElements.define('document-capture', DocumentCapture);
}

export default DocumentCapture;
