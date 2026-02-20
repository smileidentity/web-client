import * as Sentry from '@sentry/browser';

Sentry.init({
  beforeSend(event) {
    // Check if the error originates from the library's source files
    if (event.exception && event.exception.values) {
      const isLibraryError = event.exception.values.some((exception) => {
        return exception.stacktrace?.frames?.some((frame) =>
          frame.filename.includes('inline/src'),
        );
      });

      // If the error is from the library, send it to Sentry
      if (isLibraryError) {
        return event;
      }
    }
    // Otherwise, do not send the error
    return null;
  },
  dsn: 'https://82cc89f6d5a076c26d3a3cdc03a8d954@o1154186.ingest.us.sentry.io/4507143981236224',
  integrations: [
    Sentry.thirdPartyErrorFilterIntegration({
      filterKeys: ['smileid-web-client'],
      behaviour: 'drop-error-if-contains-third-party-frames',
    }),
  ],
  tracesSampleRate: 0.01,
  tracePropagationTargets: [
    /^https:\/\/links\.usesmileid\.com/,
    /^https:\/\/links\.sandbox\.usesmileid\.com/,
    /^https:\/\/links\.dev\.usesmileid\.com/,
  ],
});

/**
 * A IdTypeVerificationMethod selection
 * @typedef {Object} IdTypeVerificationMethod
 * @property {string} country -
 * @property {string} id_type -
 * @property {string} verification_method - one of the smile identity
 * verification methods
 */

