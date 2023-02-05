'use strict';

function async postData(url = '', data = {}, mockObject) {
	if (mockObject) {
	}

	return fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
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
			}

			html {
				font-family: 'Nunito Sans', sans-serif;
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

			button {
				border-radius: .5rem;
				font-size: 20px;
				text-align: center;
				width: 100%;
				display: inline-block;
				padding: 1rem 2.5rem;
				cursor: pointer;
				font-weight: 500;
				line-height: 1;
				letter-spacing: .05ch;
				text-decoration: none;
				display: inline-block;
				border: none;
				transition: background 250ms ease-in-out,
										transform 150ms ease;
				-webkit-appearance: none;
				-moz-appearance: none;
			}

			button:focus,
			button:hover {
				filter: opacity(.75);
			}

			button[data-type='icon'] {
				height: 2rem;
				padding: 0;
				width: 2rem;
				background: transparent;
			}

			button[data-type='primary'] {
				--flow-space: 5.25rem;
				background: linear-gradient(46.64deg, #031532 -0.41%, #114482 122.81%, #02060B 122.81%);
				border: none;
				border-radius: 2rem;
				color: #FEFEFE;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				padding: 1rem 2.5rem;
			}

			button[data-type='text'] {
				padding: 0;
				background: transparent;
				border: none;
				color: #3886F7;
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
			}
		</style>

		<div class='flow center' id='id-entry'>
			<h1>
				Enter your ${this.idTypeLabel}
			</h1>

			<form style='--flow-space: 5.5rem'>
				<div id='id-number' class="input-group flow">
					<label class='required' for="id-number-entry">
						${this.idTypeLabel}
					</label>

					<input aria-required='true' id="id-number-entry" name="id_number"
						placeholder='' maxlength='11' pattern='${this.idRegex}' />

					<p>
						<small>${this.idHint}</small>
					</p>
				</div>

				<button data-type='primary' id='query-otp-modes' type='submit'>
					Continue
					<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</form>
		</div>

		<div hidden class='flow center' id='select-mode'>
			<h1>
				Select contact method
			</h1>

			<form style='--flow-space: 4.25rem' id='otp-entry' class='flow center'>
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
						<label class='input-radio'>
							<input type="radio" id="huey" name="drone" value="huey">
							<div class='otp-mode'>
								<img src='https://via.placeholder.com/30' alt='' />
								<div class='flow'>
									<p>
										**********
									</p>
									<p>
										<small>
											An OTP will be sent to your email to verify your identity
										</small>
									</p>
								</div>
							</div>
						</label>

						<label class='input-radio'>
							<input type="radio" id="dewey" name="drone" value="dewey">
							<div class='otp-mode'>
								<img src='https://via.placeholder.com/30' alt='' />
								<div class='flow'>
									<p>
										**********
									</p>
									<p>
										<small>
											An OTP will be sent to your email to verify your identity
										</small>
									</p>
								</div>
							</div>
						</label>

						<label class='input-radio'>
							<input type="radio" id="louie" name="drone" value="louie">
							<div class='otp-mode'>
								<img src='https://via.placeholder.com/30' alt='' />
								<div class='flow'>
									<p>
										**********
									</p>
									<p>
										<small>
											An OTP will be sent to your email to verify your identity
										</small>
									</p>
								</div>
							</div>
						</label>
					</div>
				</fieldset>

				<button data-type='primary' id='select-otp-mode' type='submit'>
					Continue
					<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</form>
		</div>

		<div hidden class='flow center' id='otp-verification'>
			<h1>
				OTP Verification
			</h1>

			<div style='--flow-space: 4.25rem' id='otp-entry'>
				<div style='--flow-space: 1.5rem' class='flow center'>
					<label for='totp-token'>
						Enter the OTP sent to <span class='font-weight:bold'>${this.selectedOtpDeliveryMode}</span>
					</label>
					<input type='text' id='totp-token' maxlength='6' inputmode='numeric' autocomplete='one-time-code' />

					<p>
						Didn't receive the OTP${!this.selectedOtpDeliveryMode ? '?' : ` at <span class='font-weight:bold'>${this.selectedOtpDeliveryMode}</span>?`}
					</p>

					<button style='--flow-space: .5rem' data-type='text' class='try-another-method' type='button'>
						Try another contact method
					</button>

					<button data-type='primary' id='submit-otp' type='submit'>
						Submit
						<svg aria-hidden='true' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
			</div>

			<div hidden style='--flow-space: 4.25rem' id='otp-expired'>
				<div style='--flow-space: 1.5rem' class='flow center'>
					<p style='--flow-space: 1.5rem'>
						If you didn't receive the OTP, you can
					</p>

					<button style='--flow-space: .5rem' data-type='text' class='try-another-method' type='button'>
						Try another contact method
					</button>

					<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none">
						<path stroke="#F15A5A" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M30 47.5a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/>
						<path stroke="#F15A5A" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M30.625 34.375V36.7c0 .875-.45 1.7-1.225 2.15L27.5 40"/>
						<path stroke="#2F718D" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M18.75 19.175V16.75c0-5.625 4.525-11.15 10.15-11.675a11.25 11.25 0 0 1 12.35 11.2v3.45M22.5 55h15c10.05 0 11.85-4.025 12.375-8.925l1.875-15C52.425 24.975 50.675 20 40 20H20C9.325 20 7.575 24.975 8.25 31.075l1.875 15C10.65 50.975 12.45 55 22.5 55Z"/>
					</svg>

					<p>
						Your OTP has expired
					</p>
				</div>
			</div>
		</div>
	`
};

class TotpBasedConsent extends HTMLElement {
	constructor() {
		super();

		this.templateString = markup.bind(this);
		this.render = () => {
			return this.templateString();
		}

		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const template = document.createElement('template');
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));

		// Screens
		this.idEntryScreen = this.shadowRoot.querySelector('#id-entry');
		this.selectModeScreen = this.shadowRoot.querySelector('#select-mode');
		this.otpVerificationScreen = this.shadowRoot.querySelector('#otp-verification');
		this.activeScreen(this.idEntryScreen);

		// Sub-Screens
		this.otpEntryFrame = this.otpVerificationScreen.querySelector('#otp-entry');
		this.otpExpiredFrame = this.otpVerificationScreen.querySelector('#otp-expired');

		// Buttons
		this.queryOtpModes = this.idEntryScreen.querySelector('#query-otp-modes');
		this.selectOtpMode = this.selectModeScreen.querySelector('#select-otp-mode');
		this.submitOtp = this.otpVerificationScreen.querySelector('#submit-otp');
		this.tryAnotherContactMethod = this.otpVerificationScreen.querySelectorAll('.try-another-method');

		// Input Elements
		this.idNumberEntry = this.idEntryScreen.querySelector('#id-number-entry');
		this.mode = this.selectModeScreen.querySelector('[name="mode"]');
		this.otp = this.otpEntryFrame.querySelector('#totp-token');

		// Event Handlers
		this.queryOtpModes.addEventListener('click', async () => {
			// TODO: validate BVN
			const data = {
				country: this.country,
				id_number: this.idNumberEntry.value,
				id_type: 'BVN_MFA',
				token: this.token,
				partner_id: this.partnerId,
			}
			const url = `${this.baseUrl}/totp_consent`;

			return {
					"message": "Select OTP Delivery Mode",
					"success": true,
					"session_id": "00000000",
					"modes": [
							{
									"sms": "08001****67"
							},
							{
									"email": "fa*****il@gmail.com"
							}
					],
					"signature": "Jm5Xbt5zW10PwGT7PA/URi1GLvrVkTuxmereGEo5zyI=",
					"timestamp": "2023-02-03T11:47:08.809Z"
			};
			try {
				/*
				const result = await postData(url, data);
				console.log(result);
				this.sessionId = result.session_id;
				this.modes = result.modes;
				this.setActiveScreen(this.selectModeScreen);
				*/
			} catch (error) {
				// TODO: handle errors
				console.error(error);
			}
		});

		this.selectOtpMode.addEventListener('click', async () => {
			// TODO: validate BVN
			const data = {
				country: this.country,
				id_number: this.idNumberEntry.value,
				id_type: 'BVN_MFA',
				token: this.token,
				session_id: this.sessionId,
				mode: this.mode.value,
			}
			const url = `${this.baseUrl}/totp_consent/mode`;

			return {
					"message": "OTP Delivery Mode Selected",
					"success": true,
					"signature": "hrrGpBJfHMLi9pqK8XAGQ+Cw56y2RefxZQN1IpmWSaI=",
					"timestamp": "2023-02-03T11:48:18.110Z"
			};
			/*
			try {
				const result = await postData(url, data);
				console.log(result);
				this.setActiveScreen(this.otpVerificationScreen);
			} catch (error) {
				// TODO: handle errors
				console.error(error);
			}
			*/
		});

		this.submitOtp.addEventListener('click', async () => {
			// TODO: validate BVN
			const data = {
				country: this.country,
				id_number: this.idNumberEntry.value,
				id_type: 'BVN_MFA',
				token: this.token,
				session_id: this.sessionId,
				otp: this.otp,
			}
			const url = `${this.baseUrl}/totp_consent/otp`;
			return {
				"message": "OTP Confirmed",
				"success": true,
				"signature": "LxxGIzHg1qIikcXt7ItElhV3HYuquFvJ9R4Z9D4eC98=",
				"timestamp": "2023-02-03T11:49:29.432Z"
			};
/*
			try {
				const result = await postData(url, data);
				console.log(result);
				this.sessionId = result.session_id;
			} catch (error) {
				// TODO: handle errors
				console.error(error);
			}
			*/
		});

		Array.forEach.call(this.tryAnotherContactMethod, (node) => {
			node.addEventListener('click', () => {
				this.setActiveScreen(this.idEntryScreen);
			});
		});
	}

	get baseUrl() {
		return this.getAttribute('base-url');
	}

	get country() {
		return this.getAttribute('country');
	}

	get idHint() {
		return this.getAttribute('id-hint') || 'Your BVN should be 11 digits long';
	}

	get idRegex() {
		return this.getAttribute('id-regex');
	}

	get idType() {
		return this.getAttribute('id-type');
	}

	get idTypeLabel() {
		return this.getAttribute('id-type-label');
	}

	get partnerId() {
		return this.getAttribute('partner-id');
	}

	get partnerName() {
		return this.getAttribute('partner-name');
	}

	get token() {
		return this.getAttribute('token');
	}

	handleTotpConsentGrant(e) {
		this.dispatchEvent(
			new CustomEvent('SmileIdentity::ConsentGranted::TOTP', {
				detail: {
					id_number: this.idNumber,
					session_id: this.sessionId,
					consented: {
						personal_details: granted,
						contact_information: granted,
						document_information: granted,
					}
				}
			})
		);
	}

	handleTotpConsentContactModesOutdated(e) {
		const tag = 'SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated';
		this.dispatchEvent(
			new CustomEvent(tag, {
				detail: {
					id_number: this.idNumber,
					message: tag,
					session_id: this.sessionId
				}
			})
		);
	}
};

window.customElements.define('totp-consent-app', TotpBasedConsent);
