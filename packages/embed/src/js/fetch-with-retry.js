// Shared fetch + retry helpers used by the iframe product entry points to
// recover from the iOS Safari (especially iOS 18+) intermittent
// "TypeError: Load failed" failure that almost always succeeds on retry.
//
// Two helpers are exported:
//   - `fetchWithTimeout` wraps `fetch` with a per-attempt AbortController
//     timeout and tags errors thrown by the underlying fetch with
//     `.isNetworkError = true` so callers can distinguish them from
//     downstream JSON-parse / property-access TypeErrors.
//   - `withNetworkRetry` retries a thunk up to `maxAttempts` times with
//     linear backoff (1 s, 2 s, …). Only errors flagged with
//     `.isNetworkError === true` are retried; HTTP failures (4xx/5xx) and
//     downstream parsing errors are surfaced immediately.

// Wraps fetch with a per-attempt AbortController timeout. Rejects with an
// AbortError if the timeout elapses. Tags the rejection (AbortError on
// timeout or TypeError on network failure) with `.isNetworkError = true`
// so a surrounding retry classifier can distinguish fetch-level failures
// from downstream errors (e.g. `response.json()` TypeError on malformed
// payloads, or property access on `undefined`) that should not be retried.
export function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((e) => {
      if (e && (e.name === 'AbortError' || e instanceof TypeError)) {
        // Reason: tag at the source so the retry classifier doesn't need to
        // re-derive whether the error originated from the fetch itself.
        try {
          e.isNetworkError = true;
        } catch {
          // Some error objects (e.g. frozen) reject property assignment;
          // fall back to letting the classifier treat unflagged errors as
          // non-retryable, which is the safer default.
        }
      }
      throw e;
    })
    .finally(() => clearTimeout(timerId));
}

// Retries `fn` up to `maxAttempts` times with linear backoff
// (`baseDelayMs * attempt` — 1 s before attempt 2, 2 s before attempt 3 by
// default). Only errors flagged `.isNetworkError === true` by
// `fetchWithTimeout` are retried; everything else (HTTP failures wrapped
// by the caller, JSON parse TypeErrors, etc.) is thrown immediately.
// `shouldRetry(error, attempt)` can override the default classifier.
export async function withNetworkRetry(
  fn,
  { maxAttempts = 3, baseDelayMs = 1000, shouldRetry } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn(attempt);
    } catch (e) {
      lastError = e;
      const retryable = shouldRetry
        ? shouldRetry(e, attempt)
        : e && e.isNetworkError === true;
      if (!retryable || attempt === maxAttempts) throw e;
      // Linear backoff: 1 s before attempt 2, 2 s before attempt 3.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, baseDelayMs * attempt);
      });
    }
  }
  // Unreachable — the loop either returns from `fn` or throws — but TS-style
  // linters appreciate an explicit terminator.
  throw lastError;
}
