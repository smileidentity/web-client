class SmartFileUpload {
  static memoryLimit = 10240000;

  static supportedTypes = ['image/jpeg', 'image/png'];

  static getHumanSize(numberOfBytes) {
    // Approximate to the closest prefixed unit
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const exponent = Math.min(
      Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
      units.length - 1,
    );
    const approx = numberOfBytes / 1024 ** exponent;
    const output =
      exponent === 0
        ? `${numberOfBytes} bytes`
        : `${approx.toFixed(0)} ${units[exponent]}`;

    return output;
  }

  static getData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(
          new Error(
            'An error occurred reading the file. Please check the file, and try again',
          ),
        );
      };
      reader.readAsDataURL(file);
    });
  }

  static async retrieve(files) {
    if (files.length > 1) {
      throw new Error('Only one file upload is permitted at a time');
    }

    const file = files[0];

    if (!SmartFileUpload.supportedTypes.includes(file.type)) {
      throw new Error(
        'Unsupported file format. Please ensure that you are providing a JPG or PNG image',
      );
    }

    if (file.size > SmartFileUpload.memoryLimit) {
      throw new Error(
        `${file.name} is too large. Please ensure that the file is less than ${SmartFileUpload.getHumanSize(SmartFileUpload.memoryLimit)}.`,
      );
    }

    const imageAsDataUrl = await SmartFileUpload.getData(file);

    return imageAsDataUrl;
  }
}

export default SmartFileUpload;
