"use strict";

/**
 * Returns the appropriate endpoint for the specified environment.
 *
 * NOTE: In order to support prior integrations, we have `live` and
 * `production` pointing to the same URL.
 * @param {string} environment - see above for supported environments
 * @returns {string} - the appropriate endpoint as a url.
 */
const getEndpoint = (environment) =>
  ({
    development: "https://devapi.smileidentity.com/v1",
    sandbox: "https://testapi.smileidentity.com/v1",
    live: "https://api.smileidentity.com/v1",
    production: "https://api.smileidentity.com/v1",
  })[environment];

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
 * @param {string} token - a JWT string
 * @returns {Object} - the decoded JWT
 */
const parseJWT = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + c.charCodeAt(0).toString(16);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
};

const postData = (url = "", data = {}) =>
  fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

const toHRF = (string) => string.replace(/\_/g, " ");

module.exports = {
  getEndpoint,
  parseJWT,
  postData,
  toHRF,
};
