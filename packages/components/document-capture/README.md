# DocumentCapture Web Component

## Overview

The `DocumentCapture` is a custom web component designed to capture documents using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

### Importing the Component

To use the DocumentCapture component, you need to import it into your JavaScript file:

```js
import '@smileid/components/document-capture';
```

### Using the Component

You can use the DocumentCapture component in your HTML like any other HTML element:

```html
<document-capture></document-capture>
```

### DocumentCapture Web Component Attributes

You can use a mixture of the following attributes to configure the behavior of the component.

#### hide-instructions

This attribute, when present, hides the instructions for the document capture process. It does not require a value.

Usage:

```html
<document-capture hide-instructions></document-capture>
```

#### hide-back-of-id

This attribute, when present, hides the option to capture the back of the ID. It does not require a value.

Usage:

```html
<document-capture hide-back-of-id></document-capture>
```

#### show-navigation

This attribute, when present, shows the navigation controls for the document capture process. It does not require a value.

Usage:

```html
<document-capture show-navigation></document-capture>
```

#### document-capture-modes

This attribute sets the modes for the document capture process. It requires a value, which should be a string of comma-separated modes. Available options are `camera`, `upload`, or `camera,upload`.

Usage:

```html
<document-capture document-capture-modes="camera,upload"></document-capture>
```

### Permissions

The `DocumentCapture` component requires camera permissions to function. It will automatically request these permissions when used. If the permissions are granted, it will remove the `data-camera-error` attribute from the capture screen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the document, the `DocumentCapture` component will handle it and set the `data-camera-error` attribute with the error message.

### Event Handlers

To receive the images after they have been captured, you can listen to the custom event `imagesComputed`. The data posted to this event has the structure:

```json
{
 "detail": {
  "images": [
   {"image": "base64 image", "image_type_id": ""}
  ],
  "meta": {
   "version": "version of the library in use"
  }
 }
}
```

Usage:

```js
document.querySelector('document-capture').addEventListener('imagesComputed', function(event) {
 console.log(event.detail);
});
```

### Dependencies

The `DocumentCapture` component depends on the following modules:

* [document-instructions](./document-instructions/src/README.md)
* [id-capture](./id-capture/src/README.md)
* [id-review](./id-review/src/README.md)
* SmartCamera

These modules are imported when you use the `DocumentCapture` component in your projects.

### Compatibility

The DocumentCapture component is designed to work on all modern browsers that support custom web components. However, it includes a special case for multi-camera Samsung devices to mitigate blurry images at the edges. Please report any issues found on other devices to our support team.
