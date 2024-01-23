class SmartCamera {
    static stream = null;

    static async getMedia(constraints) {
        SmartCamera.stream = await navigator.mediaDevices.getUserMedia({
            ...constraints,
            video: {
                ...constraints.video,
                // NOTE: Special case for multi-camera Samsung devices (learnt from Acuant)
                // "We found out that some triple camera Samsung devices (S10, S20, Note 20, etc) capture images blurry at edges.
                // Zooming to 2X, matching the telephoto lens, doesn't solve it completely but mitigates it."
                zoom: SmartCamera.isSamsungMultiCameraDevice() ? 2.0 : 1.0,
            }
        });
        return SmartCamera.stream;
    }

    static stopMedia() {
        if (SmartCamera.stream) {
            SmartCamera.stream.getTracks().forEach(track => track.stop());
            SmartCamera.stream = null;
        }
    }

    static isSamsungMultiCameraDevice() {
        const matchedModelNumber = navigator.userAgent.match(/SM-[N|G]\d{3}/);
        if (!matchedModelNumber) {
            return false;
        }

        const modelNumber = parseInt(matchedModelNumber[0].match(/\d{3}/)[0], 10);
        const smallerModelNumber = 970; // S10e
        return !isNaN(modelNumber) && modelNumber >= smallerModelNumber;
    }

    static handleCameraError(e) {
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

export { SmartCamera };