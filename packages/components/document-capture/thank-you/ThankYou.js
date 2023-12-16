import styles from '../../styles';

class ThankYou extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
		${styles}
		<div hidden id='thanks-screen' class='flow center'>
			<div class='section | flow'>
			<h1>Thank you</h1>
			${this.hideAttribution ? '' : `
				<powered-by-smile-id></powered-by-smile-id>
			`}
			</div>
		</div>
		`;
	}
}

if ('customElements' in window && !window.customElements.get('thank-you')) {
	customElements.define('thank-you', ThankYou);
}

export { ThankYou };