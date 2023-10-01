# Smile Identity Hosted-Web Mono-Repo

## Overview

- **Smart Camera Web** acts as a user interface client that works together with the [Server to Server](https://docs.smileidentity.com/server-to-server) libraries. For more detailed information, you can refer to the [Smart Camera Web documentation](./smart-camera-web/README.md).

- **Hosted Web Integration** provides the necessary structure for self-hosted integration on the web. Detailed information about this can be found in the [Hosted Web Integration documentation](./hosted-web-integration/README.md).

## Quick Start

### Setting Up Your Environment

1. **Node.js with NVM**: Ensure you're using the correct Node.js version. If you don't have [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) installed:

   Activate the right Node version for this project:

   ```sh
   nvm use
   ```

2. **Installing Dependencies**:

    In each subdirectory of this mono-repo, run:

   ```sh
   npm install
   ```

### Running Tests

Both projects in this mono-repo come equipped with test suites to ensure code quality and functionality. Here's how to run them:

1. **Smart Camera Web**:

   ```sh
   cd smart-camera-web
   npm test
   ```

2. **Hosted Web Integration**:

   ```sh
   cd hosted-web-integration
   npm test
   ```
