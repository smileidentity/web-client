import SmartCamera from '../../../../domain/camera/src/SmartCamera';
import styles from '../../../../styles/src/styles';
import {
  PORTRAIT_ID_PREVIEW_HEIGHT,
  PORTRAIT_ID_PREVIEW_WIDTH,
} from '../../../../domain/constants/src/Constants';
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
    ${styles}
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
  <div id='document-capture-screen' class='flow center flex-column'>
  <smileid-navigation ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>
    <h2 class='text-base font-bold color-digital-blue'>${this.documentName}</h2>
    <div class="circle-progress" id="loader">
        ${this.cameraError ? '' : '<p class="spinner"></p>'}
        ${this.cameraError ? `<p style="--flow-space: 4rem" class='color-red | center'>${this.cameraError}</p>` : '<p style="--flow-space: 4rem">Checking permissions</p>'}
    </div>
    <div class='section | flow ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
      <div class='id-video-container'>
        <div class='id-video ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}' hidden>
        </div>
        <div class='video-footer sticky'>
          <h2 class='text-base font-bold color-digital-blue reset-margin-block id-side'>${this.title}</h2>
          <h4 class='text-base font-normal color-digital-blue description reset-margin-block'>Make sure all corners are visible and there is no glare.</h4>
          <div class='actions' hidden>
            <button id='capture-id-image' class='button icon-btn | center' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM61 35C61 49.3594 49.3594 61 35 61C20.6406 61 9 49.3594 9 35C9 20.6406 20.6406 9 35 9C49.3594 9 61 20.6406 61 35ZM65 35C65 51.5685 51.5685 65 35 65C18.4315 65 5 51.5685 5 35C5 18.4315 18.4315 5 35 5C51.5685 5 65 18.4315 65 35Z" fill="#001096"/>
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

const fixedAspectRatio = 1.53;
const documentCaptureScale = 0.6;
// const scaleOffset = 0.3;

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
    // if (this.isPortraitCaptureView) {
    //   canvas.width = video.videoWidth;
    //   canvas.height = video.videoHeight;

    //   // Draw the video frame onto the canvas
    //   const ctx = canvas.getContext('2d');
    //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    //   // Get the dimensions of the video preview frame
    //   const previewWidth = PORTRAIT_ID_PREVIEW_WIDTH;
    //   const previewHeight = PORTRAIT_ID_PREVIEW_HEIGHT;

    //   // Define the padding value
    //   const paddingPercent = 1.1; // 110% of the preview dimensions because we previously scaled the image, old value was 50%;
    //   const paddedWidth = previewWidth * (1 + paddingPercent);
    //   const paddedHeight = previewHeight * (1 + paddingPercent);

    //   // Calculate the dimensions of the cropped image based on the padded preview frame dimensions
    //   const cropWidth = paddedWidth;
    //   const cropHeight = paddedHeight;
    //   const cropLeft = (canvas.width - cropWidth) / 2;
    //   const cropTop = (canvas.height - cropHeight) / 2;

    //   // Create a new canvas element for the cropped image
    //   const croppedCanvas = document.createElement('canvas');
    //   croppedCanvas.width = cropWidth;
    //   croppedCanvas.height = cropHeight;

    //   // Draw the cropped image onto the new canvas
    //   const croppedCtx = croppedCanvas.getContext('2d');
    //   croppedCtx.drawImage(
    //     canvas,
    //     cropLeft,
    //     cropTop,
    //     cropWidth,
    //     cropHeight,
    //     0,
    //     0,
    //     cropWidth,
    //     cropHeight,
    //   );
    //   // Draw the cropped image onto the new canvas
    //   const previewImageCtx = croppedCanvas.getContext('2d');
    //   const previewCanvas = document.createElement('canvas');
    //   previewImageCtx.drawImage(
    //     previewCanvas,
    //     cropLeft + 100,
    //     cropTop + 100,
    //     cropWidth,
    //     cropHeight,
    //     0,
    //     0,
    //     cropWidth,
    //     cropHeight,
    //   );

    //   const image = croppedCanvas.toDataURL('image/jpeg');
    //   const previewImage = previewCanvas.toDataURL('image/jpeg');

    //   return {
    //     image,
    //     originalHeight: canvas.height,
    //     originalWidth: canvas.width,
    //     previewImage,
    //     ...this.idCardRegion,
    //   };
    // }

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
    const videoExists = this.shadowRoot.querySelector('canvas');
    if (videoExists) {
      // remove canvas
      videoExists.remove();
    }
    let video = null;
    let canvas = null;
    video = document.createElement('video');
    canvas = document.createElement('canvas');
    const videoContainer = this.shadowRoot.querySelector('.id-video');

    video.muted = true;
    video.setAttribute('muted', 'true');

    video.autoplay = true;
    video.playsInline = true;
    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }
    const rightLeftBorderSize = 20;
    const topBottomBorderSize = 20;
    canvas.width = 430 - rightLeftBorderSize;
    canvas.height = 250 - topBottomBorderSize;
    let videoMeta = {};

    video.onloadedmetadata = () => {
      videoMeta = this._calculateVideoOffset(video, {
        clientWidth: videoContainer.clientWidth,
      });
      video.play();

      this.shadowRoot.querySelector('#loader').hidden = true;
      this.shadowRoot.querySelector('.id-video').hidden = false;
      this.shadowRoot.querySelector('.actions').hidden = false;
    };

    const onVideoStart = () => {
      if (video.paused || video.ended) return;

      const portrait = videoMeta.aspectRatio < 1;

      if (portrait) {
        videoContainer.classList.add('mobile-camera-screen');
        const intermediateCanvas = document.createElement('canvas');
        this._capturePortraitToLandscapeImage(intermediateCanvas, video);
        this._drawLandscapeImageFromCanvas(canvas, intermediateCanvas);
      } else {
        this._drawLandscapeImage(canvas, video);
      }
      requestAnimationFrame(onVideoStart);

      video.removeEventListener('playing', onVideoStart);
    };

    video.addEventListener('playing', onVideoStart);

    if (!videoExists) {
      videoContainer.prepend(canvas);
    }

    this._IDStream = stream;
    this._IDVideo = video;
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

  _calculateVideoOffset(video, { clientWidth }) {
    clientWidth = clientWidth || video.clientWidth;
    const offset = 30;
    const aspectRatio = video.videoWidth / video.videoHeight;
    const calculatedAspectRatio = this.isPortraitCaptureView
      ? PORTRAIT_ID_PREVIEW_WIDTH / PORTRAIT_ID_PREVIEW_HEIGHT
      : fixedAspectRatio;
    const portrait = aspectRatio < 1;
    const videoWidth = clientWidth;
    const videoHeight = clientWidth / calculatedAspectRatio;
    const originalWidth = video.videoWidth;
    const originalHeight = video.videoWidth / calculatedAspectRatio;

    const offsetHeight = videoHeight * ((portrait ? 5 : offset) / 100);
    const offsetWidth = videoWidth * (offset / 100);

    return {
      aspectRatio,
      offsetHeight,
      offsetWidth,
      originalHeight,
      originalWidth,
      videoHeight,
      videoWidth,
    };
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
    return this.getAttribute('theme-color') || '#043C93';
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
