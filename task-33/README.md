# Task 24 - Product Image Gallery

A responsive, editorial-style product gallery built with React and Vite. The experience presents a curated collection of headphones and accessories through an interactive image viewer, product details, and a lightweight shopping bag.

## Features

- Eight selectable product views with thumbnail navigation
- Previous and next controls with continuous gallery wrapping
- Click-to-zoom images with pointer-based pan positioning
- Keyboard navigation and accessible focus states
- Product information and pricing that update with the selected image
- Shopping bag with item quantities, removal, subtotal calculation, and an empty state
- Slide-out bag panel with backdrop and Escape-key dismissal
- Responsive layouts for desktop, tablet, and mobile screens
- Reduced-motion support for users who prefer fewer animations

## Keyboard controls

Focus the main image viewer to use the zoom controls.

| Key | Action |
| --- | --- |
| `Left Arrow` | Show the previous image |
| `Right Arrow` | Show the next image |
| `Space` or `Enter` | Toggle image zoom when the viewer is focused |
| `Escape` | Close the zoomed view or shopping bag |

## Tech stack

- React 18
- Vite 5
- Plain CSS
- Google Fonts: DM Mono, Manrope, and Playfair Display

No component library or CSS framework is used.

## Getting started

### Prerequisites

- Node.js 18 or newer
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

### Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project structure

```text
task-24/
|-- src/
|   |-- assets/       Product contact-sheet images
|   |-- App.jsx       Gallery, zoom, navigation, and bag logic
|   |-- index.css     Layout, styling, animations, and responsive rules
|   `-- main.jsx      React application entry point
|-- index.html        Vite HTML template
|-- package.json      Project scripts and dependencies
`-- vite.config.js    Vite configuration
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally for review |

## Notes

- Product imagery is stored locally in `src/assets` as contact sheets.
- Cart state is kept in memory and resets when the page reloads.
- The checkout button is a UI placeholder and does not connect to a payment service.
