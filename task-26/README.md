# Themechanger

A responsive theme-selection interface built with React and Vite. Choose from five color palettes and the app applies the selection instantly, saves it in the browser, and restores it on future visits.

## Features

- Five palettes: Linen, Midnight, Evergreen, Tidal, and Mulberry
- Theme selection through palette cards or the header toggle
- Browser persistence with `localStorage`
- Light or dark initial theme based on the operating-system preference
- Live response to system color-scheme changes until a palette is chosen manually
- Responsive desktop and mobile layouts
- Accessible pressed states, labels, semantic controls, and reduced-motion support
- Theme styling powered by CSS custom properties

## Tech stack

- React 18
- Vite 5
- Plain CSS
- Google Fonts: DM Sans and Playfair Display

## Getting started

### Prerequisites

Install a current version of [Node.js](https://nodejs.org/) and npm.

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

To preview the production build locally:

```bash
npm run preview
```

## Project structure

```text
src/
|-- App.jsx             Theme picker interface and palette definitions
|-- ThemeContext.jsx    Theme state, system preference, and persistence
|-- index.css           Responsive layout and palette variables
`-- main.jsx            React entry point and context provider
```

## How theme persistence works

The active palette is applied to the root `<html>` element through its `data-theme` attribute. CSS custom properties then update the page colors. The selected theme is stored under `tinctura-theme` in `localStorage`; a separate manual-selection flag prevents later operating-system theme changes from overriding the user's choice.
