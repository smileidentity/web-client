// Debug switch for the document auto-capture tooling (TuningPanel, ROI overlay,
// verbose console logs). Two conditions must BOTH hold:
//
// 1. Build-time gate `__SMILE_DEBUG__` — injected by the web-components Vite
//    `define` (see vite.config.ts): true for dev + preview builds, false for
//    production / npm-publish builds. This makes debug impossible to enable in
//    production no matter what.
// 2. Runtime `?debug` URL param — the explicit per-session opt-in. The embed
//    forwards the host page's `?debug` into the capture iframe
//    (embed/src/js/script.js), so it reaches the component there too.
//
// Result: `?debug` toggles the tooling in dev + preview, and is inert in prod.
//
// `__SMILE_DEBUG__` is declared globally (lib/types.d.ts); the `typeof` guard
// avoids a ReferenceError under any bundler/test runner that doesn't inject the
// define (→ disabled).
export const isDebugEnabled = (): boolean => {
  if (typeof __SMILE_DEBUG__ === 'undefined' || __SMILE_DEBUG__ !== true) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug')
  );
};
