import validate from "validate.js";
import ConsentScreen from "./components/ConsentScreen";
import TotpBasedConsent from "./components/TotpConsentApp";
import { version as sdkVersion } from "../../package.json";

(function eKYC() {
  "use strict";

  // NOTE: In order to support prior integrations, we have `live` and
  // `production` pointing to the same URL
  const endpoints = {
    development: "https://devapi.smileidentity.com/v1",
    sandbox: "https://testapi.smileidentity.com/v1",
    live: "https://api.smileidentity.com/v1",
    production: "https://api.smileidentity.com/v1",
  };

  const referenceWindow = window.parent;
  referenceWindow.postMessage("SmileIdentity::ChildPageReady", "*");
  window.customElements.define("end-user-consent", ConsentScreen);
  window.customElements.define("totp-consent-app", TotpBasedConsent);

  const pages = [];
  let activeScreen;
  let config;
  let consent_information;
  let EndUserConsent;
  let id_info;
  let partner_params;
  let ngBankCodes;
  let productConstraints;

  const LoadingScreen = document.querySelector("#loading-screen");
  const SelectIDType = document.querySelector("#select-id-type");
  const IDInfoForm = document.querySelector("#id-info");
  const CompleteScreen = document.querySelector("#complete-screen");
  let disableBackOnFirstScreen = false;

  const CloseIframeButtons = document.querySelectorAll(".close-iframe");

  function postData(url = "", data = {}) {
    return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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

      const productsConfigUrl = `${
        endpoints[config.environment]
      }/products_config`;
      const productsConfigPromise = postData(
        productsConfigUrl,
        productsConfigPayload,
      );
      const servicesPromise = fetch(
        `${endpoints[config.environment]}/services`,
      );
      const [productsConfigResponse, servicesResponse] = await Promise.all([
        productsConfigPromise,
        servicesPromise,
      ]);

      if (productsConfigResponse.ok && servicesResponse.ok) {
        const partnerConstraints = await productsConfigResponse.json();
        const generalConstraints = await servicesResponse.json();
        ngBankCodes = generalConstraints.bank_codes;

        const previewBvnMfa = config.previewBVNMFA;
        if (previewBvnMfa) {
          generalConstraints.hosted_web.enhanced_kyc.NG.id_types.BVN_MFA = {
            id_number_regex: "^[0-9]{11}$",
            label: "Bank Verification Number (with OTP)",
            required_fields: [
              "country",
              "id_type",
              "session_id",
              "user_id",
              "job_id",
            ],
            test_data: "00000000000",
          };
        }

        return {
          partnerConstraints,
          generalConstraints: generalConstraints.hosted_web.enhanced_kyc,
        };
      }
      throw new Error("Failed to get supported ID types");
    } catch (e) {
      throw new Error("Failed to get supported ID types", { cause: e });
    }
  }

  window.addEventListener(
    "message",
    async (event) => {
      if (event.data && event.data.includes("SmileIdentity::Configuration")) {
        config = JSON.parse(event.data);
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
        setActiveScreen(IDInfoForm);
      }
    } else {
      hideIdFromBackExit();
      setActiveScreen(IDInfoForm);
    }

    customizeForm();
  }

  function hideIdFromBackExit() {
    // only disable if this is the first screen
    if (!disableBackOnFirstScreen) return;
    IDInfoForm.querySelector(".nav").classList.add("justify-right");
    IDInfoForm.querySelector(".back-wrapper").style.display = "none";
  }

  function initializeSession(generalConstraints, partnerConstraints) {
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
        if (idTypes.length === 1 || typeof idTypes === "string") {
          id_info.id_type = Array.isArray(idTypes) ? idTypes[0] : idTypes;

          disableBackOnFirstScreen = true;
          // ACTION: set initial screen
          setInitialScreen(partnerConstraints);
        }
      }
    } else {
      validCountries = Object.keys(partnerConstraints.idSelection.enhanced_kyc);
    }

    if (!id_info || !id_info.id_type) {
      const selectCountry = SelectIDType.querySelector("#country");
      const selectIDType = SelectIDType.querySelector("#id_type");
      const hostedWebConfigForm = document.querySelector(
        'form[name="hosted-web-config"]',
      );

      // ACTION: Enable Country Selection
      selectCountry.disabled = false;

      // ACTION: Enable select screen
      setActiveScreen(SelectIDType);

      const loadIdTypes = (countryCode) => {
        if (countryCode) {
          const validIDTypes = config.id_selection
            ? config.id_selection
            : partnerConstraints.idSelection.enhanced_kyc;
          const constrainedIDTypes = Object.keys(
            generalConstraints[countryCode].id_types,
          );
          const selectedIDTypes = validIDTypes[countryCode].filter((value) =>
            constrainedIDTypes.includes(value),
          );

          // ACTION: Reset ID Type <select>
          selectIDType.innerHTML = "";
          const initialOption = document.createElement("option");
          initialOption.setAttribute("value", "");
          initialOption.textContent = "--Please Select--";
          selectIDType.appendChild(initialOption);

          // ACTION: Load ID Types as <option>s
          selectedIDTypes.forEach((IDType) => {
            const option = document.createElement("option");
            option.setAttribute("value", IDType);
            option.textContent =
              generalConstraints[countryCode].id_types[IDType].label;
            selectIDType.appendChild(option);
          });

          // ACTION: Enable ID Type Selection
          selectIDType.disabled = false;
        } else {
          // ACTION: Reset ID Type <select>
          selectIDType.innerHTML = "";

          // ACTION: Load the default <option>
          const option = document.createElement("option");
          option.disabled = true;
          option.setAttribute("value", "");
          option.textContent = "--Select Country First--";
          selectIDType.appendChild(option);
        }
      };

      selectCountry.addEventListener("change", (e) => {
        loadIdTypes(e.target.value);
      });

      // ACTION: Load Countries as <option>s
      validCountries.forEach((country) => {
        const countryObject = generalConstraints[country];
        if (countryObject) {
          const option = document.createElement("option");
          option.setAttribute("value", country);
          option.textContent = countryObject.name;

          if (id_info && id_info.country && country === id_info.country) {
            option.setAttribute("selected", true);
            selectCountry.value = country;
            selectCountry.disabled = true;
            loadIdTypes(country);
          }

          selectCountry.appendChild(option);
        }
      });

      hostedWebConfigForm.addEventListener("submit", (e) => {
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
    const demoTips = document.querySelectorAll(".demo-tip");
    Array.prototype.forEach.call(demoTips, (tip) => {
      tip.hidden = false;
    });

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "js/demo-ekyc.min.js";

    document.body.appendChild(script);
  }

  IDInfoForm.querySelector("#submitForm").addEventListener(
    "click",
    (event) => {
      handleFormSubmit(event);
    },
    false,
  );

  IDInfoForm.querySelector("#back-button").addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      const page = pages.pop();
      setActiveScreen(page);
    },
    false,
  );

  CloseIframeButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        closeWindow(true);
      },
      false,
    );
  });

  function customizeConsentScreen() {
    const partnerDetails = config.partner_details;

    const main = document.querySelector("main");
    EndUserConsent = document.querySelector("end-user-consent");
    if (EndUserConsent) {
      main.removeChild(EndUserConsent);
    }
    EndUserConsent = document.createElement("end-user-consent");
    EndUserConsent.setAttribute(
      "base-url",
      endpoints[config.environment] || config.environment,
    );
    EndUserConsent.setAttribute("country", id_info.country);
    EndUserConsent.setAttribute(
      "id-regex",
      productConstraints[id_info.country].id_types[id_info.id_type]
        .id_number_regex,
    );
    EndUserConsent.setAttribute("id-type", id_info.id_type);
    EndUserConsent.setAttribute(
      "id-type-label",
      productConstraints[id_info.country].id_types[id_info.id_type].label,
    );
    EndUserConsent.setAttribute("partner-id", partnerDetails.partner_id);
    EndUserConsent.setAttribute("partner-name", partnerDetails.name);
    EndUserConsent.setAttribute("partner-logo", partnerDetails.logo_url);
    EndUserConsent.setAttribute("policy-url", partnerDetails.policy_url);
    EndUserConsent.setAttribute("theme-color", partnerDetails.theme_color);
    EndUserConsent.setAttribute("token", config.token);
    if (disableBackOnFirstScreen) {
      EndUserConsent.setAttribute("hide-back-to-host", true);
    }

    if (config.demo_mode) {
      EndUserConsent.setAttribute("demo-mode", config.demo_mode);
      localStorage.setItem(
        "SmileIdentityConstraints",
        JSON.stringify(productConstraints, null, 2),
      );
      initiateDemoMode();
    }

    EndUserConsent.addEventListener(
      "SmileIdentity::Exit",
      () => {
        setActiveScreen(SelectIDType);
      },
      false,
    );

    EndUserConsent.addEventListener(
      "SmileIdentity::ConsentGranted",
      (event) => {
        consent_information = event.detail;

        if (consent_information.consented.personal_details) {
          id_info.consent_information = consent_information;
          setActiveScreen(IDInfoForm);
        }
      },
      false,
    );

    EndUserConsent.addEventListener(
      "SmileIdentity::ConsentGranted::TOTP",
      (event) => {
        consent_information = event.detail;

        if (consent_information.consented.personal_details) {
          id_info.id_number = consent_information.id_number;
          id_info.session_id = consent_information.session_id;
          id_info.consent_information = consent_information;
          handleFormSubmit();
        }
      },
      false,
    );

    EndUserConsent.addEventListener(
      "SmileIdentity::ConsentDenied",
      () => {
        referenceWindow.postMessage("SmileIdentity::ConsentDenied", "*");
        closeWindow();
      },
      false,
    );

    EndUserConsent.addEventListener(
      "SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated",
      (event) => {
        referenceWindow.postMessage(event.detail, "*");
        closeWindow();
      },
      false,
    );

    main.appendChild(EndUserConsent);
  }

  function customizeForm() {
    setGuideTextForIDType();
    setFormInputs();
  }

  function setGuideTextForIDType() {
    const label = document.querySelector('[for="id_number"]');
    const input = document.querySelector("#id_number");

    label.innerHTML =
      productConstraints[id_info.country].id_types[id_info.id_type].label;
    input.setAttribute(
      "placeholder",
      productConstraints[id_info.country].id_types[id_info.id_type].test_data,
    );
    input.setAttribute(
      "pattern",
      productConstraints[id_info.country].id_types[id_info.id_type]
        .id_number_regex,
    );
  }

  function loadBankCodes(bankCodes, placeholderElement) {
    const autocomplete = document.createElement("smileid-combobox");
    autocomplete.setAttribute("id", "bank_code");
    autocomplete.innerHTML = `
      <smileid-combobox-trigger
        label="Search Bank">
      </smileid-combobox-trigger>

      <smileid-combobox-listbox empty-label="No bank found">
        ${bankCodes
          .map(
            (bank) =>
              `
                <smileid-combobox-option
                  value="${bank.code}"
                  label="${bank.name}"
                >
                  ${bank.name}
                </smileid-combobox-option>
              `,
          )
          .join("\n")}
      </smileid-combobox-listbox>
    `;
    placeholderElement.replaceWith(autocomplete);
    autocomplete.addEventListener('change', (e) => {
      id_info.bank_code = e.detail ? e.detail.value : '';
    });

    return autocomplete;
  }

  function setFormInputs() {
    const requiredFields =
      productConstraints[id_info.country].id_types[id_info.id_type]
        .required_fields;

    const showIdNumber = requiredFields.some((fieldName) =>
      fieldName.includes("id_number"),
    );

    if (showIdNumber) {
      const IdNumber = IDInfoForm.querySelector("div#id-number");
      IdNumber.hidden = false;
    }

    const showNames = requiredFields.some((fieldName) =>
      fieldName.includes("name"),
    );

    if (showNames) {
      const Names = IDInfoForm.querySelector("fieldset#names");
      Names.hidden = false;
    }

    const showDOB = requiredFields.some((fieldName) =>
      fieldName.includes("dob"),
    );

    if (showDOB) {
      const DOB = IDInfoForm.querySelector("fieldset#dob");
      DOB.hidden = false;
    }

    const showCitizenship = requiredFields.some((fieldName) =>
      fieldName.includes("citizenship"),
    );

    if (showCitizenship) {
      const Citizenship = IDInfoForm.querySelector("fieldset#citizenships");
      Citizenship.hidden = false;
    }

    const showBankCode = requiredFields.some((fieldName) =>
      fieldName.includes("bank_code"),
    );

    if (showBankCode) {
      const BankCode = IDInfoForm.querySelector("fieldset#bank-code");
      loadBankCodes(ngBankCodes, BankCode.querySelector('#bank_code'));
      BankCode.hidden = false;
    }
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
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return `%${c.charCodeAt(0).toString(16)}`;
          })
          .join(""),
      );

      return JSON.parse(jsonPayload);
    }

    const { partner_params: partnerParams } = parseJWT(config.token);

    partner_params = { ...partnerParams, ...(config.partner_params || {}) };
  }

  function setActiveScreen(node) {
    activeScreen.hidden = true;
    node.hidden = false;
    pages.push(activeScreen);
    activeScreen = node;
  }

  function resetForm() {
    const invalidElements = IDInfoForm.querySelectorAll("[aria-invalid]");
    invalidElements.forEach((el) => el.removeAttribute("aria-invalid"));

    const validationMessages = document.querySelectorAll(".validation-message");
    validationMessages.forEach((el) => el.remove());
  }

  function validateInputs(payload) {
    const validationConstraints = {};

    const requiredFields =
      productConstraints[id_info.country].id_types[id_info.id_type]
        .required_fields;

    const showIdNumber = requiredFields.some((fieldName) =>
      fieldName.includes("id_number"),
    );

    if (showIdNumber) {
      validationConstraints.id_number = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
        format: new RegExp(
          productConstraints[id_info.country].id_types[
            id_info.id_type
          ].id_number_regex,
        ),
      };
    }

    const showNames = requiredFields.some((fieldName) =>
      fieldName.includes("name"),
    );

    if (showNames) {
      validationConstraints.first_name = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
      validationConstraints.last_name = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
    }

    const showDOB = requiredFields.some((fieldName) =>
      fieldName.includes("dob"),
    );

    if (showDOB) {
      validationConstraints.day = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
      validationConstraints.month = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
      validationConstraints.year = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
    }

    const showCitizenship = requiredFields.some((fieldName) =>
      fieldName.includes("citizenship"),
    );
    if (showCitizenship) {
      validationConstraints.citizenship = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
    }

    const showBankCode = requiredFields.some((fieldName) =>
      fieldName.includes("bank_code"),
    );

    if (showBankCode) {
      validationConstraints.bank_code = {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      };
    }

    const validation = validate(payload, validationConstraints);

    if (validation) {
      handleValidationErrors(validation);
      const submitButton = IDInfoForm.querySelector('[type="button"]');
      submitButton.removeAttribute("disabled");
    }

    return validation;
  }

  function handleValidationErrors(errors) {
    const fields = Object.keys(errors);

    fields.forEach((field) => {
      const input = IDInfoForm.querySelector(`#${field}`);
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `${field}-hint`);

      const errorDiv = document.createElement("div");
      errorDiv.setAttribute("id", `${field}-hint`);
      errorDiv.setAttribute("class", "validation-message");
      errorDiv.textContent = errors[field][0];

      input.insertAdjacentElement("afterend", errorDiv);
    });
  }

  async function handleFormSubmit(event) {
    if (event) {
      event.preventDefault();
      resetForm();
    }
    const form = IDInfoForm.querySelector("form");

    const formData = new FormData(form);
    const payload = Object.assign({}, id_info, Object.fromEntries(formData.entries()));

    const isInvalid = validateInputs(payload);

    if (isInvalid) {
      return;
    }

    id_info = {
      dob: `${payload.year}-${payload.month}-${payload.day}`,
      entered: true,
      ...payload,
      ...id_info,
    };

    try {
      if (event && event.target) event.target.disabled = true;
      await submitIdInfoForm();
      if (event && event.target) event.target.disabled = false;
      complete();
    } catch (error) {
      if (event && event.target) event.target.disabled = false;
      displayErrorMessage("Something went wrong");
      console.error(
        `SmileIdentity - ${error.name || error.message}: ${error.cause}`,
      );
    }
  }

  function displayErrorMessage(message) {
    const p = document.createElement("p");

    p.textContent = message;
    p.classList.add("validation-message");
    p.style.fontSize = "1.5rem";
    p.style.textAlign = "center";

    const main = document.querySelector("main");
    main.prepend(p);
  }

  async function submitIdInfoForm() {
    const { year, month, day, ...data } = id_info;
    const dob = year && month && day ? `${year}-${month}-${day}` : undefined;
    const {
      callback_url,
      token,
      partner_details: { partner_id },
    } = config;
    const payload = {
      ...data,
      dob,
      partner_id,
      callback_url,
      token,
      source_sdk: config.sdk || "hosted_web",
      source_sdk_version: config.sdk_version || sdkVersion,
      partner_params: {
        ...partner_params,
        job_type: 5,
      },
    };

    const URL = `${endpoints[config.environment]}/async_id_verification`;
    const response = await postData(URL, payload);
    const json = await response.json();

    if (json.error) throw new Error(json.error);
  }

  function complete() {
    const countryName = productConstraints[id_info.country].name;
    const idTypeName =
      productConstraints[id_info.country].id_types[id_info.id_type].label;

    const thankYouMessage = CompleteScreen.querySelector("#thank-you-message");
    thankYouMessage.textContent = `We will process your ${countryName} - ${idTypeName} information to verify your identity`;

    setActiveScreen(CompleteScreen);
    handleSuccess();
    window.setTimeout(closeWindow, 2000);
  }

  function closeWindow(userTriggered) {
    const message = userTriggered
      ? "SmileIdentity::Close"
      : "SmileIdentity::Close::System";
    referenceWindow.postMessage(message, "*");
  }

  function handleSuccess() {
    referenceWindow.postMessage("SmileIdentity::Success", "*");
  }
})();
