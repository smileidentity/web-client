import SmartCamera from "../../../../domain/camera/src/SmartCamera";
import styles from "../../../../styles/src/styles";
import {
  PORTRAIT_ID_PREVIEW_HEIGHT,
  PORTRAIT_ID_PREVIEW_WIDTH,
} from "../../../../domain/constants/src/Constants";
import "../../../navigation/src";

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
      .video-section {
        border: 1px solid transparent;
        /* border-radius: 0.5rem; */
        margin-left: auto;
        margin-right: auto;
        max-width: 35ch;
        padding: 0;
        height: 15rem;
      }

      .img {
        transform: scaleX(1);
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

      .instructions {
        margin-block-start: 2rem;
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

      video {
        width: 20rem;
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
        /* min-height: calc((2 * 10rem) + 176px); */
        width: calc((2 * 4rem) + 154px);
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
        border-width: 2rem 3.9rem;
        border-color: #fff;
        border-style: solid;
        height: auto;
        width: calc((2 * 4rem) + 158px);
        position: absolute;
        top: -22px;
        left: -52px;
        z-index: 2;
      }
  
      .id-video-container.landscape video {
        width: 100%;
        transform: translateX(-50%) translateY(2%);
        z-index: 1;
        width: 24rem;
      }

      .description {
        width: 66%;
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
        height: 100%;
      }
  </style>
  <div id='document-capture-screen' class='flow center flex-column'>
  <smileid-navigation ${this.showNavigation ? "show-navigation" : ""} ${this.hideBack ? "hide-back" : ""}></smileid-navigation>
    <h2 class='h2 color-digital-blue'>${this.idType}</h2>
    <div class="circle-progress" id="loader">
    ${this.cameraError ? "" : '<p class="spinner"></p>'}
        ${
          this.cameraError
            ? `<p style="--flow-space: 4rem" class='color-red | center'>${this.cameraError}</p>`
            : '<p style="--flow-space: 4rem">Checking permissions</p>'
        }
    </div>
    <div class='video-section | flow ${this.isPortraitCaptureView ? "portrait" : "landscape"}' hidden>
      <div class='id-video-container landscape'>
        <video id='id-video' class='flow' playsinline autoplay muted></video>
        <svg class="image-frame" fill="none" height="259" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259" ${this.isPortraitCaptureView ? "hidden" : ""}>
          <use href='#image-frame' />
        </svg>

        <svg class="image-frame-portrait" fill="none" height="527" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 527" ${!this.isPortraitCaptureView ? "hidden" : ""}>
          <use href='#image-frame-portrait' />
        </svg>
      </div>
    </div>
    <h2 class='h2 color-digital-blue reset-margin-block id-side'${this.IdSides[this.sideOfId]} of ${this.idType}</h2>
    <h4 class='h4 color-digital-blue description reset-margin-block'>Make sure all corners are visible and there is no glare.</h4>
    <div class='actions' hidden>
      <button id='capture-id-image' class='button icon-btn | center' type='button'>
        <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM61 35C61 49.3594 49.3594 61 35 61C20.6406 61 9 49.3594 9 35C9 20.6406 20.6406 9 35 9C49.3594 9 61 20.6406 61 35ZM65 35C65 51.5685 51.5685 65 35 65C18.4315 65 5 51.5685 5 35C5 18.4315 18.4315 5 35 5C51.5685 5 65 18.4315 65 35Z" fill="#001096"/>
        </svg>
        <span class='visually-hidden'>Capture</span>
      </button>
    </div>

      ${
        this.hideAttribution
          ? ""
          : `
        <powered-by-smile-id></powered-by-smile-id>
      `
      }
    </div>
  </div>
  `;
}

class DocumentCapture extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: "open" });
    this.IdSides = {
      back: "Back",
      front: "Front",
    };
  }

  connectedCallback() {
    const template = document.createElement("template");
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setUpEventListeners();
  }

  async getUserMedia() {
    await SmartCamera.getMedia({
      audio: false,
      video: SmartCamera.environmentOptions,
    });

    this.handleIDStream(SmartCamera.stream);
  }

  _captureIDImage() {
    const image = this._drawIDImage();

    this._stopIDVideoStream();

    this.dispatchEvent(
      new CustomEvent("document-capture.publish", {
        detail: {
          image,
        },
      }),
    );
  }

  _drawIDImage(video = this._IDVideo) {
    const canvas = document.createElement("canvas");
    if (this.isPortraitCaptureView) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame onto the canvas
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the dimensions of the video preview frame
      const previewWidth = PORTRAIT_ID_PREVIEW_WIDTH;
      const previewHeight = PORTRAIT_ID_PREVIEW_HEIGHT;

      // Define the padding value
      const paddingPercent = 0.5; // 50% of the preview dimensions;
      const paddedWidth = previewWidth * (1 + paddingPercent);
      const paddedHeight = previewHeight * (1 + paddingPercent);

      // Calculate the dimensions of the cropped image based on the padded preview frame dimensions
      const cropWidth = paddedWidth;
      const cropHeight = paddedHeight;
      const cropLeft = (canvas.width - cropWidth) / 2;
      const cropTop = (canvas.height - cropHeight) / 2;

      // Create a new canvas element for the cropped image
      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      // Draw the cropped image onto the new canvas
      const croppedCtx = croppedCanvas.getContext("2d");
      croppedCtx.drawImage(
        canvas,
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      return croppedCanvas.toDataURL("image/jpeg");
    }

    canvas.width = 2240;
    canvas.height = 1260;

    const context = canvas.getContext("2d");
    const aspectRatio = video.videoWidth / video.videoHeight;

    // NOTE: aspectRatio is greater than 1 in landscape mode, less in portrait
    if (aspectRatio < 1) {
      const imageFrame = this.activeScreen.querySelector(
        '[class*="image-frame"]:not([hidden]) [href*="image-frame"]',
      );
      const videoBox = video.getBoundingClientRect();
      const frameBox = imageFrame.getBoundingClientRect();

      const sourceXOffset =
        ((frameBox.left - videoBox.left) / videoBox.width) * video.videoWidth;
      const sourceYOffset =
        ((frameBox.top - videoBox.top) / videoBox.height) * video.videoHeight;
      const sourceWidth = frameBox.width * (video.videoWidth / videoBox.width);
      const sourceHeight =
        frameBox.height * (video.videoHeight / videoBox.height);

      canvas.height = (canvas.width * frameBox.height) / frameBox.width;

      context.drawImage(
        video,
        sourceXOffset,
        sourceYOffset,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      return canvas.toDataURL("image/jpeg");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  }

  _drawImage(canvas, enableImageTests = true, video = SmartCamera.stream) {
    this.resetErrorMessage();
    const context = canvas.getContext("2d");

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
        "Unable to capture webcam images - Please try another device",
      );
    } else {
      return context;
    }
  }

  handleIDStream(stream) {
    const videoExists = this.shadowRoot.querySelector("video");
    let video = null;
    if (videoExists) {
      video = this.shadowRoot.querySelector("video");
    } else {
      video = document.createElement("video");
    }

    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }

    video.onloadedmetadata = () => {
      video.play();
    };

    const videoContainer = this.shadowRoot.querySelector(".id-video-container");

    video.onloadedmetadata = () => {
      this.shadowRoot.querySelector(".actions").hidden = false;
      this.shadowRoot.querySelector("#loader").hidden = true;
      this.shadowRoot.querySelector(".video-section").hidden = false;
    };

    if (!videoExists) {
      videoContainer.prepend(video);
    }

    this._IDStream = stream;
    this._IDVideo = video;
  }

  _stopIDVideoStream(stream = this._IDStream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  setUpEventListeners() {
    this.captureIDImage = this.shadowRoot.querySelector("#capture-id-image");
    this.navigation = this.shadowRoot.querySelector("smileid-navigation");

    if (SmartCamera.stream) {
      this.handleIDStream(SmartCamera.stream);
    }

    this.navigation.addEventListener("navigation.back", () => {
      this.handleBackEvents();
    });

    this.navigation.addEventListener("navigation.close", () => {
      this.handleCloseEvents();
    });

    this.captureIDImage.addEventListener("click", () => {
      this._captureIDImage();
    });
  }

  get hideBack() {
    return this.hasAttribute("hide-back-to-host");
  }

  get showNavigation() {
    return this.hasAttribute("show-navigation");
  }

  get themeColor() {
    return this.getAttribute("theme-color") || "#043C93";
  }

  get hideAttribution() {
    return this.hasAttribute("hide-attribution");
  }

  get documentCaptureModes() {
    return this.getAttribute("document-capture-modes") || "camera";
  }

  get supportBothCaptureModes() {
    const value = this.documentCaptureModes;
    return value.includes("camera") && value.includes("upload");
  }

  get title() {
    return this.getAttribute("title") || "Submit Front of ID";
  }

  get hidden() {
    return this.getAttribute("hidden");
  }

  get sideOfId() {
    return (this.getAttribute("side-of-id") || "front").toLowerCase();
  }

  get isFrontOfId() {
    return this.sideOfId === "front";
  }

  get isBackOfId() {
    return !this.isFrontOfId;
  }

  get idType() {
    return this.getAttribute("id-type") || "Document";
  }

  get cameraError() {
    return this.getAttribute("data-camera-error");
  }

  static get observedAttributes() {
    return [
      "title",
      "hidden",
      "show-navigation",
      "hide-back-to-host",
      "data-camera-ready",
      "data-camera-error",
    ];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case "title":
      case "data-camera-ready":
      case "data-camera-error":
      case "hidden":
        this.shadowRoot.innerHTML = this.render();
        this.setUpEventListeners();
        break;
      default:
        break;
    }
  }

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent("document-capture.cancelled"));
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent("document-capture.close"));
  }
}

if ("customElements" in window && !customElements.get("document-capture")) {
  window.customElements.define("document-capture", DocumentCapture);
}

export default DocumentCapture;
