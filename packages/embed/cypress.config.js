import { defineConfig } from 'cypress';

const config = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/tests/**/*.cy.cjs',
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          // camera and video args
          launchOptions.args.push('--use-fake-ui-for-media-stream');
          launchOptions.args.push('--use-fake-device-for-media-stream');
          launchOptions.args.push('--autoplay-policy=no-user-gesture-required');

          // CI-specific args
          launchOptions.args.push('--disable-dev-shm-usage'); // Helps with CI memory issues
          launchOptions.args.push('--no-sandbox');

          // additional media-related args that seem to improve stability
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--allow-running-insecure-content');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        return launchOptions;
      });
    },
  },
});

export default config;
