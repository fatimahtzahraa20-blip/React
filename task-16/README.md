# Command Workspace Palette

A polished, accessible command palette built with React and Vite. It provides fast command search, grouped results, keyboard navigation, theme switching, and responsive behavior in a clean editorial interface.

## Features

- Open with `Ctrl + K` on Windows/Linux or `⌘ + K` on macOS
- Filter commands instantly by name, description, or group
- Navigate results with the arrow keys and select with Enter
- Close with Escape or by clicking outside the dialog
- Toggle between light and dark appearance modes
- Accessible dialog, listbox, status, and keyboard interactions
- Responsive desktop and mobile layout
- Lucide icons and subtle motion effects

## Tech stack

- React 18
- Vite
- Lucide React
- CSS
- ESLint

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Check the source with ESLint |

## Project structure

```text
task-16/
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── styles.css
├── eslint.config.js
├── vite.config.js
└── package.json
```

## Customizing commands

Commands are defined in the `commands` array near the top of `src/App.jsx`. Add an object with a group, icon, title, subtitle, and optional keyboard labels. Add an `action` value when the command needs custom behavior.

## Production

Run `npm run build`. Vite writes the deployable output to `dist/`, which is excluded from version control.
