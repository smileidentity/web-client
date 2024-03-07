# Document Instruction Web Component Guide

## Importing the Component

To incorporate the DocumentInstruction component into your project, import it into your JavaScript file as follows:

```js
import '@smileid/document-capture/document-instructions';
```

## Using the Component

The `DocumentInstruction` component is designed to provide users with guidance for capturing document images. It can be integrated into your web page as a custom HTML element:

```html
<document-capture-instructions></document-capture-instructions>
```

### Customizing the Component

Adjust the component's behavior and appearance using the following attributes:

#### `show-navigation`

Displays navigation controls, facilitating user interaction during the document capture process. This attribute is boolean and does not require a value.

```html
<document-capture-instructions show-navigation></document-capture-instructions>
```

#### `document-capture-modes`

Determines the available modes for document capture. This attribute accepts a comma-separated string specifying the modes:

- `camera`: Enables capturing document images using the camera.
- `upload`: Allows uploading document images from the device.
- `camera,upload`: Offers users a choice between capturing images using the camera or uploading from the device.

```html
<document-capture-instructions document-capture-modes="camera,upload"></document-capture-instructions>
```

## Example

Here is a complete example demonstrating how to embed the `DocumentInstruction` component with navigation controls and both capture modes enabled:

```html
<document-capture-instructions show-navigation document-capture-modes="camera,upload"></document-capture-instructions>
```

This setup provides an intuitive interface for users, enabling them to receive instructions, navigate through the capture process, and choose their preferred method of document image submission.
