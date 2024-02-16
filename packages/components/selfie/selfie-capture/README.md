# SelfieCapture Web Component

## Overview

The `SelfieCapture` is a custom web component designed to capture selfie and liveness images using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

### Importing the Component

To use the SelfieCapture component, you need to import it in your JavaScript file:

```js
import '@smileid/components/selfie-capture';
```

### Using the Component

You can use the SelfieCapture component in your HTML like any other HTML element:

```html
<selfie-capture></selfie-capture>
```

### SelfieCapture Web Component Attributes

You can you a mixture of the following attributes to configure the behaviour of the component.

#### show-navigation

This attribute, when present, shows the navigation controls for the document capture process. It does not require a value.

Usage:

```html
<selfie-capture show-navigation></selfie-capture>
```

### Permissions

The `SelfieCapture` component requires camera permissions to function. It will automatically request these permissions when it is used. If the permissions are granted, it will remove the `data-camera-error` attribute from the captureScreen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions by yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the document, the `SelfieCapture` component will handle it and set the data-camera-error attribute with the error message.

### Event Handlers

To receive the images after they have been captured, you can listen to the custom event `imagesComputed`. The data posted to this event is of the structure.

```json
detail = {
 images: [
  {image: "base64 image", image_type_id: ""}
 ],
 meta: {
  version: "version of the library in use"
 }
}
```

usage:

```js
document.querySelector('selfie-capture').addEventListener('SelfieCapture::ImageCaptured', function(event) {
 console.log(event.detail);
});
```

### Compatibility

The `SelfieCapture` component is designed to work on all modern browsers that support custom web components. However, it has a special case for multi-camera Samsung devices to mitigate blurry images at the edges. Please report any other issues found on other devices to our support team.
