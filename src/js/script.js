var SmileIdentity = function () {
	'use strict';

	function getSiteURL() {
		var currentScriptSrc = document.currentScript.src;
		const qualifiedURL = currentScriptSrc.split('script')[0];
		return qualifiedURL;
	}

	const config = {
		siteURL: getSiteURL()
	};

	function getIFrameURL(product) {
		if (product === 'ekyc_smartselfie') return './../ekyc-smartselfie.html';

		throw new Error(`SmileIdentity: ${product} is not currently supported in this integration`);
	}

	function createIframe(productName) {
		var iframe = document.createElement('iframe');

		iframe.setAttribute('src', `${config.siteURL}${getIFrameURL(productName)}`);
		iframe.setAttribute('id', 'smile-identity-hosted-web-integration');
		iframe.setAttribute('name', 'smile-identity-hosted-web-integration');
		iframe.setAttribute('data-cy', 'smile-identity-hosted-web-integration');
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allow', 'camera; geolocation; encrypted-media; fullscreen');
		iframe.setAttribute('allowtransparency', 'true');

		iframe.style.cssText = `
			background-color: transparent;
			background-color: rgba(0, 0, 0, .75);
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

	function closeIFrame(config) {
		const iframe = document.querySelector('#smile-identity-hosted-web-integration');

		iframe.remove();

		if (config.onClose) {
			config.onClose();
		}
	}

	function handleSuccess(config) {
		if (config.onSuccess) {
			config.onSuccess();
		}
	}

	function handleConsentRejection(config) {
		if (config.onError) {
			config.onError();
		}
	}

	/*
	const countriesAndIDTypes = {
		'GH': ['DRIVERS_LICENSE', 'NEW_VOTER_ID', 'PASSPORT', 'SSNIT', 'VOTER_ID'],
		'KE': ['ALIEN_CARD', 'NATIONAL_ID', 'PASSPORT'],
		'NG': ['BVN', 'DRIVERS_LICENSE', 'NIN', 'NIN_SLIP', 'TIN', 'VOTER_ID'],
		'ZA': ['NATIONAL_ID']
	};
	*/

	const requiredPartnerDetails = ['name', 'logo_url', 'partner_id', 'policy_url', 'theme_color'];

	function isConfigValid(config) {
		if (!config.token) throw new Error('SmileIdentity: Please provide your web token via the `token` attribute');
		if (!config.callback_url) throw new Error('SmileIdentity: Please provide a callback URL via the `callback_url` attribute');
		if (!config.product) throw new Error('SmileIdentity: Please select a product via the `product` attribute. Currently, only `ekyc_smartselfie` is supported');

		/*
		if (config.id_info.country || config.id_info.id_type) {
			const validCountries = Object.keys(countriesAndIDTypes);
			if (!config.id_info.country || !validCountries.includes(config.id_info.country)) {
				throw new Error(`SmileIdentity: Please select the country from ${validCountries.join(', ')}`);
			}

			const validIDTypes = countriesAndIDTypes[config.id_info.country];

			if (!config.id_info.id_type || !validIDTypes.includes(config.id_info.id_type)) {
				throw new Error(`SmileIdentity: Please select the id_type from ${validIDTypes.join(', ')}`);
			}
		}
		*/

		if (config.product === 'ekyc_smartselfie' && !config.partner_details) {
			throw new Error('SmileIdentity: Please provide Partner Details via the `partner_details` attribute');
		}

		requiredPartnerDetails.forEach(param => {
			if (!config.partner_details[param]) {
				throw new Error(`SmileIdentity: Please include ${param} in the "partner_details" object`);
			}
		});

		return true;
	}

	function publishConfigToIFrame(config) {
		const targetWindow = document.querySelector("[name='smile-identity-hosted-web-integration']").contentWindow;

		targetWindow.postMessage(JSON.stringify(config), '*');
	}

	function saveConfig(config) {
		localStorage.setItem('SmileIdentityConfig', JSON.stringify(config));
	}

	function SmileIdentity(config) {
		const configIsValid = isConfigValid(config);

		if (configIsValid) {
			createIframe(config.product);

			setTimeout(() => publishConfigToIFrame(config), 2000);
			saveConfig(config);

			window.addEventListener('message', (event) => {
				const data = event.data;

				switch (data) {
					case 'SmileIdentity::Close':
						return closeIFrame(config);
						break;
					case 'SmileIdentity::Success':
						return handleSuccess(config);
						break;
					case 'SmileIdentity::ConsentDenied':
						return handleConsentRejection(config);
						break;
					default:
						return;
					}
				}, false);
		}
	}

	return SmileIdentity;
}();
