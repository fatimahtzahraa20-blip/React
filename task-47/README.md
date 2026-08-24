# Offline-First Form

A small React application that saves form submissions locally before attempting to send them to a server. Entries remain available across page reloads and temporary connection loss because the browser's IndexedDB database is the source of truth for the sync queue.

## How it works

1. A user submits a title and optional notes.
2. The entry is written to IndexedDB immediately with a `pending` status.
3. When the app is online, it processes queued entries in the background.
4. Successfully synced entries are removed from the local queue.
5. Failed entries remain in IndexedDB with an `error` status and can be retried.

The app also listens for the browser's `online` and `offline` events. When connectivity returns, it automatically starts another sync pass.

## Features

- Local-first form submission with IndexedDB
- Persistent queue that survives refreshes and browser restarts
- Automatic synchronization after reconnecting
- Manual **Simulate offline** mode for testing
- `pending`, `syncing`, and `error` queue states
- Retry controls for failed submissions
- Mock server latency and an approximately 20% failure rate
- Responsive dark interface

## Tech stack

- React 18
- Vite 5
- Browser IndexedDB API
- Plain CSS

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- A modern browser with IndexedDB support

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Production build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Try the offline workflow

1. Enable **Simulate offline**.
2. Add several entries. They will appear in the sync queue immediately.
3. Refresh the page to confirm that the queued entries persist.
4. Disable **Simulate offline**.
5. Watch the app sync and remove successful entries from the queue.
6. If an entry fails, select **Retry** or use **Sync now**.

## Project structure

```text
src/
|-- App.jsx            # Form, connectivity state, and sync queue logic
|-- db.js              # Promise-based IndexedDB helpers
|-- mockSubmitApi.js   # Simulated server request and failures
|-- index.css          # Application styles
`-- main.jsx           # React entry point
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Serve the production build locally |

## Important notes

- The server is simulated in `src/mockSubmitApi.js`; this project does not send data to a real backend.
- The offline toggle only changes application behavior. It does not disable the browser's network connection.
- This demo syncs while the page is open. It does not register a service worker or use the Background Sync API.
- Successfully synced entries are deleted from IndexedDB, so the interface shows only items that are still queued.
