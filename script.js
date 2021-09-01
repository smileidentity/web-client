'use strict';

function getSiteURL() {
	var currentScriptSrc = document.currentScript.src;

	const qualifiedURL = currentScriptSrc.split('script.js')[0];

	if (qualifiedURL.includes('instrumented')) {
		return '';
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
	iframe.setAttribute('allowtransparency', 'true');

	iframe.style.width = '100vw';
	iframe.style.height = '100vh';

	document.body.appendChild(iframe);
}

createIframe();