/**
* SmileIdentity - Creates an instance of the Smile Identity Web Integration
* @function
* @param { Object } config - the configuration object
* @param { string } config.token - token generated on the server side using the
* `get_web_token` method in one of our server-to-server libraries
* @param { string } config.callback_url - callback URL for responses
* @param { string } config.environment - one of `sandbox` or `production`
* @param { string } [config.product] - one of the product types,
* @param { Object[] } [config.id_types] - list of the id types and their
* verification_methods
* @param { Object[] } config.id_types[]. - list of the id types and their
* @param { string } config.id_type[].country - 
* @param { string } config.id_type[].id_type - list of the id types and their
* @param { string } config.id_type[].verification_method - one of
* SmileIdentity's verification_methods
* @param { Object } config.partner_details - partner details for customization
* @param { string } config.partner_details.name - name to display on the widget
* @param { string } config.partner_details.policy_url - URL for data privacy
	policy
* @param { string } config.partner_details.partner_id - partner_id for the
	organization
* @param { string } config.partner_details.theme_color - accent color for links in a css compliant color format
* @param { string } config.partner_details.logo_url - URL for a logo image,
	preferably in 1:1 aspect ratio
* @param { Object } [config.partner_params] - optional additional metadata for
* partner organization
* @param { Object } [config.translation] - optional translation configuration
* @param { string } [config.translation.language=en] - the language to use for the UI.
* Supported languages are: en, ar,
* @param { Object } [config.id_selection=all our [supported id types / countries]{@link https://docs.usesmileid.com/general/supported-id-types}] - a mapping of country code to a selection of supported id types
* e.g. { 'NG': ['BVN', 'NIN'] }
* @param { Object } [config.id_info] - a mapping of country code to id types with pre-filled field data.
* Takes precedence over id_selection when both are provided.
* If exactly 1 country + 1 ID type is provided, the selection screen is skipped.
* If all required fields pass validation, the input screen is also skipped.
* e.g. { 'NG': { 'BVN': { id_number: '12345678901', first_name: 'John', last_name: 'Doe', dob: '1990-03-15' } } }
* @param { Object } [config.consent_required=none of our [supported id types / countries]{@link https://docs.usesmileid.com/general/supported-id-types}] - a mapping of country code to a selection of supported id types
* e.g. { 'NG': ['BVN', 'NIN'] }
* N.B.: This controls the display of the screen for the provision of end-user
	consent. Ensure that your authorization matches this in the sandbox
	environment before publishing to end users
*/
window.SmileIdentity = (function () {
  'use strict';

  function getSiteURL() {
    const currentScriptSrc = document.currentScript.src;
    const qualifiedURL = currentScriptSrc.split('script')[0];
    return qualifiedURL;
  }

  const innerConfig = {
    siteURL: getSiteURL(),
  };

  function getIFrameURL(product) {
    Sentry.setTag('product', product);
    switch (product) {
      case 'biometric_kyc':
      case 'ekyc_smartselfie':
        return './../biometric-kyc.html';
      case 'enhanced_kyc':
        return './../ekyc.html';
      case 'authentication':
      case 'smartselfie':
        return './../smartselfie-auth.html';
      case 'doc_verification':
        return './../doc-verification.html';
      case 'enhanced_document_verification':
        return './../enhanced-document-verification.html';
      case 'e_signature':
        return './../e-signature.html';
      case 'basic_kyc':
      case 'identity_verification':
        return './../basic-kyc.html';
      case undefined:
        return './../product-selection.html';
      default:
        throw new Error(
          `SmileIdentity: ${product} is not currently supported in this integration`,
        );
    }
  }

  function createIframe(productName) {
    const iframe = document.createElement('iframe');

    iframe.setAttribute(
      'src',
      `${innerConfig.siteURL}${getIFrameURL(productName)}`,
    );
    iframe.setAttribute('id', 'smile-identity-hosted-web-integration');
    iframe.setAttribute('name', 'smile-identity-hosted-web-integration');
    iframe.setAttribute('data-cy', 'smile-identity-hosted-web-integration');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute(
      'allow',
      'camera; geolocation; encrypted-media; fullscreen',
    );
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

  function closeIFrame(config, userTriggered) {
    const iframe = document.querySelector(
      '#smile-identity-hosted-web-integration',
    );

    iframe?.remove();

    if (config.onClose && userTriggered) {
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

  function handleError(config, error) {
    if (config.onError) {
      config.onError(error);
    }
  }

  const requiredPartnerDetails = [
    'name',
    'logo_url',
    'partner_id',
    'policy_url',
    'theme_color',
  ];

  function isConfigValid(config) {
    if (!config.token)
      throw new Error(
        'SmileIdentity: Please provide your web token via the `token` attribute',
      );
    if (!config.callback_url)
      throw new Error(
        'SmileIdentity: Please provide a callback URL via the `callback_url` attribute',
      );
    if (!config.product && !config.id_types)
      throw new Error(
        'SmileIdentity: Please select a product via the `product` attribute.',
      );

    if (
      (config.product === 'biometric_kyc' ||
        config.product === 'ekyc_smartselfie') &&
      !config.partner_details
    ) {
      throw new Error(
        'SmileIdentity: Please provide Partner Details via the `partner_details` attribute',
      );
    }

    if (
      (config.product === 'biometric_kyc' ||
        config.product === 'ekyc_smartselfie') &&
      config.partner_details
    ) {
      requiredPartnerDetails.forEach((param) => {
        if (!config.partner_details[param]) {
          throw new Error(
            `SmileIdentity: Please include ${param} in the "partner_details" object`,
          );
        }
      });
      Sentry.setTag('partner_id', config.partner_details?.partner_id);
    }

    if (
      config.document_capture_modes &&
      !Array.isArray(config.document_capture_modes)
    ) {
      throw new Error(
        'SmileIdentity: document_capture_modes must be an array containing one of `camera` or `upload`, or both',
      );
    }

    if (config.product === 'e_signature' && !config.document_ids) {
      throw new Error(
        'SmileIdentity: `document_ids` field is required for `e_signature` product type',
      );
    }

    if (
      config.product === 'e_signature' &&
      config.document_ids &&
      !Array.isArray(config.document_ids)
    ) {
      throw new Error(
        'SmileIdentity: `document_ids` must be an array containing ids of documents uploaded for `e_signature`',
      );
    }

    return true;
  }

  function publishConfigToIFrame(config) {
    const targetWindow = document.querySelector(
      "[name='smile-identity-hosted-web-integration']",
    ).contentWindow;
    config.source = 'SmileIdentity::Configuration';

    targetWindow.postMessage(JSON.stringify(config), '*');
  }

  function SmileIdentity(config) {
    try {
      const configIsValid = isConfigValid(config);
      Sentry.setTag('environment', config.environment);
      if (configIsValid) {
        createIframe(config.product);

        window.addEventListener(
          'message',
          (event) => {
            const tag = event.data.message || event.data;

            switch (tag) {
              case 'SmileIdentity::ChildPageReady':
                return publishConfigToIFrame(config);
              case 'SmileIdentity::Close':
                return closeIFrame(config, true);
              case 'SmileIdentity::Close::System':
                return closeIFrame(config, false);
              case 'SmileIdentity::Success':
                return handleSuccess(config);
              case 'SmileIdentity::ConsentDenied':
              case 'SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated':
                return handleConsentRejection(config, event.data);
              case 'SmileIdentity::Error':
                return handleError(config, event.data);
              default:
                return undefined;
            }
          },
          false,
        );
      }
    } catch (error) {
      if (config.onError) {
        config.onError(error.message);
      }
    }
  }

  return SmileIdentity;
})();
