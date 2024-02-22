# LivenessCapture Web Component

## Overview

The `LivenessCapture` is a custom web component designed to capture selfies and liveness images using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

### Importing the Component

To use the LivenessCapture component, you need to import it into your JavaScript file:

```js
import '@smileid/components/selfie-capture';
```

### Using the Component

You can use the LivenessCapture component in your HTML like any other HTML element:

```html
<liveness-capture></liveness-capture>
```

### LivenessCapture Web Component Attributes

You can use a mixture of the following attributes to configure the behavior of the component.

#### hide-instructions

This attribute, when present, hides the instructions for the liveness capture process. It does not require a value.

Usage:

```html
<liveness-capture hide-instructions></liveness-capture>
```

#### show-navigation

This attribute, when present, shows the navigation controls for the liveness capture process. It does not require a value.

Usage:

```html
<liveness-capture show-navigation></liveness-capture>
```

### Permissions

The `LivenessCapture` component requires camera permissions to function. It will automatically request these permissions when used. If the permissions are granted, it will remove the `data-camera-error` attribute from the capture screen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the images, the `LivenessCapture` component will handle it and set the `data-camera-error` attribute with the error message.

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
document.querySelector('liveness-capture').addEventListener('imagesComputed', function(event) {
 console.log(event.detail);
});
```

### Dependencies

The `LivenessCapture` component depends on the following modules:

* [selfie-capture](#selfiecapture-web-component)
* [selfie-review](#selfie-review-web-component)
* Selfie-instructions
* SmartCamera

These modules are imported when you use the `LivenessCapture` component in your projects.

### SelfieCapture Web Component

#### Overview

The `SelfieCapture` is a custom web component designed to capture selfies and liveness images using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

#### Importing the SelfieCapture Component

To use the SelfieCapture component, you need to import it into your JavaScript file:

```js
import '@smileid/components/selfie-capture';
```

### Using the Component

You can use the SelfieCapture component in your HTML like any other HTML element:

```html
<selfie-capture></selfie-capture>
```

### SelfieCapture Web Component Attributes

You can use a mixture of the following attributes to configure the behavior of the component.

#### show-navigation

This attribute, when present, shows the navigation controls for the document capture process. It does not require a value.

Usage:

```html
<selfie-capture show-navigation></selfie-capture>
```

### Permissions

The `SelfieCapture` component requires camera permissions to function. It will automatically request these permissions when used. If the permissions are granted, it will remove the `data-camera-error` attribute from the capture screen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the images, the `SelfieCapture` component will handle it and set the `data-camera-error` attribute with the error message.

### Event Handlers

To receive the images after they have been captured, you can listen to the custom event `SelfieCapture::ImageCaptured`. The data posted to this event has the structure:

```json
{
 "detail": {
  "images": [
   {"image": "

base64 image", "image_type_id": ""}
  ],
  "meta": {
   "version": "version of the library in use"
  }
 }
}
```

Usage:

```js
document.querySelector('selfie-capture').addEventListener('SelfieCapture::ImageCaptured', function(event) {
 console.log(event.detail);
});
```

### SelfieReview Web Component

This component is used to allow the user to verify the accuracy of the capture.
The user can choose to use the captured image or recapture a new selfie.

Usage:

```html
<selfie-review data-image="base64 image" show-navigation hide-back-to-host></selfie-review>
```

When a user accepts an image, an event is triggered as shown below:

```js
document.querySelector('selfie-review').addEventListener('SelfieReview::SelectImage', function(event) {
});
```

When a user wants to recapture a selfie, an event is triggered as shown below:

```js
document.querySelector('selfie-review').addEventListener('SelfieReview::ReCapture', function(event) {
});
```

### Compatibility

The LivenessCapture component is designed to work on all modern browsers that support custom web components. However, it includes a special case for multi-camera Samsung devices to mitigate blurry images at the edges. Please report any issues found on other devices to our support team.
