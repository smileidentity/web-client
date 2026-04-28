# `<document-auto-capture>`

Auto-capture document scanner. Designed as a drop-in replacement for the
legacy `<document-capture>` element. Both elements coexist in the bundle
until cutover (the same staged rollout used for `SmartSelfieCapture`).

## Usage

```html
<document-auto-capture
  document-type="id-card"
  capture-mode="autoCapture"
  side-of-id="Front"
  theme-color="#001096"
  show-navigation
></document-auto-capture>
```

Listen for the publish event on the host element:

```js
document
  .querySelector('document-auto-capture')
  .addEventListener('document-capture.publish', (e) => {
    const { image, side, captureOrigin } = e.detail;
    // image — base64 JPEG (encoded at JPEG_QUALITY)
    // side — 'Front' | 'Back'
    // captureOrigin — 'auto' | 'manual' | 'gallery'
  });
```

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `document-type` | _(auto-detect)_ | `id-card`, `passport`, or `greenbook`. When omitted the element auto-classifies from contour aspect ratio. |
| `capture-mode` | `autoCapture` | `autoCapture` (auto with manual fallback after timeout), `autoCaptureOnly` (no manual button), `manualCaptureOnly` (no auto trigger). |
| `auto-capture-timeout` | `10000` | Milliseconds before the manual fallback button is surfaced in `autoCapture` mode. Clamped to the 3000–30000ms range. |
| `side-of-id` | `Front` | Echoed into the publish event so consumers can wire front/back flows. |
| `theme-color` | `#001096` | Primary accent colour. |
| `show-navigation` | `false` | Embed the shared `<smileid-navigation>` header. |
| `hide-attribution` | `false` | Hide the "Powered by Smile ID" footer. |
| `allow-gallery-upload` | `true` | Show a gallery-pick button alongside the capture controls. |
| `title` | _(none)_ | Optional title overlay rendered at the top of the camera viewport. |

## Events

Dispatched by the element (bubbling, composed):

| Event | Detail | Notes |
|---|---|---|
| `document-capture.publish` | `{ image, previewImage, originalWidth, originalHeight, side, captureOrigin }` | Fired once per session when an image is captured. Payload is JPEG base64 encoded at the package's `JPEG_QUALITY`. |
| `document-capture.cancelled` | — | Forwarded from `<smileid-navigation>`'s back button when `show-navigation` is set. |
| `document-capture.close` | — | Forwarded from `<smileid-navigation>`'s close button or the in-camera close icon. |

Dispatched on `<smart-camera-web>` (matching `SmartSelfieCapture`):

- `metadata.document-capture-start` / `metadata.document-capture-end`

## OpenCV runtime

Auto-capture relies on OpenCV.js. The element loads
`https://docs.opencv.org/4.8.0/opencv.js` lazily on mount unless the page
already includes it. Hosts with strict CSP must either allow that origin
(`script-src https://docs.opencv.org`) or self-host the file and inject a
`<script>` tag before the element is mounted.

If the runtime is not ready within 20 seconds the element surfaces a manual
capture button (or, in `autoCaptureOnly` mode, an error message).

## Debug mode

Append `?debug` to the page URL to reveal the in-component tuning panel
(thresholds for blur, glare, edge density, stability frames, etc.).
