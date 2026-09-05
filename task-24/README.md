# Task 15 — Accessible Accordion Component

A responsive FAQ accordion built with React 18 and Vite. The component supports mouse and keyboard interaction, uses accessible ARIA relationships, and animates panels with CSS Grid so content can expand without a fixed height or JavaScript measurements.

## Features

- Opens and closes FAQ answers with native buttons
- Keeps one section open at a time while allowing the active section to close
- Starts with the first FAQ expanded
- Supports `Arrow Up`, `Arrow Down`, `Home`, and `End` keyboard navigation
- Wraps focus from the last heading to the first and vice versa
- Connects triggers and panels with `aria-expanded`, `aria-controls`, and `aria-labelledby`
- Uses visible focus styles and semantic heading structure
- Animates dynamic-height content with CSS Grid (`0fr` to `1fr`)
- Respects the user's reduced-motion preference
- Adapts the layout and spacing for smaller screens

## Tech Stack

- React 18
- Vite 5
- Plain CSS
- Google Fonts — DM Sans

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite, typically `http://localhost:5173`.

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create an optimized production build
npm run preview  # Preview the production build locally
```

## Keyboard Controls

| Key | Action |
| --- | --- |
| `Tab` | Move focus into or out of the accordion |
| `Enter` / `Space` | Toggle the focused section |
| `Arrow Down` | Focus the next accordion heading |
| `Arrow Up` | Focus the previous accordion heading |
| `Home` | Focus the first accordion heading |
| `End` | Focus the last accordion heading |

## Project Structure

```text
task-15/
├── src/
│   ├── App.jsx       # FAQ data, accordion components, and interaction logic
│   ├── index.css     # Layout, responsive styles, and panel animation
│   └── main.jsx      # React application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Implementation Notes

The accordion stores the currently open item index in React state. Button references are kept in an array so the arrow, Home, and End keys can move focus directly between headings.

Each answer wrapper transitions its grid row from `0fr` to `1fr`. This creates a smooth expansion for content of any height without calculating dimensions in JavaScript.