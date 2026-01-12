# hosted-web-integration

[![Staging Status](https://github.com/smileidentity/hosted-web-integration/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/smileidentity/hosted-web-integration/actions/workflows/deploy-staging.yml)
[![Production Status](https://github.com/smileidentity/hosted-web-integration/actions/workflows/deploy.yml/badge.svg)](https://github.com/smileidentity/hosted-web-integration/actions/workflows/deploy.yml)

## Overview

This repository provides a self-hosted integration for Smile ID on the Web. It encompasses a comprehensive set of utilities for KYC processes, biometric verification, and more. Public documentation [here](https://docs.usesmileid.com/integration-options/web-mobile-web/web-integration).

## Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed.
- Install [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) for managing Node.js versions.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/smileidentity/hosted-web-integration.git
   cd hosted-web-integration
   ```

2. Switch to the appropriate Node version using `nvm`:

   ```bash
   nvm install
   nvm use
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

## Running the Project

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the local server:

   ```bash
   npm start
   ```

3. Access the application on `http://localhost:8000`.

### Configuration

- `.git-blame-ignore-revs`: File used to ignore certain commits in `git blame`.
- `.gitignore`: Specifies files to ignore in git. These include [./dist](./dist) and [./build](./build).
- `.nvmrc`: Node Version Manager configuration file.
- `.nycrc`: [NYC](https://github.com/istanbuljs/nyc) configuration file.
- `esbuild.js`: [esbuild](https://esbuild.github.io/) configuration file.

## Testing

Run Cypress tests using:

```bash
npm test
```

NOTE: the `npm start` command must be running in a separate terminal window.

### Cypress Configuration & Pages

- `cypress.config.js`: Main Cypress configuration file.
- `cypress/pages/`: Contains all the utility pages.

## Creating a Release

When you're ready to create a new release for this project, follow the steps below:

1. Bump the version in the `package.json` file:

   You can do this manually or use npm commands to update the version. For example, to bump a patch:

   ```bash
   npm version patch
   ```

   This will increase the patch version (e.g., from v1.0.0 to v1.0.1). Similarly, you can use `npm version minor` or `npm version major` for minor and major version bumps respectively.

2. Commit the change:

   If you used the npm version command, it will automatically commit the change for you with a commit message like "1.0.1". If you updated the `package.json` file manually, ensure you commit the change:

   ```bash
   git add package.json
   git commit -m "Bump version to [NEW_VERSION]"
   ```

3. Push a new tag:

   Tag the new commit with the version number and push the tag to the repository:

   ```bash
   git tag v[NEW_VERSION]
   git push origin v[NEW_VERSION]
   ```

## Localization

The embed supports multiple languages and string customization through the `translation` option.

### Quick Start

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  // Set language (supports 'en', 'fr', 'ar')
  translation: {
    language: 'fr',
  },

  partner_details: {
    /* ... */
  },
  onSuccess: () => {},
  onError: () => {},
});
```

### Customizing Strings

Override specific UI text while keeping defaults:

```javascript
translation: {
  language: 'en',
  locales: {
    en: {
      common: {
        continue: 'Proceed',
        back: 'Go Back'
      },
      selfie: {
        instructions: {
          title: 'Time for a quick selfie!'
        }
      }
    }
  }
}
```

### Adding Custom Languages

Provide complete translations for unsupported languages:

```javascript
translation: {
  language: 'sw', // Swahili
  locales: {
    sw: {
      direction: 'ltr',
      common: {
        back: 'Rudi',
        continue: 'Endelea',
        // ... all required keys
      }
    }
  }
}
```

📖 **[Full Localization Guide](https://github.com/smileidentity/web-client/blob/main/packages/web-components/LOCALIZATION.md)** - Complete documentation including available languages, all translation keys, and custom language setup.
