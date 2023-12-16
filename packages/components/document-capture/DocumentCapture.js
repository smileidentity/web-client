import './id-capture/src'
import './id-review/src'
import './instructions/src'
import { SmartCamera } from "../domain/camera/SmartCamera";
import { Router } from '../router/router';
import { IMAGE_TYPE  } from "../domain/Constants";
const VERSION = '1.0.2';

async function getPermissions(captureScreen) {
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

	captureScreen.setAttribute('data-camera-ready', true);
}

class DocumentCapture extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
			<document-instruction ${this.hideInstructions ? 'hidden' : ''}></document-instruction>
			<id-capture side-of-id='Front' id-type='National ID' ${this.hideInstructions ? '' : 'hidden'} ></id-capture>
			<id-capture id='back-of-id' side-of-id='Back' id-type='National ID' hidden ></id-capture>
			<id-review hidden></id-review>
			<id-review id='back-of-id-review' hidden></id-review>
			<thank-you hidden></thank-you>
		`;

		this._data = {
			images: [],
			partner_params: {
			  libraryVersion: VERSION,
			  permissionGranted: false,
			},
		  };

		this.documentInstruction = this.querySelector('document-instruction');
		this.idCapture = this.querySelector('id-capture');
		this.idReview = this.querySelector('id-review');
		this.idCaptureBack = this.querySelector('#back-of-id');
		this.backOfIdReview = this.querySelector('#back-of-id-review');
		this.thankYouScreen = this.querySelector('thank-you');

		if (this.hideInstructions) {
			Router.setActiveScreen(this.idCapture);
			getPermissions(this.idCapture);
		}else{
			Router.setActiveScreen(this.documentInstruction);
		}

		this.setUpEventListeners();
	}


	setUpEventListeners() {
		this.documentInstruction.addEventListener('DocumentInstruction::StartCamera', async () => {
			await getPermissions(this.idCapture);
			Router.setActiveScreen(this.idCapture);
		});

		this.idCapture.addEventListener('IDCapture::ImageCaptured', (event) => {
			this.idReview.setAttribute('data-image', event.detail.image);
			this._data.images.push({
				image: event.detail.image.split(',')[1],
				image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
			  });
			Router.setActiveScreen(this.idReview);
			SmartCamera.stopMedia();
		});

		this.idReview.addEventListener('IdReview::ReCaptureID', async (event) => {
			this.idReview.removeAttribute('data-image');
			this._data.images.pop();
			Router.setActiveScreen(this.idCapture);
			await getPermissions(this.idCapture);
		});

		this.idReview.addEventListener('IdReview::SelectImage', async () => {
			if (this.hideBackOfId) {
				this._publishSelectedImages();
			}else {
				Router.setActiveScreen(this.idCaptureBack);
				await getPermissions(this.idCaptureBack);
			}
		});

		this.idCaptureBack.addEventListener('IDCapture::ImageCaptured', (event) => {
			this.backOfIdReview.setAttribute('data-image', event.detail.image);
			this._data.images.push({
				image: event.detail.image.split(',')[1],
				image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
			  });
			Router.setActiveScreen(this.backOfIdReview);
			SmartCamera.stopMedia();
		});

		this.backOfIdReview.addEventListener('IdReview::ReCaptureID', async (event) => {
			this.backOfIdReview.removeAttribute('data-image');
			this._data.images.pop();
			Router.setActiveScreen(this.idCaptureBack);
			await getPermissions(this.idCaptureBack);
		});

		this.backOfIdReview.addEventListener('IdReview::SelectImage', () => {
			this._publishSelectedImages();
		});
	}
	_publishSelectedImages() {
		this.dispatchEvent(
		  new CustomEvent('imagesComputed', { detail: this._data }),
		);
		Router.setActiveScreen(this.thankYouScreen);
	}


	get hideInstructions() {
		return this.hasAttribute('hide-instructions');
	}

	get hideBackOfId() {
		return this.hasAttribute('hide-back-of-id');
	}
}

if ('customElements' in window && !customElements.get('document-capture')) {
	customElements.define('document-capture', DocumentCapture);
}

export { DocumentCapture };
