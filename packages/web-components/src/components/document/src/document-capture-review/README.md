# DocumentCaptureReview Web Component

The `DocumentCaptureReview` component is designed to facilitate user interaction by allowing them to review and verify the accuracy of captured images. Users have the option to accept the captured image or initiate a recapture if necessary.

## Usage

To integrate the `DocumentCaptureReview` component into your web application, insert the custom HTML tag as follows, specifying attributes for the captured image data and optional features like navigation controls:

```html
<document-capture-review
  data-image="base64image"
  show-navigation
  hide-back-to-host
></document-capture-review>
```

### Attributes

- `data-image`: A base64 encoded string of the captured image to be reviewed.
- `show-navigation`: (Optional) Shows navigation controls for the review process. This attribute is boolean and does not require a value.
- `hide-back-to-host`: (Optional) Hides the option to return to the host application or page. This attribute is boolean and does not require a value.

## Event Handling

### Image Acceptance

When a user confirms the captured image as acceptable, the `document-capture-review.accepted` event is emitted. Implement an event listener to handle this action:

```js
document
  .querySelector('document-capture-review')
  .addEventListener('document-capture-review.accepted', function (event) {
    // Handle the image acceptance action here
  });
```

### Recapture Request

If the user decides to recapture the image, the `document-capture-review.rejected` event is triggered. Set up an event listener to manage this scenario:

```js
document
  .querySelector('document-capture-review')
  .addEventListener('document-capture-review.rejected', function (event) {
    // Handle the recapture request here
  });
```

## Example

Below is a sample implementation showcasing how to use the `IdReview` component with an event listener for both accepting an image and requesting a recapture:

```html
<document-capture-review
  data-image="base64image"
  show-navigation
  hide-back-to-host
></document-capture-review>

<script>
  const idReviewElement = document.querySelector('document-capture-review');

  idReviewElement.addEventListener(
    'document-capture-review.accepted',
    function (event) {
      console.log('Image accepted by the user.');
      // Additional logic for accepted image
    },
  );

  idReviewElement.addEventListener(
    'document-capture-review.rejected',
    function (event) {
      console.log('User requested to recapture the image.');
      // Additional logic for image recapture
    },
  );
</script>
```
