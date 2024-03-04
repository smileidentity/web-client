# SmartCamera.js

SmartCamera.js is a JavaScript class that provides an interface for interacting with the user's camera device. It has special handling for multi-camera Samsung devices to mitigate issues with blurry images at the edges.

## Usage

### Getting Media Stream

To get the media stream from the user's camera, call the `getMedia` method with the desired constraints. This method returns a Promise that resolves to a MediaStream object.

```javascript
const constraints = {
 video: true,
 audio: false,
};
const stream = await SmartCamera.getMedia(constraints);
```

`StartCamera` is a singleton so the `stream` can be accessed anytime via `SmartCamera.stream`.

```javascript
   let video =  document.createElement('video');

    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }
    video.play();
```

### Stopping Media Stream

To stop the media stream, call the stopMedia method. This will stop all tracks in the stream and set the stream to null.
