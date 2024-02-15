# DocumentCapture Web Component

## Overview

The `DocumentCapture` is a custom web component designed to capture documents using a camera. It uses the `SmartCamera` module to interact with the device's camera and handle permissions.

### Importing the Component

To use the DocumentCapture component, you need to import it in your JavaScript file:

```js
import '@smileid/components/document-capture';
```

### Using the Component

You can use the DocumentCapture component in your HTML like any other HTML element:

```html
<document-capture></document-capture>
```

### DocumentCapture Web Component Attributes

You can you a mixture of the following attributes to configure the behaviour of the component.

### hide-instructions

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

#### title

This attribute sets the title of the document capture component. It requires a value.

Usage:

```html
<document-capture document-capture-modes="camera,upload"></document-capture>
```

This attribute sets the modes for the document capture process. It requires a value, which should be a string of comma-separated modes. [camera,upload]

### Permissions

The `DocumentCapture` component requires camera permissions to function. It will automatically request these permissions when it is used. If the permissions are granted, it will remove the `data-camera-error` attribute from the captureScreen and set the `data-camera-ready` attribute to true. If the permissions are denied, it will remove the `data-camera-ready` attribute and set the `data-camera-error` attribute with the error message.

If you handle the permissions by yourself, make sure to set `data-camera-ready` and `data-camera-error` appropriately.

### Error Handling

If there is an error while requesting permissions or capturing the document, the `DocumentCapture` component will handle it and set the data-camera-error attribute with the error message.

### Dependencies

The `DocumentCapture` component depends on the following modules:

* id-capture
* id-review
* document-instructions
* SmartCamera

These modules are are imported when you use the `DocumentCapture` component in your projects.

### Compatibility

The DocumentCapture component is designed to work on all modern browsers that support custom web components. However, it has a special case for multi-camera Samsung devices to mitigate blurry images at the edges. Please report any other issues found on other devices to our support team.
