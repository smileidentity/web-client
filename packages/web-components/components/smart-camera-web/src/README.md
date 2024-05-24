# SmartCameraWeb Component

The SmartCameraWeb is a custom web component that encapsulates several functionalities related to camera operations. It is built using the native Custom Elements API.

## Usage

First, import the SmartCameraWeb component into your JavaScript file:

```js
import SmartCameraWeb from 'path-to-component/SmartCameraWeb';
```

Then, you can use the SmartCameraWeb component in your HTML:

```js
<smart-camera-web
  show-navigation
  hide-attribution 
  hide-instructions
  hide-back-to-host
  document-type="Your Document Type"
  document-capture-modes="Your Document Capture Modes"
  hide-back-of-id="false">
</smart-camera-web>
```

## Options

The SmartCameraWeb component accepts several attributes that customize its behavior:

`show-navigation`: Determines whether navigation should be displayed. Set to show navigation.
`hide-attribution`: Determines whether attribution should be hidden. Set to hide attribution.
`hide-instructions`: Determines whether instructions should be hidden. Set to hide instructions.
`hide-back-to-host`: Determines whether the back to host option should be hidden. Set to hide the back to host option.
`document-type`: The type of document to be captured.
`document-capture-modes`: The modes of document capture. The value can be either `camera`, `upload` or a comma separated value `camera,upload`
`hide-back-of-id`: Determines whether the back of the ID should be hidden. Set to hide the back of the ID, the back of ID document capture will be skipped.
