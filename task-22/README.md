# Task 13 — Rich Text Editor Toolbar

A responsive rich-text editor built with React 18 and Vite. The editor uses the browser's `contentEditable` and `execCommand` APIs to apply formatting while keeping the toolbar synchronized with the current text selection.

## Features

- Editable document canvas with starter content
- Paragraph, heading, and blockquote styles
- Undo and redo controls
- Bold, italic, underline, and strikethrough formatting
- Left, center, and right text alignment
- Bulleted and numbered lists
- Link insertion with automatic `https://` handling
- Clear-formatting action
- Live toolbar state based on the current selection
- Live word and character counts
- Saved/editing status indicator
- WhatsApp and native device sharing
- Word-compatible `.doc` and plain-text `.txt` downloads
- Copy-to-clipboard action
- Responsive desktop and mobile layout

## Tech Stack

- React 18
- Vite 5
- Plain CSS
- Browser Selection, Clipboard, Share, Blob, and `execCommand` APIs

No CSS framework or external UI component library is used.

## Getting Started

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

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```text
task-13/
├── src/
│   ├── App.jsx       # Editor interface, formatting logic, and share actions
│   ├── index.css     # Layout, editor, toolbar, menu, and responsive styles
│   └── main.jsx      # React application entry point
├── index.html
├── package.json
└── vite.config.js
```

## How It Works

The document is rendered as a `contentEditable` article. Toolbar actions call `document.execCommand()` to update selected content. A `selectionchange` listener reads the active formatting commands, synchronizes each toolbar button's pressed state, and refreshes the word and character totals.

When the link dialog opens, the current selection range is stored and restored before creating the link so the selected text remains the link target.

## Browser Notes

- Native sharing requires Web Share API support; unsupported browsers fall back to copying the document text.
- Clipboard access may require HTTPS or localhost and browser permission.
- `document.execCommand()` is deprecated but intentionally used for this task's `contentEditable` formatting implementation.
