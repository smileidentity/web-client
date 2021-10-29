var eKYCSmartSelfie = function eKYCSmartSelfie() {
	'use strict';

	const endpoints = {
		'dev': 'https://devapi.smileidentity.com/v1',
		'sandbox': 'https://testapi.smileidentity.com/v1',
		'live': 'https://api.smileidentity.com/v1'
	}

	var config;
	var activeScreen;
	var consent_information, id_info, images, partner_params;

	var EndUserConsent;
	var SmartCameraWeb = document.querySelector('smart-camera-web');
	var IDInfoForm = document.querySelector('#id-info');
	var UploadProgressScreen = document.querySelector('#upload-progress-screen');
	var UploadFailureScreen = document.querySelector('#upload-failure-screen');
	var CompleteScreen = document.querySelector('#complete-screen');

	var CloseIframeButton = document.querySelector('#close-iframe');
	var UploadProgressOutline = UploadProgressScreen.querySelector('#upload-progress-outline');
	var RetryUploadButton = document.querySelector('#retry-upload');

	var fileToUpload, uploadURL;

	window.addEventListener('message', event => {
		config = JSON.parse(event.data);
		customizeConsentScreen();
		activeScreen = EndUserConsent;
		setUpForm();
		getPartnerParams();
		localStorage.setItem('SmileIdentityConfig', event.data);
	}, false);

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

	function customizeConsentScreen() {
		const partnerDetails = config.partner_details;
		id_info = config.id_info;

		EndUserConsent = document.createElement('end-user-consent');
		EndUserConsent.setAttribute('id-type', id_info.id_type);
		EndUserConsent.setAttribute('partner-name', partnerDetails.name);
		EndUserConsent.setAttribute('partner-logo', partnerDetails.logo_url);
		EndUserConsent.setAttribute('policy-url', partnerDetails.policy_url);
		EndUserConsent.setAttribute('theme-color', partnerDetails.theme_color);

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
		main.hidden = false;
	}

	function setUpForm() {
		const country = id_info.country;
		const IDType = id_info.id_type;

		if (country !== 'NG') return;

		if (IDType === 'DRIVERS_LICENSE') {
			const DOB = IDInfoForm.querySelector('fieldset#dob');

			DOB.hidden = false;
		}

		if (IDType === 'DRIVERS_LICENSE' || IDType === 'PHONE_NUMBER') {
			const Names = IDInfoForm.querySelector('fieldset#names');

			Names.hidden = false;
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

	const regexes = {
		GH: {
			DRIVERS_LICENSE: /^[A-Z0-9]{6,10}$/i ,
			SSNIT: /^[A-Z]{1}[A-Z0-9]{12,14}$/i,
			VOTER_ID: /^[0-9]{10,12}$/,
			NEW_VOTER_ID: /^[0-9]{10,12}$/,
			PASSPORT: /^G[A-Z0-9]{7,9}$/i,
			NATIONAL_ID: /^GHA-[A-Z0-9]{9}-[A-Z0-9]{1}$/i
		},
		KE: {
			NATIONAL_ID: /^[0-9]{1,9}$/,
			PASSPORT: /^[A-Z0-9]{7,9}$/,
			ALIEN_CARD: /^[0-9]{6,9}$/,
		},
		NG: {
			BANK_ACCOUNT: /^[0-9]{10}$/,
			BVN: /^[0-9]{11}$/,
			CAC: /^(RC)?[0-9]{5,8}$/,
			DRIVERS_LICENSE: /^(?=.*[0-9])(?=.*[A-Z])[A-Z0-9]{3}([ -]{1})?[A-Z0-9]{6,12}$/i,
			NATIONAL_ID: /^[0-9]{10}$/,
			NIN: /^[0-9]{11}$/,
			NIN_SLIP: /^[0-9]{11}$/,
			PASSPORT: /^[A-Z]{1}( )?[0-9]{8}$/i,
			PHONE_NUMBER: /^[0-9]{11}$/,
			TIN: /^[0-9]{8,}-[0-9]{4,}$/,
			VOTER_ID: /^([A-Z0-9]{19}|[A-Z0-9]{9})$/i,
		},
		UG: {
			NATIONAL_ID_NO_PHOTO: /^[A-Z0-9]{14}$/i,
		},
		ZA: {
			NATIONAL_ID: /^[0-9]{13}$/,
			NATIONAL_ID_NO_PHOTO: /^[0-9]{13}$/,
		},
	};

	function validateInputs(payload) {
		const validationConstraints = {
			id_number: {
				presence: {
					allowEmpty: false,
					message: 'is required'
				},
				format: regexes[id_info.country][id_info.id_type]
			}
		}

		if (id_info.country === 'NG') {
			if (id_info.id_type === 'PHONE_NUMBER' || id_info.id_type === 'DRIVERS_LICENSE') {
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

			if (id_info.id_type === 'DRIVERS_LICENSE') {
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
		};

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
		p.style.fontSize = '2rem';
		p.style.textAlign = 'center';

		const main = document.querySelector('main');
		main.prepend(p);
	}

	async function createZip() {
		const zip = new JSZip();

		zip.file('info.json', JSON.stringify({
			package_information: {
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

		const URL = `${endpoints[config.environment]}/upload`;

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

		request.upload.addEventListener('progress', function(e) {
			let percentCompleted = (e.loaded / e.total)*100;
			animateUploadProgress(percentCompleted);
		});

		request.addEventListener('load', function(e) {
			return request.response;
		});

		request.addEventListener('error', function(e) {
			setActiveScreen(UploadFailureScreen);
			throw new Error('uploadZip failed', { cause: e });
		});

		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
				setActiveScreen(CompleteScreen);
				window.setTimeout(closeWindow, 2000);
			}
			if (request.readyState === XMLHttpRequest.DONE && request.status !== 200) {
				throw new Error('uploadZip failed', { cause: request });
			}
		};

		request.setRequestHeader("Content-type", "application/zip");
		request.send(file);
	}

	function retryUpload() {
		var fileUploaded = uploadZip(fileToUpload, uploadURL);

		return fileUploaded;
	}

	function animateUploadProgress(percentageCompleted) {
		/**
		 * this was culled from https://jakearchibald.com/2013/animated-line-drawing-svg/
		 * and modified for the new use case
		 */
		// NOTE: get length of the path
		const progressOutlineLength = UploadProgressOutline.getTotalLength();
		// Set up the starting positions
		UploadProgressOutline.style.strokeDasharray = progressOutlineLength + ' ' + progressOutlineLength;
		// Set new position
		UploadProgressOutline.style.strokeDashOffset = progressOutlineLength * (percentageCompleted / 100);
	}

	function closeWindow() {
		window.parent.postMessage('SmileIdentity::Close', '*');
	}

	function onSuccess() {
		window.parent.postMessage('SmileIdentity::Success', '*');
	}
}();
