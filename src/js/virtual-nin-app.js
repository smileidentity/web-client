'use strict';
function vNinHelperMarkup() {
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
				--color-grey: #9394AB;

				--color-success: #1EB244;
				--color-failure: #FFEDEB;
				--color-failure-tint: #F86B58;
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

			input,
			select,
			textarea {
				border: 1px solid #d1d8d6;
				border-radius: .5rem;
				padding: .75rem 1rem;
			}

			button. .button {
				border-radius: 1rem;
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

			.flow-space-large {
				--flow-space: 5.25rem;
			}

			.flow-space-initial {
				--flow-space: 1.5rem;
			}

			.flow-space-small {
				--flow-space: .75rem;
			}

			button[data-type='primary'],
			.button[data-type='primary'] {
				background: #3886F7;
				border: none;
				border-radius: 1rem;
				color: #fff;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				padding: 1rem 2.5rem;
				text-decoration: none;
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

			.font-weight-bold {
				font-weight: 600;
			}

			.font-size-small {
				font-size: .75rem;
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

			input {
				block-size: 3.25rem;
				max-inline-size: 100%;
				background-color: #F5F5F5;
				border: none;
				border-bottom: 2px solid #2F718D;
				font-size: 1.25rem;
				font-weight: 600;
				padding: .5rem 1rem;
			}

			#ussd-code {
				background-color: #F8F8F8;
				inline-size: 20rem;
				margin-inline: auto;
				text-align: center;
			}
		</style>

		<div class='flow center' id='generate-virtual-nin'>
			<h1>
				Generate Virtual NIN
			</h1>
			<p class='color-grey'>
				We require your Virtual NIN issued by NIMC, the NIN custodian,
				to process your information.
			</p>

			<div class='flow-space-large flow'>
				<div class='flow'>
					<p class='font-size-small font-weight-bold'>
						Do you have the NIMC App?
					</p>

					<a class='flow-space-initial button' data-type='primary' id='mobile-app-link' href='${this.nimcAppDeepLink}' target='_blank'>
						Generate VNIN using NIMC App
					</a>

					<p class='flow-space-small color-grey font-size-small'>
						You would be redirected to the NIMC mobile app
					</p>
				</div>

				<p class='flow-space-initial'>
					OR
				</p>

				<div class='flow-space-initial flow'>
					<p class='font-size-small font-weight-bold'>
						Don't have the NIMC Mobile ID App?
					</p>
					<p>
						<button data-type='text' id='generate-with-ussd' type='button'>
							Generate VNIN using USSD
						</button>
					</p>
					<p class='color-grey font-size-small'>
						Click to begin with generating Virtual NIN using *346*3*NIN*Agent Code#
					</p>
				</div>
			</div>
		</div>

		<div hidden class='flow center' id='generate-ussd-code'>
			<h1>
				Enter your NIN
			</h1>
			<p class='color-grey flow-space-small'>
				Let's help you generate the code for generating your Virtual NIN.
			</p>
			<p class='color-grey flow-space-small'>
				Enter your regular NIN, and click on "Get Code"
			</p>

			<form class='flow flow-space-large' novalidate>
				<div class='flow input-group'>
					<label for='nin'>
						Enter your 11-digit NIN
					</label>
					<input id='nin' pattern='^[0-9]{11}$' maxlength='11' />
					<p class='color-grey flow-space-small'>
						Let's help you generate the code
					</p>
				</div>

				<div>
					<button data-type='primary' type='submit' id='get-ussd-code'>
						Get code
					</button>
				</div>
			</form>
		</div>

		<div hidden class='flow center' id='show-ussd-code'>
			<br />
			<p class='flow-space-large'>
				Type or paste this in your phone and dial
			<p>

			<input id='ussd-code' readonly value='${this.ussdCode}' />

			<p class='color-grey'>
				<small>
					You might incur a charge from NIMC and your service provider
				</small>
			</p>

			<p>
				<button data-type='primary' id='copy-ussd-code'>
					<span>Copy</span>
					<span class='visually-hidden'>USSD Code</span>
				</button>
			</p>

			<br class='flow-space-large' />
		</div>

		<div hidden class='flow center' id='enter-virtual-nin'>
			<h1>
				Enter your Virtual NIN
			</h1>
			<p class='color-grey'>
				We require your Virtual NIN issued by NIMC, the NIN custodian,
				to process your information.
			</p>

			<form class='flow flow-space-large' novalidate>
				<div class='flow input-group'>
					<label for='id_number'>
						Enter your generated virtual NIN
					</label>

					<input id='id_number' pattern=${this.idTypeRegex} name='id_number' maxlength='16'/>
				</div>

				<div class='flow flow-space-initial'>
					<button data-type='primary' type='submit' id='submit-virtual-nin'>
						Enter VNIN
					</button>

					<div class='font-size-small'>
						<p>
							Couldn't generate VNIN?
						</p>

						<p>
							<button data-type='text' type='button' id='switch-method'>
								Try another method
							</button>
						</p>
					</div>
				</div>
			</form>
		</div>
	`
};

class VirtualNinApp extends HTMLElement {
	constructor() {
		super();

		this.templateString = vNinHelperMarkup.bind(this);
		this.render = () => {
			return this.templateString();
		}

		this.attachShadow({ mode: 'open' });

		this['ussd-code'] = '';

		this.getUssdCode = this.getUssdCode.bind(this);
		this.copyUssdCode = this.copyUssdCode.bind(this);
		this.submitVirtualNin = this.submitVirtualNin.bind(this);
	}

	setUpEventListeners() {
		// Screens
		this.generateVirtualNinScreen = this.shadowRoot.querySelector('#generate-virtual-nin');
		this.generateUssdScreen = this.shadowRoot.querySelector('#generate-ussd-code');
		this.showUssdScreen = this.shadowRoot.querySelector('#show-ussd-code');
		this.enterVirtualNinScreen = this.shadowRoot.querySelector('#enter-virtual-nin');

		if (!this.activeScreen) {
			this.activeScreen = this.generateVirtualNinScreen;
			this.setActiveScreen(this.generateVirtualNinScreen);
		}

		// Inputs
		this.nin = this.generateUssdScreen.querySelector('#nin');
		this.idNumber = this.enterVirtualNinScreen.querySelector('#id_number');

		// Triggers
		this.mobileAppLink = this.generateVirtualNinScreen.querySelector('#mobile-app-link');
		this.generateWithUssdButton = this.generateVirtualNinScreen.querySelector('#generate-with-ussd');
		this.getUssdCodeButton = this.generateUssdScreen.querySelector('#get-ussd-code');
		this.copyUssdCodeButton = this.showUssdScreen.querySelector('#copy-ussd-code');
		this.submitVirtualNinButton = this.enterVirtualNinScreen.querySelector('#submit-virtual-nin');
		this.switchMethodButton = this.enterVirtualNinScreen.querySelector('#switch-method');

		// EventListeners
		this.mobileAppLink.addEventListener('click', () => this.setActiveScreen(this.enterVirtualNinScreen));
		this.generateWithUssdButton.addEventListener('click', () => this.setActiveScreen(this.generateUssdScreen));
		this.getUssdCodeButton.addEventListener('click', e => this.getUssdCode(e));
		this.copyUssdCodeButton.addEventListener('click', () => this.copyUssdCode());
		this.submitVirtualNinButton.addEventListener('click', e => this.submitVirtualNin(e));
		this.switchMethodButton.addEventListener('click', () => this.setActiveScreen(this.generateVirtualNinScreen));
	}

	connectedCallback() {
		const template = document.createElement('template');
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.setUpEventListeners();
	}

	static get observedAttributes() {
		return ['ussd-code'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'ussd-code': {
				const updatedTemplate = document.createElement('template');
				updatedTemplate.innerHTML = this.render();
				const updatedNode = updatedTemplate.content.cloneNode(true).querySelector(`#${this.activeScreen.id}`);
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

	setActiveScreen(screen) {
		this.activeScreen.hidden = true;
		screen.hidden = false;
		this.activeScreen = screen;
	}

	resetForm() {
		const submitButton = this.activeScreen.querySelector('[type="submit"]');
		submitButton.disabled = true;

		const invalidElements = this.activeScreen.querySelectorAll('[aria-invalid]');
		invalidElements.forEach((el) => el.removeAttribute('aria-invalid'));

		const validationMessages = this.activeScreen.querySelectorAll('.validation-message');
		validationMessages.forEach((el) => el.remove());
	}

	handleIdNumberValidationErrors(errors) {
		const submitButton = this.activeScreen.querySelector('[type="submit"]');
		const fields = Object.keys(errors);

		fields.forEach((field) => {
			const input = this.activeScreen.querySelector(`#${field}`);
			input.setAttribute('aria-invalid', 'true');
			input.setAttribute('aria-describedby', `${field}-hint`);

			const errorDiv = document.createElement('div')
			errorDiv.setAttribute('id', `${field}-hint`);
			errorDiv.setAttribute('class', 'validation-message');
			errorDiv.textContent = errors[field][0];

			input.insertAdjacentElement('afterend', errorDiv);
		});
		submitButton.disabled = false;
	}

	handleActiveScreenErrors(error) {
		const submitButton = this.activeScreen.querySelector('[type="submit"]');
		const errorDiv = document.createElement('div')
		errorDiv.setAttribute('class', 'validation-message');
		errorDiv.textContent = error;
		submitButton.insertAdjacentElement('beforebegin', errorDiv);
		submitButton.disabled = false;
	}

	validateNin(nin) {
		const validationConstraints = {
			nin: {
				presence: {
					allowEmpty: false,
					message: 'is required'
				},
				format: new RegExp('^[0-9]{11}$')
			}
		};

		const errors = validate({ nin }, validationConstraints);

		if (errors) {
			this.handleIdNumberValidationErrors(errors);
		}

		return errors;
	}

	getUssdCode(event) {
		event.preventDefault();
		this.resetForm();

		// ACTION: Validate idNumber
		const validationErrors = this.validateNin(this.nin.value);

		if (!validationErrors) {
			this.resetForm();
			this.ussdCode = `*346*3*${this.nin.value}*${this.enterpriseId}#`;
			this.setActiveScreen(this.showUssdScreen);
			this.setAttribute('ussd-code', this.ussdCode);
		}
	}

	async copyUssdCode() {
		try {
			if ('clipboard' in navigator) {
				await navigator.clipboard.writeText(this.ussdCode);
			}
		} catch (err) {
			throw new Error("Unable to copy ussd code", { cause: err });
		} finally {
			this.setActiveScreen(this.enterVirtualNinScreen);
		}
	}

	validateIdNumber(idNumber) {
		const validationConstraints = {
			id_number: {
				presence: {
					allowEmpty: false,
					message: 'is required'
				},
				format: new RegExp(this.idRegex)
			}
		};

		const errors = validate({ id_number: idNumber }, validationConstraints);

		if (errors) {
			this.handleIdNumberValidationErrors(errors);
			this.queryOtpModesButton.removeAttribute('disabled');
		}

		return errors;
	}

	submitVirtualNin(event) {
		event.preventDefault();

		// ACTION: reset form
		this.resetForm();

		const validationErrors = this.validateIdNumber(this.idNumber.value);

		if (!validationErrors) {
			const tag = 'SmileIdentity::VirtualNinApp::Submitted';
			const customEvent = new CustomEvent(tag, {
				detail: {
					message: tag,
					data: {
						id_number: this.idNumber.value
					}
				}
			});

			this.dispatchEvent(customEvent);
		}
	}

	get enterpriseId() {
		return this.getAttribute('enterprise-id');
	}

	get idRegex() {
		return this.getAttribute('id-regex');
	}

	get nimcAppDeepLink() {
		return `https://ent.nimc.gov.ng/enterprise/?shortCode=${this.enterpriseId}`;
	}
};

window.customElements.define('virtual-nin-app', VirtualNinApp);
