# File Upload Component

A responsive file-upload interface built with React 18 and Vite. It supports drag-and-drop and file browsing, validates selected files, previews images, and presents simulated upload progress and completion states.

## Features

- Drag-and-drop upload area with keyboard support
- Multiple file selection
- PNG, JPG/JPEG, WEBP, and PDF validation
- Maximum file size of 10 MB per file
- Local thumbnail previews for supported images
- Simulated progress indicators and completed-file count
- Clear-all and individual file removal controls
- Responsive layout for desktop and mobile screens
- Success screen after all valid files finish processing

## Tech Stack

- React 18
- Vite 5
- Plain CSS
- Inline SVG icons

No CSS framework or external component library is used.

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

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
.
|-- src/
|   |-- App.jsx       # Uploader UI, validation, and state management
|   |-- index.css     # Component styling and responsive layout
|   `-- main.jsx      # React application entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## Validation Rules

Files are checked in the browser before their simulated upload begins:

| Rule | Accepted value |
| --- | --- |
| File types | PNG, JPEG, WEBP, PDF |
| Maximum size | 10 MB per file |
| Selection | Multiple files allowed |

Invalid files remain visible with an error message and can be removed individually or cleared with the rest of the list.

## Implementation Note

This project is a front-end demonstration. Upload progress is generated in the browser, files are not sent to a server, and selections are not persisted. The privacy/encryption message is presentation copy and does not represent an implemented encryption workflow. Object URLs are used only to display local image previews.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
