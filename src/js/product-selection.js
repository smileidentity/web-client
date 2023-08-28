var productSelection = (function productSelection() {
	'use strict';

	// NOTE: In order to support prior integrations, we have `live` and
	// `production` pointing to the same URL
	const endpoints = {
		development: "https://devapi.smileidentity.com",
		sandbox: "https://testapi.smileidentity.com",
		live: "https://api.smileidentity.com",
		production: "https://api.smileidentity.com",
	};

	const referenceWindow = window.parent;
	referenceWindow.postMessage('SmileIdentity::ChildPageReady', '*');

	var config;
	var verificationMethodMap;
	var activeScreen;
	var LoadingScreen = document.querySelector('#loading-screen');
	var SelectIdType = document.querySelector('#select-id-type');
	var ConfigForm = document.querySelector('form[name="hosted-web-config"]');
	var CloseIframeButtons = document.querySelectorAll('.close-iframe');

	CloseIframeButtons.forEach((button) => {
		button.addEventListener('click', event => {
			closeWindow();
		}, false);
	});

	function setActiveScreen(element) {
		activeScreen.hidden = true;
		element.hidden = false;
		activeScreen = element;
	}

	function getIdTypeName(country, id_type, services) {
		if (services['hosted_web']['doc_verification'][country] && services['hosted_web']['doc_verification'][country]['id_types'][id_type]) {
			return services['hosted_web']['doc_verification'][country]['id_types'][id_type]['label'];
		}
		if (services['hosted_web']['enhanced_kyc'][country] && services['hosted_web']['enhanced_kyc'][country]['id_types'][id_type]) {
			return services['hosted_web']['enhanced_kyc'][country]['id_types'][id_type]['label'];
		}
		throw new Error('Cannot find the full name of the id_type');
	}

	function transformIdTypesToVerificationMethodMap(config, services) {
		return config.id_types.reduce((idSelectionMap, { country, id_type, verification_method }) => {
			idSelectionMap[country] = idSelectionMap[country] || {
				name: services['hosted_web']['doc_verification'][country]['name'],
				id_types: {},
			};
			idSelectionMap[country]['id_types'][id_type] = {
				name: getIdTypeName(country, id_type, services),
				verification_method
			}

			return idSelectionMap;
		}, {});
	}

	function loadIdTypes(verificationMethodMap, idTypeSelector, countryCode) {
		if (countryCode) {
			// ACTION: Reset ID Type <select>
			idTypeSelector.innerHTML = '';
			const initialOption = document.createElement('option');
			initialOption.setAttribute('value', '');
			initialOption.textContent = '--Please Select--';
			idTypeSelector.appendChild(initialOption);

			// ACTION: Load ID Types as <option>s
			const idTypes = Object.keys(verificationMethodMap[countryCode].id_types);
			const isSingleIdType = idTypes.length === 1;
			idTypes.forEach((idType) => {
				const option = document.createElement("option");
				option.setAttribute("value", idType);
				option.textContent = verificationMethodMap[countryCode]["id_types"][idType].name;

				if (isSingleIdType) {
					option.setAttribute('selected', true);
				}

				idTypeSelector.appendChild(option);
			});

			// ACTION: Enable ID Type Selection
			idTypeSelector.disabled = false;
		} else {
			// ACTION: Reset ID Type <select>
			idTypeSelector.innerHTML = "";

			// ACTION: Load the default <option>
			const option = document.createElement("option");
			option.disabled = true;
			option.setAttribute("value", "");
			option.textContent = "--Select Country First--";
			idTypeSelector.appendChild(option);
		}
	}

	function getVerificationMethod(country, id_type) {
		return verificationMethodMap[country]['id_types'][id_type].verification_method;
	}

	function initializeForm(form, verificationMethodMap) {
		const countrySelector = form.querySelector('#country');
		const idTypeSelector = form.querySelector('#id_type');

		countrySelector.addEventListener('change', (e) => {
			loadIdTypes(verificationMethodMap, idTypeSelector, e.target.value);
		});

		const countries = Object.keys(verificationMethodMap);
		const isSingleCountry = countries.length === 1;
		countries.forEach(countryCode => {
			const country = verificationMethodMap[countryCode];

			const option = document.createElement('option');
			option.setAttribute('value', countryCode);
			option.textContent = country.name;

			if (isSingleCountry) {
				option.setAttribute('selected', true);
				loadIdTypes(verificationMethodMap, idTypeSelector, countryCode)
			}

			countrySelector.appendChild(option);
		});

		countrySelector.disabled = false;
		setActiveScreen(form);
	}

	function getSiteURL() {
		const urlParts = location.href.split('/');
		const url = urlParts.slice(0, -1).join('/')
		return `${url}/`;
	}

	function getIFrameURL(product) {
		switch (product) {
			case 'biometric_kyc':
				return 'biometric-kyc.html';
			case 'doc_verification':
				return 'doc-verification.html';
			case 'enhanced_kyc':
				return 'ekyc.html';
			default:
				throw new Error('Unsupported product');
		}
	}

	function createIframe(productName) {
		var iframe = document.createElement('iframe');

		iframe.setAttribute('src', `${getSiteURL()}${getIFrameURL(productName)}`);
		iframe.setAttribute('id', 'smile-identity-hosted-web-integration-post-product-selection');
		iframe.setAttribute('name', 'smile-identity-hosted-web-integration-post-product-selection');
		iframe.setAttribute('data-cy', 'smile-identity-hosted-web-integration-post-product-selection');
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allow', 'camera; geolocation; encrypted-media; fullscreen');
		iframe.setAttribute('allowtransparency', 'true');

		iframe.style.cssText = `
			background-color: #F9F0E7;
			border: none;
			height: 100%;
			left: 0;
			position: fixed;
			top: 0;
			width: 100%;
			z-index: 999999;
		`;

		document.body.prepend(iframe);
	}

	function closeWindow() {
		referenceWindow.postMessage('SmileIdentity::Close', '*');
	}

	function publishMessage() {
		const targetWindow = document.querySelector("[name='smile-identity-hosted-web-integration-post-product-selection']").contentWindow;
		config.source = 'SmileIdentity::Configuration';

		targetWindow.postMessage(JSON.stringify(config), '*');
	}

	function setProductPage(selectedCountry, selectedIdType) {
		config.id_selection = {};
		config.id_selection[selectedCountry] = [selectedIdType];
		config.product = getVerificationMethod(selectedCountry, selectedIdType);

		createIframe(config.product);
	}

	ConfigForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const selectedCountry = ConfigForm.querySelector('#country').value;
		const selectedIdType = ConfigForm.querySelector('#id_type').value;

		setProductPage(selectedCountry, selectedIdType);
	});

	window.addEventListener(
		"message",
		async (event) => {
			if (event.data) {
				if (event.data.includes("SmileIdentity::Configuration")) {
					config = JSON.parse(event.data);
					activeScreen = LoadingScreen;

					try {
						const servicesResponse = await fetch(`${endpoints[config.environment]}/v1/services`);

						if (servicesResponse.ok) {
							const services = await servicesResponse.json();

							verificationMethodMap = transformIdTypesToVerificationMethodMap(config, services);
							initializeForm(SelectIdType, verificationMethodMap);
						} else {
							throw Error('Failed to get supported ID types');
						}
					} catch (e) {
						throw e;
					}
				} else if (event.data.includes("SmileIdentity::ChildPageReady")) {
					publishMessage(config);
				}
			} else {
				referenceWindow.postMessage(event.detail || event.data, '*');
			}
		},
		false
	);
})();
