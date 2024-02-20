# IdReview web component

This component is used to allow the user verify the accuracy of the capture.
The user can choose to use the captured image or recapture a document.

usage:

```html
<id-review data-image="base64image" show-navigation hide-back-to-host></id-review>
```

When a user accepts an image, an event is triggered as shown below

```js
document.querySelector('id-review').addEventListener('IdReview::SelectImage', function(event) {
});
```

When a user wants to recapture a selfie, an event is triggered as shown below

```js
document.querySelector('id-review').addEventListener('IdReview::ReCapture', function(event) {
});
```
