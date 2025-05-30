import JSZip from 'jszip';
import '@smileid/web-components/smart-camera-web';
import { version as sdkVersion } from '../../package.json';
import { getMetadata } from './metadata';

(function SmartSelfie() {
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

  const labels = {
    2: {
      title: 'SmartSelfie™ Authentication',
      upload: 'Authenticating User',
    },
    4: {
      title: 'SmartSelfie™ Registration',
      upload: 'Registering User',
    },
  };
  let config;
  let activeScreen;
  let id_info;
  let images;
  let partner_params;

  const SmartCameraWeb = document.querySelector('smart-camera-web');
  const UploadProgressScreen = document.querySelector(
    '#upload-progress-screen',
  );
  const UploadFailureScreen = document.querySelector('#upload-failure-screen');
  const CompleteScreen = document.querySelector('#complete-screen');

  const CloseIframeButton = document.querySelector('#close-iframe');
  const RetryUploadButton = document.querySelector('#retry-upload');

  let fileToUpload;
  let uploadURL;

  window.addEventListener(
    'message',
    async (event) => {
      if (
        event.data &&
        typeof event.data === 'string' &&
        event.data.includes('SmileIdentity::Configuration')
      ) {
        config = JSON.parse(event.data);

        CloseIframeButton.setAttribute('hidden', true);
        partner_params = getPartnerParams();
        id_info = {};

        SmartCameraWeb.setAttribute(
          'allow-agent-mode',
          config.allow_agent_mode,
        );
        SmartCameraWeb.setAttribute(
          'theme-color',
          config.partner_details.theme_color,
        );

        if (config.hide_attribution) {
          const attributions = document.querySelectorAll('.credits');
          Array.prototype.forEach.call(attributions, (attribution) => {
            attribution.hidden = config.hide_attribution;
          });
          SmartCameraWeb.setAttribute('hide-attribution', true);
        }
        setActiveScreen(SmartCameraWeb);
      }
    },
    false,
  );

  SmartCameraWeb.addEventListener(
    'smart-camera-web.publish',
    (event) => {
      images = event.detail.images;
      const title = document.querySelector('#uploadTitle');
      title.innerHTML = labels[`${partner_params.job_type}`].upload;
      setActiveScreen(UploadProgressScreen);
      handleFormSubmit();
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

  CloseIframeButton?.addEventListener(
    'click',
    () => {
      closeWindow(true);
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

  SmartCameraWeb.addEventListener(
    'smart-camera-web.cancelled',
    () => {
      closeWindow(true);
    },
    false,
  );

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

  function getPartnerParams() {
    const { partner_params: partnerParams } = parseJWT(config.token);
    partner_params = { ...partnerParams, ...(config.partner_params || {}) };
    return partner_params;
  }

  function setActiveScreen(node) {
    if (activeScreen) activeScreen.hidden = true;
    node.hidden = false;
    activeScreen = node;
  }

  async function handleFormSubmit() {
    const errorMessage = document.querySelector('.validation-message');
    if (errorMessage) errorMessage.remove();

    try {
      [uploadURL, fileToUpload] = await Promise.all([
        getUploadURL(),
        createZip(),
      ]);
      uploadZip(fileToUpload, uploadURL);
    } catch (error) {
      displayErrorMessage('Something went wrong');
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

    zip.file(
      'info.json',
      JSON.stringify({
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
      }),
    );

    try {
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
      partner_params,
      metadata: getMetadata(),
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

    const URL = `${getEndpoint(config.environment)}/upload`;

    const response = await fetch(URL, fetchConfig);
    const json = await response.json();

    if (json.error) throw new Error(json.error);

    return json.upload_url;
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
    (referenceWindow.parent || referenceWindow).postMessage(
      'SmileIdentity::Success',
      '*',
    );
  }
})();
