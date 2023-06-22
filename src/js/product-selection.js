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

	var config;
	var verificationMethodMap;
	var activeScreen;
	var LoadingScreen = document.querySelector('#loading-screen');
	var SelectIdType = document.querySelector('#select-id-type');
	var ConfigForm = document.querySelector('form[name="hosted-web-config"]');

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
			Object.keys(verificationMethodMap[countryCode].id_types).forEach((idType) => {
				const option = document.createElement("option");
				option.setAttribute("value", idType);
				option.textContent = verificationMethodMap[countryCode]["id_types"][idType].name;
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
		countries.forEach(countryCode => {
			const country = verificationMethodMap[countryCode];

			const option = document.createElement('option');
			option.setAttribute('value', countryCode);
			option.textContent = country.name;

			countrySelector.appendChild(option);
		});

		countrySelector.disabled = false;

		setActiveScreen(form);
	}

	ConfigForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const selectedCountry = ConfigForm.querySelector('#country').value;
		const selectedIdType = ConfigForm.querySelector('#id_type').value;

		config.id_selection = {};
		config.id_selection[selectedCountry] = selectedIdType;
		config.product = getVerificationMethod(selectedCountry, selectedIdType);

		console.log(config);
	});

	window.addEventListener(
		"message",
		async (event) => {
			if (event.data.includes("SmileIdentity::HostedWebIntegration")) {
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
			}
		},
		false
	);
})();
