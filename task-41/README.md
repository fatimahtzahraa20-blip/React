# Task 41 - Network Status Indicator

A responsive React application that monitors browser connectivity and demonstrates how an interface can react to online, offline, and slow-network states.

## Features

- Detects online and offline status using `navigator.onLine` and browser network events
- Simulates a heartbeat every four seconds to classify the connection as good or slow
- Displays the latest heartbeat latency
- Shows an offline alert and a temporary reconnection confirmation
- Demonstrates queueing user actions while offline
- Records the 12 most recent connectivity events with timestamps
- Uses a responsive dark interface with clear status colors

## How It Works

The custom `useNetworkStatus` hook listens for the browser's `online` and `offline` events. It also runs a simulated heartbeat because `navigator.onLine` only reports whether a network interface is available; it does not guarantee reliable internet access.

The hook returns:

- `isOnline` - the browser's current connectivity state
- `connectionQuality` - `good`, `slow`, or `unknown`
- `lastPingMs` - the duration of the most recent successful heartbeat
- `history` - recent connectivity and timeout events

When the browser goes offline, actions performed in the demo are counted as locally queued. The interface indicates that they can be synchronized after connectivity returns; no real persistence or server synchronization is implemented.

## Tech Stack

- React 18
- Vite 5
- JavaScript
- CSS

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Testing Network States

1. Open the application in a browser.
2. Open Developer Tools and select the **Network** tab.
3. Change network throttling to **Offline**.
4. Confirm that the status changes to offline and the alert appears.
5. Click **Perform action (will queue)** to test the queued-action counter.
6. Restore the connection and confirm that the back-online message appears.

Slow connections and heartbeat timeouts are simulated automatically, so the status may periodically change while the browser remains online.

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Project Structure

```text
src/
|-- App.jsx               # Network status interface and demo interactions
|-- index.css             # Layout, colors, and component styles
|-- main.jsx              # React application entry point
`-- useNetworkStatus.js   # Connectivity hook and heartbeat simulation
```

## Production Note

For a production application, replace the simulated heartbeat with a request to a lightweight health endpoint and store queued actions in durable browser storage such as IndexedDB.
