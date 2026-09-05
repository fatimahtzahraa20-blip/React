// Simulates a Sentry/Bugsnag-style error reporting client. In a real app
// this would POST to a tracking service; here it just keeps an in-memory
// log so the UI can display "what would have been reported."

const listeners = new Set();
const log = [];

export function reportError(error, context = {}) {
  const entry = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message: error.message,
    stack: error.stack?.split("\n").slice(0, 3).join("\n"),
    context,
    ts: Date.now(),
  };
  log.unshift(entry);
  listeners.forEach((cb) => cb());
  // eslint-disable-next-line no-console
  console.error("[error-reporting] captured:", entry);
  return entry;
}

export function getErrorLog() {
  return log;
}

export function subscribeErrorLog(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function clearErrorLog() {
  log.length = 0;
  listeners.forEach((cb) => cb());
}
