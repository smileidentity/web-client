import { defineConfig } from "cypress"; // eslint-disable-line import/no-extraneous-dependencies

const config = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8000",
    specPattern: "cypress/tests/**/*.cy.cjs",
  },
});

export default config;
