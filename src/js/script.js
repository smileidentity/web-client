/**
* SmileIdentity - Creates an instance of the Smile Identity Web Integration
* @function
* @param { Object } config - the configuration object
* @param { string } config.token - token generated on the server side using the
* `get_web_token` method in one of our server-to-server libraries
* @param { string } config.callback_url - callback URL for responses
* @param { string } config.environment - one of `sandbox` or `production`
* @param { string } config.product - one of the product types,
* @param { Object } config.partner_details - partner details for customization
* @param { string } config.partner_details.name - name to display on the widget
* @param { string } config.partner_details.policy_url - URL for data privacy
	policy
* @param { string } config.partner_details.partner_id - partner_id for the
	organization
* @param { string } config.partner_details.theme_color - accent color for links in a css compliant color format
* @param { string } config.partner_details.logo_url - URL for a logo image,
	preferably in 1:1 aspect ratio
* @param { Object } [config.id_selection=all our [supported id types / countries]{@link https://docs.smileidentity.com/general/supported-id-types}] - a mapping of country code to a selection of supported id types
* e.g. { 'NG': ['BVN', 'NIN'] }
* @param { Object } [config.consent_required=none of our [supported id types / countries]{@link https://docs.smileidentity.com/general/supported-id-types}] - a mapping of country code to a selection of supported id types
* e.g. { 'NG': ['BVN', 'NIN'] }
* N.B.: This controls the display of the screen for the provision of end-user
	consent. Ensure that your authorization matches this in the sandbox
	environment before publishing to end users
*/
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
		if (product === 'biometric_kyc' || product === 'ekyc_smartselfie') {
			return './../biometric-kyc.html';
		} else if (product === 'enhanced_kyc') {
			return './../ekyc.html';
		} else if (product === 'authentication' || product === 'smartselfie') {
			return './../smartselfie-auth.html';
		} else if (product === 'doc_verification') {
			return './../doc-verification.html';
		} else if (product === 'basic_kyc' || product === 'identity_verification') {
			return './../basic-kyc.html';
		}

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

	function handleConsentRejection(config, error) {
		if (config.onError) {
			config.onError(error);
		}
	}

	const requiredPartnerDetails = ['name', 'logo_url', 'partner_id', 'policy_url', 'theme_color'];

	function isConfigValid(config) {
		if (!config.token) throw new Error('SmileIdentity: Please provide your web token via the `token` attribute');
		if (!config.callback_url) throw new Error('SmileIdentity: Please provide a callback URL via the `callback_url` attribute');
		if (!config.product) throw new Error('SmileIdentity: Please select a product via the `product` attribute.');

		if ((config.product === 'biometric_kyc' || config.product === 'ekyc_smartselfie') && !config.partner_details) {
			throw new Error('SmileIdentity: Please provide Partner Details via the `partner_details` attribute');
		}

		if ((config.product === 'biometric_kyc' || config.product === 'ekyc_smartselfie') && config.partner_details) {
			requiredPartnerDetails.forEach(param => {
				if (!config.partner_details[param]) {
					throw new Error(`SmileIdentity: Please include ${param} in the "partner_details" object`);
				}
			});
		}

		if (config.document_capture_mode && !['camera', 'upload'].includes(config.document_capture_mode)) {
			throw new Error('SmileIdentity: document_capture_mode must be one of `camera` or `upload`');
		}

		return true;
	}

	function publishConfigToIFrame(config) {
		const targetWindow = document.querySelector("[name='smile-identity-hosted-web-integration']").contentWindow;
		config.source = 'SmileIdentity::HostedWebIntegration';

		targetWindow.postMessage(JSON.stringify(config), '*');
	}

	function SmileIdentity(config) {
		const configIsValid = isConfigValid(config);

		if (configIsValid) {
			createIframe(config.product);

			setTimeout(() => publishConfigToIFrame(config), 2000);

			window.addEventListener('message', (event) => {
				const tag = event.data.message || event.data;

				switch (tag) {
					case 'SmileIdentity::Close':
						return closeIFrame(config);
						break;
					case 'SmileIdentity::Success':
						return handleSuccess(config);
						break;
					case 'SmileIdentity::ConsentDenied':
					case 'SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated':
						return handleConsentRejection(config, event.data);
						break;
					default:
						return;
				}
			}, false);
		}
	}

	return SmileIdentity;
}();

window.SmileIdentity = SmileIdentity;
