import './id-capture/src'
import './id-review/src'
import './instructions/src'
import { SmartCamera } from "../domain/camera/SmartCamera";
import { Router } from '../router/router';

class DocumentCapture extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
			<document-instruction ${this.hideInstructions ? 'hidden' : ''}></document-instruction>
			<id-capture ${this.hideInstructions ? '' : 'hidden'}></id-capture>
			<id-review hidden></id-review>
		`;

		this.documentInstruction = this.querySelector('document-instruction');
		this.idCapture = this.querySelector('id-capture');
		this.idReview = this.querySelector('id-review');

		if (this.hideInstructions) {
			Router.setActiveScreen(this.idCapture);
		}else{
			Router.setActiveScreen(this.documentInstruction);
		}

		this.documentInstruction.addEventListener('DocumentInstruction::StartCamera', async () => {
			await SmartCamera.getMedia({
				audio: false,
				video: {
					facingMode: 'environment',
					width: { min: 1280 },
					// NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
					// "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
					// Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
					zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
				},
			});

			Router.setActiveScreen(this.idCapture);
		});

		this.idCapture.addEventListener('IDCapture::ImageCaptured', (event) => {
			this.idReview.setAttribute('data-image', event.detail.image);
			Router.setActiveScreen(this.idReview);
		});
	}


	get hideInstructions() {
		return this.hasAttribute('hide-instructions');
	}
}

if ('customElements' in window && !customElements.get('document-capture')) {
	customElements.define('document-capture', DocumentCapture);
}

export { DocumentCapture };
