# Smart Camera Web

<img alt="Build" src="https://github.com/smileidentity/smart-camera-web/actions/workflows/deploy-preview.yml/badge.svg" />

SmartCameraWeb is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
used to capture images — selfies, liveness images, ID Document images — for use
with SmileIdentity.

It works together with our [Server to Server](https://docs.smileidentity.com/server-to-server)
libraries, acting as a user interface client.

Here's an [example full stack integration](https://glitch.com/edit/#!/smart-camera-web-demo-node)
using our [NodeJS](https://docs.smileidentity.com/server-to-server/javascript)
library.

## Guide

In order to build with this, you need to follow the following steps:

1. Choose a Server to Server Library
2. Install the Web SDK
3. Use the Web SDK
4. Parse Images to Server to Server Library & Submit to SmileIdentity

### Choose a Server to Server Library

We currently have [Server to Server
Libraries](https://docs.smileidentity.com/server-to-server) in the following
languages / run-times.

- [Ruby](https://docs.smileidentity.com/server-to-server/ruby)
- [Python](https://docs.smileidentity.com/server-to-server/python)
- [Java](https://docs.smileidentity.com/server-to-server/java)
- [NodeJS](https://docs.smileidentity.com/server-to-server/javascript)
- [PHP](https://docs.smileidentity.com/server-to-server/php)

In this documentation, our code samples will use the NodeJS Server to Server library.

### Installation
We support installation through NPM and by adding a script tag from our CDN.

#### Install Via NPM
```shell
npm install @smile_identity/smart-camera-web@<version>
```

In your VueJS / AngularJS / React page or component, import the package this way

```js
import '@smile_identity/smart-camera-web'
```

#### Install via a script tag
```html
<script src="https://cdn.smileidentity.com/js/<version>/smart-camera-web.js"></script>
```

We use semantic versioning. As such, an example of a valid link will be:
```html
<script src="https://cdn.smileidentity.com/js/v1.0.0-beta.7/smart-camera-web.js"></script>
```
### Usage

On successful installation, and importing if required, you can use the web
component by following these two steps.

#### Steps

1. Insert the following markup in your page / component

    - For Selfie Capture / Liveness Images only

      ```html
      <smart-camera-web>
      </smart-camera-web>
      ```
    - For Selfie Capture / Liveness, and ID Images

      ```html
      <smart-camera-web capture-id>
      </smart-camera-web>

    The following image should show up on your web page, if installation, and import, was successful.

    <img
      src='https://cdn.smileidentity.com/images/smart-camera-web/request.jpg'
      width='205'
      height='350'
    />

    After granting access by clicking the button, you should see the capture screen below

    <img
      src='https://cdn.smileidentity.com/images/smart-camera-web/selfie-camera.png'
      width='205'
      height='350'
    />

    On clicking the "Take Selfie" button, you should be navigated to a review screen.

    <img
      src='https://cdn.smileidentity.com/images/smart-camera-web/selfie-review.png'
      width='205'
      height='350'
    />

    You can review the selfie taken or select it, when it meets your criteria.

    When the `capture-id` attribute is added, we have the following extra screens.

    - ID Camera

    <img
      src='https://cdn.smileidentity.com/images/smart-camera-web/id-camera.png'
      width='205'
      height='350'
    />

    - ID Review

    <img
      src='https://cdn.smileidentity.com/images/smart-camera-web/id-review.png'
      width='205'
      height='350'
    />

2. Handle the `imagesComputed` event in your page / component

On clicking the "Yes, use this one" button for the selfie / liveness images flow,
or the "Approve" icon on the `capture-id` flow, an `imagesComputed` event will be published.

`imagesComputed` is a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) returning data — in `e.detail`.
Here's a sample:

```js
{
  partner_params: {
    libraryVersion: "1.0.0-beta.7",
    permissionGranted: true
  },
  images: [
    {
      image_type_id: 2,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."  // truncated base64 encoded string of image
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 6,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
    {
      image_type_id: 3,
      image: "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAA..."
    },
  ]
}
```

`partner_params` are documented [here](https://docs.smileidentity.com/further-reading/faqs/what-are-partner_params),
and `image_type_id` is explained [here](https://docs.smileidentity.com/further-reading/faqs/what-are-the-image-types-i-can-upload-to-smile-id)

Here, we handle the `imagesComputed` event by sending the data to an endpoint.

```html
<script>
  const app = document.querySelector('smart-camera-web');

  const postContent = async (data) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    try {
      const response = await fetch('/', options)
      const json = await response.json();

      return json;
    } catch (e) {
      throw e;
    }
  };

  app.addEventListener('imagesComputed', async (e) => {

    try {
      const response = await postContent(e.detail);

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });
</script>
```

The sample endpoint is built using our NodeJS Server to Server library and ExpressJS. This is the code below:

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
      SID_SERVER
    );

    const partner_params_from_server = {
      user_id: `user-${UUID()}`,
      job_id: `job-${UUID()}`,
      job_type: 4 // job_type is the simplest job we have which enrolls a user using their selfie
    };

    const { images, partner_params: { libraryVersion } } = req.body;

    const options = {
      return_job_status: true
    };
    
    const partner_params = Object.assign({}, partner_params_from_server, { libraryVersion });
    
    
    const result = await connection.submit_job(
      partner_params,
      images,
      {},
      options
    );

    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

// NOTE: This can be used to process responses. don't forget to add it as a callback option in the `connection` config on L22
// https://docs.smileidentity.com/further-reading/faqs/how-do-i-setup-a-callback
app.post('/callback', (req, res, next) => {
});

app.listen(process.env.PORT || 4000);
```

You can also build this using any of the other Server to Server libraries.

## Notes

This library can be used with most JS frameworks / libraries directly.
However, for [ReactJS](https://reactjs.org), there need to be a few extra steps.
This is due to the cross-compatibility issues between React and WebComponents.

In order to work around this, we've found this [tutorial](https://www.robinwieruch.de/react-web-components) helpful in the past.

## Support

This library has been tested on the latest versions of Chrome, Edge, Firefox, and Safari.
If any issues are found with some browsers, please notify us.
