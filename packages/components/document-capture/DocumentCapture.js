import './id-capture/src'
import './id-review/src'
import './document-instructions/src'
import { SmartCamera } from "../domain/camera/SmartCamera";
import { IMAGE_TYPE } from "../domain/Constants";
import { version as COMPONENTS_VERSION } from "../package.json";
import styles from '../styles';

async function getPermissions(captureScreen) {
	try {
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
		captureScreen.removeAttribute('data-camera-error');
		captureScreen.setAttribute('data-camera-ready', true);
	} catch (error) {
		captureScreen.removeAttribute('data-camera-ready');
		captureScreen.setAttribute('data-camera-error', SmartCamera.handleError(error));
	}
}

class DocumentCapture extends HTMLElement {
	constructor() {
		super();
		this.activeScreen = null;
	}

	connectedCallback() {
		this.innerHTML = `
			${styles}
			<div>
			<document-instruction ${this.hideInstructions ? 'hidden' : ''}></document-instruction>
			<id-capture side-of-id='Front' id-type='National ID' ${this.hideInstructions ? '' : 'hidden'} ></id-capture>
			<id-capture id='back-of-id' side-of-id='Back' id-type='National ID' hidden ></id-capture>
			<id-review hidden></id-review>
			<id-review id='back-of-id-review' hidden></id-review>
			<thank-you hidden></thank-you>
			</div>
		`;

		this._data = {
			images: [],
			meta: {
				libraryVersion: COMPONENTS_VERSION,
			},
		};

		this.documentInstruction = this.querySelector('document-instruction');
		this.idCapture = this.querySelector('id-capture');
		this.idReview = this.querySelector('id-review');
		this.idCaptureBack = this.querySelector('#back-of-id');
		this.backOfIdReview = this.querySelector('#back-of-id-review');
		this.thankYouScreen = this.querySelector('thank-you');

		if (this.hideInstructions) {
			getPermissions(this.idCapture);
			this.setActiveScreen(this.idCapture);
		} else {
			this.setActiveScreen(this.documentInstruction);
		}

		this.setUpEventListeners();
	}
	disconnectedCallback() {
		SmartCamera.stopMedia();
		if (this.activeScreen) {
			this.activeScreen.removeAttribute('hidden');
		}
		this.activeScreen = null;
		this.innerHTML = '';
	}

	setUpEventListeners() {
		this.documentInstruction.addEventListener('DocumentInstruction::StartCamera', async () => {
			this.setActiveScreen(this.idCapture);
			await getPermissions(this.idCapture);
		});

		this.idCapture.addEventListener('IDCapture::ImageCaptured', (event) => {
			this.idReview.setAttribute('data-image', event.detail.image);
			this._data.images.push({
				image: event.detail.image.split(',')[1],
				image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64,
			});
			SmartCamera.stopMedia();
			this.setActiveScreen(this.idReview);
		});

		this.idReview.addEventListener('IdReview::ReCaptureID', async (event) => {
			this.idReview.removeAttribute('data-image');
			this._data.images.pop();
			this.setActiveScreen(this.idCapture);
			await getPermissions(this.idCapture);
		});

		this.idReview.addEventListener('IdReview::SelectImage', async () => {
			if (this.hideBackOfId) {
				this._publishSelectedImages();
			} else {
				this.setActiveScreen(this.idCaptureBack);
				await getPermissions(this.idCaptureBack);
			}
		});

		this.idCaptureBack.addEventListener('IDCapture::ImageCaptured', (event) => {
			this.backOfIdReview.setAttribute('data-image', event.detail.image);
			this._data.images.push({
				image: event.detail.image.split(',')[1],
				image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64,
			});
			this.setActiveScreen(this.backOfIdReview);
			SmartCamera.stopMedia();
		});

		this.backOfIdReview.addEventListener('IdReview::ReCaptureID', async (event) => {
			this.backOfIdReview.removeAttribute('data-image');
			this._data.images.pop();
			this.setActiveScreen(this.idCaptureBack);
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
	}


	get hideInstructions() {
		return this.hasAttribute('hide-instructions');
	}

	get hideBackOfId() {
		return this.hasAttribute('hide-back-of-id');
	}

	setActiveScreen(screen) {
		this.activeScreen?.setAttribute('hidden', '');
		screen.removeAttribute('hidden');
		this.activeScreen = screen;
	}
}

if ('customElements' in window && !customElements.get('document-capture')) {
	customElements.define('document-capture', DocumentCapture);
}

export { DocumentCapture };
