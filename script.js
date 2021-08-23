'use strict';

function getSiteURL() {
	let qualifiedURL = '';

	if (document.currentScript) {
		var currentScriptSrc = document.currentScript.src;

		qualifiedURL = currentScriptSrc.split('script.js')[0];

		if (qualifiedURL.includes('instrumented') {
			return '';
		}
	}

	return qualifiedURL;
}

const config = {
	siteURL: getSiteURL()
};

function createIframe() {
	var iframe = document.createElement('iframe');

	iframe.setAttribute('src', `${config.siteURL}iframe.html`);
	iframe.setAttribute('id', 'iframe');
	iframe.setAttribute('name', 'smile-identity-hosted-integration');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('allow', 'camera; geolocation; encrypted-media;');
	iframe.setAttribute('sandbox', 'allow-forms allow-same-origin allow-scripts');
	iframe.setAttribute('allowtransparency', 'true');

	iframe.style.width = '100vw';
	iframe.style.height = '100vh';

	document.body.appendChild(iframe);
}

createIframe();
