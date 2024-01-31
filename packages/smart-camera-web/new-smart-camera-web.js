"use strict";

(function () {
  class SmartCamera {
    static stream = null;

    static async getMedia(constraints) {
      try {
        SmartCamera.stream = await navigator.mediaDevices.getUserMedia({
          ...constraints,
          video: {
            ...constraints.video,
            // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
            // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
            // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
            zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
          },
        });
        return SmartCamera.stream;
      } catch (error) {
        throw error;
      }
    }

    static stopMedia() {
      if (SmartCamera.stream) {
        SmartCamera.stream.getTracks().forEach((track) => track.stop());
      }
    }

    static isSamsungMultiCameraDevice() {
      const matchedModelNumber = navigator.userAgent.match(/SM-[N|G]\d{3}/);
      if (!matchedModelNumber) {
        return false;
      }

      const modelNumber = parseInt(matchedModelNumber[0].match(/\d{3}/)[0], 10);
      const smallerModelNumber = 970; // S10e
      return !isNaN(modelNumber) && modelNumber >= smallerModelNumber;
    }
  }

  class SmartFileUpload {
    static memoryLimit = 1024000;
    static supportedTypes = ["image/jpeg", "image/png"];

    static getHumanSize(numberOfBytes) {
      // Approximate to the closest prefixed unit
      const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const exponent = Math.min(
        Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
        units.length - 1,
      );
      const approx = numberOfBytes / 1024 ** exponent;
      const output =
        exponent === 0
          ? `${numberOfBytes} bytes`
          : `${approx.toFixed(0)} ${units[exponent]}`;

      return output;
    }

    static validate(files) {
      if (files.length > 1) {
        throw new Error("Only one file upload is permitted at a time");
      }

      const file = files[0];

      if (!SmartFileUpload.supportedTypes.includes(file.type)) {
        throw new Error(
          "Unsupported file format. Please ensure that you are providing a JPG or PNG image",
        );
      }

      if (file.size > SmartFileUpload.memoryLimit) {
        throw new Error(
          `File is too large. Please ensure that the file is less than ${SmartFileUpload.getHumanSize(
            SmartFileUpload.memoryLimit,
          )}.`,
        );
      }
    }

    static async getData(files) {
      const file = files[0];

      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  class SmartImageCapture {
    static documentFromVideo(video, width, height) {
      const aspectRatio = video.videoWidth / video.videoHeight;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (aspectRatio < 1) {
        const cropHeight = video.videoWidth * aspectRatio;

        context.drawImage(
          video,
          0,
          (video.videoHeight - cropHeight) / 2,
          video.videoWidth,
          cropHeight,
          0,
          0,
          width,
          height,
        );
      } else {
        context.drawImage(video, 0, 0, width, height);
      }

      return canvas.toDataURL("image/jpeg");
    }

    static faceFromVideo(video, canvasSideLength, grayscale = false) {
      const context = canvas.getContext("2d");

      const xCenterOfImage = video.videoWidth / 2;
      const yCenterOfImage = video.videoHeight / 2;

      context.drawImage(
        video,
        xCenterOfImage - sideLength / 2,
        yCenterOfImage - imageDimension / 2,
        imageDimension,
        imageDimension,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }
  }

  class WelcomeScreen extends HTMLElement {
    constructor() {
      super();

      const template = document.createElement("template");
      template.innerHTML = `
				<link rel="preconnect" href="https://fonts.gstatic.com">
				<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet">

				<style>
					* {
						font-family: 'Nunito', sans-serif;
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
						margin-top: 1rem;
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
						display: none;
						justify-content: space-between;
					}
					.back-button {
						display: block !important;
					}
					.back-button-text {
						font-size: 11px;
						line-height: 11px;
						color: #3886F7;
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

					.video-container,
					.id-video-container {
						position: relative;
						z-index: 1;
						width: 100%;
					}

					.video-container #smile-cta,
					.video-container video,
					.id-video-container video {
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

					.id-video-container {
						min-height: calc((2 * 10rem) + 198px);
						height: auto;
					}

					.id-video-container .image-frame {
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

					.id-video-container video {
						width: 100%;
						transform: translateX(-50%) translateY(-50%);
						z-index: 1;
						height: 100%;
						block-size: 100%;
					}

					.id-video-container img {
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translateX(-50%) translateY(-50%);
						max-width: 90%;
						max-height: 260px;
					}

					#id-review-screen .id-video-container,
					#back-of-id-review-screen .id-video-container {
						background-color: rgba(0, 0, 0, 1);
					}

					.actions {
						bottom: 0;
						display: flex;
						justify-content: space-between;
						padding: 1rem;
						position: absolute;
						width: 90%;
						z-index: 2;
					}
				</style>

				<svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259">
					<symbol id="image-frame">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0v69.605h13.349V13.349h56.256V0H0zM396 0h-69.605v13.349h56.256v56.256H396V0zM0 258.604V189h13.349v56.256h56.256v13.348H0zM396 258.604h-69.605v-13.348h56.256V189H396v69.604z" fill="#f00"/>
					</symbol>
				</svg>

				<svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
					<symbol id="close-icon">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M.732.732a2.5 2.5 0 013.536 0L10 6.464 15.732.732a2.5 2.5 0 013.536 3.536L13.536 10l5.732 5.732a2.5 2.5 0 01-3.536 3.536L10 13.536l-5.732 5.732a2.5 2.5 0 11-3.536-3.536L6.464 10 .732 4.268a2.5 2.5 0 010-3.536z" fill="#fff"/>
					</symbol>
				</svg>

				<svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41">
					<symbol id="approve-icon">
						<circle cx="20.5" cy="20.5" r="20" stroke="#fff"/>
						<path d="M12.3 20.5l6.15 6.15 12.3-12.3" stroke="#fff" stroke-width="3.075" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
					</symbol>
				</svg>

				<svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 18">
					<symbol id="refresh-icon">
						<path d="M3.314 15.646a8.004 8.004 0 01-2.217-4.257 8.06 8.06 0 01.545-4.655l1.789.788a6.062 6.062 0 001.264 6.737 6.033 6.033 0 008.551 0c2.358-2.37 2.358-6.224 0-8.592a5.996 5.996 0 00-4.405-1.782l.662 2.354-3.128-.796-3.127-.796 2.25-2.324L7.748 0l.55 1.953a7.966 7.966 0 016.33 2.326 8.004 8.004 0 012.342 5.684 8.005 8.005 0 01-2.343 5.683A7.928 7.928 0 018.97 18a7.928 7.928 0 01-5.656-2.354z" fill="currentColor"/>
					</symbol>
				</svg>
				<div id='request-screen' class='flow center'>
					<div class='section | flow'>
						<p class='color-red' id='error'>
						</p>

						${
              this.hideAttribution
                ? ""
                : `
							<p class='powered-by text-transform-uppercase'>
								<span class='logo-mark'>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 10">
										<symbol id="logo-mark">
											<path fill="#fff" d="M6.67 4V2.82c0-1.65-.9-2.6-2.46-2.6s-2.43.95-2.43 2.6v.3c0 .08.06.13.13.13.08 0 .13-.05.13-.13v-.3c0-.87.3-2.33 2.17-2.33C6.1.5 6.38 1.95 6.38 2.82V4H1.65a.85.85 0 00-.86.83L.97 8.4c0 .45.4.82.87.82h4.51c.47 0 .86-.37.86-.82l.19-3.56A.9.9 0 006.67 4zm.23 4.38c0 .33-.26.55-.57.55h-4.5a.57.57 0 01-.57-.55L1.08 4.8c0-.3.26-.55.57-.55h4.86c.31 0 .57.25.57.55L6.9 8.38z"/>
										</symbol>
										<use href="#logo-mark" />
									</svg>
								</span>
								<span>Powered By</span>
								<span class='company'>Smile Identity</span>
							</p>
						`
            }

						<p>
							We need access to your camera so that we can take selfie and proof-of-life images.
						</p>

						<button id='request-camera-access' class='button button--primary | center' type='button'>
							Request Camera Access
						</button>
					</div>
				</div>
			`;

      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        this.requestCameraAccessButton = this.shadowRoot.querySelector(
          "#request-camera-access",
        );
        this.errorMessage = this.shadowRoot.querySelector("#error");
        this.requestCameraAccessButton.addEventListener("click", (e) =>
          this.requestCameraAccess(e),
        );
      } else {
        const heading = document.createElement("h1");
        heading.classList.add("error-message");
        heading.textContent = "Your browser does not support this integration";

        this.shadowRoot.appendChild(heading);
      }
    }

    handleError(e) {
      if (e.name === "NotAllowedError" || e.name === "SecurityError") {
        this.errorMessage.textContent = `
					Looks like camera access was not granted, or was blocked by a browser
					level setting / extension. Please follow the prompt from the URL bar,
					or extensions, and enable access.

					You may need to refresh to start all over again
					`;
      }

      if (e.name === "AbortError") {
        this.errorMessage.textContent = `
					Oops! Something happened, and we lost access to your stream.

					Please refresh to start all over again
					`;
      }

      if (e.name === "NotReadableError") {
        this.errorMessage.textContent = `
					There seems to be a problem with your device's camera, or its connection.

					Please check this, and when resolved, try again. Or try another device.
					`;
      }

      if (e.name === "NotFoundError") {
        this.errorMessage.textContent = `
					We are unable to find a video stream.

					You may need to refresh to start all over again
					`;
      }

      if (e.name === "TypeError") {
        this.errorMessage.textContent = `
					This site is insecure, and as such cannot have access to your camera.

					Try to navigate to a secure version of this page, or contact the owner.
				`;
      }
    }

    handleStream(stream) {
      this.dispatchEvent(
        new CustomEvent("SmartCameraWeb::CameraRequest::Granted"),
        { detail: { stream } },
      );
    }

    async requestCameraAccess(event) {
      try {
        event.target.toggleAttribute("disabled");
        const stream = await SmartCamera.getMedia({
          audio: false,
          video: {
            facingMode: this.facingMode,
          },
        });

        event.target.toggleAttribute("disabled");
        this.handleStream(stream);
      } catch (error) {
        this.handleError(error);
      }
    }

    get facingMode() {
      const captureType = this.getAttribute("start-with");
      return captureType === "face" ? "user" : "environment";
    }
  }

  customElements.define("welcome-screen", WelcomeScreen);

  class FaceCapture extends HTMLElement {
    constructor() {
      super();

      const template = document.createElement("template");
      template.innerHTML = `
				<div id='camera-screen'>
					<video>
					</video>

					<button data-type='icon' type='button'>
						<span class='visually-hidden'>
							${this.captureLabel}
						</span>
					</button>
				</div>

				<div hidden id='review-screen'>
					<img src alt='review selfie' />
				</div>
			`;

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true),
      );
    }

    get type() {
      return this.getAttribute("type") || "liveness";
    }

    get captureLabel() {
      return this.getAttribute("capture-label") || "Take Photo";
    }

    get hideAttribution() {
      return this.hasAttribute("hide-attribution");
    }
  }

  customElements.define("face-capture", FaceCapture);

  class DocumentCapture extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });

      const documentCaptureContainer = document.createElement("div");
      documentCaptureContainer.innerHTML = `
				<link rel="preconnect" href="https://fonts.gstatic.com">
				<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet">

				<style>
					[hidden] {
						display: none !important;
					}
				</style>

				<div id='entry-screen'>
					<button type='button' id='open-camera-button'>
						${this.captureLabel}
					</button>

					<label>
						<input type='file' id='upload-button' name='document' accept='image/png, image/jpeg' />
						${this.uploadLabel}
					</label>
				</div>

				<div id='camera-screen' hidden>
					<video>
					</video>

					<button type='button' id='capture-photo-button'>
						<span class='visually-hidden'>
							${this.captureLabel}
						</span>
					</button>
				</div>

				<div id='review-screen' hidden>
					<img src alt='review document' />
				</div>
			`;

      shadow.appendChild(documentCaptureContainer);
    }

    connectedCallback() {
      this.entryScreen = this.shadowRoot.querySelector("#entry-screen");
      this.cameraScreen = this.shadowRoot.querySelector("#camera-screen");
      this.reviewScreen = this.shadowRoot.querySelector("#review-screen");

      const openCameraButton = this.entryScreen.querySelector(
        "#open-camera-button",
      );
      const uploadPhotoButton =
        this.entryScreen.querySelector("#upload-button");

      const capturePhotoButton = this.cameraScreen.querySelector(
        "#capture-photo-button",
      );

      openCameraButton.addEventListener("click", (e) => this.openCamera(e));
      uploadPhotoButton.addEventListener("change", (e) => this.uploadPhoto(e));
      capturePhotoButton.addEventListener("click", (e) => this.capturePhoto(e));

      this.activeScreen = this.doNotUpload
        ? this.cameraScreen
        : this.entryScreen;
      if (this.activeScreen === this.cameraScreen) {
        this.openCamera();
      }
    }

    get title() {
      return this.getAttribute("title") || "Submit your ID";
    }

    get doNotUpload() {
      return this.hasAttribute("do-not-upload") || false;
    }

    get uploadLabel() {
      return this.getAttribute("upload-label") || "Upload Photo";
    }

    get captureLabel() {
      return this.getAttribute("capture-label") || "Take Photo";
    }

    setActiveScreen(element) {
      this.activeScreen.hidden = true;
      element.hidden = false;
      this.activeScreen = element;
    }

    handleStream(stream) {
      const video = this.cameraScreen.querySelector("video");
      video.autoplay = true;
      video.playsInline = true;

      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = URL.createObjectURL(stream);
      }
    }

    handleSmartCameraError(e) {
      console.error(e);
      /*
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
			*/
    }

    async uploadPhoto(event) {
      try {
        const files = event.target.files;

        SmartFileUpload.validate(files);

        // convert file to data url
        const fileData = await SmartFileUpload.getData(files);

        // add file to preview state
        const previewImage = this.reviewScreen.querySelector("img");
        previewImage.src = fileData;
        this.setActiveScreen(this.reviewScreen);
      } catch (error) {
        console.error(error);
      }
    }

    async openCamera(event) {
      try {
        if (event) {
          event.target.toggleAttribute("disabled");
        }

        const stream = await SmartCamera.getMedia({
          audio: false,
          video: {
            facingMode: "environment",
          },
        });
        this.handleStream(stream);

        if (event) {
          event.target.toggleAttribute("disabled");
          this.setActiveScreen(this.cameraScreen);
        }
      } catch (error) {
        this.handleSmartCameraError(error);
      }
    }

    capturePhoto(event) {
      event.target.toggleAttribute("disabled");

      // ACTION: Set preview image on review screen
      const video = this.cameraScreen.querySelector("video");
      const image = SmartImageCapture.documentFromVideo(video, 2240, 1260);
      const previewImage = this.reviewScreen.querySelector("img");
      previewImage.src = image;

      event.target.toggleAttribute("disabled");
      SmartCamera.stopMedia();
      this.setActiveScreen(this.reviewScreen);
    }
  }

  customElements.define("document-capture", DocumentCapture);

  class ExitScreen extends HTMLElement {
    constructor() {
      super();

      const template = document.createElement("template");
      template.innerHTML = `
			`;

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true),
      );
    }
  }

  customElements.define("exit-screen", ExitScreen);

  class SmartCameraWebUI extends HTMLElement {
    constructor() {
      super();

      const template = document.createElement("template");
      template.innerHTML = `
				<style>
				</style>

				${
          this.showNavigation
            ? `
						<nav id='navigation' class='navigation'>
							${
                true
                  ? `
									<button data-type='icon' type='button' id='back'>
										<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M8.56418 14.4005L1.95209 7.78842L8.56418 1.17633" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
										<span class='visually-hidden'>
											back to previous screen
										</span>
									<button>
								`
                  : ""
              }

							<button data-type='icon' type='button' id='close'>
								<svg aria-hidden='true' width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M9.8748 11.3775L0 21.2523L1.41421 22.6665L11.289 12.7917L21.2524 22.7551L22.6666 21.3409L12.7032 11.3775L22.6665 1.41421L21.2523 0L11.289 9.96328L1.41428 0.0885509L6.76494e-05 1.50276L9.8748 11.3775Z" fill="#BDBDBF"/>
								</svg>
								<span class='visually-hidden'>
									close component
								</span>
							<button>
						</nav>
					`
            : ""
        }

				<div id='smart-camera-web'>
					<welcome-screen
						start-with='${this.type || this.steps ? this.type || this.steps[0] : "face"}'
						${this.hideAttribution ? "hide-attribution" : ""}
					></welcome-screen>

					${this.steps || this.type ? this.setUpFlow() : this.setUpLegacyFlow()}

					<exit-screen
						hidden
						${this.hideAttribution ? "hide-attribution" : ""}
					></exit-screen>
				</div>
			`;

      const shadow = this.attachShadow({ mode: "open" });

      shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      // NOTE: Core Screens
      this.entryScreen = this.shadowRoot.querySelector("welcome-screen");
      this.exitScreen = this.shadowRoot.querySelector("exit-screen");
      this.faceCapture = this.shadowRoot.querySelector("face-capture");
      this.documentCapture =
        this.shadowRoot.querySelectorAll("document-capture");

      // NOTE:
      this.backButton = this.shadowRoot.querySelector("nav #back");
      this.closeButton = this.shadowRoot.querySelector("nav #close");

      // NOTE: All Event Listeners handled here
      this.backButton.addEventListener("click", (e) => this.navigateBack());
      this.closeButton.addEventListener("click", () => this.closeComponent());

      this.entryScreen.addEventListener(
        "SmartCameraWeb::CameraRequest::Granted",
        () => this._init(),
      );

      this.activeScreen = this.entryScreen;
    }

    setActiveScreen(screen) {
      this.activeScreen.hidden = true;
      screen.hidden = false;
      this.activeScreen = screen;
    }

    navigateBack() {}

    closeComponent() {
      this.dispatchEvent(new CustomEvent("SmartCameraWeb::Close"));
    }

    _init() {
      const nextElement = this.activeScreen.nextElementSibling;
      this.addVideoStreamToElement(nextElement);
      this.setActiveScreen(nextElement);
    }

    addVideoStreamToElement(element) {
      const video = element.shadowRoot.querySelector("video");
      video.autoplay = true;
      video.playsInline = true;

      if ("srcObject" in video) {
        video.srcObject = SmartCamera.stream;
      } else {
        video.src = URL.createObjectURL(stream);
      }
    }

    setUpFlow() {
      return `
				<face-capture
					hidden
				></face-capture>
			`;
    }

    setUpLegacyFlow() {
      return `
				<face-capture
					hidden
					id='face-capture'
					${this.hideAttribution ? "hide-attribution" : ""}
				></face-capture>

				${
          this.captureDocument
            ? `
						<document-capture
							hidden
							id='document-front'
							do-not-upload
							${this.hideAttribution ? "hide-attribution" : ""}
						></document-capture>
						${
              this.captureDocument === "back"
                ? `
								<document-capture
									hidden
									id='document-back'
									do-not-upload
									${this.hideAttribution ? "hide-attribution" : ""}
								></document-capture>
							`
                : ""
            }
					`
            : ""
        }
			`;
    }

    get type() {
      return this.getAttribute("type");
    }

    get steps() {
      return this.getAttribute("steps");
    }

    get doNotUpload() {
      return this.hasAttribute("do-not-upload");
    }

    get hideAttribution() {
      return this.hasAttribute("hide-attribution");
    }

    get showNavigation() {
      return this.hasAttribute("show-navigation");
    }

    get hideBackToHost() {
      return this.hasAttribute("hide-back-to-host");
    }

    /**
     * NOTE: this is transitional, to support legacy methods
     */
    get captureDocument() {
      return this.getAttribute("capture-id");
    }
  }

  customElements.define("smart-camera-web", SmartCameraWebUI);
})();
