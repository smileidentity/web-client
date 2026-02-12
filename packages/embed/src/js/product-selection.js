(function productSelection() {
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
  let verificationMethodMap;
  let activeScreen;
  const LoadingScreen = document.querySelector('#loading-screen');
  const SelectIdType = document.querySelector('#select-id-type');
  const ConfigForm = document.querySelector('form[name="hosted-web-config"]');
  const CloseIframeButtons = document.querySelectorAll('.close-iframe');

  CloseIframeButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        closeWindow();
      },
      false,
    );
  });

  function setActiveScreen(element) {
    activeScreen.hidden = true;
    element.hidden = false;
    activeScreen = element;
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

    const locale = config.translation?.language;
    const url = new URL(
      `${getEndpoint(config.environment)}/valid_documents`,
    );
    if (locale) {
      url.searchParams.append('locale', locale);
    }

    try {
      const response = await fetch(url.toString(), fetchConfig);
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

    const locale = config.translation?.language;
    const url = new URL(`${getEndpoint(config.environment)}/services`);
    if (locale) {
      url.searchParams.append('locale', locale);
    }

    try {
      const response = await fetch(url.toString(), fetchConfig);
      const json = await response.json();

      return json.hosted_web;
    } catch (e) {
      throw new Error('Failed to get supported ID types', { cause: e });
    }
  }

  function getIdTypeName(
    country,
    id_type,
    productConstraints,
    legacyProductConstraints,
  ) {
    const validDocumentsCountry = productConstraints.find(
      (item) => item.country.code === country,
    );

    if (!validDocumentsCountry) {
      throw new Error(`SmileIdentity - ${country} is not supported`);
    }

    let validIdType = validDocumentsCountry.id_types.find(
      (item) => item.code === id_type,
    );

    if (!validIdType) {
      const legacyValidIdType =
        legacyProductConstraints.doc_verification[country]?.id_types[id_type] ||
        legacyProductConstraints.enhanced_kyc[country]?.id_types[id_type];
      if (legacyValidIdType) {
        validIdType = {
          name: legacyValidIdType.label,
        };
      }
    }

    if (!validIdType) {
      throw new Error(`SmileIdentity - ${country} ${id_type} is not supported`);
    }

    return validIdType.name;
  }

  function transformIdTypesToVerificationMethodMap(
    idTypes,
    productConstraints,
    legacyProductConstraints,
  ) {
    return idTypes.reduce(
      (idSelectionMap, { country, id_type, verification_method }) => {
        idSelectionMap[country] = idSelectionMap[country] || {
          name: productConstraints.find((item) => item.country.code === country)
            ?.country?.name,
          id_types: {},
        };
        idSelectionMap[country].id_types[id_type] = {
          name: getIdTypeName(
            country,
            id_type,
            productConstraints,
            legacyProductConstraints,
          ),
          verification_method,
        };

        return idSelectionMap;
      },
      {},
    );
  }

  function loadIdTypes(
    localVerificationMethodMap,
    idTypeSelector,
    countryCode,
  ) {
    if (countryCode) {
      // ACTION: Reset ID Type <select>
      idTypeSelector.innerHTML = '';
      const initialOption = document.createElement('option');
      initialOption.setAttribute('value', '');
      initialOption.textContent = '--Please Select--';
      idTypeSelector.appendChild(initialOption);

      // ACTION: Load ID Types as <option>s
      const idTypes = Object.keys(
        localVerificationMethodMap[countryCode].id_types,
      );
      const isSingleIdType = idTypes.length === 1;
      idTypes.forEach((idType) => {
        const option = document.createElement('option');
        option.setAttribute('value', idType);
        option.textContent =
          localVerificationMethodMap[countryCode].id_types[idType].name;

        if (isSingleIdType) {
          option.setAttribute('selected', true);
        }

        idTypeSelector.appendChild(option);
      });

      // ACTION: Enable ID Type Selection
      idTypeSelector.disabled = false;
    } else {
      // ACTION: Reset ID Type <select>
      idTypeSelector.innerHTML = '';

      // ACTION: Load the default <option>
      const option = document.createElement('option');
      option.disabled = true;
      option.setAttribute('value', '');
      option.textContent = '--Select Country First--';
      idTypeSelector.appendChild(option);
    }
  }

  function getVerificationMethod(country, id_type) {
    return verificationMethodMap[country].id_types[id_type].verification_method;
  }

  function initializeForm(form, localVerificationMethodMap) {
    const countrySelector = form.querySelector('#country');
    const idTypeSelector = form.querySelector('#id_type');

    countrySelector.addEventListener('change', (e) => {
      loadIdTypes(localVerificationMethodMap, idTypeSelector, e.target.value);
    });

    const countries = Object.keys(localVerificationMethodMap);
    const isSingleCountry = countries.length === 1;
    countries.forEach((countryCode) => {
      const country = localVerificationMethodMap[countryCode];

      const option = document.createElement('option');
      option.setAttribute('value', countryCode);
      option.textContent = country.name;

      if (isSingleCountry) {
        option.setAttribute('selected', true);
        loadIdTypes(localVerificationMethodMap, idTypeSelector, countryCode);
      }

      countrySelector.appendChild(option);
    });

    countrySelector.disabled = false;
    setActiveScreen(form);
  }

  function getSiteURL() {
    const urlParts = location.href.split('/');
    const url = urlParts.slice(0, -1).join('/');
    return `${url}/`;
  }

  function getIFrameURL(product) {
    switch (product) {
      case 'biometric_kyc':
        return 'biometric-kyc.html';
      case 'doc_verification':
        return 'doc-verification.html';
      case 'enhanced_document_verification':
        return 'enhanced-document-verification.html';
      case 'enhanced_kyc':
        return 'ekyc.html';
      default:
        throw new Error('Unsupported product');
    }
  }

  function createIframe(productName) {
    const iframe = document.createElement('iframe');

    iframe.setAttribute('src', `${getSiteURL()}${getIFrameURL(productName)}`);
    iframe.setAttribute(
      'id',
      'smile-identity-hosted-web-integration-post-product-selection',
    );
    iframe.setAttribute(
      'name',
      'smile-identity-hosted-web-integration-post-product-selection',
    );
    iframe.setAttribute(
      'data-cy',
      'smile-identity-hosted-web-integration-post-product-selection',
    );
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

  function closeWindow() {
    (referenceWindow.parent || referenceWindow).postMessage(
      'SmileIdentity::Close',
      '*',
    );
  }

  function publishMessage() {
    const targetWindow = document.querySelector(
      "[name='smile-identity-hosted-web-integration-post-product-selection']",
    ).contentWindow;
    config.source = 'SmileIdentity::Configuration';

    targetWindow.postMessage(JSON.stringify(config), '*');
  }

  function setProductPage(selectedCountry, selectedIdType) {
    config.id_selection = {};
    config.id_selection[selectedCountry] = [selectedIdType];
    config.product = getVerificationMethod(selectedCountry, selectedIdType);

    createIframe(config.product);
  }

  ConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedCountry = ConfigForm.querySelector('#country').value;
    const selectedIdType = ConfigForm.querySelector('#id_type').value;

    setProductPage(selectedCountry, selectedIdType);
  });

  window.addEventListener(
    'message',
    async (event) => {
      if (
        event.data &&
        typeof event.data === 'string' &&
        event.data.includes('SmileIdentity')
      ) {
        if (event.data.includes('SmileIdentity::Configuration')) {
          config = JSON.parse(event.data);

          LoadingScreen.querySelector('.credits').hidden =
            config.hide_attribution;
          const attributions = document.querySelectorAll('.credits');
          Array.prototype.forEach.call(attributions, (attribution) => {
            attribution.hidden = config.hide_attribution;
          });

          activeScreen = LoadingScreen;

          const constraintsPromises = [
            getProductConstraints(),
            getLegacyProductConstraints(),
          ];
          const [productConstraints, legacyConstraints] =
            await Promise.all(constraintsPromises);
          verificationMethodMap = transformIdTypesToVerificationMethodMap(
            config.id_types,
            productConstraints,
            legacyConstraints,
          );
          initializeForm(SelectIdType, verificationMethodMap);
        } else if (event.data.includes('SmileIdentity::ChildPageReady')) {
          publishMessage(config);
        }
      } else {
        referenceWindow.postMessage(event.detail || event.data, '*');
      }
    },
    false,
  );
})();
