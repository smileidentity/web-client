'use strict';

function templateString() {
	return `
		<link rel="preconnect" href="https://fonts.gstatic.com"> 
		<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap" rel="stylesheet">

		<style>
			*,
			*::before,
			*::after {
				box-sizing: border-box;
				margin: 0;
				padding: 0;
			}

			:host {
				--flow-space: 1.5rem;

				--color-dark: #404040;
				--color-grey: #555B69;

				--color-success: #1EB244;
				--color-failure: #FFEDEB;
				--color-failure-tint: #F86B58;

				--color-richblue: #043C93;
				--color-theme: ${this.themeColor};
			}

			html {
				font-family: 'Nunito Sans', sans-serif;
			}

			[hidden] {
				display: none !important;
			}

			[disabled] {
				cursor: not-allowed !important;
				filter: grayscale(75%);
			}

			.visually-hidden {
				border: 0;
				clip: rect(1px 1px 1px 1px);
				clip: rect(1px, 1px, 1px, 1px);
				height: auto;
				margin: 0;
				overflow: hidden;
				padding: 0;
				position: absolute;
				white-space: nowrap;
				width: 1px;
			}

			.color-dark {
				color: var(--color-dark);
			}

			.color-grey {
				color: var(--color-grey);
			}

			.flow > * + * {
				margin-top: var(--flow-space);
			}

			.center {
				margin-left: auto;
				margin-right: auto;

				text-align: center;
			}

			h1 {
				font-size: 20px;
				font-weight: 400;
			}

			ol[role=list], ul[role=list] {
				list-style: none;
				padding-left: 0;
			}

			button {
				border-radius: .5rem;
				font-size: 20px;
				text-align: center;
				width: 100%;
				display: inline-block;
				padding: 1rem 2.5rem;
				cursor: pointer;
				font-weight: 500;
				line-height: 1;
				letter-spacing: .05ch;
				text-decoration: none;
				display: inline-block;
				border: none;
				transition: background 250ms ease-in-out,
										transform 150ms ease;
				-webkit-appearance: none;
				-moz-appearance: none;
			}

			button:focus,
			button:hover {
				filter: opacity(.75);
			}

			button[data-type='icon'] {
				height: 2rem;
				padding: 0;
				width: 2rem;
				background: transparent;
			}

			button[data-type='primary'] {
				background-color: #1EB244;
				color: #FEFEFE;
			}

			button[data-type='secondary'] {
				background-color: #FFEDEB;
				color: #F86B58;
			}

			img {
				border-radius: 50%;
				position: relative;
			}

			img::before {
				background-color: #ffffff;
				border-radius: 50%;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			.callout {
				border: 0.8px solid #DEEAEF;
				border-radius: .5rem;
				font-size: .875rem;
				padding: 1rem 1.5rem;
			}

			.processing-list {
			}

			.processing-list__items {
				display: flex;
				align-items: center;
			}

			.processing-list__items > * + p {
				margin-left: 1rem;
			}

			.processing-list__items > :last-child {
				margin-left: auto;
			}

			.theme {
				font-weight: 700;
				color: var(--color-theme);
			}

			.tooltip {
				position: relative;
			}

			.tooltip__trigger {
			}

			.tooltip__trigger:focus + .tooltip__content,
			.tooltip__trigger:hover + .tooltip__content {
				display: flex;
			}

			.tooltip__content {
				align-items: flex-start;
				background-color: #ffffff;
				border-radius: .5rem;
				box-shadow: 0px 12px 36px rgba(0, 0, 0, 0.08);
				display: none;
				padding: 1.25rem;
				position: absolute;
				right: 20px;
				bottom: -50px;
				width: 200px;
			}

			.tooltip__content > :last-child {
				margin-left: 1rem;
			}

			.tooltip__content .title {
				font-size: .75rem;
				font-weight: 700;
			}

			.tooltip__content .description {
				--flow-space: .25rem;
				font-size: .625rem;
				color: #6B7280;
			}

			svg {
				flex-shrink: 0;
			}
		</style>

		<section class='flow center'>
			<img alt='' width='50' height='50' src='${this.partnerLogoURL}' />
			<h1>
				<span class='theme'>${this.partnerName}</span>
				wants to access your
				<span class='theme'>${this.IDType}</span>
				information
			</h1>
			<p class='color-grey'>
				This will allow ${this.partnerName} to:
			</p>
		</section>

		<ul role='list' class='processing-list flow' style='--flow-space: 2.5rem; margin: var(--flow-space) auto;'>
			<li class='processing-list__items'>
				<svg width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="22.723" height="22.575" rx="4.537" fill="#2F718D"/>
					<path d="M5.681 6.773c0-.621.511-1.13 1.136-1.13h5.68c.626 0 1.137.509 1.137 1.13 0 .62-.511 1.128-1.136 1.128h-5.68A1.136 1.136 0 0 1 5.68 6.773ZM5.68 11.288c0-.62.512-1.129 1.137-1.129h9.089c.625 0 1.136.508 1.136 1.129 0 .62-.511 1.129-1.136 1.129h-9.09a1.136 1.136 0 0 1-1.135-1.129ZM5.68 15.803c0-.621.512-1.13 1.137-1.13h2.272c.625 0 1.136.509 1.136 1.13 0 .62-.511 1.128-1.136 1.128H6.817a1.136 1.136 0 0 1-1.136-1.128Z" fill="#fff"/>
				</svg>
				<p>
					Process your personal details
				</p>
				<div class='tooltip'>
					<button class='tooltip__trigger' type='button' data-type='icon'>
						<svg width="17" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
							<symbol id='info-icon'>
								<ellipse cx="8.512" cy="8.463" rx="7.512" ry="7.463" stroke="#043C93" stroke-linecap="round" stroke-linejoin="round"/>
								<path fill-rule="evenodd" clip-rule="evenodd" d="M8.512 6.473c.692 0 1.252-.557 1.252-1.244 0-.687-.56-1.244-1.252-1.244-.691 0-1.252.557-1.252 1.244 0 .687.56 1.244 1.252 1.244ZM7.51 7.663a.8.8 0 0 0 0 1.6h.202v3.18a.8.8 0 0 0 .8.8h1.002a.8.8 0 0 0 0-1.6h-.202v-3.18a.8.8 0 0 0-.8-.8H7.51Z" fill="#043C93"/>
							</symbol>
							<use href='#info-icon' />
						</svg>
						<span class='visually-hidden'>Details</span>
					</button>
					<div class='tooltip__content'>
						<svg width="16" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
							<symbol id='shield-icon'>
								<g clip-path="url(#a)">
									<path d="m5.666 9.196 1.556 1.81 3.111-3.62m4.37-3.635c-.16.01-.32.015-.481.015C11.832 3.766 9.651 2.72 8 1 6.348 2.72 4.168 3.766 1.778 3.766a8.15 8.15 0 0 1-.481-.015A12.57 12.57 0 0 0 1 6.481C1 11.541 3.974 15.794 8 17c4.025-1.206 7-5.458 7-10.519 0-.943-.104-1.857-.297-2.73Z" stroke="#2D9CDB" stroke-width="1.535" stroke-linecap="round" stroke-linejoin="round"/>
								</g>
								<defs>
									<clipPath id="a">
										<path fill="#fff" d="M0 0h16v18H0z"/>
									</clipPath>
								</defs>
							</symbol>
							<use href='#shield-icon' />
						</svg>

						<div class='flow'>
							<p class='title'>
								Personal Details
							</p>

							<p class='description'>
								Partner can process your names, DOB, and gender.
							</p>
						</div>
					</div>
				</div>
			</li>

			<li class='processing-list__items'>
				<svg width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="22.723" height="22.575" rx="4.537" fill="#2F8D60"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M15.71 8.518a.286.286 0 0 0 .054.082c.054.055.054.164.054.218v6.546c0 .927-.709 1.636-1.636 1.636H7.636C6.71 17 6 16.29 6 15.364V6.636C6 5.71 6.71 5 7.636 5H12c.055 0 .164 0 .218.055.055 0 .11.054.164.109l3.273 3.272a.284.284 0 0 1 .054.082Zm-1.746-.245-1.418-1.418v1.418h1.418Zm.218 7.636H7.636c-.327 0-.545-.218-.545-.545V6.636c0-.327.218-.545.545-.545h3.818v2.727c0 .327.219.546.546.546h2.727v6c0 .327-.218.545-.545.545Zm-1.09-3.818c.326 0 .544-.218.544-.545 0-.328-.218-.546-.545-.546H8.727c-.327 0-.545.218-.545.546 0 .327.218.545.545.545h4.364Zm.544 1.636c0 .328-.218.546-.545.546H8.727c-.327 0-.545-.218-.545-.546 0-.327.218-.545.545-.545h4.364c.327 0 .546.218.546.545ZM8.727 8.818c-.327 0-.545.218-.545.546 0 .327.218.545.545.545h1.091c.328 0 .546-.218.546-.545 0-.328-.218-.546-.546-.546h-1.09Z" fill="#fff"/>
				</svg>
				<p>
					Process your contact information
				</p>
				<div class='tooltip'>
					<button class='tooltip__trigger' type='button' data-type='icon'>
						<svg width="17" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
							<use href='#info-icon' />
						</svg>
						<span class='visually-hidden'>Details</span>
					</button>
					<div class='tooltip__content'>
						<svg width="16" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
							<use href='#shield-icon' />
						</svg>

						<div class='flow'>
							<p class='title'>
								Contact Information
							</p>

							<p class='description'>
								Partner can process your phone numbers and address
							</p>
						</div>
					</div>
				</div>
			</li>

			<li class='processing-list__items'>
				<svg width="23" height="23" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="22.723" height="22.575" rx="4.537" fill="#2F4F8D"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M15.16 9.408a.238.238 0 0 1-.045-.067c-.011-.023-.023-.046-.045-.068l-3.187-3.167c-.046-.045-.091-.09-.137-.09-.045-.045-.136-.045-.182-.045H8.377c-.774 0-1.366.588-1.366 1.357v7.237c0 .769.592 1.357 1.366 1.357h5.463c.774 0 1.366-.588 1.366-1.357V9.589c0-.045 0-.135-.045-.18Zm-3.14-1.9 1.638 1.629H12.02V7.509Zm-3.643 7.51h5.464c.273 0 .455-.182.455-.453v-4.523h-2.732c-.273 0-.455-.181-.455-.453V6.875H8.377c-.273 0-.455.181-.455.453v7.237c0 .271.182.452.455.452Z" fill="#fff"/>
				</svg>
				<p>
					Process your document information
				</p>
				<div class='tooltip'>
					<button class='tooltip__trigger' type='button' data-type='icon'>
						<svg width="17" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
							<use href='#info-icon' />
						</svg>
						<span class='visually-hidden'>Details</span>
					</button>
					<div class='tooltip__content'>
						<svg width="16" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
							<use href='#shield-icon' />
						</svg>

						<div class='flow'>
							<p class='title'>
								Document Information
							</p>

							<p class='description'>
								Partner can process your Photo, ID expiration date, country of issuance, and document number.
							</p>
						</div>
					</div>
				</div>
			</li>
		</ul>

		<section class='callout | flow center' style='--flow-space: 2.5rem; margin: var(--flow-space) auto;'>
			<p>
				You can view <span class='theme'>${this.partnerName}</span>'s privacy policy
				<a class='theme' href='${this.partnerPolicyURL}' rel='noreferer noopener' target='_blank'>here</a>
			</p>

			<p style='--flow-space: .75rem'>
				By choosing "Allow" below,
				you grant
				<span class='theme'>${this.partnerName}</span>
				consent to process your personal data
				to offer you this service
			</p>
		</section>

		<section class='flow' style='--flow-space: 2.5rem'>
			<button id='allow' data-type='primary'>
				Allow
			</button>

			<button id='cancel' data-type='secondary' style='--flow-space: 1.5rem'>
				Cancel
			</button>
		</section>
	`;
}

class EndUserConsent extends HTMLElement {
	constructor() {
		super();

		this.templateString = templateString.bind(this);
		this.render = () => {
			return this.templateString();
		}

		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const template = document.createElement('template');
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this.allowButton = this.shadowRoot.querySelector('#allow');
		this.rejectButton = this.shadowRoot.querySelector('#cancel');

		this.allowButton.addEventListener('click', e => this.handleConsentGrant(e));
		this.rejectButton.addEventListener('click', e => this.handleConsentGrant(e));
	}

	get partnerName() {
		return this.getAttribute('partner-name');
	}

	get partnerLogoURL() {
		return this.getAttribute('partner-logo');
	}

	get partnerPolicyURL() {
		return this.getAttribute('policy-url');
	}

	get IDType() {
		return this.getAttribute('id-type');
	}

	get themeColor() {
		return this.getAttribute('theme-color') || '#043C93';
	}

	handleConsentGrant(e) {
		const granted = e.target === this.allowButton;

		this.dispatchEvent(
			new CustomEvent('SmileIdentity::Consent', {
				detail: {
					consented: {
						personal_details: granted,
						contact_information: granted,
						document_information: granted,
					}
				}
			})
		);
	}
}

window.customElements.define('end-user-consent', EndUserConsent);
