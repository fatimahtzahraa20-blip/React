# Toast Notification System

A responsive toast notification interface built with React and Vite. It includes success, error, warning, and informational notifications with stacking, progress indicators, auto-dismiss behavior, and manual close controls.

## Features

- Four notification variants
- Automatic dismissal after five seconds
- Configurable 3, 5, or 8-second duration
- Four selectable screen positions
- Manual dismiss buttons
- Stacked notifications
- Clear-all control and a five-toast stack limit
- Responsive layout
- Accessible live-region announcements
- Reduced-motion support

## Getting started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Production build

Create an optimized build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Technology

- React
- Vite
- Lucide React
- CSS

## Project structure

```text
├── src/
│   ├── main.jsx       # React components and toast behavior
│   └── styles.css     # Layout, toast variants, and animations
├── index.html
├── package.json
└── README.md
```
