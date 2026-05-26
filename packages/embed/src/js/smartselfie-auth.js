import * as Sentry from '@sentry/browser';
import JSZip from 'jszip';
import '@smileid/web-components/smart-camera-web';
import {
  setCurrentLocale,
  translate,
  getDirection,
} from '@smileid/web-components/localisation';
import { version as sdkVersion } from '../../package.json';
import { getMetadata } from './metadata';
import { installActiveLivenessTimeout } from './activeLivenessTimeout';
import { getHeaders, getZipSignature } from './request';

// Expose Sentry on the iframe window so the standalone `smart-camera-web`
// web component (which has no @sentry/browser dep of its own) can report
// camera-init failures via `window.Sentry?.captureException`.
window.Sentry = Sentry;

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

  // Translation keys for job types
  const labelKeys = {
    2: {
      title: 'pages.smartSelfie.authentication.title',
      upload: 'pages.smartSelfie.authentication.upload',
    },
    4: {
      title: 'pages.smartSelfie.registration.title',
      upload: 'pages.smartSelfie.registration.upload',
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

        CloseIframeButton.setAttribute('hidden', true);
        partner_params = getPartnerParams();
        id_info = {};

        SmartCameraWeb.setAttribute(
          'allow-agent-mode',
          config.use_strict_mode ? false : config.allow_agent_mode,
        );
        SmartCameraWeb.setAttribute(
          'theme-color',
          config.partner_details.theme_color,
        );

        if (config.partner_details.name) {
          SmartCameraWeb.setAttribute(
            'partner-name',
            config.partner_details.name,
          );
        }
        if (config.partner_details.logo_url) {
          SmartCameraWeb.setAttribute(
            'partner-logo',
            config.partner_details.logo_url,
          );
        }
        if (config.partner_details.policy_url) {
          SmartCameraWeb.setAttribute(
            'policy-url',
            config.partner_details.policy_url,
          );
        }

        if (config.allow_legacy_selfie_fallback) {
          SmartCameraWeb.setAttribute('allow-legacy-selfie-fallback', true);
        }

        if (config.use_strict_mode) {
          SmartCameraWeb.setAttribute('use-strict-mode', 'true');
        }

        if (config.show_navigation) {
          SmartCameraWeb.setAttribute('show-navigation', '');
        }

        if (config.hide_attribution) {
          const attributions = document.querySelectorAll('.credits');
          Array.prototype.forEach.call(attributions, (attribution) => {
            attribution.hidden = config.hide_attribution;
          });
          SmartCameraWeb.setAttribute('hide-attribution', true);
        }
        installActiveLivenessTimeout(SmartCameraWeb, {
          enabled: !!config.use_strict_mode,
        });
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
      const jobType = partner_params.job_type;
      title.textContent = translate(labelKeys[jobType].upload);
      // In strict mode the Enhanced SmartSelfie component renders its own
      // submitting / success / error screens, so we must NOT switch to the
      // legacy `Registering User` upload screen — the host just signals
      // submission progress via a window event the ESS listens for.
      if (!config.use_strict_mode) {
        setActiveScreen(UploadProgressScreen);
      } else {
        window.dispatchEvent(
          new CustomEvent('enhanced-smartselfie.submission-state', {
            detail: { state: 'submitting' },
          }),
        );
      }
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

  // Strict-mode (Enhanced SmartSelfie) end-of-flow signals: ESS shows its own
  // success / error screens and dispatches these window events when the user
  // taps Continue / Exit. We mirror the legacy behaviour: close the iframe.
  window.addEventListener('enhanced-smartselfie.continue', () => {
    closeWindow(true);
  });
  window.addEventListener('enhanced-smartselfie.exit', () => {
    closeWindow(true);
  });

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
      if (config.use_strict_mode) {
        // ESS owns the post-submit UI. Surface the failure via the same
        // submission-state event the upload XHR uses so the user lands on
        // the proper "Submission Failed" screen instead of getting a stray
        // "Something went wrong" banner above the still-spinning view.
        window.dispatchEvent(
          new CustomEvent('enhanced-smartselfie.submission-state', {
            detail: {
              state: 'error',
              message: translate('pages.error.generic'),
            },
          }),
        );
      } else {
        displayErrorMessage(translate('pages.error.generic'));
      }
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
      partner_params,
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
      if (config.use_strict_mode) {
        window.dispatchEvent(
          new CustomEvent('enhanced-smartselfie.submission-state', {
            detail: { state: 'error' },
          }),
        );
      } else {
        setActiveScreen(UploadFailureScreen);
      }
      throw new Error('uploadZip failed', { cause: e });
    });

    request.onreadystatechange = function () {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        if (config.use_strict_mode) {
          window.dispatchEvent(
            new CustomEvent('enhanced-smartselfie.submission-state', {
              detail: { state: 'success' },
            }),
          );
        } else {
          setActiveScreen(CompleteScreen);
        }
        handleSuccess();
        if (!config.use_strict_mode) {
          window.setTimeout(closeWindow, 2000);
        }
      }
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status !== 200
      ) {
        if (config.use_strict_mode) {
          window.dispatchEvent(
            new CustomEvent('enhanced-smartselfie.submission-state', {
              detail: { state: 'error' },
            }),
          );
        } else {
          setActiveScreen(UploadFailureScreen);
        }
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
