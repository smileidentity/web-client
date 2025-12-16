import { t, tHtml } from '../../localisation';

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
        reject(new Error(t('fileUpload.error.readingFile')));
      };
      reader.readAsDataURL(file);
    });
  }

  static async retrieve(files) {
    if (files.length > 1) {
      throw new Error(t('fileUpload.error.multipleFiles'));
    }

    const file = files[0];

    if (!SmartFileUpload.supportedTypes.includes(file.type)) {
      throw new Error(t('fileUpload.error.unsupportedFormat'));
    }

    if (file.size > SmartFileUpload.memoryLimit) {
      throw new Error(
        tHtml('fileUpload.error.fileTooLarge', {
          filename: file.name,
          size: SmartFileUpload.getHumanSize(SmartFileUpload.memoryLimit),
        }),
      );
    }

    const imageAsDataUrl = await SmartFileUpload.getData(file);

    return imageAsDataUrl;
  }
}

export default SmartFileUpload;
