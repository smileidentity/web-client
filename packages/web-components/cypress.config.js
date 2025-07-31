import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3005',
    experimentalStudio: true,
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
