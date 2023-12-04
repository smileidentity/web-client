import SignaturePadCore from "signature_pad";

class SmartFileUpload {
  static memoryLimit = 2048000;

  static supportedTypes = ['image/png', 'image/svg+xml'];

  static getHumanSize(numberOfBytes) {
    // Approximate to the closest prefixed unit
    const units = [
      'B',
      'kB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB',
      'ZB',
      'YB',
    ];
    const exponent = Math.min(
      Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
      units.length - 1,
    );
    const approx = numberOfBytes / 1024 ** exponent;
    const output = exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(0)} ${units[exponent]}`;

    return output;
  }

  static getData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('An error occurred reading the file. Please check the file, and try again'));
      };
      reader.readAsDataURL(file);
    });
  }

  static async retrieve(files) {
    if (files.length > 1) {
      throw new Error('Only one file upload is permitted at a time');
    }

    const file = files[0];

    if (!SmartFileUpload.supportedTypes.includes(file.type)) {
      throw new Error('Unsupported file format. Please ensure that you are providing a PNG or SVG image');
    }

    if (file.size > SmartFileUpload.memoryLimit) {
      throw new Error(`${file.name} is too large. Please ensure that the file is less than ${SmartFileUpload.getHumanSize(SmartFileUpload.memoryLimit)}.`);
    }

    const imageAsDataUrl = await SmartFileUpload.getData(file);

    return imageAsDataUrl;
  }
}

class SignaturePad extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
:host {
  display: block;
  block-size: 30rem;
  inline-size: 25rem;
}

:host::part(upload) {
  text-align: right;
}

:host::part(signature-controls) {
  text-align: right;
  position: relative;
  top: 3rem;
  right: 1rem;
}

:host::part(upload) svg + * {
  margin-inline-start: .5rem;
}

:host::part(canvas) {
  background-color: #F9F0E7;
  --dot-bg: #F9F0E7;
  --dot-color: black;
  --dot-size: 1px;
  --dot-space: 22px;
  background:
    linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
    linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
    var(--dot-color);
  border-radius: 2rem;
  inline-size: 25rem;
  block-size: 25rem;
}

.visually-hidden {
  clip: rect(0 0 0 0); 
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap; 
  width: 1px;
}

button,
label {
  font: inherit;
  cursor: pointer;
}

label {
  display: inline-flex;
  text-decoration: underline;
}

label svg + * {
  margin-inline-start: .5rem;
}

[type="file"] {
  display: none;
}

button[data-variant="icon"] {
  appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  border: 0px;
}

button[data-variant="text"] {
  appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  border: 0px;
  text-decoration: underline;
  display: inline-flex;
  align-items: baseline;
}
    `;

    const wrapper = document.createElement('div');
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
      <p id="error" class="color-red | center"><p>
    `;

    const signatureControls = document.createElement('div');
    signatureControls.innerHTML = `
      <div part="signature-controls" id="controls">
        <button data-variant="icon" type="button" name="publish" id="publish">
          <span class="visually-hidden">
            Publish Signature
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="18" height="18" version="1.0">
            <path d="M7.689 404.614s115.165 129.688 138.198 182.664h99.042C286.39 460.596 447.62 158.16 585.82 52.208c28.633-36.814-43.298-52.01-101.346-27.64-87.486 36.73-252.488 317.169-283.307 384.653-43.762 11.516-89.829-73.706-89.829-73.706L7.69 404.615z" style="fill:#0b0;fill-opacity:1;fill-rule:evenodd;stroke:#000;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
          </svg>
        </button>
        
