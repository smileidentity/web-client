class Utils {
	static handleError(e) {
		switch (e.name) {
		case 'NotAllowedError':
		case 'SecurityError':
		  return `
			  Looks like camera access was not granted, or was blocked by a browser
			  level setting / extension. Please follow the prompt from the URL bar,
			  or extensions, and enable access.
			  You may need to refresh to start all over again
			`;
		case 'AbortError':
		  return `
			  Oops! Something happened, and we lost access to your stream.
			  Please refresh to start all over again
			`;
		case 'NotReadableError':
		  return `
			  There seems to be a problem with your device's camera, or its connection.
			  Please check this, and when resolved, try again. Or try another device.
			`;
		case 'NotFoundError':
		  return `
			  We are unable to find a video stream.
			  You may need to refresh to start all over again
			`;
		case 'TypeError':
			return `
			  This site is insecure, and as such cannot have access to your camera.
			  Try to navigate to a secure version of this page, or contact the owner.
			`;
		default:
		 return e.message;
		}
	  }
}

export default Utils;