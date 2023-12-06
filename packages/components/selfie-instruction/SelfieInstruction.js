"use strict";

function templateString() {
	return `
  <div hidden id='id-entry-screen' class='flow center'>
  ${this.showNavigation ? `
	<div class="nav">
	  <div class="back-wrapper">
		<button type='button' data-type='icon' id="back-button-selfie" class="back-button icon-btn">
		  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
			<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
			<path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
		  </svg>
		</button>
		<div class="back-button-text">Back</div>
	  </div>
	  <button data-type='icon' type='button' id='id-entry-close' class='close-iframe icon-btn'>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
		  <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
		  <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
		</svg>
		<span class='visually-hidden'>Close SmileIdentity Verification frame</span>
	  </button>
	</div>
  ` : ''}
  <header>
	<svg xmlns="http://www.w3.org/2000/svg" width="51" height="78" fill="none">
	  <g clip-path="url(#clip-path)">
		<path fill="#7FCBF5" d="m37.806 75.563.15-52.06c0-1.625-1.145-3.581-2.53-4.394L4.126 1.054C3.435.632 2.772.602 2.32.874l-1.265.721c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.626 1.144 3.581 2.53 4.394L33.98 77.73c.934.541 1.958.09 1.807.18l1.266-.722c.451-.27.753-.843.753-1.625Zm-1.266.782c0 .392-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
		<path fill="#7FCBF5" d="m39.07 74.84.151-52.06c0-1.625-1.144-3.58-2.53-4.393L5.39.361c-.692-.42-1.355-.45-1.807-.18L2.32.903c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.625 1.144 3.581 2.53 4.394l31.299 18.055c.934.542 1.958.09 1.807.181l1.266-.722c.451-.271.753-.843.753-1.625v-.03Zm-1.265.783c0 .391-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
		<path fill="#3B3837" d="M13.19 40.626c-.873-.06-1.687.03-2.44.27 1.597 2.498 3.525 4.635 5.603 6.2-1.265-2.077-2.35-4.274-3.163-6.47Zm9.88 5.687c-.813 1.264-1.897 2.227-3.192 2.799 2.078.842 4.006.933 5.633.27a24.828 24.828 0 0 0-2.44-3.069Zm-5.542-4.393c-1.054-.542-2.109-.933-3.133-1.144a34.476 34.476 0 0 0 3.133 6.23V41.92Zm1.265.722v5.085c1.265-.511 2.32-1.384 3.133-2.587a21.086 21.086 0 0 0-3.133-2.498Zm-7.35-10.593-4.609-2.648c.12 3.16 1.205 6.65 3.043 9.99.873-.3 1.807-.39 2.801-.33-.753-2.438-1.175-4.785-1.265-6.982m6.115 3.521-4.88-2.829c.06 2.017.452 4.153 1.175 6.41 1.205.21 2.44.662 3.705 1.324V35.6Zm6.145 3.52-4.88-2.828v4.905c1.235.783 2.47 1.776 3.675 2.95.723-1.415 1.115-3.1 1.205-5.026Zm5.844 3.371-4.609-2.648c-.09 2.107-.512 3.972-1.295 5.507a30.696 30.696 0 0 1 2.802 3.581c1.867-1.204 2.952-3.43 3.102-6.44ZM14.154 25.73c-.904 1.504-1.416 3.43-1.506 5.627l4.88 2.829v-5.748c-1.145-.722-2.26-1.625-3.374-2.678m8.043 4.634a13.447 13.447 0 0 1-3.404-1.264v5.748l4.88 2.829c-.09-2.287-.572-4.815-1.476-7.313Zm-11.869-9.088c-2.078 1.084-3.343 3.49-3.524 6.68l4.609 2.649c.09-2.378.633-4.454 1.566-6.079a31.138 31.138 0 0 1-2.65-3.25Zm15.725 9.058c-.813.21-1.717.27-2.65.18.933 2.709 1.445 5.387 1.536 7.855l4.608 2.648c-.15-3.37-1.385-7.222-3.464-10.713m-8.465-7.613c-1.084.42-2.018 1.113-2.801 2.046a19.827 19.827 0 0 0 2.771 2.166v-4.212m1.265.722v4.213c.934.481 1.838.842 2.772 1.053a33.855 33.855 0 0 0-2.771-5.266Zm-2.38-2.137c-1.867-.722-3.614-.903-5.12-.451.723.963 1.476 1.896 2.289 2.738.783-1.023 1.747-1.805 2.862-2.317m3.524 2.016a34.581 34.581 0 0 1 2.832 5.567c.813.09 1.566.06 2.29-.12-1.507-2.197-3.254-4.063-5.122-5.477m-8.886 33.945s-.271-.271-.271-.452V55.16c0-.15.12-.24.27-.15l14.008 8.065s.271.27.271.451v1.595c0 .15-.12.24-.27.15l-14.008-8.064Zm0-4.093s-.271-.27-.271-.451v-1.595c0-.15.12-.241.27-.15l14.008 8.064s.271.27.271.451v1.595c0 .15-.12.241-.27.15l-14.008-8.064Zm4.308-38.037s-.272-.27-.272-.451V13.03c0-.15.12-.241.271-.15l7.772 4.332s.272.271.272.452v1.595c0 .15-.12.24-.271.15l-7.773-4.333Zm2.71 34.546s-.09-.06-.15-.09h-.06c-3.193-1.956-6.236-5.146-8.525-9.028-2.47-4.183-3.826-8.667-3.826-12.639 0-4.152 1.596-7.222 4.338-8.395 2.26-.963 5.12-.572 8.103 1.083h.06s.09.09.151.12c.06.03.09.06.15.09h.06c2.983 1.806 5.845 4.725 8.074 8.276 2.741 4.363 4.278 9.238 4.278 13.391 0 3.942-1.386 6.861-3.886 8.185-2.32 1.234-5.362.933-8.555-.872h-.06s-.091-.09-.151-.12Zm15.756-29.731L2.707 1.896c-1.416-.812-2.56-.15-2.56 1.445l-.151 51.94c0 1.625 1.114 3.58 2.53 4.393L33.735 77.67c1.416.813 2.56.151 2.56-1.444l.15-51.91c0-1.625-1.144-3.58-2.53-4.393"/>
		<path fill="#7FCBF5" d="M16.353 47.096c-2.079-1.565-4.007-3.701-5.603-6.2.753-.24 1.566-.33 2.44-.27a35.724 35.724 0 0 0 3.163 6.47Zm3.494 2.016a7.52 7.52 0 0 0 3.193-2.799c.874.933 1.687 1.987 2.44 3.07-1.626.662-3.554.542-5.633-.27Zm-2.38-2.137a33.523 33.523 0 0 1-3.133-6.229c1.025.211 2.079.572 3.133 1.144v5.085Zm1.235.723v-5.086a19.828 19.828 0 0 1 3.163 2.498c-.813 1.203-1.897 2.076-3.163 2.588Zm-8.886-8.336c-1.838-3.31-2.922-6.8-3.043-9.99l4.61 2.648c.06 2.196.481 4.543 1.265 6.981a7.717 7.717 0 0 0-2.802.331m3.976-.21c-.692-2.227-1.084-4.394-1.174-6.41l4.88 2.828v4.905c-1.266-.662-2.5-1.113-3.706-1.324Zm8.646 4.995c-1.205-1.174-2.44-2.167-3.705-2.95v-4.904l4.91 2.828c-.09 1.926-.482 3.611-1.205 5.026Zm3.946 4.785a30.707 30.707 0 0 0-2.801-3.582c.783-1.564 1.205-3.4 1.295-5.507l4.609 2.649c-.15 3.009-1.235 5.236-3.103 6.44ZM12.647 31.296c.09-2.197.603-4.122 1.507-5.627 1.114 1.053 2.259 1.956 3.404 2.678v5.748l-4.91-2.829m6.115 3.521V29.04c1.174.602 2.29 1.024 3.434 1.264.873 2.528 1.386 5.026 1.476 7.313l-4.88-2.829m-11.96-6.891c.181-3.19 1.416-5.597 3.525-6.68a28.286 28.286 0 0 0 2.651 3.25c-.934 1.624-1.476 3.7-1.566 6.078l-4.61-2.648Zm18.105 10.442c-.09-2.468-.602-5.146-1.536-7.854.934.09 1.837 0 2.65-.18 2.08 3.49 3.314 7.342 3.465 10.712l-4.609-2.648m-7.35-11.435a19.841 19.841 0 0 1-2.772-2.167 6.523 6.523 0 0 1 2.802-2.046v4.213m1.235.722v-4.213a33.86 33.86 0 0 1 2.771 5.266c-.903-.21-1.837-.571-2.771-1.053Zm-5.212-4.032c-.813-.843-1.566-1.776-2.289-2.739 1.506-.451 3.284-.3 5.121.452-1.115.511-2.078 1.294-2.862 2.317m9.188 5.296a34.581 34.581 0 0 0-2.831-5.567c1.867 1.414 3.614 3.28 5.12 5.477-.722.15-1.476.18-2.289.12m-4.579-8.185s-.09-.06-.15-.09h-.06c-2.983-1.685-5.845-2.077-8.104-1.114-2.741 1.174-4.338 4.243-4.338 8.396 0 4.153 1.356 8.426 3.826 12.639 2.29 3.882 5.332 7.072 8.525 8.998h.06s.09.12.15.15c.061.03.091.06.152.09h.06c3.193 1.806 6.236 2.137 8.555.903 2.5-1.324 3.856-4.243 3.886-8.185 0-4.153-1.536-9.028-4.278-13.361-2.229-3.551-5.09-6.5-8.073-8.276h-.06s-.09-.09-.15-.12"/>
		<path fill="#43C15F" d="M40.668 50.165h-.03c-5.723 0-10.363 4.635-10.363 10.352v.03c0 5.717 4.64 10.352 10.363 10.352h.03c5.723 0 10.363-4.635 10.363-10.352v-.03c0-5.717-4.64-10.352-10.363-10.352Z"/>
		<path fill="#E5E7E7" d="m38.826 65.873-5.603-5.447 1.627-1.685 3.976 3.822 7.591-7.343 1.627 1.685-9.188 8.968h-.03Z"/>
	  </g>
	  <defs>
		<clipPath id="clip-path">
		  <path fill="#fff" d="M0 0h51v78H0z"/>
		</clipPath>
	  </defs>
	</svg>
	<h1>
	  Submit${this.captureBackOfID ? ' the Front of' : ''} Your ID
	</h1>
	<p>
	  We'll use it to verify your identity.
	</p>
	<p>
	  Follow the tips below for the best results.
	</p>
  </header>
  <div class='flow'>
	<div class='document-tips'>
	  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
		<g fill="#9394AB" clip-path="url(#clip)">
		  <path fill-rule="evenodd" d="M26.827 16a10.827 10.827 0 1 1-21.655 0 10.827 10.827 0 0 1 21.655 0Z" clip-rule="evenodd"/>
		  <path d="M16.51 3.825h-1.02L15.992 0l.518 3.825ZM22.53 5.707l-.884-.51 2.346-3.056-1.462 3.566ZM26.804 10.354l-.51-.883 3.557-1.479-3.047 2.362ZM28.183 16.51v-1.02l3.817.502-3.817.518ZM26.293 22.53l.51-.884 3.056 2.346-3.566-1.462ZM21.646 26.804l.884-.51 1.478 3.557-2.362-3.047ZM15.49 28.183h1.02L16.009 32l-.518-3.817ZM9.47 26.293l.884.51-2.346 3.056 1.462-3.566ZM5.196 21.646l.51.884-3.557 1.478 3.047-2.362ZM3.825 15.49v1.02L0 16.009l3.825-.518ZM5.707 9.47l-.51.884L2.14 8.008 5.707 9.47ZM10.354 5.196l-.883.51L7.992 2.15l2.362 3.047Z"/>
		</g>
		<defs>
		  <clipPath id="clip">
			<path fill="#fff" d="M0 0h32v32H0z"/>
		  </clipPath>
		</defs>
	  </svg>
	  <div>
		<p>Check the lighting</p>
		<p>
		  Take your ID document image in a well-lit environment where it is easy to read, and free from glare on the card.
		</p>
	  </div>
	</div>
	<div class='document-tips'>
	  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" fill="none">
		<g fill="#9394AB" clip-path="url(#path)">
		  <path d="M30.967 10.884H1.033A25.08 25.08 0 0 0 .65 12.06h30.702c-.11-.398-.238-.787-.384-1.176ZM31.515 12.696H.485c-.092.36-.165.721-.229 1.091h31.488c-.064-.37-.137-.73-.229-1.091ZM31.854 14.508H.146c-.045.333-.073.665-.1.997h31.908a18.261 18.261 0 0 0-.1-.997ZM32 16.767c0-.152 0-.294-.01-.446H.01c-.01.152-.01.294-.01.446 0 .152 0 .313.01.465h31.98c.01-.152.01-.313.01-.465ZM31.945 18.133H.055c.018.275.046.55.082.816h31.726c.036-.266.064-.54.082-.816ZM31.707 19.946H.293c.045.246.1.483.155.72h31.104c.055-.236.11-.474.155-.72ZM31.269 21.758H.73c.074.209.138.427.21.636h30.117c.073-.21.147-.427.21-.636ZM30.601 23.57H1.4l.247.541h28.708l.247-.54ZM29.687 25.383H2.322c.08.151.17.303.275.455h26.816l.274-.455ZM28.453 27.195H3.547l.284.36h24.338l.284-.36ZM26.816 29.007H5.184l.293.266h21.046l.293-.266ZM24.54 30.82H7.46l.284.18h16.512l.283-.18ZM28.873 6.898a16.377 16.377 0 0 0-.933-1.186A15.316 15.316 0 0 0 15.973 0 15.314 15.314 0 0 0 3.585 6.253h.027c-.164.218-.329.427-.484.645h25.746ZM29.12 7.268H2.88c-.293.437-.567.892-.823 1.357h27.886a13.617 13.617 0 0 0-.823-1.357ZM30.18 9.071H1.82c-.21.418-.403.845-.577 1.272h29.513a17.482 17.482 0 0 0-.575-1.272Z"/>
		</g>
		<defs>
		  <clipPath id="path">
			<path fill="#fff" d="M0 0h32v31H0z"/>
		  </clipPath>
		</defs>
	  </svg>
	  <div>
		<p>Make sure it's in focus</p>
		<p>
		  Ensure the photo of the ID document you submit is not blurry: you should be able to read the text on the document.
		</p>
	  </div>
	</div>
  </div>
  <div class='flow'>
	${this.supportBothCaptureModes || this.documentCaptureModes === 'camera' ? `
	  <button data-variant='solid full-width' class='button' type='button' id='take-photo'>
		Take Photo
	  </button>
	` : ''}
	${this.supportBothCaptureModes || this.documentCaptureModes === 'upload' ? `
	  <label id='upload-photo-label' data-variant='${this.supportBothCaptureModes ? 'outline' : 'solid'}' class='button'>
		<input type='file' onclick='this.value=null;' id='upload-photo' name='document' accept='image/png, image/jpeg' />
		<span>Upload Photo</span>
	  </label>
	` : ''}
  </div>
  ${this.hideAttribution ? '' : `
	<powered-by-smile-id></powered-by-smile-id>
  `}
</div>
  `;
}

