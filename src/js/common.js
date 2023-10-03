"use strict";
// NOTE: In order to support prior integrations, we have `live` and
// `production` pointing to the same URL
const endpoints = {
  development: "https://devapi.smileidentity.com/v1",
  sandbox: "https://testapi.smileidentity.com/v1",
  live: "https://api.smileidentity.com/v1",
  production: "https://api.smileidentity.com/v1",
};

function toHRF(string) {
    return string.replace(/\_/g, " ");
}

module.exports = {
  endpoints,
  toHRF,
};
