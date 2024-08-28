import PoweredBySmileId from './PoweredBySmileId';
import SmartCameraWeb from './SmartCameraWeb';

if (window.customElements && !window.customElements.get('powered-by-smile-id')) {
   window.customElements.define('powered-by-smile-id', PoweredBySmileId);
}
if (window.customElements && !window.customElements.get('smart-camera-web')) {
   window.customElements.define('smart-camera-web', SmartCameraWeb);
}
