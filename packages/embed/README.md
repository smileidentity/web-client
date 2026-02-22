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

## Configuration Options

The embed supports several configuration options:

| Option                         | Type      | Default | Description                                                                                                                                                          |
| ------------------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hide_attribution`             | `boolean` | `false` | Hide Smile ID attribution/credits                                                                                                                                    |
| `allow_agent_mode`             | `boolean` | `false` | Allow agent mode for assisted capture                                                                                                                                |
| `allow_legacy_selfie_fallback` | `boolean` | `false` | Allow fallback to legacy selfie capture if Mediapipe fails to load. When `false` (default), an error message is shown instead of falling back to the legacy capture. |
| `id_info`                      | `object`  | —       | Pre-fill ID information fields. Keys are country codes mapping to ID types and field data. See [Pre-filled ID Inputs](#pre-filled-id-inputs) below.                  |

## Pre-filled ID Inputs

The `id_info` option allows partners to pre-fill ID information, reducing user input and streamlining the verification flow.

### Basic Usage

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  id_info: {
    NG: {
      BVN: {
        id_number: '00000000000',
        first_name: 'John',
        last_name: 'Doe',
      },
    },
  },

  partner_details: {
    /* ... */
  },
  onSuccess: () => {},
  onError: () => {},
});
```

### Behavior

- **Single country + single ID type**: The selection screen is automatically skipped.
- **All required fields valid**: The input screen is also skipped — the user goes straight to the next step (e.g. selfie capture).
- **Missing fields**: The input screen is shown with valid fields locked (read-only) and missing fields editable.
- **Invalid fields**: By default (`strict: true`), invalid fields are shown as editable with error indicators. With `strict: false`, the input screen is skipped and data is submitted as-is.
- **Multiple countries or ID types**: The selection screen is shown with options constrained to the provided entries.
- **Precedence**: `id_info` takes precedence over `id_selection` when both are provided.

### Strict Mode

Control whether invalid (but provided) fields should block the user:

```javascript
id_info: {
  strict: false, // default: true
  NG: {
    DRIVERS_LICENSE: {
      id_number: '1234', // doesn't match regex, but submit anyway
      first_name: 'John',
      last_name: 'Doe',
      dob: '1990-03-15',
    },
  },
}
```

| `strict` | Fields status              | Behavior                                       |
| -------- | -------------------------- | ---------------------------------------------- |
| `true`   | All valid                  | Skip input screen, submit                      |
| `true`   | Some invalid               | Show form with invalid fields editable          |
| `true`   | Some missing               | Show form with missing fields editable          |
| `false`  | All valid                  | Skip input screen, submit                      |
| `false`  | Some invalid (none missing)| Skip input screen, submit with data as-is      |
| `false`  | Some missing               | Show form with missing fields editable          |

### Date of Birth

Provide DOB as an ISO date string — it is automatically parsed into day/month/year fields:

```javascript
id_info: {
  NG: {
    BVN: {
      id_number: '00000000000',
      dob: '1990-03-15', // parsed into day: '15', month: '03', year: '1990'
    },
  },
}
```

## Localization

The embed supports multiple languages and string customization through the `translation` option.

### Quick Start

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  // Optional: Allow legacy selfie fallback if Mediapipe fails
  allow_legacy_selfie_fallback: true,

  // Set language (supports 'en-GB', 'fr-FR', 'ar-EG')
  translation: {
    language: 'fr-FR',
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
  language: 'en-GB',
  locales: {
    'en-GB': {
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
  language: 'sw-KE', // Swahili (Kenya)
  locales: {
    'sw-KE': {
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
