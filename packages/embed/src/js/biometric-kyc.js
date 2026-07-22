import * as Sentry from '@sentry/browser';
import JSZip from 'jszip';
import validate from '@smileid/web-components/validate';
import '@smileid/web-components/end-user-consent';
import '@smileid/web-components/smart-camera-web';
import {
  setCurrentLocale,
  translate,
  translateHtml,
  getDirection,
  getCurrentLocale,
} from '@smileid/web-components/localisation';
import { version as sdkVersion } from '../../package.json';
import { getMetadata } from './metadata';
import { installActiveLivenessTimeout } from './activeLivenessTimeout';
import { getHeaders, getZipSignature } from './request';
import {
  hasIdInfo,
  allowsModification,
  shouldSkipSelection,
  idInfoToIdSelection,
  applyIdInfoPrefill,
} from './id-info-utils.js';
import {
  buildInitApiFailure,
  captureInitApiFailure,
} from './init-api-sentry.js';
import { fetchWithTimeout } from './fetch-with-retry.js';
import initIframeSentry from './sentry-iframe-init.js';
import createOidcRedirect from './oidc/oidcRedirect';

initIframeSentry('biometric-kyc');

// Expose Sentry on the iframe window so the standalone `smart-camera-web`
// web component (which has no @sentry/browser dep of its own) can report
// camera-init failures via `window.Sentry?.captureException`.
window.Sentry = Sentry;

