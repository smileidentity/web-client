import JSZip from 'jszip';
import '@smileid/web-components/smart-camera-web';
import {
  setCurrentLocale,
  translate,
  getDirection,
} from '@smileid/web-components/localisation';
import { version as sdkVersion } from '../../package.json';
import { getMetadata } from './metadata';
import { getHeaders, getZipSignature } from './request';

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyPageTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      try {
        const translation = translate(key);
        if (translation) {
          element.textContent = translation;
        }
      } catch (error) {
        console.error(`Translation failed for key: ${key}`, error);
      }
    }
  });
}

(function enhancedDocumentVerification() {
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
  let productConstraints;

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

  async function getProductConstraints() {
    try {
      const response = await fetch(
        `${getEndpoint(config.environment)}/services`,
      );
      const json = await response.json();

      return json.hosted_web.enhanced_document_verification;
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
        await setCurrentLocale(config.translation?.language || 'en');
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

        productConstraints = await getProductConstraints();
        initializeSession(productConstraints);
        getPartnerParams();
      }
    },
    false,
  );

  function initializeSession(constraints) {
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
    // this is to mimic the behavior of the old hosted web integration
    SmartCameraWeb.setAttribute('hide-back-of-id', true);
    const supportedCountries = Object.keys(constraints)
      .map((countryCode) => ({
        code: countryCode,
        name: constraints[countryCode].name,
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
      const selectedCountryList = Object.keys(config.id_selection);
      validCountries = supportedCountries.filter((value) =>
        selectedCountryList.includes(value),
      );

      if (validCountries.length === 1) {
        const selectedCountry = validCountries[0];
        id_info = {
          country: validCountries[0],
        };

        const idTypes = config.id_selection[selectedCountry];
        if (idTypes.length === 1 || typeof idTypes === 'string') {
          id_info.id_type = Array.isArray(idTypes) ? idTypes[0] : idTypes;

          // ACTION: set initial screen
          SmartCameraWeb.setAttribute('document-type', id_info.id_type);
          // ACTION: set document capture mode
          if (config.document_capture_modes) {
            SmartCameraWeb.setAttribute(
              'document-capture-modes',
              config.document_capture_modes.join(','),
            );
          }
          // Hide the back button that takes the user back to the id selection screen
          // from startcamera web
          SmartCameraWeb.setAttribute('hide-back-to-host', true);
          // this is to mimic the behavior of the old hosted web integration
          SmartCameraWeb.setAttribute('hide-back-of-id', true);
          setActiveScreen(SmartCameraWeb);
        }
      }
    } else {
      validCountries = supportedCountries;
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
            productConstraints[countryCode].id_types,
          );
          const validIDTypes = config.id_selection
            ? config.id_selection[countryCode]
            : constrainedIDTypes;
          const selectedIDTypes = validIDTypes.filter((value) =>
            constrainedIDTypes.includes(value),
          );

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
              productConstraints[countryCode].id_types[IDType].label;
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

      // ACTION: Load Countries as <option>s
      validCountries.forEach((country) => {
        const countryObject = productConstraints[country];

        if (countryObject) {
          const option = document.createElement('option');
          option.setAttribute('value', country);
          option.textContent = constraints[country].name;

          if (id_info && id_info.country && country === id_info.country) {
            option.setAttribute('selected', true);
            selectCountry.value = country;
            selectCountry.disabled = true;
            loadIdTypes(country);
          }

          selectCountry.appendChild(option);
        }
      });

      selectCountry.addEventListener('change', (e) => {
        loadIdTypes(e.target.value);
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

        SmartCameraWeb.setAttribute('document-type', selectedIDType);
        // ACTION: set document capture mode
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

  // eslint-disable-next-line no-unused-vars
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

  CloseIframeButtons.forEach((button) => {
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
    }
  }

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
        job_type: 11,
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
    [referenceWindow.parent, referenceWindow].forEach((win) => {
      if (win) {
        win.postMessage(message, '*');
      }
    });
  }

  function handleSuccess() {
    [referenceWindow.parent, referenceWindow].forEach((win) => {
      if (win) {
        win.postMessage('SmileIdentity::Success', '*');
      }
    });
  }
})();
