'use strict';

function createIframe() {
	var iframe = document.createElement('iframe');

	iframe.setAttribute('src', 'https://cdn.smileidentity.com/iframe.html');
	iframe.style.width = '100vw';
	iframe.style.height = '100vh';

	document.body.appendChild('iframe');
}

createIframe();
