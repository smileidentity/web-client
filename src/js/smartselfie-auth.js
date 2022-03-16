// noinspection JSVoidFunctionReturnValueUsed

var smartSelfieReg = (function smartSelfieReg() {
  "use strict";

  // NOTE: In order to support prior integrations, we have `live` and
  // `production` pointing to the same URL
  const endpoints = {
    sandbox: "https://testapi.smileidentity.com/v1",
    live: "https://api.smileidentity.com/v1",
    production: "https://api.smileidentity.com/v1",
  };

  var config;
  var activeScreen;
  var images, partner_params;
  var SmartCameraWeb = document.querySelector("smart-camera-web");
  var UploadProgressScreen = document.querySelector("#upload-progress-screen");
  var UploadFailureScreen = document.querySelector("#upload-failure-screen");
  var CompleteScreen = document.querySelector("#complete-screen");

  var SDKModalScreen = document.querySelector("sdk-modal");
  var RetryUploadButton = document.querySelector("#retry-upload");

  var fileToUpload, uploadURL;

  SDKModalScreen.addEventListener(
    "SmileIdentity::ModalClose",
    (event) => closeWindow(),
    false
  );

  SDKModalScreen.addEventListener(
    "SmileIdentity::ModalInit",
    ({ detail }) => {
      config = detail.config;
      partner_params = detail.partner_params;

      var title = "SmartSelfie™ Authentication";
      if (partner_params.job_type === 4) {
        title = "SmartSelfie™ Registration";
      }
      setActiveScreen(SmartCameraWeb, title, false);
    },
    false
  );
  // hidden title and credit in modal when using camera
  SmartCameraWeb.shadowRoot
    .querySelector("#request-camera-access")
    .addEventListener("click", () => {
      setTimeout(() => {
        SDKModalScreen.setAttribute("showtitle", `false`);
        SDKModalScreen.setAttribute("showcredit", `false`);
      });
    });

  SmartCameraWeb.addEventListener(
    "imagesComputed",
    (event) => {
      images = event.detail.images;
      setActiveScreen(
        UploadProgressScreen,
        partner_params.job_type === 4
          ? "Registering User"
          : "Authenticating User"
      );
      handleFormSubmit();
    },
    false
  );

  RetryUploadButton.addEventListener(
    "click",
    (event) => {
      retryUpload();
    },
    false
  );

  function setActiveScreen(node, title, showCredit = true) {
    if (activeScreen) activeScreen.hidden = true;
    node.hidden = false;
    activeScreen = node;
    SDKModalScreen.setAttribute("showcredit", `${showCredit}`);
    SDKModalScreen.setAttribute("title", title);
  }

  async function handleFormSubmit(event) {
    try {
      [uploadURL, fileToUpload] = await Promise.all([
        getUploadURL(),
        createZip(),
      ]);
      uploadZip(fileToUpload, uploadURL);
    } catch (error) {
      switch (error.message) {
        case "createZip failed":
        case "getUploadURL failed":
        case "uploadFile failed":
        default:
          displayErrorMessage(error);
          console.error(`SmileIdentity - ${error.name}: ${error.cause}`);
      }
    }
  }

  function displayErrorMessage(error) {
    const p = document.createElement("p");

    p.textContent = error.message;
    p.style.color = "red";
    p.style.fontSize = "1.5rem";
    p.style.textAlign = "center";

    const main = document.querySelector("main");
    main.prepend(p);
  }

  async function createZip() {
    const zip = new JSZip();

    zip.file(
      "info.json",
      JSON.stringify({
        package_information: {
          language: "Hosted Web Integration",
          apiVersion: {
            buildNumber: 0,
            majorVersion: 2,
            minorVersion: 0,
          },
        },
        images,
      })
    );

    try {
      const zipFile = await zip.generateAsync({ type: "blob" });

      return zipFile;
    } catch (error) {
      throw new Error("createZip failed", { cause: error });
    }
  }

  async function getUploadURL() {
    var payload = {
      file_name: `${config.product}.zip`,
      smile_client_id: config.partner_details.partner_id,
      callback_url: config.callback_url,
      token: config.token,
      partner_params,
    };

    const fetchConfig = {
      cache: "no-cache",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    };

    const URL = `${endpoints[config.environment]}/upload`;

    try {
      const response = await fetch(URL, fetchConfig);
      const json = await response.json();

      if (json.error) throw new Error(json.error);

      return json.upload_url;
    } catch (error) {
      throw new Error("getUploadURL failed", { cause: error });
    }
  }

  function uploadZip(file, destination) {
    // CREDIT: Inspiration - https://usefulangle.com/post/321/javascript-fetch-upload-progress
    setActiveScreen(
      UploadProgressScreen,
      partner_params.job_type === 4 ? "Registering User" : "Authenticating User"
    );

    let request = new XMLHttpRequest();
    request.open("PUT", destination);

    request.upload.addEventListener("load", function (e) {
      return request.response;
    });

    request.upload.addEventListener("error", function (e) {
      setActiveScreen(UploadFailureScreen);
      throw new Error("uploadZip failed", { cause: e });
    });

    request.onreadystatechange = function () {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        setActiveScreen(CompleteScreen, "Submission Complete");
        handleSuccess();
        window.setTimeout(closeWindow, 2000);
      }
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status !== 200
      ) {
        setActiveScreen(UploadFailureScreen);
        throw new Error("uploadZip failed", { cause: request });
      }
    };

    request.setRequestHeader("Content-type", "application/zip");
    request.send(file);
  }

  function retryUpload() {
    var fileUploaded = uploadZip(fileToUpload, uploadURL);

    return fileUploaded;
  }

  function closeWindow() {
    window.parent.postMessage("SmileIdentity::Close", "*");
  }

  function handleSuccess() {
    window.parent.postMessage("SmileIdentity::Success", "*");
  }
})();
