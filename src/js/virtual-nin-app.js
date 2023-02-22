'use strict';
function vNinHelperMarkup() {
	return `
		<div id='generate-virtual-nin'>
			<h1>
				Generate Virtual NIN
			</h1>
			<p>
				We require your Virtual NIN issued by NIMC, the NIN custodian,
				to process your information.
			</p>

			<div>
				<div>
					<p>
						Do you have the NIMC App?
					</p>

					<a id='mobile-app-link' href='${this.nimcAppDeepLink}' target='_blank'>
						Generate VNIN using NIMC App
					</a>

					<p>
						You would be redirected to the NIMC mobile app
					</p>
				</div>

				<p>
					OR
				</p>

				<div>
					<p>
						Don't have the NIMC Mobile ID App?
					</p>
					<button id='generate-with-ussd' type='button'>
						Generate VNIN using USSD
					</button>
					<p>
						Click to begin with generating Virtual NIN using *346*3*NIN*Agent Code#
					</p>
				</div>
			</div>
		</div>

		<div hidden id='generate-ussd-code'>
			<h1>
				Enter your NIN
			</h1>
			<p>
				Let's help you generate the code for generating your Virtual NIN.
			</p>
			<p>
				Enter your regular NIN, and click on "Get Code"
			</p>

			<form novalidate>
				<label for='nin'>
					Enter your 11-digit NIN
				</label>
				<input id='nin' pattern='^[0-9]{11}$' maxlength='11' />
				<p>
					<small>
						Let's help you generate the code
					</small>
				</p>

				<button type='submit' id='get-ussd-code'>
					Get code
				</button>
			</form>
		</div>

		<div hidden id='show-ussd-code'>
			<p>
				Type or paste this in your phone and dial
			<p>

			<input id='ussd-code' readonly value='${this.ussdCode}' />

			<p>
				<small>
					You might incur a charge from NIMC and your service provider
				</small>
			</p>

			<button id='copy-ussd-code'>
				<span>Copy</span>
				<span class='visually-hidden'>USSD Code</span>
			</button>
		</div>

		<div hidden id='enter-virtual-nin'>
			<h1>
				Enter your Virtual NIN
			</h1>
			<p>
				We require your Virtual NIN issued by NIMC, the NIN custodian,
				to process your information.
			</p>

			<form novalidate>
				<div>
				<label for='id_number'>
					Enter your generated virtual NIN
				</label>
				<input id='id_number' pattern=${this.idTypeRegex} name='id_number' maxlength='16'/>
				<button type='submit' id='submit-virtual-nin'>
					Enter VNIN
				</button>

				<p>
					<small>
						Couldn't generate VNIN?
					</small>
				</p>

				<p>
					<button type='button' id='switch-method'>
						Try another method
					</button>
				</p>
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
