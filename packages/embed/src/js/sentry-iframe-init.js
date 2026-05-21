import * as Sentry from '@sentry/browser';

// DSN previously embedded in the CDN loader URL
// (https://js.sentry-cdn.com/<key>.min.js) loaded from each iframe HTML.
// Now configured directly on the bundled SDK so that setTag /
// captureException calls from the iframe JS bundles target the same hub
// that ships events — without this, tags like `partner_id` set in the
// bundle never reached Sentry because the bundled SDK had no client.
const DSN =
  'https://82cc89f6d5a076c26d3a3cdc03a8d954@o1154186.ingest.us.sentry.io/4507143981236224';

export function initIframeSentry(pageName) {
  Sentry.init({
    dsn: DSN,
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames || [];
      // Drop events where any frame originates outside the library's
      // source files. Preserves the historical filter behaviour from the
      // per-page CDN loader configs.
      for (const frame of frames) {
        if (!frame.filename?.match(/inline\/src/g)) {
          return null;
        }
      }
      if (!event.request?.url?.match(new RegExp(pageName))) {
        return null;
      }
      return event;
    },
    tracesSampleRate: 0.01,
  });
}
