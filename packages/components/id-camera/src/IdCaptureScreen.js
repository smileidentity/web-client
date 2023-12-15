"use strict";

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
      .section {
        border: 1px solid #f4f4f4;
        border-radius: 0.5rem;
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

      #id-capture-screen,
      #back-of-id-capture-screen {
        block-size: 45rem;
        padding-block: 2rem;
        display: flex;
        flex-direction: column;
        max-block-size: 100%;
        max-inline-size: 40ch;
		justify-content: space-between;
      }

      #id-capture-screen header p {
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
	</style>
	<div id='id-camera-screen' class='flow center'>
    ${this.showNavigation ? `
      <div class="nav">
        <div class="back-wrapper">
          <button type='button' data-type='icon' id="back-button-id-entry" class="back-button icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
            </svg>
          </button>
          <div class="back-button-text">Back</div>
        </div>
        <button data-type='icon' type='button' id='id-camera-close' class='close-iframe icon-btn'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
            <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
            <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
          </svg>
          <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
        </button>
      </div>
    ` : ''}
    <h1>Take ID Card Photo</h1>
    <div class='section | flow ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
      <div class='id-video-container ${this.isPortraitCaptureView ? 'portrait' : 'landscape'}'>
        <svg class="image-frame" fill="none" height="259" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259" ${this.isPortraitCaptureView ? 'hidden' : ''}>
          <use href='#image-frame' />
        </svg>

        <svg class="image-frame-portrait" fill="none" height="527" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 527" ${!this.isPortraitCaptureView ? 'hidden' : ''}>
          <use href='#image-frame-portrait' />
        </svg>

        <div class='actions' hidden>
          <button id='capture-id-image' class='button icon-btn | center' type='button'>
            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM61 35C61 49.3594 49.3594 61 35 61C20.6406 61 9 49.3594 9 35C9 20.6406 20.6406 9 35 9C49.3594 9 61 20.6406 61 35ZM65 35C65 51.5685 51.5685 65 35 65C18.4315 65 5 51.5685 5 35C5 18.4315 18.4315 5 35 5C51.5685 5 65 18.4315 65 35Z" fill="#001096"/>
              </svg>
            <span class='visually-hidden'>Capture</span>
          </button>
        </div>
      </div>

      ${this.hideAttribution ? '' : `
        <powered-by-smile-id></powered-by-smile-id>
      `}
    </div>
  </div>
  `;
}

class IdCaptureScreen extends HTMLElement {
	constructor() {
		super();
		this.templateString = templateString.bind(this);
		this.render = () => {
			return this.templateString();
		};

		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const template = document.createElement("template");
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.IDCameraScreen = this.shadowRoot.querySelector('#id-camera-screen');
		this.captureIDImage = this.shadowRoot.querySelector('#capture-id-image');
		this.backButton = this.shadowRoot.querySelector("#back-button");

		const CloseIframeButtons =
			this.shadowRoot.querySelectorAll(".close-iframe");

		this.backButton && this.backButton.addEventListener("click", (e) => {
			this.handleBackEvents(e);
		});

		CloseIframeButtons.forEach((button) => {
			button.addEventListener(
				"click",
				() => {
					this.closeWindow();
				},
				false
			);
		});

		this.captureIDImage.addEventListener('click', () => {
			this._captureIDImage();
		});

		window.addEventListener('IDCapture::Start', async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
					  facingMode: 'environment',
					  width: { min: 1280 },
					  // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
					  // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
					  // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
					  zoom: isSamsungMultiCameraDevice() ? 2.0 : 1.0,
					},
				  });
				  this.handleIDStream(stream);
			} catch (e) {
				this.handleError(e)
			}
		});
	}

	_captureIDImage() {
		const image = this._drawIDImage();

		if (this.activeScreen === this.IDCameraScreen) {
			this.IDReviewImage.src = image;
		} else {
			this.backOfIDReviewImage.src = image;
		}

		this._data.images.push({
			image: image.split(',')[1],
			image_type_id: this.activeScreen === this.IDCameraScreen ? 3 : 7,
		});

		this._stopIDVideoStream();

		if (this.activeScreen === this.IDCameraScreen) {
			this.setActiveScreen(this.IDReviewScreen);
		} else {
			this.setActiveScreen(this.backOfIDReviewScreen);
		}

		this.dispatchEvent(new CustomEvent('IDCapture::ImageCaptured', {
			detail: {
				image,
			},
		}));
	}

	_drawImage(canvas, enableImageTests = true, video = this._video) {
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
			throw new Error('Unable to capture webcam images - Please try another device');
		} else {
			return context;
		}
	}

	handleIDStream(stream) {
		const videoExists = this.activeScreen === this.IDCameraScreen
			? !!this.IDCameraScreen.querySelector('video')
			: !!this.backOfIDCameraScreen.querySelector('video');
	
		let video = null;
		if (videoExists) {
			if (this.activeScreen === this.IDCameraScreen) {
			video = this.IDCameraScreen.querySelector('video');
			} else {
			video = this.backOfIDCameraScreen.querySelector('video');
			}
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
	
		const videoContainer = this.shadowRoot.querySelector('.id-video-container')
	
		video.onloadedmetadata = () => {
			videoContainer.querySelector('.actions').hidden = false;
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

	get hideBack() {
		return this.hasAttribute("hide-back-to-host");
	}

	get showNavigation() {
		return this.hasAttribute('show-navigation');
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
		return this.getAttribute('title') || 'Submit Front of ID';
	}

	handleBackEvents() {
		this.dispatchEvent(new CustomEvent("SmileIdentity::Exit"));
	}

	closeWindow() {
		const referenceWindow = window.parent;
		referenceWindow.postMessage("SmileIdentity::Close", "*");
	}
}

if ("customElements" in window) {
	window.customElements.define("id-capture", IdCaptureScreen);
}

export { IdCaptureScreen };
