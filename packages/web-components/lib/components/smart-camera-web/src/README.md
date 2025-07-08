# SmartCameraWeb

`SmartCameraWeb` is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) designed to capture images including selfies, liveness images, and ID Document images for use with SmileIdentity. It interfaces with the [Server to Server](https://docs.usesmileid.com/server-to-server) libraries, serving as a user interface client.

Explore an [example full stack integration](https://glitch.com/edit/#!/smart-camera-web-demo-node) using our [NodeJS](https://docs.usesmileid.com/server-to-server/javascript) library.

## Getting Started

To integrate `SmartCameraWeb`, follow these steps:

- [SmartCameraWeb](#smartcameraweb)
  - [Getting Started](#getting-started)
    - [Choose a Server to Server Library](#choose-a-server-to-server-library)
    - [Installation](#installation)
      - [Install Via NPM](#install-via-npm)
    - [Usage](#usage)
  - [Compatibility](#compatibility)
  - [Support](#support)
  - [Development](#development)

### Choose a Server to Server Library

Supported [Server to Server Libraries](https://docs.usesmileid.com/server-to-server) include:

- [Java](https://docs.usesmileid.com/server-to-server/java)
- [NodeJS](https://docs.usesmileid.com/server-to-server/javascript)
- [PHP](https://docs.usesmileid.com/server-to-server/php)
- [Python](https://docs.usesmileid.com/server-to-server/python)
- [Ruby](https://docs.usesmileid.com/server-to-server/ruby)

> **Note**: Code samples in this documentation utilize the NodeJS Server to Server library.

### Installation

You can install via NPM or directly include it from our CDN.

#### Install Via NPM

```shell
npm install @smileid/web-components@<version>
```

Then, in your VueJS, AngularJS, or React component:

```js
import '@smileid/web-components/smart-camera-web';
```

### Usage

After installation and necessary imports:

1. Add the desired markup to your page/component:
   - **For Selfie Capture / Liveness Images**:

     ```html
     <smart-camera-web></smart-camera-web>
     ```

   - **For Selfie Capture / Liveness and ID Images**:

     ```html
     <smart-camera-web capture-id></smart-camera-web>
     ```

     Initially, you'll see this image:
     ![Selfie Capture Instruction](https://cdn.smileidentity.com/images/smart-camera-web/selfie-capture-instruction.png)

     After granting access, the capture screen appears:
     ![Selfie Camera](https://cdn.smileidentity.com/images/smart-camera-web/selfie-capture.png)

     Upon capturing a selfie, you'll reach the review screen:
     ![Selfie Review](https://cdn.smileidentity.com/images/smart-camera-web/selfie-capture-review.png)

   ![Document Capture Instruction](https://cdn.smileidentity.com/images/smart-camera-web/document-capture-instruction.png)

   If the `capture-id` attribute is used, additional screens include:

   ![ID Camera](https://cdn.smileidentity.com/images/smart-camera-web/document-capture.png)

   ![ID Review](https://cdn.smileidentity.com/images/smart-camera-web/document-review-new.png)

2. Handle the `smart-camera-web.publish` event:

   When the user approves the captured image, an `smart-camera-web.publish` event is dispatched. The event returns a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) payload in `e.detail`.

   Here's a script example to handle the event and send data to a backend endpoint:

   ```html
   <script>
     const app = document.querySelector('smart-camera-web');

     const postContent = async (data) => {
       const options = {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
       };

       try {
         const response = await fetch('/', options);
         const json = await response.json();

         return json;
       } catch (e) {
         throw e;
       }
     };

     app.addEventListener('smart-camera-web.publish', async (e) => {
       try {
         const response = await postContent(e.detail);

         console.log(response);
       } catch (e) {
         console.error(e);
       }
     });
   </script>
   ```

   The provided backend endpoint uses the NodeJS Server to Server library and ExpressJS:

   ```js
   const express = require('express');
   const { v4: UUID } = require('uuid');

   if (process.env.NODE_ENV === 'development') {
     const dotenv = require('dotenv');

     dotenv.config();
   }

   const SIDCore = require('smile-identity-core');
   const SIDSignature = SIDCore.Signature;
   const SIDWebAPI = SIDCore.WebApi;

   const app = express();

   app.use(express.json({ limit: '500kb' }));
   app.use(express.static('public'));

   app.post('/', async (req, res, next) => {
     try {
       const { PARTNER_ID, API_KEY, SID_SERVER } = process.env;
       const connection = new SIDWebAPI(
         PARTNER_ID,
         '/callback',
         API_KEY,
         SID_SERVER,
       );

       const partner_params_from_server = {
         user_id: `user-${UUID()}`,
         job_id: `job-${UUID()}`,
         job_type: 4, // job_type is the simplest job we have which enrolls a user using their selfie
       };

       const {
         images,
         partner_params: { libraryVersion },
       } = req.body;

       const options = {
         return_job_status: true,
       };

       const partner_params = Object.assign({}, partner_params_from_server, {
         libraryVersion,
       });

       const result = await connection.submit_job(
         partner_params,
         images,
         {},
         options,
       );

       res.json(result);
     } catch (e) {
       console.error(e);
     }
   });

   // NOTE: This can be used to process responses. don't forget to add it as a callback option in the `connection` config on L22
   // https://docs.usesmileid.com/further-reading/faqs/how-do-i-setup-a-callback
   app.post('/callback', (req, res, next) => {});

   app.listen(process.env.PORT || 4000);
   ```

   This approach can also be achieved using other Server to Server libraries.

## Compatibility

`SmartCameraWeb` is compatible with most JavaScript frameworks and libraries. For integration with [ReactJS](https://reactjs.org), refer to this [tutorial](https://www.robinwieruch.de/react-web-components) due to React-WebComponents compatibility issues.

## Support

Tested on the latest versions of Chrome, Edge, Firefox, and Safari. If compatibility issues arise on certain browsers, please notify us.

## Development

Note: `smart-camera-web.js` is generated from `src/` using [esbuild](https://esbuild.github.io/). To make changes, edit the source files and run `npm run build` to generate the new `smart-camera-web.js` file.