        <button data-variant="icon" type="button" name="clear" id="clear">
          <span class="visually-hidden">
            Clear Signature
          </span>
          <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 600 600" width="18" height="18" id="svg2">
            <defs id="defs5"/>
            <path d="M 3.2256306,500.60601 C 3.2256306,491.25372 43.758136,444.29477 93.297856,396.25279 C 142.83758,348.21081 190.58002,301.56316 199.39218,292.59134 C 208.20433,283.61953 199.05159,231.54121 179.05273,176.86176 C 137.62307,63.587785 133.84657,25.920941 162.44557,11.22195 C 201.53416,-8.8683761 255.17957,20.811156 300.20945,87.440355 L 345.82828,154.94098 L 431.49626,85.021183 C 487.8258,39.04656 528.03591,18.570758 548.9095,25.231984 C 590.2087,38.411479 614.04278,89.982978 582.83295,98.634538 C 547.40845,108.45442 400.79201,294.00339 401.07018,328.6626 C 401.20186,345.07435 422.03434,388.63634 447.36457,425.46705 C 465.23081,451.44496 489.24604,471.94435 479.71274,486.03505 L 428.75193,561.35761 C 418.86818,575.96632 382.36042,537.01753 339.11325,499.2103 L 263.67191,433.25848 L 180.03742,515.74309 C 134.03845,561.10962 91.093734,597.99391 84.60471,597.70816 C 78.115704,597.42239 3.2256306,509.95831 3.2256306,500.60601 z" id="X" style="fill:#f60000;fill-opacity:1;stroke:none;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
          </svg>
        </button>
      </div>
    `;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'signature-canvas');
    canvas.setAttribute('part', 'canvas');

    const uploadControl = document.createElement('div');
    uploadControl.setAttribute('id', 'signature-upload-wrapper');
    uploadControl.innerHTML = `
      <p part="upload">
        <strong>or</strong>
        <label>
          <input type='file' onclick='this.value=null;' id='upload-signature' accept='image/png, image/svg+xml' />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
            <rect width="16" height="16" fill="#F9F0E7" rx="2"/>
            <mask id="sign" width="16" height="16" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha">
              <rect width="16" height="16" fill="#D9D9D9" rx="2"/>
            </mask>
            <g mask="url(#sign)">
              <path fill="#2D2B2A" d="M0 13.333h16V16H0z"/>
            </g>
            <path fill="#2D2B2A" fill-rule="evenodd" d="M2.69 7.346a.23.23 0 0 1 .059-.073.275.275 0 0 1 .284-.034c.07.036.146.064.224.084h.12c0-.012.105-.048.105-.395a.796.796 0 0 1 .211-.61.667.667 0 0 1 .607-.096c.202.061.39.154.555.275.194.138.38.286.555.443.146.134.31.25.489.347l.092.047c.119.06.238-.023.185-.143l-.04-.12a.817.817 0 0 1-.066-.694.675.675 0 0 1 .244-.273.774.774 0 0 1 .364-.12c.324-.028.651 0 .964.083h.026c.027-.861.225-1.83.82-2.523.593-.694 1.478-.993 2.205-.837.726.155 1.307.73 1.307 1.602 0 1.34-.872 2.26-1.915 2.93.471.374.85.835 1.11 1.351.027.046.05.094.065.144h.014a.55.55 0 0 0 .079.203.44.44 0 0 0 .04.18c.002.025.011.05.026.07h-.013c.037.17.041.344.013.515a.955.955 0 0 1-.188.493 1.097 1.097 0 0 1-.433.344 1.346 1.346 0 0 1-1.122.012 2.194 2.194 0 0 1-.846-.67 5.024 5.024 0 0 1-.462-.681h-.026a.502.502 0 0 0-.106-.144.014.014 0 0 1-.01-.003.011.011 0 0 1-.003-.009.035.035 0 0 1-.013-.023.047.047 0 0 1-.011-.017.626.626 0 0 0-.055-.163.24.24 0 0 0-.014-.095h.014a3.477 3.477 0 0 1-.198-.49 6.318 6.318 0 0 1-.278-1.699L7.51 6.51c-.243-.07-.5-.094-.753-.071-.158.024-.198.071-.211.107-.014.036-.04.168.053.359.092.191.171.478.118.658a.45.45 0 0 1-.21.25.66.66 0 0 1-.305.06 1.521 1.521 0 0 1-.568-.19 3.533 3.533 0 0 1-.58-.42 3.54 3.54 0 0 0-.49-.394 1.49 1.49 0 0 0-.409-.203c-.053-.024-.079-.024-.092-.012H4.05c-.014.012-.066.072-.066.275 0 .395-.12.705-.423.813a.813.813 0 0 1-.41.024 1.646 1.646 0 0 1-.343-.12.237.237 0 0 1-.126-.127.208.208 0 0 1 .007-.172Zm5.731.766c.068.204.152.404.251.598.011.053.03.105.053.155.036.068.08.132.132.191.02.05.047.099.08.144.085.152.186.296.303.43.167.22.389.4.647.526a.847.847 0 0 0 .687-.011.655.655 0 0 0 .247-.204.573.573 0 0 0 .11-.287 1.435 1.435 0 0 0-.04-.454h-.014a.496.496 0 0 0-.079-.335.491.491 0 0 0-.119-.191 3.842 3.842 0 0 0-1.017-1.16l-.356.18a.253.253 0 0 1-.193.027.248.248 0 0 1-.088-.041.22.22 0 0 1-.063-.07.219.219 0 0 1-.02-.172.242.242 0 0 1 .113-.14l.172-.083a3.388 3.388 0 0 0-.463-.251l-.58-.24c.022.47.101.935.237 1.388Zm.568-1.555c.24.12.474.252.7.395 1.017-.634 1.81-1.459 1.81-2.63 0-.67-.41-1.053-.912-1.16-.502-.108-1.189.083-1.704.669-.515.586-.7 1.47-.713 2.32v.083c.251.084.515.192.819.323Z" clip-rule="evenodd"/>
          </svg>
          <span>upload a signature</span>
        </label>
      </p>
    `;

    wrapper.appendChild(errorMessage);
    wrapper.appendChild(signatureControls);
    wrapper.appendChild(canvas);
    wrapper.appendChild(uploadControl);

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    this.core = new SignaturePadCore(canvas);

    // Error Message
    this.errorMessage = errorMessage.querySelector('#error');

    // Signature Pad Controls
    this.publishSignatureButton = signatureControls.querySelector('#publish');
    this.publishSignatureButton.addEventListener('click', () => this.publishSignature());

    this.clearSignatureButton = signatureControls.querySelector('#clear');
    this.clearSignatureButton.addEventListener('click', () => this.clearSignature());

    // Upload Controls
    this.uploadSignatureButton = uploadControl.querySelector("#upload-signature");
    this.uploadSignatureButton.addEventListener('change', (event) => this.uploadSignature(event));
  }

  disconnectedCallback() {
    this.publishSignatureButton.removeEventListener('click', () => this.publishSignature());
    this.clearSignatureButton.removeEventListener('click', () => this.clearSignature());
    this.uploadSignatureButton.removeEventListener('change', (event) => this.uploadSignature(event));
  }

  publishSignature(uploadedImage) {
    try {
      this.resetErrorMessage();
      let image = uploadedImage;
      if (!image && !this.core.isEmpty()) {
        image = this.core.toDataURL();
      }

      if (image) {
        this.dispatchEvent(new CustomEvent(
          "signature-pad.publish",
          {
            detail: image,
          }
        ));
      } else {
        throw new Error("No signature present. Upload or draw a signature");
      }
    } catch (error) {
      this.handleError(error.message);
    }
  }

  resetErrorMessage() {
    this.errorMessage.textContent = '';
  }

  handleError(error) {
    this.errorMessage.textContent = error;
  }

  clearSignature() {
    this.resetErrorMessage();
    this.core.clear();
  }

  async uploadSignature(event) {
    try {
      this.resetErrorMessage();
      const { files } = event.target;

      // validate file, and convert file to data url
      const fileData = await SmartFileUpload.retrieve(files);

      this.publishSignature(fileData);
    } catch (error) {
      this.handleError(error.message);
    }
  }
}

if ('customElements' in window) {
  window.customElements.define('smileid-signature-pad', SignaturePad);
}

export { SignaturePad };