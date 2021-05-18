# Smart-Camera-Web
![Build](https://github.com/smileidentity/smart-camera-web/actions/workflows/main.yml/badge.svg)

This is a [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
library built to enable us capture selfies and liveness images for use with SmileIdentity.

It works in concert with our [server-side libraries](https://docs.smileidentity.com/products/core-libraries).

Here's an [example full-stack integration](https://glitch.com/edit/#!/smart-camera-web-demo-node) using our [NodeJS Server-Side Library](https://www.npmjs.com/package/smile-identity-core)

## Installation

We support installation through NPM and by adding a script tag from our CDN

### Install Via NPM
```shell
npm install @smile_identity/smart-camera-web@<version>
```

In your VueJS / AngularJS / React page or component, import the package this way

```js
import '@smile_identity/smart-camera-web'
```

### Install via a script tag
```html
<script src="https://cdn.smileidentity.com/js/<version>/smart-camera-web.js"></script>
```

We use semantic versioning. As such, an example of a valid link will be:
```html
<script src="https://cdn.smileidentity.com/js/v1.0.0-beta.2/smart-camera-web.js"></script>
```
## Usage

After installing, and importing if required, you can use the web-component by
following these two steps

### Steps
1. Insert the following markup in your page / component

```html
<smart-camera-web>
</smart-camera-web>
```

2. Listen for the `imagesComputed` event in your page / component

```js
const smartCameraWeb = document.querySelector('smart-camera-web');

smartCameraWeb.addEventListener('imagesComputed', (e) => {
  const data = e.detail;

  // add any textual data that may be required here
});
```

`imagesComputed` is a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) returning data — in `e.detail` — of the shape:

```js
{
  partner_params: {
    libraryVersion: String,
    permissionGranted: Boolean, // expected to be `true`
  },
  images: [
    {
      file: '',
      image_type_id: Number, // as recommended here: https://docs.smileidentity.com/products/core-libraries#images-required
      image: String // base64 encoded string of image
    }
  ]
}
```

We advise that the `partner_params` published be merged with other [`partner_params`](https://docs.smileidentity.com/products/core-libraries#partner_params-required) sent with your request.

## Notes

This library can be used with most JS frameworks / libraries directly.
However, for [ReactJS](https://reactjs.org), there need to be a few extra steps.
This is due to the cross-compatibility issues between React and WebComponents.

In order to work around this, we've found this [tutorial](https://www.robinwieruch.de/react-web-components) helpful in the past.

## Support

This library has been tested on the latest versions of Chrome, Edge, Firefox, and Safari.
If any issues are found with some browsers, please notify us.
