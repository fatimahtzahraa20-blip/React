# ActivityLogs

ActivityLogs is a responsive React application for following workspace activity and managing a personal profile. It combines a simulated real-time event feed with a polished desktop and mobile interface.

## Features

### Activity feed

- Streams new comments, likes, follows, uploads, and mentions.
- Displays live connection, reconnecting, and connecting states.
- Buffers incoming events while the user is reading older activity.
- Filters events by activity type.
- Loads older activity with simulated pagination.
- Shows skeleton placeholders during the initial load.
- Displays readable relative timestamps such as `Just now` and `4m ago`.

### Profile

- Provides a dedicated profile view with personal details and account statistics.
- Supports editing the name, role, biography, location, and website.
- Saves profile changes to browser `localStorage`.
- Includes an availability and focus-mode control.
- Shows recent activity associated with the current user.
- Provides responsive account and preference controls.

### Responsive interface

- Uses a persistent sidebar on desktop.
- Uses a compact header and bottom navigation on mobile.
- Adapts profile details, statistics, filters, and activity rows to smaller screens.

## Tech stack

- React 18
- Vite 5
- CSS
- Browser `EventTarget` API
- Browser `localStorage` API

## Project structure

```text
src/
  App.jsx         Main interface, navigation, feed, and profile views
  index.css       Application styling and responsive layouts
  main.jsx        React application entry point
  mockFeed.js     Simulated real-time activity service
```

## Getting started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite. Use `#activity` or `#profile` in the URL to open a specific view.

## Production build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Activity simulation

`src/mockFeed.js` provides an `EventTarget`-based activity source that behaves like a lightweight WebSocket or server-sent events client. It:

- Emits connection-status changes.
- Generates activity events at random intervals.
- Simulates occasional connection drops and automatic reconnection.
- Returns older events through `fetchHistoryPage()`.

The mock service can later be replaced with a real API while preserving the surrounding feed interface and user experience.
