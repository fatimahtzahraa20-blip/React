# Product Filter Panel

A responsive product catalog built with React and Vite. Users can narrow the catalog by category, maximum price, and minimum rating, then sort the results. Every selection is synchronized with the URL, so filtered views remain intact after a refresh and can be shared as links.

## Features

- Filter products by one or more categories
- Set a maximum price with a range slider
- Filter by minimum product rating
- Sort by relevance, price, or rating
- Remove individual filters using active-filter chips
- Clear all filters in one action
- Display the current result count and an empty state when no products match
- Persist filter and sorting state in the URL without React Router
- Responsive two-column layout that adapts for tablets and phones

## URL query parameters

The application reads its initial state from the query string and updates the URL as selections change.

| Parameter | Purpose | Example |
| --- | --- | --- |
| `cat` | Comma-separated categories | `cat=Audio,Wearables` |
| `max` | Maximum product price | `max=150` |
| `rating` | Minimum rating | `rating=4` |
| `sort` | Sort order | `sort=price-asc` |

Example:

```text
/?cat=Audio,Accessories&max=150&rating=4&sort=price-asc
```

Default values are omitted from the URL to keep it concise.

## Tech stack

- React 18
- Vite 5
- Plain CSS
- Browser `URLSearchParams` and History APIs

## Getting started

Requirements: Node.js 18 or later and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized output is generated in `dist/`.

## Project structure

```text
task-23/
|-- src/
|   |-- App.jsx       # Product data, filters, sorting, and URL synchronization
|   |-- index.css     # Layout, component styles, and responsive breakpoints
|   `-- main.jsx      # React application entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |
