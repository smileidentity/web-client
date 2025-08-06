import { defineConfig } from 'cypress';

const config = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/tests/**/*.cy.cjs',
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
});

export default config;
