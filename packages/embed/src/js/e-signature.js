import validate from "validate.js";
import { version as sdkVersion } from "../../package.json";

(function eSignature() {
  "use strict";

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

  function closeWindow(userTriggered) {
    const message = userTriggered
      ? "SmileIdentity::Close"
      : "SmileIdentity::Close::System";
    referenceWindow.postMessage(message, "*");
  }

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

  function handleSuccess() {
    referenceWindow.postMessage("SmileIdentity::Success", "*");
  }

  function handleBadDocuments(error) {
    referenceWindow.postMessage({
      message: "SmileIdentity::Error",
      data: {
        error,
      },
    }, '*');
  }

  const CloseIframeButtons = document.querySelectorAll(".close-iframe");

  CloseIframeButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        closeWindow(true);
      },
      false,
    );
  });

  const screens = [];
  let activeScreen;
  let config;
  let partner_params;
  let documents;
  let personal_info;

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

  async function getDocuments() {
    try {
      const {
        callback_url,
        token,
        partner_details: { partner_id },
      } = config;

      const URL = `${endpoints[config.environment]}/documents?ids=${config.document_ids.join(',')}`;
      const fetchConfig = {
        mode: 'cors',
        headers: {
          partner_id,
          token,
        },
      };

      const response = await fetch(URL, fetchConfig);
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        handleBadDocuments(result.error);
        closeWindow();
      }
    } catch (e) {
      handleBadDocuments(e);
      closeWindow();
      throw new Error("Failed to retrieve documents", { cause: e });
    }
  }

  window.addEventListener(
    "message",
    async (event) => {
      if (event.data && event.data.includes("SmileIdentity::Configuration")) {
        config = JSON.parse(event.data);
        activeScreen = LoadingScreen;
        getPartnerParams();
        documents = await getDocuments();
        initializeSession(documents);
      }
    },
    false,
  );

  const LoadingScreen = document.querySelector("#loading-screen");
  activeScreen = LoadingScreen;
  const EntryScreen = document.querySelector("#entry-screen");
  const DocumentReviewScreen = document.querySelector(
    "#document-review-screen",
  );
  const PersonalInfoScreen = document.querySelector("#personal-info-screen");
  const PersonalInfoForm = PersonalInfoScreen.querySelector("form");
  const SignatureScreen = document.querySelector("#signature-screen");
  const ReviewSignatureScreen = document.querySelector(
    "#review-signature-screen",
  );
  const CompleteScreen = document.querySelector("#complete-screen");

  EntryScreen.querySelector('#getStarted').addEventListener('click', setActiveScreen(DocumentReviewScreen));

  function setActiveScreen(node) {
    activeScreen.hidden = true;
    node.hidden = false;
    screens.push(activeScreen);
    activeScreen = node;
  }

  function initializeSession(documents) {
    setActiveScreen(EntryScreen);
  }

  function validateInputs(payload) {
    const validationConstraints = {
      last_name: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      },
      other_names: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      },
    };

    const validation = validate(payload, validationConstraints);

    if (validation) {
      handleValidationErrors(validation);
      const submitButton = PersonalInfoForm.querySelector('[type="button"]');
      submitButton.removeAttribute("disabled");
    }

    return validation;
  }

  function handleValidationErrors(errors) {
    const fields = Object.keys(errors);

    fields.forEach((field) => {
      const input = PersonalInfoForm.querySelector(`#${field}`);
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

    const formData = new FormData(PersonalInfoForm);
    const payload = {
      ...Object.fromEntries(formData.entries()),
    };

    const isInvalid = validateInputs(payload);

    if (isInvalid) {
      return;
    }

    personal_info = {
      ...payload,
    };

    try {
      if (event && event.target) event.target.disabled = true;
      await storePersonalInfo();
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

  PersonalInfoForm.querySelector("#submitForm").addEventListener(
    "click",
    (event) => {
      handleFormSubmit(event);
    },
    false,
  );

  PersonalInfoScreen.querySelector("#back-button").addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      const screen = screens.pop();
      setActiveScreen(screen);
    },
    false,
  );

  function loadDocuments(documents, placeholderElement) {
    const list = `
      <ul class="document-list">
        ${documents
          .map(
            (document) =>
              `
                <li>
                  <a
                    href="${document.link}"
                    target="_blank"
                  >
                    <div class='flow'>
                      <p>${document.name}<p>
                      <p>${document.size}<p>
                    </div>
                  </a>
                </li>
              `,
          )
          .join("\n")}
      </ul>
    `;
    placeholderElement.replaceWith(list);

    return list;
  }

  function resetForm() {
    const invalidElements = PersonalInfoForm.querySelectorAll("[aria-invalid]");
    invalidElements.forEach((el) => el.removeAttribute("aria-invalid"));

    const validationMessages = document.querySelectorAll(".validation-message");
    validationMessages.forEach((el) => el.remove());
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

  function complete() {
    setActiveScreen(CompleteScreen);
    handleSuccess();
    window.setTimeout(closeWindow, 2000);
  }
})();
