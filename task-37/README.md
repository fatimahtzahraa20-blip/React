# Task 37 - Collaborative Text Editor

A React prototype that demonstrates how a shared text editor can merge concurrent changes, track document versions, show collaborator presence, and ask the user to resolve overlapping edits.

![Collaborative text editor preview](./Task-37%20SS.png)

## Features

- Editable shared document with a clean, dark interface
- Simulated collaborators named Lena and Omar
- Automatic remote edits every few seconds
- Debounced local syncing after the user stops typing
- Synced, syncing, and conflict status indicators
- Version tracking and a recent change history
- Basic transformation of non-overlapping concurrent operations
- Conflict controls for keeping the local text or accepting the server text

## How it works

The app keeps a simulated server document, version number, and operation log in the browser. Local text changes are converted into `insert`, `delete`, or `replace` operations after a 500 ms debounce. If remote operations arrived in the meantime, the local operation is shifted to account for them.

When a local replacement or deletion overlaps a concurrent remote edit, the app does not merge the changes automatically. Instead, it displays a conflict banner with two choices:

- **Keep mine** replaces the simulated server document with the local version.
- **Take theirs** discards the unsynced local version and loads the current server document.

All collaboration is simulated locally. The project does not connect to a real server, database, or WebSocket service.

## Tech stack

- React 18
- Vite 5
- JavaScript
- CSS

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
task-37/
|-- src/
|   |-- App.jsx            # Editor UI, sync state, history, and conflicts
|   |-- collabEngine.js    # Diffing, operation transforms, and peer simulation
|   |-- index.css          # Application styling
|   `-- main.jsx           # React entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## Prototype limitations

This project illustrates collaboration concepts but is not a production-ready collaborative editor. Its diff algorithm supports one contiguous changed region, its operation transform is intentionally basic, and all state is lost when the page reloads. A production implementation should use a proven OT or CRDT library such as ShareDB, Yjs, or Automerge together with persistent storage, authentication, and real-time networking.
