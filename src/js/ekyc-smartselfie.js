var eKYCSmartSelfie = function eKYCSmartSelfie() {
	'use strict';

	const endpoints = {
		'sandbox': 'https://testapi.smileidentity.com/v1',
		'live': 'https://api.smileidentity.com/v1'
	}

	var config;
	var activeScreen;
	var consent_information, id_info, images, partner_params;
	var productConstraints;

	var EndUserConsent;
	var SelectIDType = document.querySelector('#select-id-type');
	var SmartCameraWeb = document.querySelector('smart-camera-web');
	var IDInfoForm = document.querySelector('#id-info');
	var UploadProgressScreen = document.querySelector('#upload-progress-screen');
	var UploadFailureScreen = document.querySelector('#upload-failure-screen');
	var CompleteScreen = document.querySelector('#complete-screen');

	var CloseIframeButton = document.querySelector('#close-iframe');
	var UploadProgressOutline = UploadProgressScreen.querySelector('#upload-progress-outline');
	var RetryUploadButton = document.querySelector('#retry-upload');

	var fileToUpload, uploadURL;

	async function getProductConstraints() {
		try {
			const response = await fetch(`${endpoints[config.environment]}/services`);
			const json = await response.json();

			return json.hosted_web['ekyc_smartselfie'];
		} catch (e) {
		}
	}

	window.addEventListener('message', async event => {
		config = JSON.parse(event.data);
		activeScreen = SelectIDType;

		try {
			productConstraints = await getProductConstraints();
			initializeSession(productConstraints);
			getPartnerParams();

			localStorage.setItem('SmileIdentityConfig', event.data);
		} catch (e) {
			throw e;
		}
	}, false);

	function initializeSession(constraints) {
		const supportedCountries = Object.keys(constraints);

		const selectCountry = SelectIDType.querySelector('#country');
		const selectIDType = SelectIDType.querySelector('#id_type');
		const hostedWebConfigForm = document.querySelector('form[name="hosted-web-config"]');

		let validCountries = [];

		if (config.id_selection) {
			validCountries = supportedCountries.filter(value =>
				Object.keys(config.id_selection).includes(value));
		} else {
			validCountries = supportedCountries;
		}

		// ACTION: Load Countries as <option>s
		validCountries.forEach(country => {
			const option = document.createElement('option');
			option.setAttribute('value', country);
			option.textContent = constraints[country].name;
			selectCountry.appendChild(option);
		});

		// ACTION: Enable Country Selection
		selectCountry.disabled = false;

		selectCountry.addEventListener('change', e => {
			if (e.target.value) {
				let validIDTypes = [];
				const constrainedIDTypes = Object.keys(constraints[e.target.value].id_types);

				let selectedIDTypes = config.id_selection ?
					config.id_selection[e.target.value].filter(value => constrainedIDTypes.includes(value)) :
					constrainedIDTypes;

				// ACTION: Reset ID Type <select>
				selectIDType.innerHTML = '';

				// ACTION: Load ID Types as <option>s 
				selectedIDTypes.forEach(IDType => {
					const option = document.createElement('option');
					option.setAttribute('value', IDType);
					option.textContent = constraints[e.target.value]['id_types'][IDType].label;
					selectIDType.appendChild(option);
				});

				// ACTION: Enable ID Type Selection
				selectIDType.disabled = false;
			} else {
				// ACTION: Reset ID Type <select>
				selectIDType.innerHTML = '';

				// ACTION: Load the default <option>
				const option = document.createElement('option');
				option.disabled = true;
				option.setAttribute('value', '');
				option.textContent = '--Select Country First--';
				selectIDType.appendChild(option);
			}
		});

		hostedWebConfigForm.addEventListener('submit', e => {
			e.preventDefault();
			const selectedCountry = selectCountry.value;
			const selectedIDType = selectIDType.value;

			// ACTION: set up `id_info`
			id_info = {
				country: selectedCountry,
				id_type: selectedIDType
			};

			if (config.consent_required) {
				const IDRequiresConsent = config.consent_required[selectedCountry].includes(selectedIDType);

				if (IDRequiresConsent) {
					customizeConsentScreen();
					setActiveScreen(EndUserConsent);
				} else {
					setActiveScreen(SmartCameraWeb);
				}
			}

			customizeForm();
		});
	}

	function initiateDemoMode() {
		const demoTips = document.querySelectorAll('.demo-tip');
		Array.prototype.forEach.call(demoTips, (tip) => {
			tip.hidden = false;
		});

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'js/demo-ekyc-smartselfie.min.js';

		document.body.appendChild(script);
	}

	SmartCameraWeb.addEventListener('imagesComputed', event => {
		images = event.detail.images;
		setActiveScreen(IDInfoForm);
	}, false);

	IDInfoForm.querySelector('#submitForm').addEventListener('click', event => {
		handleFormSubmit(event);
	}, false);

	RetryUploadButton.addEventListener('click', event => {
		retryUpload();
	}, false);

	CloseIframeButton.addEventListener('click', event => {
		closeWindow();
	}, false);

	function toHRF(string) {
		return string.replace(/\_/g, ' ');
	}

	function customizeConsentScreen() {
		const partnerDetails = config.partner_details;

		EndUserConsent = document.createElement('end-user-consent');
		EndUserConsent.setAttribute('id-type', toHRF(id_info.id_type));
		EndUserConsent.setAttribute('partner-name', partnerDetails.name);
		EndUserConsent.setAttribute('partner-logo', partnerDetails.logo_url);
		EndUserConsent.setAttribute('policy-url', partnerDetails.policy_url);
		EndUserConsent.setAttribute('theme-color', partnerDetails.theme_color);
		if (config.demo_mode) {
			EndUserConsent.setAttribute('demo-mode', config.demo_mode);
			localStorage.setItem('SmileIdentityConstraints', JSON.stringify(productConstraints, null, 2));
			initiateDemoMode();
		}

		EndUserConsent.addEventListener('SmileIdentity::ConsentGranted', event => {
			consent_information = event.detail;

			if (consent_information.consented.personal_details) {
				setActiveScreen(SmartCameraWeb);
			}
		}, false);

		EndUserConsent.addEventListener('SmileIdentity::ConsentDenied', event => {
			window.parent.postMessage('SmileIdentity::ConsentDenied', '*');
			closeWindow();
		}, false);

		const main = document.querySelector('main');
		main.appendChild(EndUserConsent);
	}

	function customizeForm() {
		setGuideTextForIDType();
		setFormInputs();
	}

	function setGuideTextForIDType() {
		const label = document.querySelector('[for="id_number"]');
		const input = document.querySelector('#id_number');

		label.innerHTML = productConstraints[id_info.country]['id_types'][id_info.id_type]['label'];
		input.setAttribute('placeholder', productConstraints[id_info.country]['id_types'][id_info.id_type]['test_data']);
		input.setAttribute('pattern', productConstraints[id_info.country]['id_types'][id_info.id_type]['id_number_regex']);
	}

	function setFormInputs() {
		const requiredFields = productConstraints[id_info.country]['id_types'][id_info.id_type]['required_fields'];

		const showNames = requiredFields.some(fieldName => fieldName.includes('name'));

		if (showNames) {
			const Names = IDInfoForm.querySelector('fieldset#names');
			Names.hidden = false;
		}

		const showDOB = requiredFields.some(fieldName => fieldName.includes('dob'));

		if (showDOB) {
			const DOB = IDInfoForm.querySelector('fieldset#dob');
			DOB.hidden = false;
		}
	}

	function getPartnerParams() {
		function parseJWT(token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));

			return JSON.parse(jsonPayload);
		};

		const { partner_params: partnerParams } = parseJWT(config.token);

		partner_params = partnerParams;
	}

	function setActiveScreen(node) {
		activeScreen.hidden = true;
		node.hidden = false;
		activeScreen = node;
	}

	function resetForm() {
		const submitButton = IDInfoForm.querySelector('[type="button"]');
		submitButton.disabled = true;

		const invalidElements = IDInfoForm.querySelectorAll('[aria-invalid]');
		invalidElements.forEach((el) => el.removeAttribute('aria-invalid'));

		const validationMessages = IDInfoForm.querySelectorAll('.validation-message');
		validationMessages.forEach((el) => el.remove());
	};

	function validateInputs(payload) {
		const validationConstraints = {
			id_number: {
				presence: {
					allowEmpty: false,
					message: 'is required'
				},
				format: new RegExp(productConstraints[id_info.country]['id_types'][id_info.id_type]['id_number_regex'])
			}
		}

		const requiredFields = productConstraints[id_info.country]['id_types'][id_info.id_type]['required_fields'];

		const showNames = requiredFields.some(fieldName => fieldName.includes('name'));

		if (showNames) {
			validationConstraints.first_name = {
				presence: {
					allowEmpty: false,
					message: 'is required'
				}
			};
			validationConstraints.last_name = {
				presence: {
					allowEmpty: false,
					message: 'is required'
				}
			};
		}

		const showDOB = requiredFields.some(fieldName => fieldName.includes('dob'));

		if (showDOB) {
			validationConstraints.day = {
				presence: {
					allowEmpty: false,
					message: 'is required'
				}
			};
			validationConstraints.month = {
				presence: {
					allowEmpty: false,
					message: 'is required'
				}
			};
			validationConstraints.year = {
				presence: {
					allowEmpty: false,
					message: 'is required'
				}
			};
		}

		const validation = validate(payload, validationConstraints);

		if (validation) {
			handleValidationErrors(validation);
			const submitButton = IDInfoForm.querySelector('[type="button"]');
			submitButton.removeAttribute('disabled');
		}

		return validation;
	}

	function handleValidationErrors(errors) {
		const fields = Object.keys(errors);

		fields.forEach((field) => {
			const input = IDInfoForm.querySelector(`#${field}`);
			input.setAttribute('aria-invalid', 'true');
			input.setAttribute('aria-describedby', `${field}-hint`);

			const errorDiv = document.createElement('div')
			errorDiv.setAttribute('id', `${field}-hint`);
			errorDiv.setAttribute('class', 'validation-message');
			errorDiv.textContent = errors[field][0];

			input.insertAdjacentElement('afterend', errorDiv);
		});
	}

	async function handleFormSubmit(event) {
		event.preventDefault();
		resetForm();
		const form = IDInfoForm.querySelector('form');

		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());

		const isInvalid = validateInputs(payload);

		if (isInvalid) {
			return;
		}

		id_info = Object.assign({
			dob: `${payload.year}-${payload.month}-${payload.day}`,
			entered: true
		}, id_info, payload);

		try {
			[ uploadURL, fileToUpload ] = await Promise.all([ getUploadURL(), createZip() ]);

			var fileUploaded = uploadZip(fileToUpload, uploadURL);
		} catch (error) {
			switch (error.message) {
				case 'createZip failed':
				case 'getUploadURL failed':
				case 'uploadFile failed':
				default:
					displayErrorMessage(error);
					console.error(`SmileIdentity - ${error.name}: ${error.cause}`);
			}
		}
	};

	function displayErrorMessage(error) {
		const p = document.createElement('p');

		p.textContent = error.message;
		p.style.color = 'red';
		p.style.fontSize = '1.5rem';
		p.style.textAlign = 'center';

		const main = document.querySelector('main');
		main.prepend(p);
	}

	async function createZip() {
		const zip = new JSZip();

		zip.file('info.json', JSON.stringify({
			package_information: {
				"language": "Hosted Web Integration",
				"apiVersion": {
					"buildNumber": 0,
					"majorVersion": 2,
					"minorVersion": 0
				}
			},
			id_info,
			images
		}));

		try {
			const zipFile = await zip.generateAsync({ type: 'blob' });

			return zipFile;
		} catch (error) {
			throw new Error('createZip failed', { cause: error });
		}
	}

	async function getUploadURL() {
		var payload = {
			file_name: `${config.product}.zip`,
			smile_client_id: config.partner_details.partner_id,
			callback_url: config.callback_url,
			token: config.token,
			partner_params
		}

		const fetchConfig = {
			cache: 'no-cache',
			mode: 'cors',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(payload),
		};

		const URL = `${endpoints[config.environment] || config.environment}/upload`;

		try {
			const response = await fetch(URL, fetchConfig);
			const json = await response.json();

			if (json.error) throw new Error(json.error);

			return json.upload_url;
		} catch (error) {
			throw new Error('getUploadURL failed', { cause: error });
		}
	}

	function uploadZip(file, destination) {
		// CREDIT: Inspiration - https://usefulangle.com/post/321/javascript-fetch-upload-progress
		setActiveScreen(UploadProgressScreen);

		let request = new XMLHttpRequest();
		request.open('PUT', destination);

		request.upload.addEventListener('load', function(e) {
			return request.response;
		});

		request.upload.addEventListener('error', function(e) {
			setActiveScreen(UploadFailureScreen);
			throw new Error('uploadZip failed', { cause: e });
		});

		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
				setActiveScreen(CompleteScreen);
				handleSuccess();
				window.setTimeout(closeWindow, 2000);
			}
			if (request.readyState === XMLHttpRequest.DONE && request.status !== 200) {
				setActiveScreen(UploadFailureScreen);
				throw new Error('uploadZip failed', { cause: request });
			}
		};

		request.setRequestHeader("Content-type", "application/zip");
		request.send(file);
	}

	function retryUpload() {
		UploadProgressOutline.parentElement.classList.toggle('spinner');
		var fileUploaded = uploadZip(fileToUpload, uploadURL);

		return fileUploaded;
	}

	function closeWindow() {
		window.parent.postMessage('SmileIdentity::Close', '*');
	}

	function handleSuccess() {
		window.parent.postMessage('SmileIdentity::Success', '*');
	}
}();
