# Orivue — Autocomplete Search

A polished, responsive autocomplete search experience built with React and Vite. Orivue searches a curated local dataset and includes keyboard navigation, category filters, highlighted matches, recent-search persistence, and accessible interaction states.

## Features

- Instant, case-insensitive suggestions across titles, topics, and keywords
- Full keyboard support: `↑` / `↓` to navigate, `Enter` to select, `Esc` to close
- `Cmd/Ctrl + K` global search shortcut
- Category filters for articles, books, guides, and podcasts
- Search-term highlighting and helpful empty states
- Dedicated content page for every result with URL-based navigation
- Browser back/forward support and shareable direct links
- Related recommendations on every content page
- Recent selections stored in `localStorage`
- Responsive layout and reduced-motion support
- No backend or API key required

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── App.jsx       # Search behavior and UI
├── DetailPage.jsx # Full result page and related content
├── data.js       # Searchable local content
├── main.jsx      # React entry point
└── styles.css    # Responsive visual system
```

To add suggestions, edit the array in `src/data.js`. Each item needs an `id`, `title`, `category`, `meta`, `icon`, and searchable `keywords` string.

## Tech stack

React, Vite, Lucide React, and plain CSS.
