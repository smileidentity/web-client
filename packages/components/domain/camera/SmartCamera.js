class SmartCamera {
	static stream = null;

	static async getMedia(constraints) {
		try {
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
		} catch (error) {
			throw error;
		}
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
}

export { SmartCamera };