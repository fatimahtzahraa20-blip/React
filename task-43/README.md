# API Handling

A professional API resilience and observability dashboard built with React and Vite. It provides a visual workspace for testing unreliable endpoints, validating retry policies, inspecting responses, and following every request attempt in real time.

The project uses a simulated backend, so failure scenarios such as network errors, timeouts, rate limits, server errors, and missing resources can be tested safely without an external service.

## Highlights

- Centralized, reusable API error-handling layer
- Retry-aware error classification
- Exponential backoff with randomized jitter
- Configurable retry attempts and base delay
- Individual endpoint runner and full batch health check
- Live system health, success rate, latency, and retry metrics
- Structured response previews with raw JSON mode
- Filterable request activity and retry-decision trace
- Friendly user-facing error messages
- Responsive interface for desktop, tablet, and mobile

## Resilience flow

```text
UI request
   │
   ▼
requestWithRetry()
   │
   ├── Success ──────────────► Return response data
   │
   └── Failure
         │
         ├── Non-retryable ──► Stop and surface a safe error
         │
         └── Retryable
               │
               ├── Attempts remaining ─► Backoff + jitter ─► Retry
               └── Limit reached ──────► Stop and surface a safe error
```

## Simulated endpoints

| Endpoint | Service | Failure profile | Possible failures |
| --- | --- | ---: | --- |
| `/api/users` | Identity | 35% | Network, 500, 429 |
| `/api/orders` | Commerce | 50% | Timeout, 500 |
| `/api/profile` | Account | 20% | 404, non-retryable |
| `/api/settings` | Preferences | 15% | Network |

Each request includes randomized latency to make loading, retry, and telemetry states observable in the interface.

## Core architecture

### `requestWithRetry()`

The shared request wrapper in `src/apiClient.js` provides consistent behavior to every consumer:

- Retries only errors marked as retryable
- Applies exponential backoff between attempts
- Adds jitter to prevent synchronized retry bursts
- Enforces a configurable attempt ceiling
- Publishes attempt results and retry decisions through `onAttempt`

### `ApiError`

The typed error model in `src/mockApi.js` includes:

- `status`: HTTP-style status value
- `code`: stable internal error identifier
- `retryable`: whether another attempt is appropriate
- `message`: technical error description

This avoids fragile message matching in UI and business logic.

### Friendly errors

`friendlyErrorMessage()` converts internal error codes into clear, user-safe messages. Technical codes remain available in the dashboard for diagnostics without exposing raw backend messages as the primary experience.

## Dashboard features

### Health overview

The overview tracks:

- Healthy services
- Successful attempts
- Average end-to-end latency
- Automatic retries initiated

### Endpoint workspace

Each endpoint card supports:

- Independent request execution
- Current health and latency display
- Loading and terminal error states
- Structured record or property previews
- Raw JSON inspection
- Attempt-count reporting

Use **Run all endpoints** to execute the complete health-check suite concurrently.

### Retry policy controls

Before running a request, choose:

- Maximum attempts: 2–5
- Base delay: 200 ms, 400 ms, or 800 ms

The actual delay grows exponentially and includes randomized jitter.

### Request activity

The activity table records:

- Request time
- Endpoint
- Attempt number
- Success or error outcome
- Internal error code
- Retry or stop decision

Events can be filtered by outcome or cleared from the current session.

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

The optimized production output is generated in `dist/`.

## Project structure

```text
.
├── src/
│   ├── App.jsx          # Dashboard UI, endpoint state, metrics, and activity trace
│   ├── apiClient.js     # Retry orchestration and friendly error mapping
│   ├── mockApi.js       # Simulated data, latency, and classified failures
│   ├── index.css        # Responsive dashboard design system
│   └── main.jsx         # React application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |

## Technology

- React 18
- Vite 5
- Modern CSS
- Simulated Promise-based API

## Notes

- Data and failures are intentionally simulated; no external API credentials are required.
- A failed request is expected behavior and demonstrates the recovery layer.
- Refreshing the page resets dashboard metrics and the activity history.
