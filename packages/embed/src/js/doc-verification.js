import '@smileid/web-components/combobox';
import '@smileid/web-components/smart-camera-web';
import {
  setCurrentLocale,
  t,
  getDirection,
} from '@smileid/web-components/localisation';

import JSZip from 'jszip';
import { version as sdkVersion } from '../../package.json';
import { getMetadata } from './metadata';
import { getHeaders, getZipSignature } from './request';

(function documentVerification() {
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

  let config;
  let activeScreen;
  let id_info;
  let images;
  let partner_params;

  const LoadingScreen = document.querySelector('#loading-screen');
  const SelectIDType = document.querySelector('#select-id-type');
  const SmartCameraWeb = document.querySelector('smart-camera-web');
  const UploadProgressScreen = document.querySelector(
    '#upload-progress-screen',
  );
  const UploadFailureScreen = document.querySelector('#upload-failure-screen');
  const CompleteScreen = document.querySelector('#complete-screen');

  const CloseIframeButtons = document.querySelectorAll('.close-iframe');
  const RetryUploadButton = document.querySelector('#retry-upload');

  let fileToUpload;
  let uploadURL;

  function applyPageTranslations() {
    // Apply translations to all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const translation = t(key);

      // For elements with child SVGs (buttons), preserve the SVG
      const svg = element.querySelector('svg');
      if (svg) {
        // Clear text nodes only, preserve SVG
        Array.from(element.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.remove();
          }
        });
        element.insertBefore(document.createTextNode(translation), svg);
      } else {
        element.textContent = translation;
      }
    });

    // Close button accessibility text
    CloseIframeButtons.forEach((button) => {
      const srText = button.querySelector('.visually-hidden');
      if (srText) srText.textContent = t('common.closeVerificationFrame');
    });
  }

  async function getProductConstraints() {
    const payload = {
      token: config.token,
      partner_id: config.partner_details.partner_id,
    };

    const fetchConfig = {
      cache: 'no-cache',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(
        `${getEndpoint(config.environment)}/valid_documents`,
        fetchConfig,
      );
      const json = await response.json();

      return json.valid_documents;
    } catch (e) {
      throw new Error('Failed to get supported ID types', { cause: e });
    }
  }

  async function getLegacyProductConstraints() {
    const fetchConfig = {
      cache: 'no-cache',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    };

    try {
      const response = await fetch(
        `${getEndpoint(config.environment)}/services`,
        fetchConfig,
      );
      const json = await response.json();

      return json.hosted_web.doc_verification;
    } catch (e) {
      throw new Error('Failed to get supported ID types', { cause: e });
    }
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
        try {
          const language = config.translation?.language || 'en-GB';
          await setCurrentLocale(language);
          document.documentElement.lang = language;
          document.documentElement.dir = getDirection();
          applyPageTranslations();
        } catch (error) {
          console.error(
            `SmileIdentity - Failed to set locale: ${error.message}`,
          );
        }
        // this makes the main content visible after translations are applied and prevents the flash of untranslated content
        document.querySelector('main').hidden = false;

        LoadingScreen.querySelector('.credits').hidden =
          config.hide_attribution;
        const attributions = document.querySelectorAll('.credits');
        Array.prototype.forEach.call(attributions, (attribution) => {
          attribution.hidden = config.hide_attribution;
        });

        activeScreen = LoadingScreen;

        const productConstraints = await getProductConstraints();
        initializeSession(productConstraints);
        getPartnerParams();
      }
    },
    false,
  );

  function loadCountrySelector(countries, placeholderElement) {
    const isSingleCountry = countries.length === 1;

    const autocomplete = document.createElement('smileid-combobox');
    autocomplete.setAttribute('id', 'country');
    autocomplete.innerHTML = `
      <smileid-combobox-trigger
        ${isSingleCountry ? 'disabled' : ''}
        ${isSingleCountry ? `value="${countries[0].name}"` : ''}
        label="${t('pages.idSelection.searchCountry')}">
      </smileid-combobox-trigger>

      <smileid-combobox-listbox empty-label="${t('pages.idSelection.noCountryFound')}">
        ${countries
          .map(
            (country) =>
              `
            <smileid-combobox-option ${
              isSingleCountry ? 'aria-selected="true" ' : ''
            }value="${country.code}" label="${country.name}">
              ${country.name}
            </smileid-combobox-option>
          `,
          )
          .join('\n')}
      </smileid-combobox-listbox>
    `;

    placeholderElement.replaceWith(autocomplete);

    return autocomplete;
  }

  function loadIdTypeSelector(idTypes) {
    const isSingleIdType = idTypes.length === 1;
    const idTypeSelector = document.querySelector('#id-type-selector');

    let combobox = document.querySelector('smileid-combobox[id="id_type"]');
    if (!combobox) {
      combobox = document.createElement('smileid-combobox');
      combobox.setAttribute('id', 'id_type');
    }

    combobox.innerHTML = `
      <smileid-combobox-trigger
        ${isSingleIdType ? 'disabled' : ''}
        ${isSingleIdType ? `value="${idTypes[0].name}"` : ''}
        label="${t('pages.idSelection.selectDocument')}"
        type="button"
      >
      </smileid-combobox-trigger>

      <smileid-combobox-listbox empty-label="${t('pages.idSelection.noIdTypeFound')}">
        ${idTypes
          .map(
            (idType) =>
              `
            <smileid-combobox-option value="${idType.code}__${idType.name}" label="${
              idType.name
            }">
              <div>
                <p>${idType.name}</p>
                ${
                  idType.name === 'Others' ||
                  (idType.example && idType.example.length > 1)
                    ? `<small>${
                        idType.example.length > 1 ? 'e.g. ' : ''
                      }${idType.example.join(', ')}</small>`
                    : ''
                }
              </div>
            </smileid-combobox-option>
          `,
          )
          .join('\n')}
      </smileid-combobox-listbox>
    `;

    if (idTypeSelector.hidden) {
      idTypeSelector.appendChild(combobox);
      idTypeSelector.removeAttribute('hidden');
    }

    return combobox;
  }

  async function initializeSession(constraints) {
    let selectedCountry;
    let selectedIdType;
    let selectedIdName;

    SmartCameraWeb.setAttribute('allow-agent-mode', config.allow_agent_mode);
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

    function loadIdTypes(countryCode) {
      const countryIdTypes = constraints.find(
        (item) => item.country.code === countryCode,
      ).id_types;

      if (config.id_selection) {
        const result = countryIdTypes.filter((idType) => {
          return config.id_selection[countryCode].find((validIdType) => {
            if (validIdType === '' || validIdType.toLowerCase() === 'others') {
              return !idType.code;
            }
            return validIdType === idType.code;
          });
        });
        return result;
      }

      return countryIdTypes;
    }

    function initialiseIdTypeSelector(country, selectIdType) {
      const idTypes = loadIdTypes(country);
      const idTypeSelector = loadIdTypeSelector(idTypes, selectIdType);
      idTypeSelector.addEventListener('combobox.change', (e) => {
        const details = (e.detail ? e.detail.value : '').split('__');
        selectedIdType = details[0];
        selectedIdName = details[1];
      });
    }

    const supportedCountries = constraints
      .map(({ country: { name, code } }) => ({
        code,
        name,
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

    if (config.id_selection) {
      /**
       * when id selection list is made, we have two sources for id_types:
       *  1. `valid_documents`, the new approach
       *  2. `services`, the old approach
       *
       * what we want to do is extend the `valid_documents` entries with the
       * entries from `services` that are not present.
       *
       * the steps to do that are:
       * 1. Get the legacyConstraints
       * 2. Add the absent entries to the new constraints `id_types` in the same
       *       format
       */
      const legacyConstraints = await getLegacyProductConstraints();
      Object.keys(config.id_selection).forEach((countryCode) => {
        /**
         * 1. find out if the country code is in the new constraints list
         * 2. find out if the id_type is in the id_types list
         *   2.1. if in the list, continue
         *   2.3. if not in the list, log a deprecated message, and add it
         */
        const isCountrySupported = supportedCountries.includes(countryCode);

        if (!isCountrySupported) {
          throw new Error(
            `SmileIdentity - ${t('pages.error.countryNotSupported', { country: countryCode })}`,
          );
        }

        const countryIndex = constraints.findIndex(
          (entry) => entry.country.code === countryCode,
        );

        config.id_selection[countryCode].forEach((idSelectionIdType) => {
          const isIdTypeSupported = constraints[countryIndex].id_types.find(
            (constrainedIdType) => idSelectionIdType === constrainedIdType.code,
          );

          if (isIdTypeSupported) return;
          console.error(
            `SmileIdentity - ${countryCode}-${idSelectionIdType} has been deprecated`,
          );
          if (idSelectionIdType.toLowerCase() !== 'others') {
            constraints[countryIndex].id_types.push({
              code: idSelectionIdType,
              has_back: false,
              name: legacyConstraints[countryCode].id_types[idSelectionIdType]
                .label,
            });
          }
        });
      });

      const selectedCountryList = Object.keys(config.id_selection);
      validCountries = supportedCountries.filter((value) =>
        selectedCountryList.includes(value),
      );

      if (validCountries.length === 1) {
        selectedCountry = validCountries[0];
        id_info = {
          country: validCountries[0],
        };

        const idTypes = config.id_selection[selectedCountry];

        if (
          (idTypes.length === 1 || typeof idTypes === 'string') &&
          !(idTypes.includes('IDENTITY_CARD') && selectedCountry === 'ZA')
        ) {
          id_info.id_type = Array.isArray(idTypes) ? idTypes[0] : idTypes;

          const countryConstraints = constraints.find(
            (entry) => entry.country.code === selectedCountry,
          );
          const countryConstraint = Array.isArray(countryConstraints)
            ? countryConstraints[0]
            : countryConstraints;
          const documentCaptureConfig = countryConstraint.id_types.find(
            (entry) => entry.code === id_info.id_type,
          );

          // ACTION: set initial screen
          SmartCameraWeb.setAttribute('document-type', id_info.id_type);
          // ACTION: set document capture mode
          if (!documentCaptureConfig.has_back) {
            SmartCameraWeb.setAttribute('hide-back-of-id', true);
          }

          if (config.document_capture_modes) {
            SmartCameraWeb.setAttribute(
              'document-capture-modes',
              config.document_capture_modes.join(','),
            );
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

    const countries = validCountries.map((countryCode) => {
      const countryObject = constraints.find(
        (entry) => entry.country.code === countryCode,
      ).country;

      return {
        code: countryCode,
        name: countryObject.name,
      };
    });

    if (!id_info || id_info.id_type === undefined) {
      const selectCountry = SelectIDType.querySelector('#country');
      const hostedWebConfigForm = document.querySelector(
        'form[name="hosted-web-config"]',
      );

      // ACTION: Enable Country Selection
      selectCountry.disabled = false;

      // ACTION: Enable select screen
      setActiveScreen(SelectIDType);

      // ACTION: Load Countries using combobox
      const countrySelector = loadCountrySelector(countries, selectCountry);
      countrySelector.addEventListener('combobox.change', (e) => {
        selectedCountry = e.detail ? e.detail.value : '';

        // ACTION: Load id types using combobox
        initialiseIdTypeSelector(selectedCountry);
      });

      if (id_info && id_info.country) {
        selectedCountry = id_info.country;

        // ACTION: Load id types using combobox
        initialiseIdTypeSelector(selectedCountry);
      }

      hostedWebConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // ACTION: set up `id_info`
        id_info = {
          country: selectedCountry,
          id_type: selectedIdType,
        };

        SmartCameraWeb.setAttribute('document-type', selectedIdType);
        const documentCaptureConfig = constraints
          .find((entry) => entry.country.code === selectedCountry)
          .id_types.find(
            (entry) =>
              entry.code === selectedIdType && entry.name === selectedIdName,
          );

        // ACTION: set document capture mode
        if (documentCaptureConfig.has_back) {
          SmartCameraWeb.setAttribute('capture-id', 'back');
        }
        if (!documentCaptureConfig.has_back) {
          SmartCameraWeb.setAttribute('hide-back-of-id', true);
        }
        if (config.document_capture_modes) {
          SmartCameraWeb.setAttribute(
            'document-capture-modes',
            config.document_capture_modes.join(','),
          );
        }
        setActiveScreen(SmartCameraWeb);
      });
    }
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
      setActiveScreen(UploadProgressScreen);
      handleFormSubmit(event);
    },
    false,
  );

  SmartCameraWeb.addEventListener(
    'smart-camera-web.cancelled',
    () => {
      setActiveScreen(SelectIDType);
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

  RetryUploadButton.addEventListener(
    'click',
    () => {
      retryUpload();
    },
    false,
  );

  CloseIframeButtons?.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        closeWindow(true);
      },
      false,
    );
  });

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
    node.hidden = false;
    activeScreen = node;
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const errorMessage = document.querySelector('.validation-message');
    if (errorMessage) errorMessage.remove();

    try {
      event.target.disabled = true;
      [uploadURL, fileToUpload] = await Promise.all([
        getUploadURL(),
        createZip(),
      ]);

      uploadZip(fileToUpload, uploadURL);
      event.target.disabled = false;
    } catch (error) {
      event.target.disabled = false;
      displayErrorMessage(t('pages.error.generic'));
      console.error(
        `SmileIdentity - ${error.name || error.message}: ${error.cause}`,
      );
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
        job_type: 6,
      },
      metadata: getMetadata(),
    };

    const fetchConfig = {
      cache: 'no-cache',
      mode: 'cors',
      headers: {
        ...(await getHeaders(payload, config.partner_details.partner_id)),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    };

    const URL = `${getEndpoint(config.environment)}/upload`;

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
    (referenceWindow.parent || referenceWindow).postMessage(message, '*');
  }

  function handleSuccess() {
    [referenceWindow.parent, referenceWindow].forEach((win) => {
      if (win) {
        win.postMessage('SmileIdentity::Success', '*');
      }
    });
  }
})();
