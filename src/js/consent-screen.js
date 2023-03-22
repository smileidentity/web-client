'use strict';

function templateString() {
	return `
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
				font-family: 'DM Sans', sans-serif;
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
				--button-color: var(--color-default);
				--flow-space: 3rem;
				-webkit-appearance: none;
				-moz-appearance: none;
				align-items: center;
				appearance: none;
				background-color: transparent;
				border-radius: 2.5rem;
				border: none;
				color: #ffffff;
				cursor: pointer;
				display: inline-flex;
				font-size: 20px;
				font-weight: 500;
				inline-size: 100%;
				justify-content: center;
				letter-spacing: .05ch;
				line-height: 1;
				padding: 1rem 2.5rem;
				text-align: center;
				text-decoration: none;
			}

			button[data-variant='solid'] {
				background-color: var(--button-color);
				border: 2px solid var(--button-color);
			}

			button[data-variant='outline'] {
				color: var(--button-color);
				border: 2px solid var(--button-color);
			}

			button[data-variant='ghost'] {
				color: var(--button-color);
			}

			button:hover,
			button:focus,
			button:active {
				--button-color: var(--color-active);
			}

			button:disabled {
				--button-color: var(--color-disabled);
			}

			button[data-type='icon'] {
				align-items: center;
				background-color: transparent;
				border: 0;
				cursor: pointer;
				display: flex;
				padding: 0;
			}

			button[data-type='icon'] {
				height: 2rem;
				padding: 0;
				width: 2rem;
				background: transparent;
			}

			.nav {
				display: flex;
				justify-content: space-between;
			}

			.justify-right {
				justify-content: end !important;
			}
			
			.back-button-text {
				font-size: 11px;
				line-height: 11px;
				color: #3886F7;
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

			.demo-tip {
				align-items: center;
				background-color: #f5fcff;
				border-radius: .75rem;
				border: 1px solid #A9D1E8;
				color: inherit;
				display: flex;
				font-size: .875rem;
				max-width: 36rem;
				padding: 1rem;
				text-align: left;
				text-decoration: none;
			}

			.demo-tip > * + * {
				margin-left: .5rem;
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

			[disabled] {
				cursor: not-allowed;
				filter: opacity(.7);
			}

			.credits {
				--flow-space: 2rem;
				margin-inline: auto;
				max-inline-size: 10rem;
			}

			.company-name {
				text-transform: uppercase;
				letter-spacing: .1rem;
				border-left: 1px solid #cecece;
				margin-left: .75rem;
				padding-left: .75rem;
				display: inline-flex;
				align-items: center;
			}

			.company-name svg {
				margin-right: .5rem;
			}
		</style>

		<div id='consent-screen'>
			<section class='flow center'>
				<div class="nav ${this.hideBack ? 'justify-right' : ''}">
					<div class="back-wrapper" ${this.hideBack ? 'hidden' : ''}>
						<button type='button' data-type='icon' id="back-button" class="back-button">
							<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.56418 14.4005L1.95209 7.78842L8.56418 1.17633" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<div class="back-button-text">Back</div>
					</div>
					<button data-type='icon' type='button' class='close-iframe'>
						<svg aria-hidden='true' width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M9.8748 11.3775L0 21.2523L1.41421 22.6665L11.289 12.7917L21.2524 22.7551L22.6666 21.3409L12.7032 11.3775L22.6665 1.41421L21.2523 0L11.289 9.96328L1.41428 0.0885509L6.76494e-05 1.50276L9.8748 11.3775Z" fill="#BDBDBF"/>
						</svg>												             
						<span class='visually-hidden'>Close SmileIdentity Verification frame</span>
					</button>
				</div>
				<img alt='' width='50' height='50' src='${this.partnerLogoURL}' />
				<p class='demo-tip' ${this.demoMode ? '' : 'hidden'}>
					<svg aria-hidden='true' width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="4.46045" y="4.46069" width="47.7205" height="47.7205" rx="23.8603" fill="white"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M35.1578 25.7487H34.2813V23.1195C34.2813 20.2273 31.915 17.861 29.0229 17.861C26.1307 17.861 23.7644 20.2273 23.7644 23.1195V25.7487H22.888C21.3981 25.7487 20.2588 26.888 20.2588 28.3779V34.5128C20.2588 36.0027 21.3981 37.142 22.888 37.142H35.1578C36.6476 37.142 37.787 36.0027 37.787 34.5128V28.3779C37.787 26.888 36.6476 25.7487 35.1578 25.7487ZM25.5171 23.1194C25.5171 21.1913 27.0946 19.6138 29.0227 19.6138C30.9508 19.6138 32.5283 21.1913 32.5283 23.1194V25.7487H25.5171V23.1194ZM35.1577 35.3892C35.6836 35.3892 36.0342 35.0386 36.0342 34.5128V28.3779C36.0342 27.8521 35.6836 27.5015 35.1577 27.5015H22.888C22.3622 27.5015 22.0116 27.8521 22.0116 28.3779V34.5128C22.0116 35.0386 22.3622 35.3892 22.888 35.3892H35.1577Z" fill="#2D9CDB"/>
						<rect x="4.46045" y="4.46069" width="47.7205" height="47.7205" rx="23.8603" stroke="#DDF2F7" stroke-width="7.15808"/>
					</svg>

					<span>
						This consent screen is for illustrative purposes only. Demo App does not collect personal ID data.
					</span>
				</p>
				<h1>
					<span class='theme'>${this.partnerName}</span>
					wants to access your
					<span class='theme'>${this.idTypeLabel}</span>
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
					By choosing "Allow",
					you grant
					<span class='theme'>${this.partnerName}</span>
					consent to process your personal data
					to offer you this service
				</p>
			</section>

			<section class='flow' style='--flow-space: 2.5rem'>
				<button id='allow' data-variant='solid'>
					Allow
				</button>

				<button id='cancel' data-variant='outline' style='--flow-space: 1.5rem'>
					Cancel
				</button>
			</section>
		</div>

		<totp-consent-app
			hidden
			base-url='${this.baseUrl}'
			country='${this.country}'
			id-hint='${this.idHint}'
			id-regex='${this.idRegex}'
			id-type='${this.idType.includes('BVN') ? 'BVN_MFA' : this.idType}'
			id-type-label='${this.idTypeLabel}'
			partner-id='${this.partnerId}'
			partner-name='${this.partnerName}'
			token='${this.token}'
		>
		</totp-consent-app>

		<div hidden id='consent-rejected-screen' class='flow'>
			<section class='flow center'>
				<svg xmlns="http://www.w3.org/2000/svg" width="185" height="138" fill="none">
					<g filter="url(#a)">
						<path fill="url(#b)" d="M115.503 88.266H70.86a3.443 3.443 0 0 1-3.445-3.444V23.59a3.443 3.443 0 0 1 3.445-3.444h44.643a3.443 3.443 0 0 1 3.444 3.444v61.232a3.443 3.443 0 0 1-3.444 3.444Z"/>
					</g>
					<path fill="#D5DDEA" d="M98.982 71.746H87.38a2.33 2.33 0 0 1-2.334-2.334 2.33 2.33 0 0 1 2.334-2.334h11.603a2.33 2.33 0 0 1 2.334 2.334 2.33 2.33 0 0 1-2.334 2.334Zm5.326 5.054H82.032c-.68 0-1.224-.544-1.224-1.224 0-.68.544-1.224 1.224-1.224h22.276c.68 0 1.224.544 1.224 1.224 0 .657-.544 1.223-1.224 1.223Z"/>
					<path fill="#D9DEEA" d="M108.41 44.439c0 4.578-2.017 8.68-5.213 11.467a15.186 15.186 0 0 1-10.016 3.739 15.09 15.09 0 0 1-10.016-3.762 15.17 15.17 0 0 1-5.212-11.467c0-8.407 6.82-15.228 15.228-15.228 8.407 0 15.229 6.844 15.229 15.251Z"/>
					<path fill="#fff" d="M103.197 55.906a15.187 15.187 0 0 1-10.016 3.739 15.09 15.09 0 0 1-10.016-3.762c1.11-.43 2.56-.997 4.51-1.79a1.87 1.87 0 0 0 .996-.952 1.8 1.8 0 0 0 .159-.77v-3.649c-.068-.068-.113-.159-.159-.227a3.648 3.648 0 0 1-.589-1.586l-.317-.158c-.93.226-.861-.771-1.11-2.697-.091-.793.022-.952.385-1.088l.294-.408c-1.813-4.079-.906-6.64.884-7.546-.59-1.292-.635-1.768-.635-1.768s3.808.635 5.1.386c1.654-.34 4.214.067 5.166 2.266 1.586.611 2.198 1.631 2.334 2.696.136.998-.158 2.085-.453 2.924a1.077 1.077 0 0 1-.068.158c0 .023-.023.046-.023.068-.045.114-.068.204-.113.295-.023.045-.023.09-.045.136-.023.09-.068.181-.09.25 0 .022 0 .022-.023.044l-.069.204a2.466 2.466 0 0 1-.068.227c.023.023.023.068.046.09.25.114.34.34.25 1.043-.228 1.836-.16 2.946-1.111 2.697l-.839 1.45c-.022.159-.045.25-.068.34-.022.272-.022.816-.022 3.807 0 .363.113.703.294.997.204.317.499.59.861.748 0 0 .023 0 .023.023 1.971.838 3.422 1.382 4.532 1.813Z"/>
					<path fill="url(#c)" d="M99.254 42.92c.068-.453-.136-1.042-.294-1.427-.023-.068-.068-.136-.091-.204-.725-1.45-2.357-2.062-3.898-2.153-3.943-.204-4.328.544-5.552-.589.386.567.408 1.496-.181 2.629-.408.793-1.201 1.155-1.926 1.382-1.813-4.079-.907-6.64.883-7.546-.589-1.292-.634-1.768-.634-1.768s3.807.635 5.099.386c1.654-.34 4.215.067 5.167 2.266 1.586.611 2.198 1.631 2.334 2.696.272 1.7-.725 3.58-.907 4.329Z"/>
					<path fill="url(#d)" d="M97.804 53.368v.702h-9.156v-.929a1.8 1.8 0 0 0 .16-.77v-3.649c-.069-.068-.114-.159-.16-.227v-.226c.204.34.454.634.748.906l2.856 2.017c.657.567 1.631.567 2.311.023l2.674-2.402c.09-.068.181-.159.272-.25-.023.272-.023.816-.023 3.807.046.363.136.703.318.998Z"/>
					<g filter="url(#e)">
						<path fill="url(#f)" d="M54.86 77.728H26.15a3.443 3.443 0 0 1-3.445-3.444V34.128a3.443 3.443 0 0 1 3.445-3.445h28.71a3.443 3.443 0 0 1 3.444 3.445v40.179a3.424 3.424 0 0 1-3.444 3.421Z"/>
					</g>
					<path fill="#D5DDEA" d="M44.504 66.33h-8.022a1.615 1.615 0 0 1-1.609-1.61c0-.883.725-1.608 1.609-1.608h8.022c.884 0 1.61.725 1.61 1.609s-.726 1.609-1.61 1.609Zm3.694 3.49H32.811a.837.837 0 0 1-.838-.839c0-.476.385-.838.838-.838h15.387c.476 0 .839.385.839.838a.851.851 0 0 1-.839.839Z"/>
					<path fill="#D9DEEA" d="M51.008 47.453a10.52 10.52 0 0 1-3.603 7.931 10.5 10.5 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.911-2.584a10.52 10.52 0 0 1-3.604-7.931c0-5.801 4.714-10.515 10.515-10.515 5.802 0 10.515 4.714 10.515 10.515Z"/>
					<path fill="#fff" d="M47.405 55.385a10.5 10.5 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.912-2.584a87.84 87.84 0 0 0 3.105-1.246c.317-.136.544-.363.68-.658.068-.158.113-.34.113-.543v-2.516a.69.69 0 0 1-.113-.158 2.36 2.36 0 0 1-.408-1.088l-.227-.113c-.634.158-.589-.544-.77-1.859-.068-.544.023-.657.25-.748l.203-.271c-1.246-2.833-.612-4.6.612-5.213-.408-.883-.43-1.223-.43-1.223s2.628.43 3.535.272c1.155-.227 2.9.045 3.557 1.563 1.088.43 1.519 1.133 1.61 1.858.09.703-.114 1.428-.295 2.017-.023.046-.023.068-.045.114 0 .022-.023.022-.023.045l-.068.204c-.023.023-.023.068-.045.09-.023.069-.046.114-.068.182v.023c-.023.045-.046.09-.046.136-.022.068-.045.113-.045.158.023.023.023.045.023.068.18.09.226.227.158.703-.158 1.269-.113 2.04-.77 1.858l-.567 1.02c-.022.113-.045.158-.045.249-.023.181-.023.567-.023 2.629 0 .249.068.475.204.68.136.226.34.407.59.498h.022c1.405.59 2.402.974 3.15 1.27Z"/>
					<path fill="url(#g)" d="M44.708 46.41c.046-.317-.09-.702-.204-.997l-.068-.136c-.498-.997-1.631-1.427-2.696-1.473-2.72-.136-2.992.386-3.83-.407.272.407.294 1.02-.113 1.813-.295.543-.839.793-1.315.951-1.246-2.832-.612-4.6.612-5.212-.408-.884-.43-1.224-.43-1.224s2.628.431 3.535.272c1.155-.226 2.9.046 3.557 1.564 1.088.43 1.519 1.133 1.61 1.858.135 1.179-.544 2.47-.658 2.992Z"/>
					<path fill="url(#h)" d="M43.711 53.64v.498H37.39v-.657a1.37 1.37 0 0 0 .113-.544v-2.515a.69.69 0 0 1-.113-.16v-.135c.136.227.317.453.52.612l1.972 1.382a1.264 1.264 0 0 0 1.61.023l1.858-1.654a.689.689 0 0 0 .18-.182c-.022.181-.022.567-.022 2.629 0 .25.068.498.204.703Z"/>
					<g filter="url(#i)">
						<path fill="url(#j)" d="M159.533 77.728h-28.712a3.443 3.443 0 0 1-3.444-3.444V34.128a3.443 3.443 0 0 1 3.444-3.445h28.712a3.443 3.443 0 0 1 3.445 3.445v40.179a3.424 3.424 0 0 1-3.445 3.421Z"/>
					</g>
					<path fill="#D5DDEA" d="M149.177 66.33h-8.022a1.616 1.616 0 0 1-1.609-1.61c0-.883.726-1.608 1.609-1.608h8.022c.884 0 1.609.725 1.609 1.609.023.884-.702 1.609-1.609 1.609Zm3.694 3.49h-15.387a.836.836 0 0 1-.838-.839c0-.476.385-.838.838-.838h15.387c.476 0 .839.385.839.838a.837.837 0 0 1-.839.839Z"/>
					<path fill="#D9DEEA" d="M155.704 47.453c0 3.172-1.405 6.005-3.604 7.931a10.498 10.498 0 0 1-6.911 2.584c-2.652 0-5.076-.975-6.912-2.584a10.52 10.52 0 0 1-3.603-7.931c0-5.801 4.713-10.515 10.515-10.515 5.801 0 10.515 4.714 10.515 10.515Z"/>
					<path fill="#fff" d="M152.101 55.385a10.501 10.501 0 0 1-6.912 2.584c-2.651 0-5.076-.975-6.912-2.584a87.84 87.84 0 0 0 3.105-1.246c.317-.136.544-.363.68-.658.068-.158.113-.34.113-.543v-2.516a.677.677 0 0 1-.113-.158 2.352 2.352 0 0 1-.408-1.088l-.227-.113c-.634.158-.589-.544-.77-1.859-.068-.544.022-.657.249-.748l.204-.271c-1.246-2.833-.612-4.6.612-5.213-.408-.883-.431-1.223-.431-1.223s2.629.43 3.535.272c1.156-.227 2.901.045 3.558 1.563 1.088.43 1.519 1.133 1.609 1.858.091.703-.113 1.428-.294 2.017-.023.046-.023.068-.046.114 0 .022-.022.022-.022.045l-.068.204c-.023.023-.023.068-.046.09-.022.069-.045.114-.068.182v.023c-.022.045-.045.09-.045.136-.023.068-.045.113-.045.158.022.023.022.045.022.068.182.09.227.227.159.703-.159 1.269-.113 2.04-.77 1.858l-.567 1.02c-.023.113-.045.158-.045.249-.023.181-.023.567-.023 2.629 0 .249.068.475.204.68.136.226.34.407.589.498h.023c1.382.59 2.379.974 3.15 1.27Z"/>
					<path fill="url(#k)" d="M149.382 46.41c.045-.317-.091-.702-.204-.997l-.068-.136c-.499-.997-1.632-1.427-2.697-1.473-2.719-.136-2.991.386-3.83-.407.272.407.295 1.02-.113 1.813-.295.543-.839.793-1.315.951-1.246-2.832-.611-4.6.612-5.212-.408-.884-.43-1.224-.43-1.224s2.628.431 3.535.272c1.156-.226 2.901.046 3.558 1.564 1.088.43 1.518 1.133 1.609 1.858.136 1.179-.521 2.47-.657 2.992Z"/>
					<path fill="url(#l)" d="M148.385 53.64v.498h-6.323v-.657a1.37 1.37 0 0 0 .113-.544v-2.515a.71.71 0 0 1-.113-.16v-.135c.136.227.317.453.521.612l1.972 1.382a1.264 1.264 0 0 0 1.609.023l1.858-1.654a.683.683 0 0 0 .181-.182c-.022.181-.022.567-.022 2.629 0 .25.068.498.204.703Z"/>
					<path fill="#F97B6A" d="M154.163 120.944 125.496 92.3l6.572-6.572 28.644 28.667-6.549 6.549Z"/>
					<path fill="#F97B6A" d="m168.44 135.334-21.982-21.982a4.72 4.72 0 0 1 0-6.662 4.719 4.719 0 0 1 6.663 0l21.981 21.981a4.719 4.719 0 0 1 0 6.663 4.72 4.72 0 0 1-6.662 0Z"/>
					<path fill="url(#m)" d="m166.876 136.739-28.282-28.282c-.657-.657-.657-1.722 0-2.402l7.229-7.229a1.71 1.71 0 0 1 2.403 0l28.281 28.282c.657.657.657 1.722 0 2.402l-7.229 7.229c-.68.657-1.745.657-2.402 0Z"/>
					<path fill="url(#n)" d="M93.045 0c-30.004 0-54.32 24.316-54.32 54.32 0 29.98 24.316 54.319 54.297 54.319 30.004 0 54.32-24.316 54.32-54.32C147.342 24.316 123.026 0 93.045 0Zm0 98.577c-24.09 0-43.6-19.829-43.6-44.28 0-24.452 19.51-44.258 43.6-44.258 24.089 0 43.6 19.829 43.6 44.28 0 24.452-19.534 44.258-43.6 44.258Z"/>
					<defs>
						<linearGradient id="b" x1="93.164" x2="93.164" y1="18.57" y2="89.001" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FDFEFF"/>
							<stop offset=".996" stop-color="#ECF0F5"/>
						</linearGradient>
						<linearGradient id="c" x1="86.316" x2="100.21" y1="38.084" y2="38.084" gradientUnits="userSpaceOnUse">
							<stop stop-color="#B0BACC"/>
							<stop offset="1" stop-color="#969EAE"/>
						</linearGradient>
						<linearGradient id="d" x1="93.229" x2="93.229" y1="54.105" y2="50.91" gradientUnits="userSpaceOnUse">
							<stop stop-color="#fff"/>
							<stop offset="1" stop-color="#E2E5EC"/>
						</linearGradient>
						<linearGradient id="f" x1="40.493" x2="40.493" y1="29.595" y2="78.236" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FDFEFF"/>
							<stop offset=".996" stop-color="#ECF0F5"/>
						</linearGradient>
						<linearGradient id="g" x1="35.801" x2="45.385" y1="43.069" y2="43.069" gradientUnits="userSpaceOnUse">
							<stop stop-color="#B0BACC"/>
							<stop offset="1" stop-color="#969EAE"/>
						</linearGradient>
						<linearGradient id="h" x1="40.552" x2="40.552" y1="54.162" y2="51.953" gradientUnits="userSpaceOnUse">
							<stop stop-color="#fff"/>
							<stop offset="1" stop-color="#E2E5EC"/>
						</linearGradient>
						<linearGradient id="j" x1="145.166" x2="145.166" y1="29.595" y2="78.236" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FDFEFF"/>
							<stop offset=".996" stop-color="#ECF0F5"/>
						</linearGradient>
						<linearGradient id="k" x1="140.474" x2="150.059" y1="43.069" y2="43.069" gradientUnits="userSpaceOnUse">
							<stop stop-color="#B0BACC"/>
							<stop offset="1" stop-color="#969EAE"/>
						</linearGradient>
						<linearGradient id="l" x1="145.225" x2="145.225" y1="54.162" y2="51.953" gradientUnits="userSpaceOnUse">
							<stop stop-color="#fff"/>
							<stop offset="1" stop-color="#E2E5EC"/>
						</linearGradient>
						<linearGradient id="m" x1="138.084" x2="177.007" y1="117.787" y2="117.787" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FF6551"/>
							<stop offset="1" stop-color="#FF9F92"/>
						</linearGradient>
						<linearGradient id="n" x1="38.676" x2="147.361" y1="54.331" y2="54.331" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FF6551"/>
							<stop offset="1" stop-color="#FF9F92"/>
						</linearGradient>
						<filter id="a" width="95.532" height="112.12" x="45.415" y="9.146" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
							<feFlood flood-opacity="0" result="BackgroundImageFix"/>
							<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
							<feOffset dy="11"/>
							<feGaussianBlur stdDeviation="11"/>
							<feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
							<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
							<feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
						</filter>
						<filter id="e" width="79.601" height="91.045" x=".704" y="19.683" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
							<feFlood flood-opacity="0" result="BackgroundImageFix"/>
							<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
							<feOffset dy="11"/>
							<feGaussianBlur stdDeviation="11"/>
							<feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
							<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
							<feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
						</filter>
						<filter id="i" width="79.601" height="91.045" x="105.377" y="19.683" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
							<feFlood flood-opacity="0" result="BackgroundImageFix"/>
							<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
							<feOffset dy="11"/>
							<feGaussianBlur stdDeviation="11"/>
							<feColorMatrix values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
							<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1211:246"/>
							<feBlend in="SourceGraphic" in2="effect1_dropShadow_1211:246" result="shape"/>
						</filter>
					</defs>
				</svg>

				<h1 style='font-size: 36px; line-height: 1; font-weight: 500; --flow-space: 1.5rem'>
					Consent Denied
				</h1>

				<p class='color-grey' style='--flow-space: 1rem'>
					We cannot verify you without your consent
				</p>

				<p>
					Wish to correct that?
				</p>
			</section>

			<button data-variant='solid' type='button' id='back-to-consent'>
				<svg style='transform: rotate(.5turn);' width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7 12h11m0 0-4.588-4M18 12l-4.588 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Go Back
			</button>

			<button data-variant='outline' id='confirm-consent-rejection' style='--flow-space: 1rem; border-radius: 2rem'>
				No, Cancel Verification
			</button>

			<p class='center credits'>
				<span class='visually-hidden'>Powered by SmileID</span>
				<svg aria-hidden='true' viewBox="0 0 90 9" fill="none" xmlns="http://www.w3.org/2000/svg">
					<symbol id='attribution'>
						<path d="M0.544 7V1.4H2.616C3.064 1.4 3.43467 1.47467 3.728 1.624C4.02133 1.77333 4.24 1.97867 4.384 2.24C4.528 2.50133 4.6 2.79467 4.6 3.12C4.6 3.42933 4.53067 3.71467 4.392 3.976C4.25333 4.232 4.03733 4.44 3.744 4.6C3.45067 4.75467 3.07467 4.832 2.616 4.832H1.568V7H0.544ZM1.568 4H2.552C2.90933 4 3.16533 3.92267 3.32 3.768C3.48 3.608 3.56 3.392 3.56 3.12C3.56 2.84267 3.48 2.62667 3.32 2.472C3.16533 2.312 2.90933 2.232 2.552 2.232H1.568V4ZM7.08025 7.096C6.69625 7.096 6.34958 7.008 6.04025 6.832C5.73625 6.656 5.49358 6.41333 5.31225 6.104C5.13625 5.78933 5.04825 5.42667 5.04825 5.016C5.04825 4.60533 5.13892 4.24533 5.32025 3.936C5.50158 3.62133 5.74425 3.376 6.04825 3.2C6.35758 3.024 6.70425 2.936 7.08825 2.936C7.46692 2.936 7.80825 3.024 8.11225 3.2C8.42158 3.376 8.66425 3.62133 8.84025 3.936C9.02158 4.24533 9.11225 4.60533 9.11225 5.016C9.11225 5.42667 9.02158 5.78933 8.84025 6.104C8.66425 6.41333 8.42158 6.656 8.11225 6.832C7.80292 7.008 7.45892 7.096 7.08025 7.096ZM7.08025 6.208C7.34692 6.208 7.57892 6.10933 7.77625 5.912C7.97358 5.70933 8.07225 5.41067 8.07225 5.016C8.07225 4.62133 7.97358 4.32533 7.77625 4.128C7.57892 3.92533 7.34958 3.824 7.08825 3.824C6.81625 3.824 6.58158 3.92533 6.38425 4.128C6.19225 4.32533 6.09625 4.62133 6.09625 5.016C6.09625 5.41067 6.19225 5.70933 6.38425 5.912C6.58158 6.10933 6.81358 6.208 7.08025 6.208ZM10.6632 7L9.50319 3.032H10.5192L11.2072 5.888L12.0072 3.032H13.1432L13.9432 5.888L14.6392 3.032H15.6552L14.4872 7H13.4232L12.5752 4.032L11.7272 7H10.6632ZM18.0886 7.096C17.6886 7.096 17.334 7.01067 17.0246 6.84C16.7153 6.66933 16.4726 6.42933 16.2966 6.12C16.1206 5.81067 16.0326 5.45333 16.0326 5.048C16.0326 4.63733 16.118 4.272 16.2886 3.952C16.4646 3.632 16.7046 3.384 17.0086 3.208C17.318 3.02667 17.6806 2.936 18.0966 2.936C18.486 2.936 18.83 3.02133 19.1286 3.192C19.4273 3.36267 19.6593 3.59733 19.8246 3.896C19.9953 4.18933 20.0806 4.51733 20.0806 4.88C20.0806 4.93867 20.078 5 20.0726 5.064C20.0726 5.128 20.07 5.19467 20.0646 5.264H17.0486C17.07 5.57333 17.1766 5.816 17.3686 5.992C17.566 6.168 17.8033 6.256 18.0806 6.256C18.2886 6.256 18.462 6.21067 18.6006 6.12C18.7446 6.024 18.8513 5.90133 18.9206 5.752H19.9606C19.886 6.00267 19.7606 6.232 19.5846 6.44C19.414 6.64267 19.2006 6.80267 18.9446 6.92C18.694 7.03733 18.4086 7.096 18.0886 7.096ZM18.0966 3.768C17.846 3.768 17.6246 3.84 17.4326 3.984C17.2406 4.12267 17.118 4.336 17.0646 4.624H19.0406C19.0246 4.36267 18.9286 4.15467 18.7526 4C18.5766 3.84533 18.358 3.768 18.0966 3.768ZM20.9419 7V3.032H21.8539L21.9499 3.776C22.0939 3.52 22.2885 3.31733 22.5339 3.168C22.7845 3.01333 23.0779 2.936 23.4139 2.936V4.016H23.1259C22.9019 4.016 22.7019 4.05067 22.5259 4.12C22.3499 4.18933 22.2112 4.30933 22.1099 4.48C22.0139 4.65067 21.9659 4.888 21.9659 5.192V7H20.9419ZM25.9714 7.096C25.5714 7.096 25.2168 7.01067 24.9074 6.84C24.5981 6.66933 24.3554 6.42933 24.1794 6.12C24.0034 5.81067 23.9154 5.45333 23.9154 5.048C23.9154 4.63733 24.0008 4.272 24.1714 3.952C24.3474 3.632 24.5874 3.384 24.8914 3.208C25.2008 3.02667 25.5634 2.936 25.9794 2.936C26.3688 2.936 26.7128 3.02133 27.0114 3.192C27.3101 3.36267 27.5421 3.59733 27.7074 3.896C27.8781 4.18933 27.9634 4.51733 27.9634 4.88C27.9634 4.93867 27.9608 5 27.9554 5.064C27.9554 5.128 27.9528 5.19467 27.9474 5.264H24.9314C24.9528 5.57333 25.0594 5.816 25.2514 5.992C25.4488 6.168 25.6861 6.256 25.9634 6.256C26.1714 6.256 26.3448 6.21067 26.4834 6.12C26.6274 6.024 26.7341 5.90133 26.8034 5.752H27.8434C27.7688 6.00267 27.6434 6.232 27.4674 6.44C27.2968 6.64267 27.0834 6.80267 26.8274 6.92C26.5768 7.03733 26.2914 7.096 25.9714 7.096ZM25.9794 3.768C25.7288 3.768 25.5074 3.84 25.3154 3.984C25.1234 4.12267 25.0008 4.336 24.9474 4.624H26.9234C26.9074 4.36267 26.8114 4.15467 26.6354 4C26.4594 3.84533 26.2408 3.768 25.9794 3.768ZM30.6487 7.096C30.2754 7.096 29.942 7.00533 29.6487 6.824C29.3554 6.64267 29.1234 6.39467 28.9527 6.08C28.782 5.76533 28.6967 5.408 28.6967 5.008C28.6967 4.608 28.782 4.25333 28.9527 3.944C29.1234 3.62933 29.3554 3.384 29.6487 3.208C29.942 3.02667 30.2754 2.936 30.6487 2.936C30.9474 2.936 31.2087 2.992 31.4327 3.104C31.6567 3.216 31.838 3.37333 31.9767 3.576V1.24H33.0007V7H32.0887L31.9767 6.432C31.8487 6.608 31.678 6.76267 31.4647 6.896C31.2567 7.02933 30.9847 7.096 30.6487 7.096ZM30.8647 6.2C31.1954 6.2 31.4647 6.09067 31.6727 5.872C31.886 5.648 31.9927 5.36267 31.9927 5.016C31.9927 4.66933 31.886 4.38667 31.6727 4.168C31.4647 3.944 31.1954 3.832 30.8647 3.832C30.5394 3.832 30.27 3.94133 30.0567 4.16C29.8434 4.37867 29.7367 4.66133 29.7367 5.008C29.7367 5.35467 29.8434 5.64 30.0567 5.864C30.27 6.088 30.5394 6.2 30.8647 6.2ZM38.3017 7.096C38.003 7.096 37.7417 7.04 37.5177 6.928C37.2937 6.816 37.1124 6.65867 36.9737 6.456L36.8617 7H35.9497V1.24H36.9737V3.6C37.1017 3.424 37.2697 3.26933 37.4777 3.136C37.691 3.00267 37.9657 2.936 38.3017 2.936C38.675 2.936 39.0084 3.02667 39.3017 3.208C39.595 3.38933 39.827 3.63733 39.9977 3.952C40.1684 4.26667 40.2537 4.624 40.2537 5.024C40.2537 5.424 40.1684 5.78133 39.9977 6.096C39.827 6.40533 39.595 6.65067 39.3017 6.832C39.0084 7.008 38.675 7.096 38.3017 7.096ZM38.0857 6.2C38.411 6.2 38.6804 6.09067 38.8937 5.872C39.107 5.65333 39.2137 5.37067 39.2137 5.024C39.2137 4.67733 39.107 4.392 38.8937 4.168C38.6804 3.944 38.411 3.832 38.0857 3.832C37.755 3.832 37.483 3.944 37.2697 4.168C37.0617 4.38667 36.9577 4.66933 36.9577 5.016C36.9577 5.36267 37.0617 5.648 37.2697 5.872C37.483 6.09067 37.755 6.2 38.0857 6.2ZM41.3051 8.76L42.2251 6.736H41.9851L40.4411 3.032H41.5531L42.6651 5.824L43.8251 3.032H44.9131L42.3931 8.76H41.3051Z" fill="#001096"/>
						<g clipPath="url(#clip0_1923_23296)">
								<path d="M58.5141 6.02913C58.5644 6.37005 58.8092 6.77098 59.4839 6.77098C60.0578 6.77098 60.336 6.56623 60.336 6.23338C60.336 5.90053 60.142 5.75579 59.788 5.71292L58.5988 5.58482C57.5612 5.47387 56.9539 4.86819 56.9539 3.87872C56.9539 2.77779 57.7801 2.04401 59.4335 2.04401C61.2135 2.04401 61.9221 2.88874 61.9894 3.88679H60.3195C60.2687 3.51157 59.965 3.27253 59.442 3.27253C58.9783 3.27253 58.6577 3.44349 58.6577 3.75062C58.6577 3.99774 58.8097 4.18534 59.2141 4.21964L60.1844 4.30486C61.4918 4.41582 62.0397 5.04672 62.0397 6.0962C62.0397 7.21377 61.3477 7.999 59.4504 7.999C57.5532 7.999 56.9534 7.02667 56.8691 6.02862H58.5141V6.02913Z" fill="#001096" />
								<path d="M70.1965 5.28736V7.85484H68.5431V5.56019C68.5431 5.09925 68.3746 4.80069 67.9194 4.80069C67.4212 4.80069 67.2108 5.11639 67.2108 5.78159V7.85484H65.5824V5.56019C65.5824 5.09925 65.4133 4.80069 64.9581 4.80069C64.4605 4.80069 64.2496 5.11639 64.2496 5.78159V7.85484H62.5967V3.58932H64.2496V4.24644C64.5113 3.75171 64.9581 3.45265 65.6586 3.45265C66.3592 3.45265 66.8309 3.7855 67.0587 4.35689C67.3285 3.80265 67.7842 3.45265 68.5351 3.45265C69.6735 3.45265 70.197 4.16928 70.197 5.28736H70.1965Z" fill="#001096" />
								<path d="M70.9785 3.8535V2.18118H72.6319V3.8535H70.9785ZM70.9785 7.85476V4.2504H72.6319V7.85476H70.9785Z" fill="#001096" />
								<path d="M73.4121 7.85475V2.18167H75.065V7.85525H73.4121V7.85475Z" fill="#001096" />
								<path d="M78.7264 6.53958H80.3579C80.1968 7.3243 79.5696 7.99151 78.0179 7.99151C76.2294 7.99151 75.6221 6.8568 75.6221 5.71351C75.6221 4.48499 76.3391 3.45265 78.0179 3.45265C79.8653 3.45265 80.3629 4.59594 80.3629 5.77302C80.3629 5.91776 80.3539 6.05443 80.3374 6.13966H77.2336C77.3178 6.68583 77.5881 6.89059 78.0518 6.89059C78.3729 6.89059 78.6083 6.73526 78.7269 6.53908L78.7264 6.53958ZM77.2416 5.21877H78.8022C78.7519 4.77497 78.5404 4.52785 78.0428 4.52785C77.5791 4.52785 77.3348 4.70689 77.2416 5.21877Z" fill="#001096" />
								<path d="M83.5907 7.85476H81.8994L81.9034 2.18118H83.5902L83.5912 7.85476H83.5907Z" fill="#001096" />
								<path d="M89.9995 5.00535C89.9995 6.46434 89.1474 7.85475 87.3345 7.85475H84.3652V2.18167H87.3345C89.1479 2.18167 89.9995 3.54686 89.9995 5.00535ZM86.9376 6.5067C87.8401 6.5067 88.2364 5.99482 88.2364 5.00535C88.2364 4.01588 87.8226 3.52971 86.9376 3.52971H86.06V6.5067H86.9376Z" fill="#001096" />
								<path d="M52.2123 3.88737H48V7.86846H52.2123V3.88737Z" fill="#001096" />
								<path d="M53.2359 0C53.2165 0 53.1975 0.00201727 53.1786 0.00252159C53.1591 0.00252159 53.1402 0 53.1207 0C52.0457 0 51.0869 0.708567 51.0869 2.27044V3.8888H55.2882V2.27044C55.2882 0.708567 54.3174 0 53.2359 0Z" fill="#FF9B00" />
						</g>
						<defs>
								<clipPath id="clip0_1923_23296">
										<rect width="42" height="8" fill="white" transform="translate(48)" />
								</clipPath>
						</defs>
					</symbol>
					<use href='#attribution' />
				</svg>
			</p>
		</div>
	`;
}

