# Task 72: Error Logging

A React error-monitoring dashboard backed by an Express API and Winston. Browser errors are sent to the API, while the API also catches unhandled request errors, uncaught exceptions, and unhandled promise rejections.

## Features

- Global browser `error` listener forwarding errors to `POST /api/logs`.
- Express error middleware for request-level failures.
- Process-level handlers for `uncaughtException` and `unhandledRejection`.
- Winston JSON logging to `logs/error.log` and `logs/combined.log`.
- Rotating file transports capped at 5 MB per file and 5 archived files.
- Request IDs returned in `X-Request-Id` and included in every log entry.
- Dashboard health status, live event filters, activity stream, and a manual test-error action.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Winston API on port `3001`.

To run the API by itself:

```bash
npm run server
```

## Verify file logging

1. Start the app with `npm run dev`.
2. Select **Send test error** in the dashboard.
3. Confirm the event appears in the activity stream.
4. Open `logs/error.log` and look for the JSON event. General messages are in `logs/combined.log`.

## Configuration

- `PORT`: API port, defaults to `3001`.
- `LOG_LEVEL`: Winston level, defaults to `info`.

Example in PowerShell:

```powershell
$env:PORT = 4000
$env:LOG_LEVEL = 'debug'
npm run server
```

## Production build

```bash
npm run build
npm run lint
```
