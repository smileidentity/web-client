# Usage Guide for Document Instruction Web Component

## Importing the Component

First, you need to import the DocumentInstruction component into your JavaScript file:

```js
import from '@smileid/document-capture';
```

## Using the Component

The `DocumentInstruction` component is a function that returns a template string. This string represents an HTML structure that can be inserted into your web page.

Here's an example of how to use it:

```html
<document-instruction></document-instruction>
```

### Customizing the Component

#### show-navigation

This attribute, when present, shows the navigation controls for the document capture process. It does not require a value.

Usage:

```html
<document-instruction show-navigation></document-instruction>
```

#### document-capture-modes

This attribute sets the modes for the document capture process. It requires a value, which should be a string of comma-separated modes. Available options are `camera`, `upload` or `camera,upload`.

* camera - The user can only capture and id document image via the camera
* upload - The user can only upload an id document image
* camera,upload - The user can choose to upload or capture iva the camera

Usage:

```html
<document-capture document-capture-modes="camera,upload"></document-capture>
```
