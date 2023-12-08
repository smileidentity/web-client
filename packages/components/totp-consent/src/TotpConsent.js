import validate from "validate.js";

function postData(url, data) {
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function markup() {
  return `
		<style>
			*,
			*::before,
			*::after {
				box-sizing: border-box;
				margin: 0;
				padding: 0;
			}

			:host {
				--flow-space: 1.5rem;

				--color-dark: #404040;
				--color-grey: #555B69;

				--color-success: #1EB244;
				--color-failure: #FFEDEB;
				--color-failure-tint: #F86B58;

				--color-richblue: #043C93;
				--color-theme: ${this.themeColor};

				--color-active: #2D2B2A;
				--color-default: #001096;
				--color-disabled: #848282;
			}

			html {
				font-family: 'DM Sans', sans-serif;
			}

			[hidden] {
				display: none !important;
			}

			[disabled] {
				cursor: not-allowed !important;
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

			.color-dark {
				color: var(--color-dark);
			}

			.color-grey {
				color: var(--color-grey);
			}

			.flow > * + * {
				margin-top: var(--flow-space);
			}

			.center {
				margin-left: auto;
				margin-right: auto;

				text-align: center;
			}

			h1 {
				font-size: 1.5rem;
				font-weight: 700;
			}

			button, input, select, textarea {
				font: inherit
			}

			label,
			input,
			select,
			textarea {
				--flow-space: .5rem;
				display: block;
				width: 100%;
			}

			input,
			select,
			textarea {
				border: 1px solid #d1d8d6;
				border-radius: .5rem;
				padding: .75rem 1rem;
			}

			button {
				--button-color: var(--color-default);
				--flow-space: 3rem;
				-webkit-appearance: none;
				-moz-appearance: none;
				align-items: center;
				appearance: none;
				background-color: transparent;
				border-radius: 2.5rem;
				border: none;
				color: #ffffff;
				cursor: pointer;
				display: inline-flex;
				font-size: 20px;
				font-weight: 500;
				inline-size: 100%;
				justify-content: center;
				letter-spacing: .05ch;
				line-height: 1;
				padding: 1rem 2.5rem;
				text-align: center;
				text-decoration: none;
			}

			button[data-variant='solid'] {
				background-color: var(--button-color);
				border: 2px solid var(--button-color);
			}

			button[data-variant='outline'] {
				color: var(--button-color);
				border: 2px solid var(--button-color);
			}

			button[data-variant='ghost'] {
				color: var(--button-color);
			}

			button:hover,
			button:focus,
			button:active {
				--button-color: var(--color-active);
			}

			button:disabled {
				--button-color: var(--color-disabled);
			}

			button[data-type='icon'] {
				height: 2rem;
				padding: 0;
				width: 2rem;
				background: transparent;
			}

			input {
				font: inherit;
			}

			fieldset {
				margin: 0;
				border: none;
			}

			.font-weight\:bold {
				font-weight: bold;
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

			#error,
			.validation-message {
				color: red;
				text-transform: capitalize;
			}

			.input-group {
				--flow-space: 1.5rem;
				text-align: initial;
			}

			.input-radio {
				--flow-space: 1.5rem;
				background-color: #F8F8F8;
				border-radius: .5rem;
				padding: .625rem 1rem;
				display: flex;
				align-items: center;
			}

			.otp-mode {
				display: flex;
				align-items: center;
				text-align: initial;
			}

			.otp-mode :first-child {
				margin: 0;
				margin-inline-end: 1rem;
			}

			.otp-mode :nth-child(2n) {
				--flow-space: .5rem;
			}

			.input-radio [type='radio'] {
				border-radius: 50%;
				inline-size: 2rem;
				block-size: 2rem;
				margin-inline-end: .5rem;
				background-color: white;
				border: .125rem solid #f5f5f5;
			}

			#totp-token {
				block-size: 3rem;
				inline-size: 20rem;
				max-inline-size: 100%;
				background-color: #F5F5F5;
				border: none;
				border-bottom: 2px solid #2F718D;
				font-size: 1.5rem;
				text-align: center;
				font-weight: 700;
				letter-spacing: 2rem;
				padding: .5rem 1rem;
				margin-inline: auto;
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
		</style>

		<div class='flow center' id='id-entry'>
			<div class="nav">
				<div class="back-wrapper">
					<button type='button' data-type='icon' id="back-button" class="back-button">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
							<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
							<path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
						</svg>
					</button>
					<div class="back-button-text">Back</div>
				</div>
				<button data-type='icon' type='button' class='close-iframe'>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
						<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
						<path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
					</svg>
					<span class='visually-hidden'>Close SmileIdentity Verification frame</span>
				</button>
			</div>
			<h1>
				Enter your ${this.idTypeLabel}
			</h1>

			<form name='id-entry-form' class='flow' novalidate style='--flow-space: 5.5rem'>
				<div id='id-number' class="input-group flow">
					<label class='required' for="id_number">
						${this.idTypeLabel}
					</label>

					<input aria-required='true' id="id_number" name="id_number"
						maxlength='11' placeholder='' />

					<p>
						<small>${this.idHint}</small>
					</p>
				</div>

				<button data-variant='solid' id='query-otp-modes' type='submit'>
					<span class='text'>Continue</span>
					<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span hidden class='spinner'></span>
				</button>
			</form>
		</div>

		<div hidden class='flow center' id='select-mode'>
			<div class="nav">
				<div class="back-wrapper">
					<button type='button' data-type='icon' id="back-to-entry-button" class="back-button">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
							<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
							<path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
						</svg>
					</button>
					<div class="back-button-text">Back</div>
				</div>
				<button data-type='icon' type='button' class='close-iframe'>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
						<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
						<path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
					</svg>
					<span class='visually-hidden'>Close SmileIdentity Verification frame</span>
				</button>
			</div>
			<h1>
				Select contact method
			</h1>

			<form name='select-mode-form' novalidate style='--flow-space: 4.25rem' id='otp-entry' class='flow center'>
				<fieldset class='flow center'>
					<legend class='flow' style='--flow-space: 1.5rem'>
						<p>
							NIBSS, the data custodian of BVN,&nbsp;
							will send you a One-Time Password (OTP) 
						</p>

						<p>
							<small>
								The request will be from Chams Plc, who is NIBSS' technical partner.
							</small>
						</p>
					</legend>

					<div class='flow center'>
						${
              this.modes.length
                ? this.modes
                    .map(
                      (mode) =>
                        `<label class='input-radio'>
								<input type="radio" id="" name="mode" value="${Object.keys(mode)[0]}">
								<div class='otp-mode'>
									${
                    Object.keys(mode)[0].includes("sms")
                      ? `
										<svg xmlns="http://www.w3.org/2000/svg" width="29" height="37" fill="none">
											<path stroke="#2F718D" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.697 24.12c4.914 0 7.37 0 8.897-1.652 1.527-1.651 1.527-4.31 1.527-9.625 0-5.316 0-7.974-1.527-9.625-1.526-1.651-3.983-1.651-8.897-1.651h-5.211c-4.914 0-7.37 0-8.897 1.651-1.527 1.651-1.527 4.31-1.527 9.625 0 5.316 0 7.974 1.527 9.625.85.92 1.991 1.328 3.685 1.508"/>
											<g filter="url(#sms)">
												<path stroke="#2F718D" stroke-linecap="round" stroke-width="2" d="M16.697 24.12c-1.61 0-3.384.703-5.005 1.613-2.602 1.462-3.903 2.193-4.545 1.727-.64-.465-.52-1.91-.277-4.799l.055-.656" shape-rendering="crispEdges"/>
											</g>
											<defs>
												<filter id="sms" width="20.023" height="15.595" x="1.675" y="21.005" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
													<feFlood flood-opacity="0" result="BackgroundImageFix"/>
													<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
													<feOffset dy="4"/>
													<feGaussianBlur stdDeviation="2"/>
													<feComposite in2="hardAlpha" operator="out"/>
													<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
													<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2_404"/>
													<feBlend in="SourceGraphic" in2="effect1_dropShadow_2_404" result="shape"/>
												</filter>
											</defs>
										</svg>
									`
                      : `
										<svg xmlns="http://www.w3.org/2000/svg" width="35" height="24" fill="none">
											<path stroke="#2F718D" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.062 4.367c0-1.437 1.221-2.603 2.727-2.603h21.815c1.506 0 2.727 1.166 2.727 2.603v15.62c0 1.438-1.221 2.604-2.727 2.604H6.789c-1.506 0-2.727-1.166-2.727-2.604V4.367Z"/>
											<g filter="url(#message)">
												<path stroke="#2F718D" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m5.426 3.066 8.647 7.338c2.067 1.754 5.18 1.754 7.247 0l8.648-7.338" shape-rendering="crispEdges"/>
											</g>
											<defs>
												<filter id="message" width="34.042" height="18.154" x=".676" y="2.316" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
													<feFlood flood-opacity="0" result="BackgroundImageFix"/>
													<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
													<feOffset dy="4"/>
													<feGaussianBlur stdDeviation="2"/>
													<feComposite in2="hardAlpha" operator="out"/>
													<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
													<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2_394"/>
													<feBlend in="SourceGraphic" in2="effect1_dropShadow_2_394" result="shape"/>
												</filter>
											</defs>
										</svg>
									`
                  }
									<div class='flow'>
										<p>
											${Object.values(mode)[0]}
										</p>
										<p>
											<small>
												An OTP will be sent by ${
                          Object.keys(mode)[0].includes("sms") ? "sms" : "email"
                        } to verify your identity
											</small>
										</p>
									</div>
								</div>
							</label>`,
                    )
                    .join("\n")
                : "No modes yet"
            }
					</div>
				</fieldset>

				<button data-variant='ghost' id='contact-methods-outdated' style='--flow-space: .5rem' class='' type='button'>
					I am no longer using any of these options
				</button>

				<button data-variant='solid' id='select-otp-mode' type='submit'>
					<span class='text'>Continue</span>
					<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span hidden class='spinner'></span>
				</button>
			</form>
		</div>

		<div hidden class='flow center' id='otp-verification'>
			<div class="nav justify-right">
				<button data-type='icon' type='button' class='close-iframe'>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
						<path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
						<path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
					</svg>
					<span class='visually-hidden'>Close SmileIdentity Verification frame</span>
				</button>
			</div>
			<h1>
				OTP Verification
			</h1>

			<div style='--flow-space: 4.25rem' id='otp-entry'>
				<form name='otp-submission-form' novalidate style='--flow-space: 1.5rem' class='flow center'>
					<label for='totp-token'>
						Enter the OTP sent to <span class='font-weight:bold'>${
              this.selectedOtpDeliveryMode
            }</span>
					</label>
					<input type='text' id='totp-token' maxlength='6' inputmode='numeric' autocomplete='one-time-code' />

					<p>
						Didn't receive the OTP${
              !this.selectedOtpDeliveryMode
                ? "?"
                : ` at <span class='font-weight:bold'>${this.selectedOtpDeliveryMode}</span>?`
            }
					</p>

					<button style='--flow-space: .5rem' data-variant='ghost' class='try-another-method' type='button'>
						Try another contact method
					</button>

					<button data-variant='solid' id='submit-otp' type='submit'>
						<span class='text'>Submit</span>
						<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span hidden class='spinner'></span>
					</button>
				</form>
			</div>
		</div>
	`;
}

class TotpConsent extends HTMLElement {
  constructor() {
    super();

    this.templateString = markup.bind(this);
    this.render = () => {
      return this.templateString();
    };

    this.attachShadow({ mode: "open" });

    this.modes = [];
    this["otp-delivery-mode"] = "";

    this.queryOtpModes = this.queryOtpModes.bind(this);
    this.selectOtpMode = this.selectOtpMode.bind(this);
    this.submitOtp = this.submitOtp.bind(this);
    this.switchContactMethod = this.switchContactMethod.bind(this);
    this.handleTotpConsentGrant = this.handleTotpConsentGrant.bind(this);
    this.handleTotpConsentContactMethodsOutdated =
      this.handleTotpConsentContactMethodsOutdated.bind(this);
    this.pages = [];
  }

  static get observedAttributes() {
    return ["modes", "otp-delivery-mode"];
  }

  attributeChangedCallback(name) {
    switch (name) {
      case "modes":
      case "otp-delivery-mode": {
        const updatedTemplate = document.createElement("template");
        updatedTemplate.innerHTML = this.render();
        const updatedNode = updatedTemplate.content
          .cloneNode(true)
          .querySelector(`#${this.activeScreen.id}`);
        updatedNode.hidden = false;
        this.shadowRoot.replaceChild(updatedNode, this.activeScreen);
        this.setUpEventListeners();
        this.setActiveScreen(updatedNode);
        break;
      }
      default:
        break;
    }
  }

  setUpEventListeners() {
    // Screens
    this.idEntryScreen = this.shadowRoot.querySelector("#id-entry");
    this.selectModeScreen = this.shadowRoot.querySelector("#select-mode");
    this.otpVerificationScreen =
      this.shadowRoot.querySelector("#otp-verification");

    if (!this.activeScreen) {
      this.activeScreen = this.idEntryScreen;
    }

    // Buttons
    this.queryOtpModesButton =
      this.idEntryScreen.querySelector("#query-otp-modes");
    this.backButton = this.idEntryScreen.querySelector("#back-button");
    this.selectOtpModeButton =
      this.selectModeScreen.querySelector("#select-otp-mode");
    this.entryBackbutton = this.selectModeScreen.querySelector(
      "#back-to-entry-button",
    );
    this.contactMethodsOutdatedButton = this.selectModeScreen.querySelector(
      "#contact-methods-outdated",
    );
    this.submitOtpButton =
      this.otpVerificationScreen.querySelector("#submit-otp");
    this.switchContactMethodButton = this.otpVerificationScreen.querySelector(
      ".try-another-method",
    );
    const CloseIframeButtons =
      this.shadowRoot.querySelectorAll(".close-iframe");

    // Input Elements
    this.idNumberInput = this.idEntryScreen.querySelector("#id_number");
    this.modeInputs = this.selectModeScreen.querySelectorAll('[name="mode"]');
    this.otpInput = this.otpVerificationScreen.querySelector("#totp-token");

    // Event Handlers
    this.queryOtpModesButton.addEventListener("click", (e) =>
      this.queryOtpModes(e),
    );
    this.selectOtpModeButton.addEventListener("click", (e) =>
      this.selectOtpMode(e),
    );
    this.submitOtpButton.addEventListener("click", (e) => this.submitOtp(e));
    this.switchContactMethodButton.addEventListener("click", (e) =>
      this.switchContactMethod(e),
    );
    this.contactMethodsOutdatedButton.addEventListener("click", (e) =>
      this.handleTotpConsentContactMethodsOutdated(e),
    );

    this.entryBackbutton.addEventListener("click", () => {
      this.handleBackClick();
    });

    this.backButton.addEventListener("click", () => {
      this.handleBackClick();
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

  closeWindow() {
    const referenceWindow = window.parent;
    referenceWindow.postMessage("SmileIdentity::Close", "*");
  }

  handleBackClick() {
    const page = this.pages.pop();
    if (page) {
      this.setActiveScreen(page);
    } else {
      this.dispatchEvent(
        new CustomEvent("SmileIdentity::ConsentDenied::Back", {}),
      );
    }
  }

  connectedCallback() {
    const template = document.createElement("template");
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setUpEventListeners();
  }

  switchContactMethod() {
    this.queryOtpModes();
  }

  resetForm() {
    const invalidElements =
      this.activeScreen.querySelectorAll("[aria-invalid]");
    invalidElements.forEach((el) => el.removeAttribute("aria-invalid"));

    const validationMessages = this.activeScreen.querySelectorAll(
      ".validation-message",
    );
    validationMessages.forEach((el) => el.remove());
  }

  handleIdNumberValidationErrors(errors) {
    const fields = Object.keys(errors);

    fields.forEach((field) => {
      const input = this.activeScreen.querySelector(`#${field}`);
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `${field}-hint`);

      const errorDiv = document.createElement("div");
      errorDiv.setAttribute("id", `${field}-hint`);
      errorDiv.setAttribute("class", "validation-message");
      errorDiv.textContent = errors[field][0];

      input.insertAdjacentElement("afterend", errorDiv);
    });
  }

  handleActiveScreenErrors(error) {
    const submitButton = this.activeScreen.querySelector('[type="submit"]');
    const errorDiv = document.createElement("div");
    errorDiv.setAttribute("class", "validation-message");
    errorDiv.textContent = error;
    submitButton.insertAdjacentElement("beforebegin", errorDiv);
  }

  validateIdNumber(idNumber) {
    const validationConstraints = {
      id_number: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
        format: new RegExp(this.idRegex),
      },
    };

    const errors = validate({ id_number: idNumber }, validationConstraints);

    if (errors) {
      this.handleIdNumberValidationErrors(errors);
    }

    return errors;
  }

  async queryOtpModes(event) {
    if (event) {
      // ACTION: disable another submission
      event.preventDefault();

      // ACTION: Reset any form validation errors'
      this.resetForm();
    }

    // ACTION: Validate idNumber
    const validationErrors = this.validateIdNumber(this.idNumberInput.value);

    // ACTION: Get and set idNumber
    localStorage.setItem("idNumber", this.idNumberInput.value || this.idNumber);

    if (!validationErrors) {
      const data = {
        country: this.country,
        id_number: this.idNumber,
        id_type: this.idType,
        partner_id: this.partnerId,
        token: this.token,
      };
      const url = `${this.baseUrl}/totp_consent`;

      try {
        this.toggleLoading();
        const response = await postData(url, data);
        const json = await response.json();
        this.toggleLoading();

        if (!response.ok) {
          this.handleActiveScreenErrors(json.error);
        } else {
          this.sessionId = json.session_id;
          this.modes = json.modes;
          this.setActiveScreen(this.selectModeScreen);
          this.setAttribute("modes", json.modes);
        }
      } catch (error) {
        this.toggleLoading();
        this.handleActiveScreenErrors(error.message);
      }
    }
  }

  async selectOtpMode(event) {
    // ACTION: disable another submission
    event.preventDefault();

    // ACTION: Reset any form validation errors'
    this.resetForm();

    // ACTION: Get mode
    this.mode = Array.prototype.find.call(
      this.modeInputs,
      (node) => node.checked,
    ).value;
    const data = {
      country: this.country,
      id_number: this.idNumber,
      id_type: this.idType,
      mode: this.mode,
      partner_id: this.partnerId,
      session_id: this.sessionId,
      token: this.token,
    };
    const url = `${this.baseUrl}/totp_consent/mode`;

    try {
      this.toggleLoading();
      const response = await postData(url, data);
      const json = await response.json();
      this.toggleLoading();

      if (!response.ok) {
        this.handleActiveScreenErrors(json.error);
      } else {
        this.selectedOtpDeliveryMode = this.modes.filter(
          (mode) => mode[this.mode],
        )[0][this.mode];
        this.setActiveScreen(this.otpVerificationScreen);
        this.setAttribute("otp-delivery-mode", this.selectedOtpDeliveryMode);
      }
    } catch (error) {
      this.toggleLoading();
      this.handleActiveScreenErrors(error.message);
    }
  }

  async submitOtp(event) {
    // ACTION: disable another submission
    event.preventDefault();

    // ACTION: Reset any form validation errors'
    this.resetForm();

    this.otp = this.otpInput.value;

    const data = {
      country: this.country,
      id_number: this.idNumber,
      id_type: this.idType,
      otp: this.otp,
      partner_id: this.partnerId,
      session_id: this.sessionId,
      token: this.token,
    };
    const url = `${this.baseUrl}/totp_consent/otp`;

    try {
      this.toggleLoading();
      const response = await postData(url, data);
      const json = await response.json();
      this.toggleLoading();

      if (!response.ok) {
        this.handleActiveScreenErrors(json.error);
      } else {
        this.handleTotpConsentGrant(event);
      }
    } catch (error) {
      this.toggleLoading();
      this.handleActiveScreenErrors(error.message);
    }
  }

  toggleLoading() {
    const button = this.activeScreen.querySelector('button[type="submit"]');
    const text = button.querySelector(".text");
    const arrow = button.querySelector("svg");
    const spinner = button.querySelector(".spinner");

    button.toggleAttribute("disabled");
    text.toggleAttribute("hidden");
    arrow.toggleAttribute("hidden");
    spinner.toggleAttribute("hidden");
  }

  setActiveScreen(screen) {
    this.activeScreen.hidden = true;
    screen.hidden = false;
    this.activeScreen = screen;
  }

  get baseUrl() {
    return this.getAttribute("base-url");
  }

  get country() {
    return this.getAttribute("country");
  }

  get idHint() {
    return this.getAttribute("id-hint") || "Your BVN should be 11 digits long";
  }

  get idNumber() {
    return localStorage.getItem("idNumber");
  }

  get idRegex() {
    return this.getAttribute("id-regex");
  }

  get idType() {
    return this.getAttribute("id-type");
  }

  get idTypeLabel() {
    return this.getAttribute("id-type-label");
  }

  get partnerId() {
    return this.getAttribute("partner-id");
  }

  get partnerName() {
    return this.getAttribute("partner-name");
  }

  get token() {
    return this.getAttribute("token");
  }

  handleTotpConsentGrant() {
    const customEvent = new CustomEvent("SmileIdentity::ConsentGranted::TOTP", {
      detail: {
        id_number: this.idNumber,
        session_id: this.sessionId,
        consented: {
          personal_details: true,
          contact_information: true,
          document_information: true,
        },
      },
    });

    this.dispatchEvent(customEvent);
  }

  handleTotpConsentContactMethodsOutdated() {
    const tag = "SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated";
    const customEvent = new CustomEvent(tag, {
      detail: {
        message: tag,
        data: {
          id_number: this.idNumber,
          session_id: this.sessionId,
        },
      },
    });

    this.dispatchEvent(customEvent);
  }
}

if ("customElements" in window) {
  window.customElements.define('totp-consent', TotpConsent);
}

export {
  TotpConsent,
};
