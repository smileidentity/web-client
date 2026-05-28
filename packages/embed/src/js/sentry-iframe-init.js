import * as Sentry from '@sentry/browser';

// DSN previously embedded in the CDN loader URL
// (https://js.sentry-cdn.com/<key>.min.js) loaded from each iframe HTML.
// Now configured directly on the bundled SDK so that setTag /
// captureException calls from the iframe JS bundles target the same hub
// that ships events — without this, tags like `partner_id` set in the
// bundle never reached Sentry because the bundled SDK had no client.
const FALLBACK_DSN =
  'https://82cc89f6d5a076c26d3a3cdc03a8d954@o1154186.ingest.us.sentry.io/4507143981236224';
/* eslint-disable no-undef */
const DSN =
  (typeof __SENTRY_DSN__ !== 'undefined' && __SENTRY_DSN__) || FALLBACK_DSN;
/* eslint-enable no-undef */

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function initIframeSentry(pageName) {
  if (Sentry.getClient()) return;

  const pageUrlPattern = new RegExp(escapeRegExp(pageName));

  Sentry.init({
    dsn: DSN,
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames || [];
      // TEMP: diagnostic for filter regex verification — remove before merge
      // eslint-disable-next-line no-console
      console.log(
        '[sentry-iframe-init] frames',
        frames.map((f) => f.filename),
        'request.url',
        event.request?.url,
        'pageUrlPattern',
        pageUrlPattern,
      );
      // Keep the event if at least one frame is from the library's source
      // files. Previously any non-matching frame (e.g. a browser-internal
      // or polyfill frame in the chain) would drop the entire event.
      // if (
      //   frames.length > 0 &&
      //   !frames.some((frame) => frame.filename?.match(/inline\/src/))
      // ) {
      //   return null;
      // }
      // if (!event.request?.url?.match(pageUrlPattern)) {
      //   return null;
      // }
      return event;
    },
    tracesSampleRate: 1.0, // TEMP: set 100% trace sampling for diagnostic purposes — adjust as needed
  });
}
