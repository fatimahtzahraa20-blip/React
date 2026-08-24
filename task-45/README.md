# Task 45 — Command Palette

An accessible command palette built with React and Vite. The project demonstrates how to create a keyboard-friendly command menu with native React state and ARIA attributes, without relying on a headless UI library.

## Features

- Open or close the menu with `Cmd + K` on macOS or `Ctrl + K` on Windows and Linux.
- Search commands by name with live, case-insensitive filtering.
- Browse grouped commands such as Actions, Navigate, Preferences, and Account.
- Move through results with the Up and Down arrow keys.
- Run the highlighted command with `Enter`.
- Close the menu with `Escape` or by clicking outside it.
- Keep the active result visible while navigating a long list.
- Display a temporary confirmation toast after a command runs.
- Restore focus to the previously focused element when the menu closes.

## Accessibility

The menu implements the combobox/listbox interaction pattern using:

- A modal dialog with `role="dialog"` and `aria-modal="true"`.
- A search input with `role="combobox"`, `aria-controls`, `aria-expanded`, and `aria-activedescendant`.
- A command list with `role="listbox"` and results with `role="option"`.
- `aria-selected` to expose the currently highlighted command.
- Keyboard focus management and focus trapping while the dialog is open.
- Screen-reader announcements for empty results and completed commands.

## Tech Stack

- React 18
- Vite 5
- CSS

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
task-45/
├── src/
│   ├── App.jsx       # Command data, filtering, keyboard controls, and UI
│   ├── index.css     # Layout and component styling
│   └── main.jsx      # React application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Available Commands

The demo includes commands for creating files and folders, saving, searching, navigating between pages, changing the theme, and logging out. Commands currently show a confirmation message rather than performing real application actions.