class SelfieInstruction extends HTMLElement {
	constructor() {
		super();
		this.templateString = templateString.bind(this);
		this.render = () => {
			return this.templateString();
		};

		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.pages = [];
		const template = document.createElement("template");
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this.backButton = this.shadowRoot.querySelector("#back-button");
		const CloseIframeButtons =
			this.shadowRoot.querySelectorAll(".close-iframe");

		this.backButton.addEventListener("click", (e) => {
			this.handleBackEvents(e);
		});

		CloseIframeButtons.forEach((button) => {
			button.addEventListener(
				"click",
				() => {
					this.closeWindow();
				},
				false,
			);
		});
	}

	get hideBack() {
		return this.hasAttribute("hide-back-to-host");
	}

	get themeColor() {
		return this.getAttribute("theme-color") || "#043C93";
	}

	get hideAttribution() {
		return this.hasAttribute('hide-attribution');
	}

	get supportBothCaptureModes() {
		const value = this.documentCaptureModes;
		return value.includes('camera') && value.includes('upload');
	}

	get documentCaptureModes() {
		/*
			NOTE: options are `camera`, `upload`, and a comma-separated combination
			of both.
	
			defaults to `camera`;
		  */
		return this.getAttribute('document-capture-modes') || 'camera';
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
	window.customElements.define('selfie-instruction', SelfieInstruction);
}

export {
	SelfieInstruction
};