class EndUserConsent extends HTMLElement {
	constructor() {
		super();

		this.idRequiresTotpConsent = ['BVN', 'BVN_MFA'];
		this.templateString = templateString.bind(this);
		this.render = () => {
			return this.templateString();
		}

		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.pages = [];
		const template = document.createElement('template');
		template.innerHTML = this.render();

		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this.consentScreen = this.shadowRoot.querySelector('#consent-screen');
		this.totpConsentApp = this.shadowRoot.querySelector('totp-consent-app');
		this.consentRejectedScreen = this.shadowRoot.querySelector('#consent-rejected-screen');

		this.allowButton = this.shadowRoot.querySelector('#allow');
		this.rejectButton = this.shadowRoot.querySelector('#cancel');
		this.backToConsentButton = this.shadowRoot.querySelector('#back-to-consent');
		this.confirmConsentRejectionButton = this.shadowRoot.querySelector('#confirm-consent-rejection');
		this.backButton = this.shadowRoot.querySelector('#back-button')
		var CloseIframeButtons = this.shadowRoot.querySelectorAll('.close-iframe');

		this.allowButton.addEventListener('click', e => this.handleConsentGrant(e));
		this.rejectButton.addEventListener('click', e => this.handleConsentGrant(e));

		this.backToConsentButton.addEventListener('click', () => this.setActiveScreen(this.consentScreen));
		this.confirmConsentRejectionButton.addEventListener('click', e => this.handleConsentRejection(e));

		this.totpConsentApp.addEventListener('SmileIdentity::ConsentDenied::TOTP::ContactMethodsOutdated', e => this.handleTotpConsentEvents(e));
		this.totpConsentApp.addEventListener('SmileIdentity::ConsentGranted::TOTP', e => this.handleTotpConsentEvents(e));
		this.totpConsentApp.addEventListener('SmileIdentity::ConsentDenied::Back', e => this.handleBackEvents(e));

		this.backButton.addEventListener('click', (e) => {
			this.handleBackEvents(e);
		});

		CloseIframeButtons.forEach((button) => {
			button.addEventListener('click', event => {
				this.closeWindow();
			}, false);
		});

		this.activeScreen = this.consentScreen;
	}

