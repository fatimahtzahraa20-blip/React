# Analytics — React Error Boundary Dashboard

A polished React dashboard demonstrating how layered error boundaries keep an application usable when individual components fail.

The project provides safe, interactive failure simulations, localized recovery states, app-shell protection, and a live event stream that mirrors a production error-monitoring workflow.

## Features

- **Component-level isolation** — Revenue and order modules can fail independently without affecting neighboring components.
- **Reusable error boundary** — `ErrorBoundary` supports custom fallback interfaces, manual resets, error callbacks, and reset keys.
- **Higher-order component support** — `withErrorBoundary()` makes it easy to protect existing components without changing their call sites.
- **App-shell protection** — A top-level boundary acts as the final safety net for unisolated rendering failures.
- **Async error handling** — Demonstrates explicit reporting for failures that React error boundaries do not catch.
- **Live event stream** — Captured errors appear immediately with their source, identifier, and timestamp.
- **Recovery controls** — Failed components and the complete dashboard can be restored without refreshing the browser.
- **Responsive interface** — The dashboard adapts across desktop, tablet, and mobile screens.
- **Accessible interactions** — Controls include clear labels, keyboard focus states, and live status updates.

## Error Boundary Architecture

```text
App-shell ErrorBoundary
└── Analytics dashboard
    ├── Revenue analytics boundary
    ├── Order pipeline boundary
    ├── Independent control
    ├── Async operation with manual reporting
    ├── Unisolated app-shell test
    └── Error event stream
```

React error boundaries catch errors thrown while rendering, in constructors, and in lifecycle methods below them. They do not catch errors in event handlers, timers, promises, server-side rendering, or inside the boundary itself. The async scenario shows how those failures can be captured and reported manually.

## Tech Stack

- React 18
- Vite 5
- JavaScript and JSX
- Custom responsive CSS
- Inline SVG icons

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local URL displayed by Vite, then use the simulation controls to test component isolation and recovery.

### Production Build

```bash
npm run build
```

### Preview the Build

```bash
npm run preview
```

## Project Structure

```text
src/
├── App.jsx              # Dashboard UI and interactive scenarios
├── ErrorBoundary.jsx    # Reusable error-boundary implementation
├── errorReporting.js    # In-memory error reporting service
├── index.css            # Responsive application styling
├── error-styles.css     # Error fallback styles
└── main.jsx             # React application entry point
```

## Testing the Dashboard

1. Select **Simulate crash** on either protected analytics card.
2. Confirm that only the selected card displays its recovery interface.
3. Interact with the independent control to verify that sibling components remain active.
4. Select **Test async capture** to send a manually handled failure to the event stream.
5. Select **Test app-shell fallback** to trigger the top-level recovery experience.
6. Restore the dashboard using the provided recovery action.

## Production Integration

`src/errorReporting.js` currently stores captured events in memory for demonstration purposes. In a production application, replace its reporting logic with a monitoring provider such as Sentry, Bugsnag, Datadog, or a custom observability endpoint.

## License

This project is provided for learning and demonstration purposes.
