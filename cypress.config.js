const { defineConfig } = require("cypress"); // eslint-disable-line import/no-extraneous-dependencies

module.exports = defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line global-require
      return require("./cypress/plugins/index")(on, config);
    },
    baseUrl: "http://localhost:8000",
    specPattern: "cypress/tests/**/*.cy.{js,jsx,ts,tsx}",
  },
});
