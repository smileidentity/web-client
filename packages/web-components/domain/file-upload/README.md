# SmartFileUpload.js

This exports a class for dealing with file-uploads in SmileID's web components

## Usage

Suppose you have an file input field

```html
<input
  type="file"
  id="upload-photo"
  name="document"
  accept="image/png, image/jpeg"
/>
```

```javascript
// get the element
const uploadDocumentPhotoButton = document.getElementById('upload-photo');
// add a change event listener
uploadDocumentPhotoButton.addEventListener('change', async (event) => {
  try {
    const { files } = event.target;

    // validate file, and convert file to data url
    // returns the data url for the first file
    const fileData = await SmartFileUpload.retrieve(files);

    // use the data url
  } catch (error) {
    // handle error
  }
});
```
