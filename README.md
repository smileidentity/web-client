# SmileID Web MonoRepo

## Overview

### Components

The [Components](packages/components) package contains web components used in the web client. It provides the necessary views to capture ID document images, selfie images, and liveness images used in verifications. For more detailed information, please refer to the [packages/components documentation](./packages/components/README.md).

### Embed

The [Embed package](packages/embed), formerly known as Hosted Web Integration, contains two main items:

1. A configuration script that creates an iframe to serve various SmileID product recipes.
2. A collection of web pages and scripts tailored for each product recipe.

This package facilitates self-hosted integration on the web. Detailed information can be found in the [packages/embed documentation](./packages/embed/README.md).

### Smart-Camera-Web

The [Smart Camera Web](packages/smart-camera-web) package includes a web component for capturing images in the browser for use within SmileID systems. It is a WebRTC-powered component designed to work seamlessly with the SmileID [Server to Server](https://docs.smileidentity.com/server-to-server) libraries. For more detailed information, you can refer to the [packages/smart-camera-web documentation](./packages/smart-camera-web/README.md).

## Quick Start

### Setting Up Your Environment

1. **Node.js with NVM**: Ensure you're using the correct Node.js version. If you haven't installed [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) yet, please do so. Then, activate the right Node version for this project by running:

   ```sh
   nvm use
   ```

2. **Installing Dependencies**: Install all required dependencies with the following command:

   ```sh
   npm install
   ```

### Running Tests

This mono-repo contains test suites for both projects to ensure code quality and functionality. Here's how to run them:

1. **For Smart-Camera-Web**:

   ```sh
   cd packages/smart-camera-web
   npm test
   ```

2. **For Embed**:

   ```sh
   cd packages/embed
   npm test
   ```

### Example App

The [Example App](example) can be used to test out changes made locally to the embed and it's dependencies.
To start testing locally with the embed

- Copy the [Sample env](example/sample.env) to [example/.env](example/.env) in the example app and provide the relevant values
- Build and start the embed server (it should be running on port 8000)
- Start the example app backend `npm start`
- Start the example app front end `npm run dev`

> Upon making changes in the embed or it's dependencies, remember to rebuild the embed by running `npm run build` in the embed directory

### Versioning

The versioning strategy is enforced by the `scripts/versionConsistency.js` script. It checks that all package.json files in the repo are on the same version. We use a CI action to publish a git tag when the version changes. In the future we will also publish to NPM.

### Storybook

Storybook is a tool for building UI components and pages in isolation. It simplifies the development process and ensures consistency across the UI.

#### Why Storybook?

- **Isolated Development**: Develop and test UI components in isolation, making the process simpler and more focused.
- **Live Documentation**: Automatically generates and updates documentation as components evolve, providing a reliable, current reference.
- **Consistency and Quality**: Visually test components to maintain UI consistency and quality.

#### How to Use Storybook

Storybook is installed at the root of the repository. It is configured via the `.storybook` directory, where the `main.js` file sets the search path for stories.

To run Storybook, execute:

```sh
npm run storybook
```

To add stories in the components folder, create a file ending with `*.stories.js` nested next to the component:

```sh
- components
  - <component-name>
    - src
      - ComponentName.stories.js
```
