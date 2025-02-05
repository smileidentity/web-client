export const parseUserAgent = (uaString) => {
  const parser = {
    browser: '',
    browserVersion: '',
    os: '',
    osVersion: '',
    device: '',
  };

  // Browser
  const browserRegex =
    /(firefox|msie|trident|chrome|safari|opera|edge|edg|opr|brave|vivaldi)/i;
  const browserMatch = uaString.match(browserRegex);

  if (browserMatch) {
    parser.browser = browserMatch[1].toLowerCase();

    // Browser version
    const versionRegex = new RegExp(
      `${parser.browser}[\\s/](\\d+(\\.\\d+)*)`,
      'i',
    );
    const versionMatch = uaString.match(versionRegex);

    if (versionMatch) {
      parser.browserVersion = versionMatch[1];
    }
  }

  // Operating System
  const osRegex = /(windows|macintosh|mac os x|linux|android|ios|iphone|ipad)/i;
  const osMatch = uaString.match(osRegex);

  if (osMatch) {
    parser.os = osMatch[1].toLowerCase();

    // OS version
    const osVersionRegex = new RegExp(
      `${parser.os}[\\s/](\\d+(\\.\\d+)*)`,
      'i',
    );
    const osVersionMatch = uaString.match(osVersionRegex);

    if (osVersionMatch) {
      parser.osVersion = osVersionMatch[1];
    }
  }

  // Device
  const deviceRegex =
    /(tablet|ipad|iphone|ipod|mobile|android|pixel|huawei|samsung|sony|nokia|moto|lg|oneplus|xiaomi|kindle)/i;
  const deviceMatch = uaString.match(deviceRegex);

  if (deviceMatch) {
    parser.device = deviceMatch[1].toLowerCase();
  }

  return parser;
};

// Example usage
const parsedData = parseUserAgent(navigator.userAgent);
console.log(parsedData);
