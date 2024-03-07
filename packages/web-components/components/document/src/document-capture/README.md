# IdCapture Web Component

## Overview

The `IdCapture` is a custom web component designed to capture documents using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

### Importing the Component

To use the IdCapture component, you need to import it into your JavaScript file:

```js
import '@smileid/components/document-capture';
```

### Using the Component

You can use the IdCapture component in your HTML like any other HTML element:

```html
<document-capture></document-capture>
```

### IdCapture Web Component Attributes

You can use a mixture of the following attributes to configure the behavior of the component.

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

### Permissions

The `IdCapture` component requires camera permissions to function. It will automatically request these permissions when used. If the permissions are granted, it will remove the `data-camera-error` attribute from the capture screen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the document, the `IdCapture` component will handle it and set the `data-camera-error` attribute with the error message.

### Event Handlers

To receive the images after they have been captured, you can listen to the custom event `IDCapture::ImageCaptured`. The data posted to this event has the structure:

```json
{
 "detail": {
  "image": "base64 image"
 }
}
```

Usage:

```js
document.querySelector('document-capture').addEventListener('IDCapture::ImageCaptured', function(event) {
 console.log(event.detail);
});
```

### Dependencies

The `IdCapture` component depends on the following module:

* SmartCamera

This module is imported when you use the `IdCapture` component in your projects.

### Compatibility

The IdCapture component is designed to work on all modern browsers that support custom web components. However, it includes a special case for multi-camera Samsung devices to mitigate blurry images at the edges. Please report any issues found on other devices to our support team.
