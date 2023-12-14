import validate from "validate.js";
import { version as sdkVersion } from "../../package.json";
import "@smileid/components/signature-pad";

function getHumanSize(numberOfBytes) {
  // Approximate to the closest prefixed unit
  const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1,
  );
  const approx = numberOfBytes / 1024 ** exponent;
  const output =
    exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(0)} ${units[exponent]}`;

  return output;
}

(function eSignature() {
  "use strict";

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
    referenceWindow.postMessage(
      {
        message: "SmileIdentity::Error",
        data: {
          error,
        },
      },
      "*",
    );
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

  const BackButtons = document.querySelectorAll(".back-button");
  BackButtons.forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const screen = screens.pop();
        setActiveScreen(screen);
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
  let signature;

  function getPartnerParams() {
    function parseJWT(token) {
      /**
       * A JSON Web Token (JWT) uses a base64 URL encoded string in it"s body.
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

      const URL = `${
        endpoints[config.environment]
      }/documents?ids=${config.document_ids.join(",")}`;
      const fetchConfig = {
        mode: "cors",
        headers: {
          "SmileID-Partner-ID": partner_id,
          "SmileID-Token": token,
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
        documents = (await getDocuments()).documents;
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

  EntryScreen.querySelector("#getStarted").addEventListener("click", () =>
    setActiveScreen(DocumentReviewScreen),
  );

  DocumentReviewScreen.querySelector("#i_agree").addEventListener(
    "change",
    (event) => {
      const button = DocumentReviewScreen.querySelector("#agreeToTerms");
      if (event.target.checked) {
        button.removeAttribute("disabled");
      } else {
        button.setAttribute("disabled", true);
      }
    },
  );

  DocumentReviewScreen.querySelector("#agreeToTerms").addEventListener(
    "click",
    agreeToTerms,
  );

  SignatureScreen.querySelector("smileid-signature-pad").addEventListener(
    "signature-pad.publish",
    (event) => {
      const name = ReviewSignatureScreen.querySelector("#name");
      name.textContent = personal_info.name;
      const image = ReviewSignatureScreen.querySelector("#preview-signature");
      image.src = event.detail;
      signature = dataURLToFile(event.detail);
      setActiveScreen(ReviewSignatureScreen);
    },
  );

  ReviewSignatureScreen.querySelector("#uploadSignature").addEventListener(
    "click",
    () => submitSignature(),
  );

  function dataURLToFile(dataURL) {
    // Code taken from https://github.com/ebidel/filer.js
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/svg+xml": "svg",
    }[contentType];

    return new File(
      [new Blob([uInt8Array], { type: contentType })],
      `signature.${ext}`,
      { type: contentType },
    );
  }

  function setActiveScreen(node) {
    activeScreen.hidden = true;
    node.hidden = false;
    screens.push(activeScreen);
    activeScreen = node;
  }

  function initializeSession(documents) {
    loadDocuments(documents, DocumentReviewScreen);
    setActiveScreen(EntryScreen);
  }

  function validateInputs(payload) {
    const validationConstraints = {
      name: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
      },
    };

    const validation = validate(payload, validationConstraints);

    if (validation) {
      handleValidationErrors(validation);
      const submitButton = PersonalInfoForm.querySelector("[type='button']");
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

  function handlePersonalInfoSubmit(event) {
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

    setActiveScreen(SignatureScreen);
  }

  PersonalInfoForm.querySelector("#submitForm").addEventListener(
    "click",
    (event) => {
      handlePersonalInfoSubmit(event);
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

  function loadDocuments(documents, containerElement) {
    const placeholderElement = containerElement.querySelector(".document-list");
    const list = document.createElement("div");
    list.innerHTML = `
      <ul class="document-list">
        ${documents
          .map(
            (document) =>
              `
                <li>
                  <a
                    href="${document.link}"
                    target="_blank"
                    class="document-tips"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" fill="none">
                      <path fill="#fff" d="M1.786 18.698a1.47 1.47 0 0 1-1.484-1.454V1.776A1.47 1.47 0 0 1 1.786.293h9.144c.312-.01.624.127.83.36l3.024 3.026c.225.215.352.517.352.83v12.705a1.47 1.47 0 0 1-1.454 1.484H1.786Z"/>
                      <path fill="#FF2116" d="M10.93.586a.8.8 0 0 1 .624.263l3.025 3.025c.176.166.264.39.264.625v12.705c0 .654-.537 1.191-1.19 1.191H1.785c-.654 0-1.19-.537-1.19-1.19V1.775c0-.654.536-1.18 1.19-1.18h9.144m0-.596H1.786C.8 0 .01.8 0 1.776v15.438C0 18.2.8 18.99 1.786 19h11.876c.986 0 1.776-.8 1.786-1.786V4.508c.01-.39-.156-.77-.449-1.034L11.974.45A1.41 1.41 0 0 0 10.93 0Z"/>
                      <path fill="#FF2116" d="M11.369 8.558a1.071 1.071 0 0 0-.498-.263 3.229 3.229 0 0 0-.81-.098c-.185 0-.38.01-.566.03a7.98 7.98 0 0 0-.624.087 7.27 7.27 0 0 1-.381-.39c-.127-.137-.244-.293-.37-.459-.079-.117-.167-.234-.245-.36-.078-.118-.156-.235-.214-.352.107-.351.204-.693.273-1.005.068-.283.107-.576.107-.859 0-.215-.039-.44-.127-.634a.597.597 0 0 0-.556-.361.453.453 0 0 0-.39.224c-.108.195-.147.537-.098.937.059.459.195.917.39 1.337-.078.224-.156.449-.244.683-.087.234-.185.478-.292.742-.088.214-.186.429-.293.644-.107.214-.195.42-.312.624a7.406 7.406 0 0 0-1.464.752c-.361.253-.576.497-.605.722a.402.402 0 0 0 .01.215c.029.068.068.136.126.185a.965.965 0 0 0 .166.107c.088.04.186.059.274.059.35 0 .722-.254 1.073-.644.38-.44.712-.918.986-1.435a9.92 9.92 0 0 1 1.024-.312c.176-.049.38-.098.566-.137.186-.039.361-.068.537-.107.332.312.732.556 1.161.712.264.088.537.137.82.137.166.01.322-.02.478-.098a.379.379 0 0 0 .176-.214.52.52 0 0 0 .01-.274.28.28 0 0 0-.088-.195ZM7.114 4.196a.416.416 0 0 1 .107-.117.235.235 0 0 1 .147-.039c.097 0 .195.049.244.127a.678.678 0 0 1 .088.39c-.01.234-.04.469-.088.693a9.602 9.602 0 0 1-.244.937 4.158 4.158 0 0 1-.342-1.25c-.03-.34 0-.604.088-.74ZM4.196 10.56c.04-.186.225-.4.547-.615.4-.263.83-.488 1.278-.673-.244.429-.527.83-.859 1.19-.263.283-.507.44-.683.44a.345.345 0 0 1-.097-.02.23.23 0 0 1-.088-.059.344.344 0 0 1-.078-.127c-.02-.039-.02-.087-.02-.136Zm4.499-2.206c-.156.03-.322.059-.488.098-.166.03-.342.078-.507.117l-.44.117c-.146.04-.292.098-.429.147.078-.157.156-.303.234-.46.069-.146.137-.292.186-.438.068-.166.136-.332.195-.498.058-.166.127-.341.185-.507a5.24 5.24 0 0 0 .4.624c.108.137.215.283.322.41.108.127.225.263.342.39Zm.293.088c.322-.058.644-.088.966-.097.214-.01.43.01.644.039.117.02.224.078.302.175a.373.373 0 0 1 .069.303.357.357 0 0 1-.225.273.677.677 0 0 1-.439.03 3.114 3.114 0 0 1-.722-.293 6.103 6.103 0 0 1-.595-.43Z"/>
                      <path fill="#2C2C2C" d="M4.704 13.623v-.02l.01-.01h.01c.038 0 .087 0 .136-.009H5.377c.156 0 .302.02.449.068a.783.783 0 0 1 .312.186.69.69 0 0 1 .176.273c.039.107.058.224.058.341 0 .137-.029.284-.078.41a.78.78 0 0 1-.224.283 1.098 1.098 0 0 1-.722.215H5.142v.986s-.009 0-.009.01H4.723c-.01 0-.01-.01-.01-.01V14.286l-.01-.663Zm.449 1.337H5.357c.069 0 .147-.01.215-.02a.622.622 0 0 0 .186-.078.335.335 0 0 0 .126-.156.724.724 0 0 0 .05-.244.48.48 0 0 0-.147-.36.543.543 0 0 0-.166-.089.887.887 0 0 0-.225-.029H5.152v.976ZM6.821 13.633v-.02l.01-.01h.664c.185 0 .38.03.556.098.146.059.283.156.39.273.108.127.186.264.234.43.059.175.078.36.078.546.01.234-.039.469-.117.693-.126.322-.39.576-.732.683a1.333 1.333 0 0 1-.439.068h-.634s-.01 0-.01-.01V13.634Zm.459 2.332H7.485c.107 0 .224-.02.322-.059a.683.683 0 0 0 .254-.185c.078-.098.136-.205.175-.322.04-.146.069-.302.059-.459 0-.146-.02-.292-.059-.439a.874.874 0 0 0-.166-.292.55.55 0 0 0-.253-.166.84.84 0 0 0-.313-.05H7.26l.02 1.972ZM9.72 16.326v.02s0 .01-.01.01H9.27V13.602s.01 0 .01-.01h1.406s.01 0 .01.01c0 0 0 .01.01.01v.01l.009.088.01.088.01.088.01.087v.02s0 .01-.01.01c0 0-.01 0-.01.01H9.71v.79h.917s.01 0 .01.01v.39s0 .01-.01.01H9.71v1.102l.01.01Z"/>
                    </svg>

                    <div class="flow">
                      <p>${document.name}<p>
                      <p>${getHumanSize(document.size)}<p>
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

  function agreeToTerms() {
    resetForm();
    const checkbox = DocumentReviewScreen.querySelector("#i_agree");

    if (checkbox.checked) {
      setActiveScreen(PersonalInfoScreen);
    } else {
      displayErrorMessage("You must tick the checkbox to proceed");
    }
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

  async function submitSignature() {
    // ACTION: Build the request headers
    const headers = {
      "SmileID-Partner-ID": config.partner_details.partner_id,
      "SmileID-Token": config.token,
    };

    // ACTION: Build the request body
    const formData = new FormData();
    formData.append(
      "partner_params",
      JSON.stringify({
        ...partner_params,
        job_type: 12,
      }),
    );
    formData.append("callback_url", config.callback_url);
    formData.append("source_sdk", config.sdk || "hosted_web");
    formData.append("source_sdk_version", config.sdk_version || sdkVersion);
    formData.append("smile_client_id", config.partner_details.partner_id);

    formData.append("ids", config.document_ids.join(","));
    formData.append("name", personal_info.name);
    formData.append("document_read_at", new Date().toISOString());
    formData.append("image", signature);

    const URL = `${
      endpoints[config.environment] || config.environment
    }/documents/sign`;

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers,
        body: formData,
      });
      const json = await response.json();

      if (json.error) throw new Error(json.error);

      setActiveScreen(CompleteScreen);
      return json;
    } catch (error) {
      throw new Error("signature submission failed", { cause: error });
    }
  }

  function complete() {
    setActiveScreen(CompleteScreen);
    handleSuccess();
    window.setTimeout(closeWindow, 2000);
  }
})();