(function biometricKyc() {
  'use strict';

  // NOTE: In order to support prior integrations, we have `live` and
  // `production` pointing to the same URL
  const endpoints = {
    sandbox: 'https://testapi.smileidentity.com/v1',
    live: 'https://api.smileidentity.com/v1',
    production: 'https://api.smileidentity.com/v1',
  };

  const getEndpoint = (environment) =>
    endpoints[environment] || `${environment}/v1`;

  const referenceWindow = window.parent;
  referenceWindow.postMessage('SmileIdentity::ChildPageReady', '*');

  const pages = [];
  let activeScreen;
  let config;
  let consent_information;
  let EndUserConsent;
  let id_info;
  let images;
  let partner_params;
  let productConstraints;

  const LoadingScreen = document.querySelector('#loading-screen');
  const SelectIDType = document.querySelector('#select-id-type');
  const SmartCameraWeb = document.querySelector('smart-camera-web');
  const IDInfoForm = document.querySelector('#id-info');
  const OidcRedirect = document.querySelector('#oidc-redirect');
  const UploadProgressScreen = document.querySelector(
    '#upload-progress-screen',
  );
  const UploadFailureScreen = document.querySelector('#upload-failure-screen');
  const CompleteScreen = document.querySelector('#complete-screen');

  const CloseIframeButtons = document.querySelectorAll('.close-iframe');
  const RetryUploadButton = document.querySelector('#retry-upload');
  let disableBackOnFirstScreen = false;

  let fileToUpload;
  let uploadURL;
  let skipInputScreen = false;

  async function postData(url = '', data = {}, shouldSignPayload = false) {
    return fetchWithTimeout(
      url,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          ...(shouldSignPayload &&
            (await getHeaders(data, config.partner_details.partner_id))),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      10000,
    );
  }

  async function getProductConstraints() {
    // iOS Safari (especially iOS 18+) intermittently fails with
    // "TypeError: Load failed" — a transient network-level error that almost
    // always succeeds on retry. Retry up to 2 times (3 total attempts) with
    // linear backoff (1 s, 2 s). HTTP failures (initApiFailure !== null) are
    // deterministic and are never retried.
    const MAX_ATTEMPTS = 3;
    // Reason: cache the parsed products_config across attempts so a transient
    // /services failure doesn't re-issue the (possibly side-effecting)
    // /products_config POST that already succeeded.
    let cachedPartnerConstraints = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Captured at the point we know which response.ok was false so the catch
      // below can attach response-level detail to the Sentry event. Null when
      // the failure is a promise rejection (network drop, abort, etc.) rather
      // than a non-OK HTTP response.
      let initApiFailure = null;
      try {
        const productsConfigPayload = {
          partner_id: config.partner_details.partner_id,
          token: config.token,
          partner_params,
        };

        const productsConfigUrl = `${getEndpoint(
          config.environment,
        )}/products_config`;
        const locale = getCurrentLocale();
        const servicesUrl = new URL(
          `${getEndpoint(config.environment)}/services`,
        );
        if (locale) {
          servicesUrl.searchParams.append('locale', locale);
        }

        let partnerConstraints;
        let servicesResponse;
        if (cachedPartnerConstraints) {
          // products_config already succeeded on a prior attempt; only retry
          // the /services leg.
          partnerConstraints = cachedPartnerConstraints;
          servicesResponse = await fetchWithTimeout(
            servicesUrl.toString(),
            {},
            10000,
          );
          if (!servicesResponse.ok) {
            initApiFailure = {
              failedRequests: ['services'],
              productsConfigStatus: 200,
              servicesStatus: servicesResponse.status,
            };
            throw new Error('Failed to get supported ID types');
          }
        } else {
          const productsConfigPromise = postData(
            productsConfigUrl,
            productsConfigPayload,
          );
          const servicesPromise = fetchWithTimeout(
            servicesUrl.toString(),
            {},
            10000,
          );
          const [productsConfigResponse, servicesResp] = await Promise.all([
            productsConfigPromise,
            servicesPromise,
          ]);
          servicesResponse = servicesResp;
          if (!productsConfigResponse.ok || !servicesResponse.ok) {
            initApiFailure = buildInitApiFailure(
              productsConfigResponse,
              servicesResponse,
            );
            throw new Error('Failed to get supported ID types');
          }
          partnerConstraints = await productsConfigResponse.json();
          cachedPartnerConstraints = partnerConstraints;
        }
        const generalConstraints = await servicesResponse.json();

        const previewBvnMfa = config.previewBVNMFA;
        if (previewBvnMfa) {
          generalConstraints.hosted_web.biometric_kyc.NG.id_types.BVN_MFA = {
            id_number_regex: '^[0-9]{11}$',
            label: 'Bank Verification Number (with OTP)',
            required_fields: [
              'country',
              'id_type',
              'session_id',
              'user_id',
              'job_id',
            ],
            test_data: '00000000000',
          };
        }

        return {
          partnerConstraints,
          generalConstraints: generalConstraints.hosted_web.biometric_kyc,
        };
      } catch (e) {
        // HTTP failures have initApiFailure !== null — deterministic, never
        // retry. Network-level failures are tagged by `fetchWithTimeout` with
        // `.isNetworkError = true`; downstream errors (JSON parse TypeError,
        // property access on undefined, etc.) are not flagged and are
        // surfaced immediately.
        const isNetworkError =
          initApiFailure === null && e && e.isNetworkError === true;
        if (!isNetworkError || attempt === MAX_ATTEMPTS) {
          captureInitApiFailure(e, initApiFailure);
          throw new Error('Failed to get supported ID types', { cause: e });
        }
        // Linear backoff: 1 s, then 2 s before the third attempt.
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  function applyPageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        try {
          el.textContent = translate(key);
        } catch (e) {
          console.error(`Translation failed for key: ${key}`, e);
        }
      }
    });
  }

  window.addEventListener(
    'message',
    async (event) => {
      if (
        event.data &&
        typeof event.data === 'string' &&
        event.data.includes('SmileIdentity::Configuration')
      ) {
        config = JSON.parse(event.data);
        // Tag every Sentry event from this iframe context with partner_id and
        // environment. The parent script.js tags the parent window's Sentry
        // hub, but this iframe runs in its own JS context with its own hub —
        // without these tags, errors from this page are unattributable.
        if (config.partner_details?.partner_id) {
          Sentry.setTag('partner_id', config.partner_details.partner_id);
        }
        if (config.environment) {
          Sentry.setTag('environment', config.environment);
        }
        await setCurrentLocale(config.translation?.language || 'en', {
          locales: config.translation?.locales,
        });
        document.documentElement.dir = getDirection();
        applyPageTranslations();
        document.querySelector('main').hidden = false;

        LoadingScreen.querySelector('.credits').hidden =
          config.hide_attribution;
        const attributions = document.querySelectorAll('.credits');
        Array.prototype.forEach.call(attributions, (attribution) => {
          attribution.hidden = config.hide_attribution;
        });

        activeScreen = LoadingScreen;

        getPartnerParams();
        try {
          const { partnerConstraints, generalConstraints } =
            await getProductConstraints();
          productConstraints = generalConstraints;
          initializeSession(generalConstraints, partnerConstraints);
        } catch (e) {
          (referenceWindow.parent || referenceWindow).postMessage(
            'SmileIdentity::Error',
            '*',
          );
        }
      }
    },
    false,
  );

  // ET NATIONAL_ID (Fayda) is verified through an OIDC handshake at the
  // national IdP instead of a partner-typed ID form. Unlike enhanced KYC,
  // the handshake runs after the SmartCamera selfie capture — see the
  // 'smart-camera-web.publish' handler below.
  function idTypeUsesOidc(country, idType) {
    return country === 'ET' && idType === 'NATIONAL_ID';
  }

  function setInitialScreen(partnerConstraints) {
    const { country: selectedCountry, id_type: selectedIDType } = id_info;

    if (config.hide_attribution) {
      SmartCameraWeb.setAttribute('hide-attribution', true);
    }

    const selectedIdRequiresConsent = partnerConstraints.consentRequired[
      selectedCountry
    ]
      ? partnerConstraints.consentRequired[selectedCountry].includes(
          selectedIDType,
        )
      : false;
    if (
      selectedIdRequiresConsent ||
      config.consent_required ||
      config.demo_mode
    ) {
      const IDRequiresConsent =
        selectedIdRequiresConsent ||
        (config.consent_required &&
          config.consent_required[selectedCountry] &&
          config.consent_required[selectedCountry].includes(selectedIDType));

      if (IDRequiresConsent || config.demo_mode) {
        customizeConsentScreen();
        setActiveScreen(EndUserConsent);
      } else {
        SmartCameraWeb.setAttribute('hide-back-to-host', true);
        setActiveScreen(SmartCameraWeb);
      }
    } else {
      SmartCameraWeb.setAttribute('hide-back-to-host', true);
      setActiveScreen(SmartCameraWeb);
    }

    customizeForm();
  }

  function initializeSession(generalConstraints, partnerConstraints) {
    SmartCameraWeb.setAttribute(
      'allow-agent-mode',
      config.use_strict_mode ? false : config.allow_agent_mode,
    );
    if (config.allow_legacy_selfie_fallback) {
      SmartCameraWeb.setAttribute('allow-legacy-selfie-fallback', true);
    }
    if (config.use_strict_mode) {
      SmartCameraWeb.setAttribute('use-strict-mode', 'true');
    }
    installActiveLivenessTimeout(SmartCameraWeb, {
      enabled: !!config.use_strict_mode,
    });
    if (hasThemeColor()) {
      SmartCameraWeb.setAttribute(
        'theme-color',
        config.partner_details.theme_color,
      );

      const root = document.documentElement;

      root.style.setProperty(
        '--color-default',
        config.partner_details.theme_color,
      );
    }

    if (config.hide_attribution) {
      SmartCameraWeb.setAttribute('hide-attribution', true);
    }

    if (config.new_instructions) {
      SmartCameraWeb.setAttribute('new-instructions', true);
    }

    const supportedCountries = Object.keys(generalConstraints)
      .map((countryCode) => ({
        code: countryCode,
        name: generalConstraints[countryCode].name,
      }))
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      })
      .map((item) => item.code);

    let validCountries = [];

    // id_info takes precedence over id_selection
    const useIdInfo = hasIdInfo(config);
    const effectiveIdSelection = useIdInfo
      ? idInfoToIdSelection(config.id_info)
      : config.id_selection;

    if (useIdInfo) {
      const { shouldSkip, country, idType } = shouldSkipSelection(
        config.id_info,
      );

      validCountries = supportedCountries.filter((value) =>
        Object.keys(effectiveIdSelection).includes(value),
      );

      if (shouldSkip) {
        id_info = { country, id_type: idType };
        disableBackOnFirstScreen = true;
        setInitialScreen(partnerConstraints);
      } else if (validCountries.length === 1) {
        id_info = { country: validCountries[0] };
      }
    } else if (effectiveIdSelection) {
      validCountries = supportedCountries.filter((value) =>
        Object.keys(effectiveIdSelection).includes(value),
      );

      if (validCountries.length === 1) {
        const selectedCountry = validCountries[0];
        id_info = {
          country: validCountries[0],
        };

        const idTypes = effectiveIdSelection[selectedCountry];
        if (idTypes.length === 1 || typeof idTypes === 'string') {
          id_info.id_type = Array.isArray(idTypes) ? idTypes[0] : idTypes;
          disableBackOnFirstScreen = true;
          // ACTION: set initial screen
          setInitialScreen(partnerConstraints);
        }
      }
    } else {
      validCountries = Object.keys(
        partnerConstraints.idSelection.biometric_kyc,
      );
    }

    if (!id_info || !id_info.id_type) {
      const selectCountry = SelectIDType.querySelector('#country');
      const selectIDType = SelectIDType.querySelector('#id_type');
      const hostedWebConfigForm = document.querySelector(
        'form[name="hosted-web-config"]',
      );

      // ACTION: Enable Country Selection
      selectCountry.disabled = false;

      // ACTION: Enable select screen
      setActiveScreen(SelectIDType);

      const loadIdTypes = (countryCode) => {
        if (countryCode) {
          const constrainedIDTypes = Object.keys(
            generalConstraints[countryCode].id_types,
          );
          const idSelectionSource =
            effectiveIdSelection &&
            effectiveIdSelection[countryCode] &&
            effectiveIdSelection[countryCode].length > 0
              ? effectiveIdSelection
              : partnerConstraints.idSelection.biometric_kyc;
          const selectedIDTypes = (
            idSelectionSource[countryCode] || constrainedIDTypes
          ).filter((value) => constrainedIDTypes.includes(value));

          // ACTION: Reset ID Type <select>
          selectIDType.innerHTML = '';
          const initialOption = document.createElement('option');
          initialOption.setAttribute('value', '');
          initialOption.textContent = translate(
            'pages.idSelection.placeholder',
          );
          selectIDType.appendChild(initialOption);

          // ACTION: Load ID Types as <option>s
          selectedIDTypes.forEach((IDType) => {
            const option = document.createElement('option');
            option.setAttribute('value', IDType);
            option.textContent =
              generalConstraints[countryCode].id_types[IDType].label;
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
          option.textContent = translate(
            'pages.idSelection.selectCountryFirst',
          );
          selectIDType.appendChild(option);
        }
      };

      selectCountry.addEventListener('change', (e) => {
        loadIdTypes(e.target.value);
      });

      // ACTION: Load Countries as <option>s
      validCountries.forEach((country) => {
        const countryObject = generalConstraints[country];
        if (countryObject) {
          const option = document.createElement('option');
          option.setAttribute('value', country);
          option.textContent = countryObject.name;

          if (id_info && id_info.country && country === id_info.country) {
            option.setAttribute('selected', true);
            selectCountry.value = country;
            selectCountry.disabled = true;
            loadIdTypes(country);
          }

          selectCountry.appendChild(option);
        }
      });

      hostedWebConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedCountry = selectCountry.value;
        const selectedIDType = selectIDType.value;

        // ACTION: set up `id_info`
        id_info = {
          country: selectedCountry,
          id_type: selectedIDType,
        };

        // ACTION: set initial screen
        setInitialScreen(partnerConstraints);
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
    script.src = 'js/demo-ekyc-smartselfie.min.js';

    document.body.appendChild(script);
  }

  function hasThemeColor() {
    return (
      config.partner_details.theme_color &&
      ![null, undefined, 'null', 'undefined'].includes(
        config.partner_details.theme_color,
      )
    );
  }

  SmartCameraWeb.addEventListener(
    'smart-camera-web.publish',
    (event) => {
      images = event.detail.images;
      // The OIDC handshake runs after the selfie capture: the biometric-kyc
      // processor needs a captured selfie to face-match against the IdP's
      // picture claim, and the /upload zip includes the id_info that carries
      // `openid_state`.
      if (idTypeUsesOidc(id_info.country, id_info.id_type)) {
        handleOidcFlow();
        return;
      }
      const idRequiresTOTPConsent = ['BVN_MFA'].includes(id_info.id_type);
      if (idRequiresTOTPConsent || skipInputScreen) {
        handleFormSubmit();
      } else {
        setActiveScreen(IDInfoForm);
      }
    },
    false,
  );

  SmartCameraWeb.addEventListener(
    'smart-camera-web.cancelled',
    () => {
      SmartCameraWeb.reset();
      const page = pages.pop();
      setActiveScreen(page);
    },
    false,
  );

  SmartCameraWeb.addEventListener(
    'smart-camera-web.close',
    () => {
      closeWindow(true);
    },
    false,
  );

  IDInfoForm.querySelector('#submitForm').addEventListener(
    'click',
    (event) => {
      handleFormSubmit(event);
    },
    false,
  );

  IDInfoForm.querySelector('#back-button').addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      const page = pages.pop();
      if (page === SmartCameraWeb) {
        page.reset();
      }
      setActiveScreen(page);
    },
    false,
  );

  RetryUploadButton.addEventListener(
    'click',
    () => {
      retryUpload();
    },
    false,
  );

  CloseIframeButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        closeWindow(true);
      },
      false,
    );
  });

  function customizeConsentScreen() {
    const partnerDetails = config.partner_details;

    const main = document.querySelector('main');
    EndUserConsent = document.querySelector('end-user-consent');
    if (EndUserConsent) {
      main.removeChild(EndUserConsent);
    }
    EndUserConsent = document.createElement('end-user-consent');
    EndUserConsent.setAttribute('base-url', getEndpoint(config.environment));
    EndUserConsent.setAttribute('country', id_info.country);
    EndUserConsent.setAttribute(
      'id-regex',
      productConstraints[id_info.country].id_types[id_info.id_type]
        .id_number_regex,
    );
    EndUserConsent.setAttribute('id-type', id_info.id_type);
    EndUserConsent.setAttribute(
      'id-type-label',
      productConstraints[id_info.country].id_types[id_info.id_type].label,
    );
    EndUserConsent.setAttribute('partner-id', partnerDetails.partner_id);
    EndUserConsent.setAttribute('partner-name', partnerDetails.name);
    EndUserConsent.setAttribute('partner-logo', partnerDetails.logo_url);
    EndUserConsent.setAttribute('policy-url', partnerDetails.policy_url);
    EndUserConsent.setAttribute('theme-color', partnerDetails.theme_color);
    EndUserConsent.setAttribute('token', config.token);
    if (config.hide_attribution) {
      EndUserConsent.setAttribute('hide-attribution', true);
    }
    if (disableBackOnFirstScreen) {
      EndUserConsent.setAttribute('hide-back-to-host', true);
    }

    if (config.demo_mode) {
      EndUserConsent.setAttribute('demo-mode', config.demo_mode);
      localStorage.setItem(
        'SmileIdentityConstraints',
        JSON.stringify(productConstraints, null, 2),
      );
      initiateDemoMode();
    }

    EndUserConsent.addEventListener(
      'end-user-consent.cancelled',
      () => {
        setActiveScreen(SelectIDType);
      },
      false,
    );

    EndUserConsent.addEventListener(
      'end-user-consent.totp.cancelled',
      () => {
        setActiveScreen(SelectIDType);
      },
      false,
    );

    EndUserConsent.addEventListener(
      'end-user-consent.granted',
      (event) => {
        consent_information = event.detail;

        if (consent_information.consented.personal_details) {
          id_info.consent_information = consent_information;
          setActiveScreen(SmartCameraWeb);
        }
      },
      false,
    );

    EndUserConsent.addEventListener(
      'end-user-consent.totp.granted',
      (event) => {
        consent_information = event.detail;

        if (consent_information.consented.personal_details) {
          id_info.id_number = consent_information.id_number;
          id_info.session_id = consent_information.session_id;
          id_info.consent_information = consent_information;
          setActiveScreen(SmartCameraWeb);
        }
      },
      false,
    );

    EndUserConsent.addEventListener(
      'end-user-consent.denied',
      () => {
        (referenceWindow.parent || referenceWindow).postMessage(
          'SmileIdentity::ConsentDenied',
          '*',
        );
        closeWindow();
      },
      false,
    );

    EndUserConsent.addEventListener(
      'end-user-consent.totp.denied.contact-methods-outdated',
      () => {
        (referenceWindow.parent || referenceWindow).postMessage(
          'SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated',
          '*',
        );
        closeWindow();
      },
      false,
    );

    main.appendChild(EndUserConsent);
  }

  function customizeForm() {
    setGuideTextForIDType();
    const result = setFormInputs();
    if (result === 'skip') {
      skipInputScreen = true;
    }
  }

  function setGuideTextForIDType() {
    const label = document.querySelector('[for="id_number"]');
    const input = document.querySelector('#id_number');

    label.innerHTML =
      productConstraints[id_info.country].id_types[id_info.id_type].label;
    input.setAttribute(
      'placeholder',
      productConstraints[id_info.country].id_types[id_info.id_type].test_data,
    );
    input.setAttribute(
      'pattern',
      productConstraints[id_info.country].id_types[id_info.id_type]
        .id_number_regex,
    );
  }

  function setFormInputs() {
    const requiredFields =
      productConstraints[id_info.country].id_types[id_info.id_type]
        .required_fields;
    const idTypeConstraints =
      productConstraints[id_info.country].id_types[id_info.id_type];

    const showIdNumber = requiredFields.some((fieldName) =>
      fieldName.includes('id_number'),
    );

    if (showIdNumber) {
      const IdNumber = IDInfoForm.querySelector('div#id-number');
      IdNumber.hidden = false;
    }

    const showNames = requiredFields.some((fieldName) =>
      fieldName.includes('name'),
    );

    if (showNames) {
      const Names = IDInfoForm.querySelector('fieldset#names');
      Names.hidden = false;
    }

    const showDOB = requiredFields.some((fieldName) =>
      fieldName.includes('dob'),
    );

    if (showDOB) {
      const DOB = IDInfoForm.querySelector('fieldset#dob');
      DOB.hidden = false;
    }

    // Handle pre-filled data from id_info param
    const { action, mergedFields } = applyIdInfoPrefill({
      config,
      country: id_info.country,
      idType: id_info.id_type,
      formElement: IDInfoForm,
      requiredFields,
      idTypeConstraints,
    });

    if (action === 'skip') {
      Object.assign(id_info, mergedFields);
      return 'skip';
    }

    return 'show';
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
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return `%${c.charCodeAt(0).toString(16)}`;
          })
          .join(''),
      );

      return JSON.parse(jsonPayload);
    }

    const { partner_params: partnerParams } = parseJWT(config.token);

    partner_params = { ...partnerParams, ...(config.partner_params || {}) };
  }

  function setActiveScreen(node) {
    activeScreen.hidden = true;
    pages.push(activeScreen);
    node.hidden = false;
    activeScreen = node;
  }

  function resetForm() {
    const invalidElements = IDInfoForm.querySelectorAll('[aria-invalid]');
    invalidElements.forEach((el) => el.removeAttribute('aria-invalid'));

    const validationMessages = document.querySelectorAll('.validation-message');
    validationMessages.forEach((el) => el.remove());
  }

  // Map field names to their translation keys
  const fieldTranslationKeys = {
    id_number: 'pages.idInfo.idNumber',
    first_name: 'pages.idInfo.firstName',
    last_name: 'pages.idInfo.lastName',
    day: 'pages.idInfo.day',
    month: 'pages.idInfo.month',
    year: 'pages.idInfo.year',
  };

  function getTranslatedValidationMessage(field) {
    const fieldKey = fieldTranslationKeys[field];
    const fieldLabel = fieldKey ? translate(fieldKey) : field;
    return translateHtml('pages.validation.isRequired', { field: fieldLabel });
  }

  function getTranslatedFormatMessage(field) {
    const fieldKey = fieldTranslationKeys[field];
    const fieldLabel = fieldKey ? translate(fieldKey) : field;
    return translateHtml('pages.validation.invalidFormat', {
      field: fieldLabel,
    });
  }

  function validateInputs(payload) {
    const validationConstraints = {};

    const requiredFields =
      productConstraints[id_info.country].id_types[id_info.id_type]
        .required_fields;

    const showIdNumber = requiredFields.some((fieldName) =>
      fieldName.includes('id_number'),
    );

    if (showIdNumber) {
      validationConstraints.id_number = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('id_number')}`,
        },
        format: {
          pattern: new RegExp(
            productConstraints[id_info.country].id_types[
              id_info.id_type
            ].id_number_regex,
          ),
          message: `^${getTranslatedFormatMessage('id_number')}`,
        },
      };
    }

    const showNames = requiredFields.some((fieldName) =>
      fieldName.includes('name'),
    );

    if (showNames) {
      validationConstraints.first_name = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('first_name')}`,
        },
      };
      validationConstraints.last_name = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('last_name')}`,
        },
      };
    }

    const showDOB = requiredFields.some((fieldName) =>
      fieldName.includes('dob'),
    );

    if (showDOB) {
      validationConstraints.day = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('day')}`,
        },
      };
      validationConstraints.month = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('month')}`,
        },
      };
      validationConstraints.year = {
        presence: {
          allowEmpty: false,
          message: `^${getTranslatedValidationMessage('year')}`,
        },
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

      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('id', `${field}-hint`);
      errorDiv.setAttribute('class', 'validation-message');
      errorDiv.textContent = errors[field][0];

      input.insertAdjacentElement('afterend', errorDiv);
    });
  }

  async function handleFormSubmit(event) {
    if (event && event.target) event.target.disabled = true;

    if (event) {
      event.preventDefault();
      resetForm();
    }

    const form = IDInfoForm.querySelector('form');

    let payload;
    if (skipInputScreen) {
      // Skip path: form was never shown, use id_info directly
      payload = { ...id_info };
    } else {
      // Non-skip path: merge form data over id_info (user may have edited fields)
      const formData = new FormData(form);
      payload = { ...id_info, ...Object.fromEntries(formData.entries()) };
    }

    const isInvalid = validateInputs(payload);

    if (isInvalid && (!skipInputScreen || allowsModification(config))) {
      if (event && event.target) event.target.disabled = false;
      return;
    }

    id_info = {
      dob: `${payload.year}-${payload.month}-${payload.day}`,
      entered: true,
      ...payload,
      ...id_info,
    };

    try {
      [uploadURL, fileToUpload] = await Promise.all([
        getUploadURL(),
        createZip(),
      ]);

      uploadZip(fileToUpload, uploadURL);
    } catch (error) {
      displayErrorMessage(translate('pages.error.generic'));
      console.error(
        `SmileIdentity - ${error.name || error.message}: ${error.cause}`,
      );
    } finally {
      if (event && event.target) event.target.disabled = false;
    }
  }

  function displayErrorMessage(message) {
    const p = document.createElement('p');

    p.textContent = message;
    p.classList.add('validation-message');
    p.style.fontSize = '1.5rem';
    p.style.textAlign = 'center';

    const main = document.querySelector('main');
    main.prepend(p);
  }

  function oidcErrorCopy(result) {
    if (!result) return translate('pages.oidc.genericError');
    if (result.message === 'timeout') return translate('pages.oidc.timeout');
    if (result.message === 'closed') return translate('pages.oidc.closed');
    if (result.error === 'access_denied') {
      return translate('pages.oidc.declined');
    }
    return translate('pages.oidc.genericError');
  }

  async function completeOidcFlow(state) {
    // The popup exchange already persisted the claims server-side; the
    // upload zip's info.json only carries `openid_state` so the biometric-kyc
    // processor can read them and skip the partner-typed ID form entirely.
    id_info = { ...id_info, openid_state: state, entered: false };
    [uploadURL, fileToUpload] = await Promise.all([
      getUploadURL(),
      createZip(),
    ]);
    uploadZip(fileToUpload, uploadURL);
  }

  function reportOidcError(result) {
    [referenceWindow.parent, referenceWindow].forEach((win) => {
      if (!win) return;
      const outbound =
        result && result.message === 'SmileIdentity::OidcCallback::Error'
          ? result
          : {
              message: 'SmileIdentity::OidcCallback::Error',
              state: result && result.state,
              error: result && result.message,
            };
      win.postMessage(outbound, '*');
    });
  }

  function handleOidcFlow() {
    if (activeScreen !== OidcRedirect) {
      setActiveScreen(OidcRedirect);
    }

    const launchPanel = OidcRedirect.querySelector('#oidc-launch');
    const loadingPanel = OidcRedirect.querySelector('#oidc-loading');
    const preparingText = OidcRedirect.querySelector('#oidc-preparing');
    const waitingText = OidcRedirect.querySelector('#oidc-waiting');
    const popupBlockedPanel = OidcRedirect.querySelector('#oidc-popup-blocked');
    const errorPanel = OidcRedirect.querySelector('#oidc-error');
    const continueButton = OidcRedirect.querySelector('#oidc-continue-button');
    const retryButton = OidcRedirect.querySelector('#oidc-retry-button');

    const oidc = createOidcRedirect(config, {
      country: id_info.country,
      product: 'biometric_kyc',
    });

    // Pre-launch: show a spinner while the authorize URL is fetched. The
    // Continue button only appears once we hold a link (see the prefetch
    // chain below), so the user can't click before there's anywhere to send
    // the popup.
    function showPreparing() {
      launchPanel.hidden = true;
      popupBlockedPanel.hidden = true;
      errorPanel.hidden = true;
      errorPanel.textContent = '';
      preparingText.hidden = false;
      waitingText.hidden = true;
      loadingPanel.hidden = false;
    }

    // The link is ready: reveal the explanation + Continue button. The popup
    // is opened by the button click so `window.open` runs inside a user
    // gesture — the one condition popup blockers honour.
    function showLaunchButton() {
      loadingPanel.hidden = true;
      popupBlockedPanel.hidden = true;
      errorPanel.hidden = true;
      launchPanel.hidden = false;
    }

    // `retryable` keeps the launch panel (and its Continue button) visible so
    // it doubles as a retry — clicking it re-runs `oidc.launch()`, which
    // re-fetches the authorize URL. `report` gates the partner-facing
    // OidcCallback::Error: a pre-click prefetch failure is recoverable and the
    // user hasn't attempted anything yet, so we don't emit a terminal error
    // event until an actual launch fails.
    function showError(result, { retryable = false, report = true } = {}) {
      launchPanel.hidden = !retryable;
      loadingPanel.hidden = true;
      popupBlockedPanel.hidden = true;
      errorPanel.hidden = false;
      errorPanel.textContent = oidcErrorCopy(result);
      if (report) {
        reportOidcError(result);
      }
    }

    function showPopupBlocked() {
      launchPanel.hidden = true;
      loadingPanel.hidden = true;
      popupBlockedPanel.hidden = false;
      [referenceWindow.parent, referenceWindow].forEach((win) => {
        if (win) {
          win.postMessage(
            { message: 'SmileIdentity::OidcCallback::PopupBlocked' },
            '*',
          );
        }
      });
    }

    // Show the spinner up front and prefetch the authorize URL. Reveal the
    // Continue button only once we hold a link. On failure, surface the error
    // with the button as retry (it re-fetches), and hold the partner error
    // event until the user actually attempts a launch.
    showPreparing();
    oidc
      .prefetch()
      .then(showLaunchButton)
      .catch((error) => showError(error, { retryable: true, report: false }));

    // Synchronous: opens the popup inside this gesture, then awaits the
    // callback. Used for both the primary Continue button and the
    // popup-blocked retry.
    async function launch() {
      launchPanel.hidden = true;
      popupBlockedPanel.hidden = true;
      errorPanel.hidden = true;
      errorPanel.textContent = '';
      preparingText.hidden = true;
      waitingText.hidden = false;
      loadingPanel.hidden = false;
      try {
        const { state } = await oidc.launch();
        await completeOidcFlow(state);
      } catch (result) {
        if (result && result.message === 'popup_blocked') {
          showPopupBlocked();
          return;
        }
        showError(result);
      }
    }

    continueButton.onclick = launch;
    retryButton.onclick = launch;
  }

  OidcRedirect.querySelector('#oidc-back-button').addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      const page = pages.pop();
      if (page === SmartCameraWeb) {
        page.reset();
      }
      setActiveScreen(page);
    },
    false,
  );

  async function createZip() {
    const zip = new JSZip();

    const infoJson = JSON.stringify({
      package_information: {
        language: 'Hosted Web Integration',
        apiVersion: {
          buildNumber: 0,
          majorVersion: 2,
          minorVersion: 0,
        },
      },
      id_info,
      images,
    });
    zip.file('info.json', infoJson);
    const fileDataForMac = [infoJson];

    try {
      const securityInfo = await getZipSignature(
        fileDataForMac,
        config.partner_details.partner_id,
      );

      zip.file('security_info.json', JSON.stringify(securityInfo));

      const zipFile = await zip.generateAsync({ type: 'blob' });
      return zipFile;
    } catch (error) {
      throw new Error('createZip failed', { cause: error });
    }
  }

  async function getUploadURL() {
    const payload = {
      source_sdk: config.sdk || 'hosted_web',
      source_sdk_version: config.sdk_version || sdkVersion,
      file_name: `${config.product}.zip`,
      smile_client_id: config.partner_details.partner_id,
      callback_url: config.callback_url,
      token: config.token,
      partner_params: {
        ...partner_params,
        job_type: 1,
      },
      metadata: getMetadata(),
    };

    const URL = `${getEndpoint(config.environment)}/upload`;

    try {
      const response = await postData(URL, payload, true);
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

    const request = new XMLHttpRequest();
    request.open('PUT', destination);

    request.upload.addEventListener('load', function () {
      return request.response;
    });

    request.upload.addEventListener('error', function (e) {
      setActiveScreen(UploadFailureScreen);
      throw new Error('uploadZip failed', { cause: e });
    });

    request.onreadystatechange = function () {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        const countryName = productConstraints[id_info.country].name;
        const idTypeName =
          productConstraints[id_info.country].id_types[id_info.id_type].label;

        const thankYouMessage =
          CompleteScreen.querySelector('#thank-you-message');
        thankYouMessage.innerHTML = translateHtml(
          'pages.complete.processingInfo',
          { country: countryName, idType: idTypeName },
        );

        setActiveScreen(CompleteScreen);
        handleSuccess();
        window.setTimeout(closeWindow, 2000);
      }
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status !== 200
      ) {
        setActiveScreen(UploadFailureScreen);
        throw new Error('uploadZip failed', { cause: request });
      }
    };

    request.setRequestHeader('Content-type', 'application/zip');
    request.send(file);
  }

  function retryUpload() {
    const fileUploaded = uploadZip(fileToUpload, uploadURL);

    return fileUploaded;
  }

  function closeWindow(userTriggered) {
    const message = userTriggered
      ? 'SmileIdentity::Close'
      : 'SmileIdentity::Close::System';
    [referenceWindow.parent, referenceWindow].forEach((win) =>
      win.postMessage(message, '*'),
    );
  }

  function handleSuccess() {
    [referenceWindow.parent, referenceWindow].forEach((win) => {
      if (win) {
        win.postMessage('SmileIdentity::Success', '*');
      }
    });
  }
})();
