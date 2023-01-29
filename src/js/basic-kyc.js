var basicKyc = (function basicKyc() {
	"use strict";

	// NOTE: In order to support prior integrations, we have `live` and
	// `production` pointing to the same URL
	const endpoints = {
		sandbox: "https://testapi.smileidentity.com",
		qa: "https://devapi.smileidentity.com",
		live: "https://api.smileidentity.com",
		production: "https://api.smileidentity.com",
	};

	var config;
	var activeScreen;
	var consent_information, id_info, partner_params;
	var productConstraints;
	var partnerProductConstraints;

	var EndUserConsent;
	var SelectIDType = document.querySelector("#select-id-type");
	var IDInfoForm = document.querySelector("#id-info");
	var CompleteScreen = document.querySelector("#complete-screen");

	var CloseIframeButton = document.querySelector("#close-iframe");

	function postData(url = '', data = {}) {
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

	async function getProductConstraints() {
		try {
			const productsConfigPayload = {
				partner_id: config.partner_details.partner_id,
				token: config.token,
				partner_params
			}
	
			const productsConfigUrl = `${endpoints[config.environment]}/v1/products_config`;
			const productsConfigPromise = postData(productsConfigUrl, productsConfigPayload);
			const servicesPromise = fetch(`${endpoints[config.environment]}/v1/services`);
			const [productsConfigResponse, servicesResponse] = await Promise.all([
				productsConfigPromise,
				servicesPromise
			])

			if (productsConfigResponse.ok && servicesResponse.ok) {
				const partnerConstraints = await productsConfigResponse.json()
				const generalConstraints = await servicesResponse.json()

				return {
					partnerConstraints,
					generalConstraints: generalConstraints.hosted_web['basic_kyc']
				}
			} else {
				throw new Error("Failed to get supported ID types");
			}
		} catch (e) {
			throw new Error("Failed to get supported ID types", { cause: e });
		}
	}

	window.addEventListener(
		"message",
		async (event) => {
			if (event.data.includes("SmileIdentity::HostedWebIntegration")) {
				config = JSON.parse(event.data);
				activeScreen = SelectIDType;

				try {
					getPartnerParams();
					const { partnerConstraints, generalConstraints } = await getProductConstraints();
					partnerProductConstraints = partnerConstraints;
					productConstraints = generalConstraints;
					initializeSession(generalConstraints, partnerConstraints);

					localStorage.setItem("SmileIdentityConfig", event.data);
				} catch (e) {
					throw e;
				}
			}
		},
		false
	);

	function initializeSession(generalConstraints, partnerConstraints) {
		const supportedCountries = Object.keys(generalConstraints)
			.map((countryCode) => ({
				code: countryCode,
				name: generalConstraints[countryCode].name,
			}))
			.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				} else if (a.name > b.name) {
					return 1;
				} else {
					return 0;
				}
			})
			.map((item) => item.code);

		const selectCountry = SelectIDType.querySelector("#country");
		const selectIDType = SelectIDType.querySelector("#id_type");
		const hostedWebConfigForm = document.querySelector(
			'form[name="hosted-web-config"]'
		);

		let validCountries = [];

		if (config.id_selection) {
			validCountries = supportedCountries.filter((value) =>
				Object.keys(config.id_selection).includes(value)
			);
		} else {
			validCountries = Object.keys(partnerConstraints.idSelection.basic_kyc);
		}

		// ACTION: Load Countries as <option>s
		validCountries.forEach(country => {
			const countryObject = generalConstraints[country]
			if (countryObject) {
				const option = document.createElement('option');
				option.setAttribute('value', country);
				option.textContent = countryObject.name;
				selectCountry.appendChild(option);
			}
		});

		// ACTION: Enable Country Selection
		selectCountry.disabled = false;

		selectCountry.addEventListener("change", (e) => {
			if (e.target.value) {
				const validIDTypes = config.id_selection ? config.id_selection : partnerConstraints.idSelection.basic_kyc;
				const constrainedIDTypes = Object.keys(generalConstraints[e.target.value].id_types);
				const selectedIDTypes = validIDTypes[e.target.value].filter(value => constrainedIDTypes.includes(value))

				// ACTION: Reset ID Type <select>
				selectIDType.innerHTML = "";

				// ACTION: Load ID Types as <option>s
				selectedIDTypes.forEach((IDType) => {
					const option = document.createElement("option");
					option.setAttribute("value", IDType);
					option.textContent =
					generalConstraints[e.target.value]["id_types"][IDType].label;
					selectIDType.appendChild(option);
				});

				// ACTION: Enable ID Type Selection
				selectIDType.disabled = false;
			} else {
				// ACTION: Reset ID Type <select>
				selectIDType.innerHTML = "";

				// ACTION: Load the default <option>
				const option = document.createElement("option");
				option.disabled = true;
				option.setAttribute("value", "");
				option.textContent = "--Select Country First--";
				selectIDType.appendChild(option);
			}
		});

		hostedWebConfigForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const selectedCountry = selectCountry.value;
			const selectedIDType = selectIDType.value;

			// ACTION: set up `id_info`
			id_info = {
				country: selectedCountry,
				id_type: selectedIDType,
			};

			if (config.consent_required || config.demo_mode) {
				const IDRequiresConsent =
					config.consent_required &&
					config.consent_required[selectedCountry] &&
					config.consent_required[selectedCountry].includes(selectedIDType);

				if (IDRequiresConsent || config.demo_mode) {
					customizeConsentScreen();
					setActiveScreen(EndUserConsent);
				} else {
					setActiveScreen(IDInfoForm);
				}
			} else {
				setActiveScreen(IDInfoForm);
			}

			customizeForm();
		});
	}

	function initiateDemoMode() {
		const demoTips = document.querySelectorAll(".demo-tip");
		Array.prototype.forEach.call(demoTips, (tip) => {
			tip.hidden = false;
		});

		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "js/demo-ekyc.min.js";

		document.body.appendChild(script);
	}

	IDInfoForm.querySelector("#submitForm").addEventListener(
		"click",
		(event) => {
			handleFormSubmit(event);
		},
		false
	);

	CloseIframeButton.addEventListener(
		"click",
		(event) => {
			closeWindow();
		},
		false
	);

	function toHRF(string) {
		return string.replace(/\_/g, " ");
	}

	function customizeConsentScreen() {
		const partnerDetails = config.partner_details;

		EndUserConsent = document.createElement("end-user-consent");
		EndUserConsent.setAttribute("id-type", toHRF(id_info.id_type));
		EndUserConsent.setAttribute("partner-name", partnerDetails.name);
		EndUserConsent.setAttribute("partner-logo", partnerDetails.logo_url);
		EndUserConsent.setAttribute("policy-url", partnerDetails.policy_url);
		EndUserConsent.setAttribute("theme-color", partnerDetails.theme_color);
		if (config.demo_mode) {
			EndUserConsent.setAttribute("demo-mode", config.demo_mode);
			localStorage.setItem(
				"SmileIdentityConstraints",
				JSON.stringify(productConstraints, null, 2)
			);
			initiateDemoMode();
		}

		EndUserConsent.addEventListener(
			"SmileIdentity::ConsentGranted",
			(event) => {
				consent_information = event.detail;

				if (consent_information.consented.personal_details) {
					setActiveScreen(IDInfoForm);
				}
			},
			false
		);

		EndUserConsent.addEventListener(
			"SmileIdentity::ConsentDenied",
			(event) => {
				window.parent.postMessage("SmileIdentity::ConsentDenied", "*");
				closeWindow();
			},
			false
		);

		const main = document.querySelector("main");
		main.appendChild(EndUserConsent);
	}

	function customizeForm() {
		setGuideTextForIDType();
		setFormInputs();
	}

	function setGuideTextForIDType() {
		const label = document.querySelector('[for="id_number"]');
		const input = document.querySelector("#id_number");

		label.innerHTML =
			productConstraints[id_info.country]["id_types"][id_info.id_type]["label"];
		input.setAttribute(
			"placeholder",
			productConstraints[id_info.country]["id_types"][id_info.id_type][
				"test_data"
			]
		);
		input.setAttribute(
			"pattern",
			productConstraints[id_info.country]["id_types"][id_info.id_type][
				"id_number_regex"
			]
		);
	}

	function setFormInputs() {
		const requiredFields =
			productConstraints[id_info.country]["id_types"][id_info.id_type][
				"required_fields"
			];

		const showNames = requiredFields.some((fieldName) =>
			fieldName.includes("name")
		);

		if (showNames) {
			const Names = IDInfoForm.querySelector("fieldset#names");
			Names.hidden = false;
		}

		const showDOB = requiredFields.some((fieldName) =>
			fieldName.includes("dob")
		);

		if (showDOB) {
			const DOB = IDInfoForm.querySelector("fieldset#dob");
			DOB.hidden = false;
		}
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
			 *		ref: just above this - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#examples
			 * 5. decode the URI Component to a JSON string
			 * 6. parse the JSON string to a javascript object
			 */
			var base64Url = token.split(".")[1];
			var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			var jsonPayload = decodeURIComponent(
				atob(base64)
					.split("")
					.map(function (c) {
						return "%" + c.charCodeAt(0).toString(16);
					})
					.join("")
			);

			return JSON.parse(jsonPayload);
		}

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

		const invalidElements = IDInfoForm.querySelectorAll("[aria-invalid]");
		invalidElements.forEach((el) => el.removeAttribute("aria-invalid"));

		const validationMessages = IDInfoForm.querySelectorAll(
			".validation-message"
		);
		validationMessages.forEach((el) => el.remove());
	}

	function validateInputs(payload) {
		const validationConstraints = {
			id_number: {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
				format: new RegExp(
					productConstraints[id_info.country]["id_types"][id_info.id_type][
						"id_number_regex"
					]
				),
			},
		};

		const requiredFields =
			productConstraints[id_info.country]["id_types"][id_info.id_type][
				"required_fields"
			];

		const showNames = requiredFields.some((fieldName) =>
			fieldName.includes("name")
		);

		if (showNames) {
			validationConstraints.first_name = {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
			};
			validationConstraints.last_name = {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
			};
		}

		const showDOB = requiredFields.some((fieldName) =>
			fieldName.includes("dob")
		);

		if (showDOB) {
			validationConstraints.day = {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
			};
			validationConstraints.month = {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
			};
			validationConstraints.year = {
				presence: {
					allowEmpty: false,
					message: "is required",
				},
			};
		}

		const validation = validate(payload, validationConstraints);

		if (validation) {
			handleValidationErrors(validation);
			const submitButton = IDInfoForm.querySelector('[type="button"]');
			submitButton.removeAttribute("disabled");
		}

		return validation;
	}

	function handleValidationErrors(errors) {
		const fields = Object.keys(errors);

		fields.forEach((field) => {
			const input = IDInfoForm.querySelector(`#${field}`);
			input.setAttribute("aria-invalid", "true");
			input.setAttribute("aria-describedby", `${field}-hint`);

			const errorDiv = document.createElement("div");
			errorDiv.setAttribute("id", `${field}-hint`);
			errorDiv.setAttribute("class", "validation-message");
			errorDiv.textContent = errors[field][0];

			input.insertAdjacentElement("afterend", errorDiv);
		});
	}

	async function handleFormSubmit(event) {
		event.preventDefault();
		resetForm();
		const form = IDInfoForm.querySelector("form");

		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());

		const isInvalid = validateInputs(payload);

		if (isInvalid) {
			return;
		}

		id_info = Object.assign(
			{
				dob: `${payload.year}-${payload.month}-${payload.day}`,
				entered: true,
			},
			id_info,
			payload
		);

		try {
			await submitIdInfoForm();
			complete();
		} catch (error) {
			displayErrorMessage(error);
			console.error(`SmileIdentity - ${error.name}: ${error.cause}`);
		}
	}

	function displayErrorMessage(error) {
		const p = document.createElement("p");

		p.textContent = error.message;
		p.style.color = "red";
		p.style.fontSize = "1.5rem";
		p.style.textAlign = "center";

		const main = document.querySelector("main");
		main.prepend(p);
	}

	async function submitIdInfoForm() {
		const { year, month, day, ...data } = id_info;
		const dob = year && month && day ? `${year}-${month}-${day}` : undefined;
		const {
			callback_url,
			token,
			partner_details: { partner_id },
		} = config;
		const payload = {
			...data,
			dob,
			partner_id,
			partner_params,
			callback_url,
			token,
			source_sdk: "hosted_web",
			source_sdk_version: "v1.0.0"
		};

		// const URL = `${endpoints[config.environment]}/v2/verify_async`;
		// this is just for QA and will be removed before deployment
		const URL = 'https://testapi.smileidentity.com/v2/verify_async'
		const response = await postData(URL, payload);
		const json = await response.json();

		if (json.error) throw new Error(json.error);
	}

	function complete() {
		setActiveScreen(CompleteScreen);
		handleSuccess();
		window.setTimeout(closeWindow, 2000);
	}

	function closeWindow() {
		window.parent.postMessage("SmileIdentity::Close", "*");
	}

	function handleSuccess() {
		window.parent.postMessage("SmileIdentity::Success", "*");
	}
})();
