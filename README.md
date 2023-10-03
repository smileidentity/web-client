# hosted-web-integration

[![Cypress Tests](https://github.com/smileidentity/hosted-web-integration/actions/workflows/main.yml/badge.svg)](https://github.com/smileidentity/hosted-web-integration/actions/workflows/main.yml)

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
