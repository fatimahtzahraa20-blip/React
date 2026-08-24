import { ApiError, mockFetch } from "./mockApi.js";

/**
 * requestWithRetry: the core abstraction. Wraps a request function with:
 *  - classification-aware retry (only retryable errors are retried)
 *  - exponential backoff with jitter
 *  - a max attempt ceiling
 *  - an onAttempt callback for UI feedback (attempt count, delay, error)
 *
 * This is the kind of function you'd normally centralize in an `apiClient`
 * module so every feature gets consistent retry/error behavior instead of
 * reimplementing try/catch loops per call site.
 */
export async function requestWithRetry(
  requestFn,
  { maxAttempts = 3, baseDelayMs = 500, onAttempt } = {}
) {
  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const data = await requestFn();
      onAttempt?.({ attempt, status: "success" });
      return data;
    } catch (err) {
      lastError = err;
      const retryable = err instanceof ApiError ? err.retryable : true;
      const willRetry = retryable && attempt < maxAttempts;

      onAttempt?.({ attempt, status: "error", error: err, willRetry, delay: willRetry ? baseDelayMs * 2 ** (attempt - 1) : 0 });

      if (!willRetry) break;

      const backoff = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.random() * 200;
      await new Promise((r) => setTimeout(r, backoff + jitter));
    }
  }

  throw lastError;
}

/** Human-readable, user-safe messages mapped from internal error codes. */
export function friendlyErrorMessage(error) {
  if (!(error instanceof ApiError)) return "Something unexpected happened. Please try again.";
  switch (error.code) {
    case "NETWORK_ERROR":
      return "We couldn't reach the server. Check your connection and try again.";
    case "TIMEOUT":
      return "That request took too long. Please try again.";
    case "SERVER_ERROR":
      return "Something went wrong on our end. Try again shortly.";
    case "RATE_LIMITED":
      return "You're doing that a bit too fast. Please wait a moment and retry.";
    case "NOT_FOUND":
      return "We couldn't find what you were looking for.";
    default:
      return error.message || "An unknown error occurred.";
  }
}

export function fetchEndpoint(endpoint) {
  return () => mockFetch(endpoint);
}


