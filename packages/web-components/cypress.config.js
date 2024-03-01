import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    setupNodeEvents() {
      // implement node event listeners here
    },
    experimentalStudio: true,
  },
});
