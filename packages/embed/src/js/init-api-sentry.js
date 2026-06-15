import * as Sentry from '@sentry/browser';

// Build a failure descriptor when both `products_config` and `services`
// responses arrived from a Promise.all but at least one was non-OK. Pass
// the result via the closure-local `initApiFailure` variable so the catch
// can attach response-level detail to the Sentry event.
export function buildInitApiFailure(productsConfigResponse, servicesResponse) {
  const failedRequests = [];
  if (!productsConfigResponse.ok) failedRequests.push('products_config');
  if (!servicesResponse.ok) failedRequests.push('services');
  return {
    failedRequests,
    productsConfigStatus: productsConfigResponse.status,
    servicesStatus: servicesResponse.status,
  };
}

// Report an init-API failure to Sentry. `failure` is the descriptor from
// `buildInitApiFailure` if both responses arrived (one of them non-OK), or
// `null` if the underlying fetch rejected (network drop, abort, etc.).
export function captureInitApiFailure(e, failure) {
  Sentry.captureException(e, {
    tags: {
      area: 'init_api',
      failedRequest: failure ? failure.failedRequests.join(',') : 'rejection',
      ...(failure
        ? {
            productsConfigStatus: String(failure.productsConfigStatus),
            servicesStatus: String(failure.servicesStatus),
          }
        : {}),
    },
  });
}
