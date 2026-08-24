# Finder — Pro Workspace Search

Finder is a polished global search experience for finding documents, teammates, and files from one place. It demonstrates responsive search, request debouncing, URL-synced queries, category filtering, and protection against stale asynchronous responses.

## Features

- Search across documents, people, and files
- Filter results by content type
- 400 ms debounce to reduce unnecessary requests
- Stale-response protection for overlapping searches
- Query synchronization through the `?q=` URL parameter
- Browser back and forward navigation support
- Loading skeletons and clear empty states
- Responsive, accessible interface
- Reduced-motion support

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` / `Cmd + K` | Focus the search field |
| `Esc` | Clear the active search |

## Getting started

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

## Production build

```bash
npm run build
npm run preview
```

The optimized production files are generated in `dist/`.

## Project structure

```text
src/
├── App.jsx         # Search interface, filters, and request state
├── hooks.js        # Debounce and URL query-state hooks
├── searchData.js   # Demo dataset and asynchronous search function
├── index.css       # Responsive visual system and component styles
└── main.jsx        # React entry point
```

## How search works

The input updates immediately, while `useDebouncedValue` waits 400 ms after the latest keystroke before starting a search. Each request receives an incrementing identifier. If an older request finishes after a newer one, its response is ignored.

`useQueryParamState` keeps the search term synchronized with the `q` URL parameter using the browser History API, making searches bookmarkable and compatible with back and forward navigation.

## Technology

- React 18
- Vite 5
- Responsive CSS with reduced-motion support

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create an optimized production build
- `npm run preview` — preview the production build locally

