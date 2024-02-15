
# SmileID Web MonoRepo

## Overview

### Components
[Components](packages/components) is package containing web components used in
the web client.

This provides the necessary views to capture id document images, selfie images and liveness images used in verifications.
Form more detailed information, you can refer to th [packages/components documentations](./packages/components/README.md)

### Embed
[Embed f.k.a. Hosted Web Integration](packages/embed) is a package that contains two items:

1. A configuration script which creates an iframe that serves some of the
    SmileID product recipes.
2. A collection of web pages and scripts: one for each product recipe

This provides the necessary structure for self-hosted integration on the web.
Detailed information about this can be found in the [packages/embed documentation](./packages/embed/README.md).

### Smart-Camera-Web
[Smart Camera Web](packages/smart-camera-web) is a package that
contains a web-component used to capture images in the browser for use within
SmileID systems.

It is WebRTC Powered Web Component that works together with the
SmileID [Server to Server](https://docs.smileidentity.com/server-to-server) libraries.

For more detailed information, you can refer to the [packages/smart-camera-web documentation](./packages/smart-camera-web/README.md).

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

1. **Smart-Camera-Web**:

   ```sh
   cd packages/smart-camera-web
   npm test
   ```

2. **Embed**:

   ```sh
   cd packages/embed
   npm test
   ```

### Storybook

Storybook is a frontend workshop for building UI components and pages in
isolation. We have adopted this for our web-components package.

#### Why Storybook?

- Isolated Environment: Develop and test UI components in isolation, which simplifies the process and enhances focus.
- Live Documentation: Automatically generate and update documentation as components evolve, providing a reliable and up-to-date reference.
- Consistency and Quality: Visually test components to maintain consistency and quality across the user interface.

#### How to use storybook?

Storybook is installed at the root of the repository, and it is configured using
the `.storybook` folder. The `main.js` file there sets up the search path for
stories.

To run storybook:

```sh
npm run storybook
```

To add stories in the components folder, add a file ending with `*.stories.js`
nested next to the component
```sh
- components
  - <component-a>
    - src
      - ComponentA.stories.js
```
