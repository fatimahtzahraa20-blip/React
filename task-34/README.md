# Date Range Picker

A responsive date-range picker built with React 18 and Vite. It provides a polished reporting-period workflow with quick presets, dual-month navigation, range previews, and explicit apply/cancel actions.

## Features

- Two-month calendar view on desktop and a single-month view on mobile
- Quick-select presets for Today, Yesterday, Last 7 days, Last 30 days, and This month
- Click-based start and end date selection
- Hover preview while choosing the end date
- Automatic normalization when the second selected date is earlier than the first
- Future dates disabled
- Inclusive selected-day count
- Previous and next month navigation, limited so users cannot browse beyond the current month
- Draft selection state with Apply and Cancel controls
- Responsive styling with visible hover and keyboard-focus states
- Accessible labels and calendar selection attributes

## Selection behavior

The picker opens with the last seven days selected. Choosing a date starts a new draft range; choosing a second date completes it. The selected range is not committed to the date fields until **Apply range** is pressed. **Cancel** closes the picker and restores the last applied range.

## Tech stack

- React 18
- Vite 5
- Plain CSS
- DM Sans via Google Fonts

No component library or CSS framework is used.

## Getting started

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` creates an optimized production bundle in `dist/`. The preview command serves that bundle locally for verification.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
└── src
    ├── App.jsx      # Calendar UI, date utilities, and selection state
    ├── index.css    # Layout, range styling, and responsive rules
    └── main.jsx     # React application entry point
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
