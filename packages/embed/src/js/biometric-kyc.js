import JSZip from 'jszip';
import validate from 'validate.js';
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
import { getHeaders, getZipSignature } from './request';
import {
  hasIdInfo,
  isStrictMode,
  extractIdInfoData,
  validatePrefilledFields,
  parseDOB,
  shouldSkipSelection,
  idInfoToIdSelection,
} from './id-info-utils.js';

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
    return fetch(url, {
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
    });
  }

  async function getProductConstraints() {
    try {
      const productsConfigPayload = {
        partner_id: config.partner_details.partner_id,
        token: config.token,
        partner_params,
      };

      const productsConfigUrl = `${getEndpoint(
        config.environment,
      )}/products_config`;
      const productsConfigPromise = postData(
        productsConfigUrl,
        productsConfigPayload,
      );
      const locale = getCurrentLocale();
      const servicesUrl = new URL(
        `${getEndpoint(config.environment)}/services`,
      );
      if (locale) {
        servicesUrl.searchParams.append('locale', locale);
      }
      const servicesPromise = fetch(servicesUrl.toString());
      const [productsConfigResponse, servicesResponse] = await Promise.all([
        productsConfigPromise,
        servicesPromise,
      ]);

      if (productsConfigResponse.ok && servicesResponse.ok) {
        const partnerConstraints = await productsConfigResponse.json();
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
      }
      throw new Error('Failed to get supported ID types');
    } catch (e) {
      throw new Error('Failed to get supported ID types', { cause: e });
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
        const { partnerConstraints, generalConstraints } =
          await getProductConstraints();
        productConstraints = generalConstraints;
        initializeSession(generalConstraints, partnerConstraints);
      }
    },
    false,
  );

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
    SmartCameraWeb.setAttribute('allow-agent-mode', config.allow_agent_mode);
    if (config.allow_legacy_selfie_fallback) {
      SmartCameraWeb.setAttribute('allow-legacy-selfie-fallback', true);
    }
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
    if (hasIdInfo(config)) {
      const prefilledData = extractIdInfoData(
        config.id_info,
        id_info.country,
        id_info.id_type,
      );

      if (prefilledData) {
        // Expand DOB if provided as single string
        let expandedData = { ...prefilledData };
        if (prefilledData.dob && typeof prefilledData.dob === 'string') {
          const parsed = parseDOB(prefilledData.dob);
          if (parsed) {
            expandedData = { ...expandedData, ...parsed };
          }
        }

        const validation = validatePrefilledFields(
          expandedData,
          requiredFields,
          idTypeConstraints,
        );

        if (validation.allValid || !isStrictMode(config)) {
          // All fields valid, or non-strict mode — pre-fill and skip input screen
          prefillFormFields(expandedData);
          mergePrefilledIntoIdInfo(expandedData);
          return 'skip';
        }

        // Pre-fill valid fields and lock them
        Object.entries(validation.validFields).forEach(([field, value]) => {
          const input = IDInfoForm.querySelector(`#${field}`);
          if (input) {
            input.value = value;
            input.setAttribute('readonly', '');
            input.classList.add('locked-field');
          }
        });

        // Pre-fill invalid fields (editable, with error display)
        Object.entries(validation.invalidFields).forEach(([field, value]) => {
          const input = IDInfoForm.querySelector(`#${field}`);
          if (input) {
            input.value = value;
            input.setAttribute('aria-invalid', 'true');
          }
        });

        // Focus first editable field
        const firstEditable =
          validation.missingFields[0] ||
          Object.keys(validation.invalidFields)[0];
        if (firstEditable) {
          const input = IDInfoForm.querySelector(`#${firstEditable}`);
          if (input) {
            requestAnimationFrame(() => input.focus());
          }
        }
      }
    }

    return 'show';
  }

  function prefillFormFields(data) {
    Object.entries(data).forEach(([field, value]) => {
      if (field === 'dob') return;
      const input = IDInfoForm.querySelector(`#${field}`);
      if (input) {
        input.value = value;
      }
    });
  }

  function mergePrefilledIntoIdInfo(data) {
    Object.entries(data).forEach(([field, value]) => {
      if (field === 'dob') return;
      id_info[field] = value;
    });
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

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const isInvalid = validateInputs(payload);

    if (isInvalid) {
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
