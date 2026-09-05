# Virtualized 10,000-Row Table

A small React demo that keeps a 10,000-row table fast by rendering only the rows near the visible viewport. The virtualization logic is implemented from scratch, without a table or virtualization library.

## Features

- Smooth scrolling through 10,000 generated records
- Windowed rendering with a six-row overscan buffer
- Search by name or email
- Ascending and descending sorting on every column
- Live statistics showing matched rows and the currently rendered range
- Status badges for active, inactive, and pending records
- Dark, responsive interface

## How virtualization works

The table uses fixed 44-pixel rows inside a 560-pixel scroll viewport. A spacer element represents the full height of the filtered dataset, while only the visible slice and its overscan rows are mounted. Each rendered row is absolutely positioned at its corresponding vertical offset.

This keeps the number of mounted rows roughly constant—typically about 25—even when the complete dataset contains 10,000 records. Filtering and sorting operate on the full dataset before the visible window is calculated.

The core implementation is in `src/App.jsx`:

- `useVirtualizedList` calculates the visible start and end indices.
- `scrollTop` determines which section of the dataset is shown.
- `OVERSCAN` renders extra rows above and below the viewport.
- `transform: translateY(...)` places each visible row at the correct position.

## Tech stack

- React 18
- Vite 5
- Plain CSS

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
```

The optimized output is written to `dist/`. To preview it locally:

```bash
npm run preview
```

## Project structure

```text
.
├── src/
│   ├── App.jsx          # Table UI, sorting, filtering, and virtualization
│   ├── generateRows.js  # Deterministic demo-data generator
│   ├── index.css        # Application styles
│   └── main.jsx         # React entry point
├── index.html
├── package.json
└── vite.config.js
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |
