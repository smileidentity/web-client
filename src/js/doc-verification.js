var documentVerification = function documentVerification() {
	'use strict';

	// NOTE: In order to support prior integrations, we have `live` and
	// `production` pointing to the same URL
	const endpoints = {
		'sandbox': 'https://testapi.smileidentity.com/v1',
		'live': 'https://api.smileidentity.com/v1',
		'production': 'https://api.smileidentity.com/v1'
	}

	const referenceWindow = window.parent;
	referenceWindow.postMessage('SmileIdentity::ChildPageReady', '*');

	var config;
	var activeScreen;
	var id_info, images, partner_params;
	var productConstraints;

	var LoadingScreen = document.querySelector('#loading-screen');
	var SelectIDType = document.querySelector('#select-id-type');
	var SmartCameraWeb = document.querySelector('smart-camera-web');
	var UploadProgressScreen = document.querySelector('#upload-progress-screen');
	var UploadFailureScreen = document.querySelector('#upload-failure-screen');
	var CompleteScreen = document.querySelector('#complete-screen');

	var CloseIframeButtons = document.querySelectorAll('.close-iframe');
	var RetryUploadButton = document.querySelector('#retry-upload');

	var fileToUpload, uploadURL;

	async function getProductConstraints() {
		var payload = {
			token: config.token,
			partner_id: config.partner_details.partner_id,
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

		try {
			const response = await fetch(`${endpoints[config.environment]}/valid_documents`, fetchConfig);
			const json = await response.json();

			return json.valid_documents;
		} catch (e) {
			throw new Error("Failed to get supported ID types", { cause: e });
		}
	}

	window.addEventListener('message', async event => {
		if (event.data && event.data.includes('SmileIdentity::Configuration')) {
			config = JSON.parse(event.data);
			activeScreen = LoadingScreen;

			try {
				productConstraints = await getProductConstraints();
				initializeSession(productConstraints);
				getPartnerParams();
			} catch (e) {
				throw e;
			}
		}
	}, false);

	function loadCountrySelector(countries, placeholderElement) {
		const isSingleCountry = countries.length === 1;

		const autocomplete = document.createElement('smileid-combobox');
		autocomplete.setAttribute('id', 'country');
		autocomplete.innerHTML = `
			<smileid-combobox-trigger label="${ isSingleCountry ? countries[0].name : "Search Country"}">
			</smileid-combobox-trigger>

			<smileid-combobox-listbox empty-label="No country found">
				${countries.map(country =>
					`
						<smileid-combobox-option ${ isSingleCountry ? 'aria-selected="true" ' : ''}value="${country.code}" label="${country.name}">
							${ country.name }
						</smileid-combobox-option>
					`
				).join('\n')}
			</smileid-combobox-listbox>
		`;

		placeholderElement.replaceWith(autocomplete);

		return autocomplete;
	}

	function loadIdTypeSelector(idTypes, placeholderElement) {
		const combobox = document.createElement('smileid-combobox');
		combobox.setAttribute('id', 'id_type');
		combobox.innerHTML = `
			<smileid-combobox-trigger type="button" label="Select Document">
			</smileid-combobox-trigger>

			<smileid-combobox-listbox empty-label="No country found">
				${idTypes.map(idType =>
					`
						<smileid-combobox-option value="${idType.code}" label="${idType.name}">
							<div>
								<p>${ idType.name }</p>
								<small>${idType.example.length > 1 ? 'e.g. ' : ''}${idType.example.join(', ')}</small>
							</div>
						</smileid-combobox-option>
					`
				).join('\n')}
			</smileid-combobox-listbox>
		`;

		placeholderElement.replaceWith(combobox);

		return combobox;
	}

	function initializeSession(constraints) {
		const supportedCountries = constraints
			.map(({ country: { name, code } }) => ({
				code,
				name,
			})).sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				} else if (a.name > b.name) {
					return 1;
				} else {
					return 0;
				}
			}).map(item => item.code);

		let validCountries = [];

		if (config.id_selection) {
			const selectedCountryList = Object.keys(config.id_selection);
			validCountries = supportedCountries.filter((value) =>
				selectedCountryList.includes(value)
			);

			if (validCountries.length === 1) {
				const selectedCountry = validCountries[0];
				id_info = {
					country: validCountries[0]
				};

				const idTypes = config.id_selection[selectedCountry];
				if (idTypes.length === 1 || typeof idTypes === 'string') {
					id_info.id_type = Array.isArray(idTypes) ? idTypes[0] : idTypes;
					const documentCaptureConfig = constraints
						.find(entry => entry.country.code === selectedCountry)
						.id_types
						.find(entry => entry.code === id_info.id_type);

					// ACTION: set initial screen
					SmartCameraWeb.setAttribute('document-type', id_info.id_type)
					// ACTION: set document capture mode
					if (documentCaptureConfig.has_back) {
						SmartCameraWeb.setAttribute('capture-id', 'back');
					}
					if (config.document_capture_modes) {
						SmartCameraWeb.setAttribute('document-capture-modes', config.document_capture_modes.join(','))
					}
					// Hide the back button that takes the user back to the id selection screen
					// from startcamera web
					SmartCameraWeb.setAttribute('hide-back-to-host', true);
					setActiveScreen(SmartCameraWeb);
				}
			}
		} else {
			validCountries = supportedCountries;
		}

		if (!id_info || !id_info.id_type) {
			const selectCountry = SelectIDType.querySelector('#country');
			let selectIdType = SelectIDType.querySelector('#id_type');
			const hostedWebConfigForm = document.querySelector('form[name="hosted-web-config"]');

			// ACTION: Enable Country Selection
			selectCountry.disabled = false;

			// ACTION: Enable select screen
			setActiveScreen(SelectIDType);

			function loadIdTypes(countryCode) {
				const countryIdTypes = constraints.find(item => item.country.code === countryCode).id_types;
				const validIdTypes = config.id_selection ? config.id_selection(countryCode) : countryIdTypes;
				const selectedIdTypes = countryIdTypes
					.filter(idType =>
						validIdTypes.find(
							validIdType => (validIdType.code || validIdType) === idType.code
						) || !idType.code
					);

				return selectedIdTypes;
			}

			let selectedCountry, selectedIdType;
			// ACTION: Load Countries using combobox
			const countries = validCountries.map(countryCode => {
				const countryObject = productConstraints.find(entry => entry.country.code === countryCode).country;

				return {
					code: countryCode,
					name: countryObject.name,
				};
			});

			const countrySelector = loadCountrySelector(countries, selectCountry);

			countrySelector.addEventListener('change', e => {
				selectIdType = SelectIDType.querySelector('#id_type');
				selectedCountry = e.detail.value;

				// ACTION: Load id types using combobox
				const idTypes = loadIdTypes(selectedCountry);

				const idTypeSelector = loadIdTypeSelector(idTypes, selectIdType);

				idTypeSelector.addEventListener('change', e => {
					selectedIdType = e.detail.value;
				});
			});

			hostedWebConfigForm.addEventListener('submit', e => {
				e.preventDefault();

				// ACTION: set up `id_info`
				id_info = {
					country: selectedCountry,
					id_type: selectedIdType
				};

				SmartCameraWeb.setAttribute('document-type', selectedIdType)
				const documentCaptureConfig = constraints
					.find(entry => entry.country.code === selectedCountry)
					.id_types
					.find(entry => entry.code === selectedIdType);

				// ACTION: set document capture mode
				if (documentCaptureConfig.has_back) {
					console.log('setting up smartcameraweb');
					SmartCameraWeb.setAttribute('capture-id', 'back');
				}
				if (config.document_capture_modes) {
					SmartCameraWeb.setAttribute('document-capture-modes', config.document_capture_modes.join(','))
				}
				setActiveScreen(SmartCameraWeb);
			});
		}
	}

	function initiateDemoMode() {
		const demoTips = document.querySelectorAll('.demo-tip');
		Array.prototype.forEach.call(demoTips, (tip) => {
			tip.hidden = false;
		});

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'js/demo-doc-verification.min.js';

		document.body.appendChild(script);
	}

	SmartCameraWeb.addEventListener('imagesComputed', event => {
		images = event.detail.images;
		setActiveScreen(UploadProgressScreen);
		handleFormSubmit(event);
	}, false);

	SmartCameraWeb.addEventListener('backExit', event => {
		setActiveScreen(SelectIDType);
	}, false);

	SmartCameraWeb.addEventListener('close', event => {
		closeWindow();
	}, false);

	RetryUploadButton.addEventListener('click', event => {
		retryUpload();
	}, false);

	CloseIframeButtons.forEach((button) => {
		button.addEventListener('click', event => {
			closeWindow();
		}, false);
	});

	function toHRF(string) {
		return string.replace(/\_/g, ' ');
	}

	function getPartnerParams() {
		function parseJWT(token) {
			/**
			 * A JSON Web Token (JWT) uses a base64 URL encoded string in it's body.
			 *
			 * in order to get a regular JSON string, we would follow these steps:
			 *
			 * 1. get the body of a JWT string
			 * 2. replace the base64 URL delimiters ( - and _ ) with regular URL delimiters ( + and / )
			 * 3. convert the regular base64 string to a string
			 * 4. encode the string from above as a URIComponent,
			 *    ref: just above this - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#examples
			 * 5. decode the URI Component to a JSON string
			 * 6. parse the JSON string to a javascript object
			 */
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			var jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(function(c) {
						return '%' + (c.charCodeAt(0).toString(16));
				}).join('')
			);

			return JSON.parse(jsonPayload);
		};

		const { partner_params: partnerParams } = parseJWT(config.token);

		partner_params = { ...partnerParams, ...(config.partner_params || {}) }
	}

	function setActiveScreen(node) {
		activeScreen.hidden = true;
		node.hidden = false;
		activeScreen = node;
	}

	async function handleFormSubmit(event) {
		event.preventDefault();

		try {
			[ uploadURL, fileToUpload ] = await Promise.all([ getUploadURL(), createZip() ]);

			var fileUploaded = uploadZip(fileToUpload, uploadURL);
		} catch (error) {
			displayErrorMessage('Something went wrong');
			console.error(`SmileIdentity - ${error.name || error.message}: ${error.cause}`);
		}
	};

	function displayErrorMessage(message) {
		const p = document.createElement('p');

		p.textContent = message;
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
			source_sdk: config.sdk || 'hosted_web',
			source_sdk_version: config.sdk_version || 'v1.0.0',
			file_name: `${config.product}.zip`,
			smile_client_id: config.partner_details.partner_id,
			callback_url: config.callback_url,
			token: config.token,
			partner_params: {
				...partner_params,
				job_type: 6
			}
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
		var fileUploaded = uploadZip(fileToUpload, uploadURL);

		return fileUploaded;
	}

	function closeWindow() {
		referenceWindow.postMessage('SmileIdentity::Close', '*');
	}

	function handleSuccess() {
		referenceWindow.postMessage('SmileIdentity::Success', '*');
	}
}();
