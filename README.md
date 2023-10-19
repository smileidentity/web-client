
# SmileID Web MonoRepo

## Overview

### Components
[Components f.k.a Smart Camera Web](packages/components) is a package that 
contains web-components used in the browser with SmileID systems.

It currently publishes `smart-camera-web` which is a Web Component that works
together with the [Server to Server](https://docs.smileidentity.com/server-to-server) libraries.

For more detailed information, you can refer to the [packages/components documentation](./packages/components/README.md).

### Embed
[Embed f.k.a Hosted Web Integration](packages/embed) is a package that contains two items:

1. A configuration script which creates an iframe that serves some of the
    SmileID product recipes.
2. A collection of web pages and scripts: one for each product recipe

This provides the necessary structure for self-hosted integration on the web.
Detailed information about this can be found in the [packages/embed documentation](./packages/embed/README.md).

## Quick Start

### Setting Up Your Environment

1. **Node.js with NVM**: Ensure you're using the correct Node.js version.
   If you don't have [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) installed:

   Activate the right Node version for this project:

   ```sh
   nvm use
   ```

2. **Installing Dependencies**:

   ```sh
   npm install
   ```

### Running Tests

Both projects in this mono-repo come equipped with test suites to ensure code
quality and functionality. Here's how to run them:

1. **Components**:

   ```sh
   cd packages/components
   npm test
   ```

2. **Embed**:

   ```sh
   cd packages/embed
   npm test
   ```
