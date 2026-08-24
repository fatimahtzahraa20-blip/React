# Error Pages Experience

A responsive React demo showcasing clear, helpful error states for common `404 Not Found` and `500 Internal Server Error` scenarios.

## Overview

The project demonstrates how an application can turn failures into useful recovery experiences. Each page explains what happened, offers relevant next steps, and keeps users inside a consistent application shell.

## Features

### 404 page

- Displays the path that could not be found
- Provides site search and homepage actions
- Lets users return to their previous page
- Includes shortcuts to popular pages

### 500 page

- Generates a unique reference ID for support requests
- Supports manual and automatic retry attempts
- Limits retries to avoid repeatedly calling a failing service
- Displays simulated service-status information
- Provides direct links to the homepage and support page

### Demo interface

- Includes home, 404, 500, and support views
- Provides a bottom toolbar for quickly switching between states
- Uses a responsive dark-themed design

## Tech Stack

- React 18
- Vite 5
- CSS

## Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, then use the demo toolbar at the bottom of the page to explore each state.

## Production Build

Create an optimized build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
.
|-- index.html
|-- src/
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- package.json
`-- vite.config.js
```

## Notes

This is a front-end demonstration. Navigation, service checks, retry behavior, and error responses are simulated in the browser and are not connected to a production API.