	setActiveScreen(screen) {
		this.activeScreen.hidden = true;
		screen.hidden = false;
		this.activeScreen = screen;
	}

	get baseUrl() {
		return this.getAttribute('base-url');
	}

	get country() {
		return this.getAttribute('country');
	}

	get demoMode() {
		return this.hasAttribute('demo-mode') ? true : false
	}

	get hideBack() {
		return this.hasAttribute('hide-back-to-host');
	}

	get idHint() {
		return this.getAttribute('id-hint') || 'Your BVN should be 11 digits long';
	}

	get idRegex() {
		return this.getAttribute('id-regex');
	}

	get idType() {
		return this.getAttribute('id-type');
	}

	get idTypeLabel() {
		return this.getAttribute('id-type-label');
	}

	get partnerId() {
		return this.getAttribute('partner-id');
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

	get themeColor() {
		return this.getAttribute('theme-color') || '#043C93';
	}

	get token() {
		return this.getAttribute('token');
	}

	handleConsentGrant(e) {
		const granted = e.target === this.allowButton;

		if (granted) {
			if (this.idRequiresTotpConsent.includes(this.idType)) {
				this.setActiveScreen(this.totpConsentApp);
				this.pages.push(this.consentScreen);
			} else {
				this.dispatchEvent(
					new CustomEvent('SmileIdentity::ConsentGranted', {
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
		} else {
			this.setActiveScreen(this.consentRejectedScreen);
		}
	}

	handleConsentRejection(e) {
		this.dispatchEvent(
			new CustomEvent('SmileIdentity::ConsentDenied')
		);
	}

	handleTotpConsentEvents(e) {
		const customEvent = new CustomEvent(e.type, {
			detail: {
				...e.detail
			}
		});
		this.dispatchEvent(customEvent);
	}

	handleBackEvents(e){
		const page = this.pages.pop();
		if (page) {
			this.setActiveScreen(page);
		}else{
			this.dispatchEvent(
				new CustomEvent('SmileIdentity::Exit')
			);
		}
	}

	closeWindow() {
		const referenceWindow = window.parent;
		referenceWindow.postMessage('SmileIdentity::Close', '*');
	}
}

window.customElements.define('end-user-consent', EndUserConsent);
