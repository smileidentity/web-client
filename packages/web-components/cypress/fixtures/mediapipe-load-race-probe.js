import { h, render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Reproduces the SelfieCaptureWrapper MediaPipe load effect in isolation so we
 * can verify, with the real Preact scheduler, whether a slow-resolving load
 * leaves the component stuck on "loading".
 *
 * variant 'buggy' mirrors the original shipped effect: the loading flag is in
 * the dependency array AND is set true as the first action, so setting it
 * re-runs the effect, whose cleanup flips `cancelled` before the load resolves.
 *
 * variant 'fixed' keeps the loading flag out of the deps (uses a ref guard), so
 * the in-flight load is only cancelled on a genuine unmount.
 *
 * @param {{ variant: 'buggy' | 'fixed', resolveDelayMs: number }} options
 * @returns {Promise<string>} final rendered text ('READY' or 'LOADING').
 */
export default function runProbe(options) {
  const { resolveDelayMs, variant } = options;

  let resolveInstance = () => {};
  const instancePromise = new Promise((resolve) => {
    resolveInstance = resolve;
  });
  setTimeout(() => resolveInstance('instance'), resolveDelayMs);

  const root = document.createElement('div');
  root.setAttribute('data-probe', variant);
  document.body.appendChild(root);

  function BuggyComp() {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (ready || loading) return undefined;
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        await instancePromise;
        if (cancelled) return;
        setReady(true);
        setLoading(false);
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [ready, loading]);

    return h('div', null, ready ? 'READY' : 'LOADING');
  }

  function FixedComp() {
    const [ready, setReady] = useState(false);
    const [, setLoading] = useState(false);
    const loadingRef = useRef(false);
    const [retryTick] = useState(0);

    useEffect(() => {
      if (ready || loadingRef.current) return undefined;
      let cancelled = false;
      loadingRef.current = true;
      setLoading(true);
      const load = async () => {
        await instancePromise;
        if (cancelled) return;
        loadingRef.current = false;
        setReady(true);
        setLoading(false);
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [ready, retryTick]);

    return h('div', null, ready ? 'READY' : 'LOADING');
  }

  render(h(variant === 'buggy' ? BuggyComp : FixedComp, null), root);

  return instancePromise.then(
    () =>
      new Promise((resolve) => {
        // Give Preact a couple of ticks to flush the post-resolution render.
        setTimeout(() => resolve(root.textContent || ''), 50);
      }),
  );
}
