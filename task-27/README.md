# Banner Cookie Consent

A responsive React demo that shows how a marketing website can request, store, and update cookie consent without interrupting the rest of the experience. Visitors can accept every cookie category, reject optional cookies, or manage individual preferences in an accessible privacy dialog.

## Features

- First-visit cookie consent banner
- Accept-all and reject-optional actions
- Preference center for analytics and personalization cookies
- Essential cookies permanently enabled
- Consent persisted in `localStorage`
- Privacy controls available after the initial choice
- Keyboard-friendly dialog with Escape-to-close and focus restoration
- Responsive layouts and reduced-motion support
- Interactive product cards and smooth in-page navigation

## How consent is stored

Preferences are saved in the browser under the `cookie-consent-v2` key. The stored object contains the three consent categories and an `updatedAt` timestamp:

```json
{
  "necessary": true,
  "analytics": false,
  "personalization": false,
  "updatedAt": "2026-08-19T00:00:00.000Z"
}
```

To see the first-visit banner again, remove this key from the browser's local storage and reload the page.

## Tech stack

- React 18
- Vite 5
- Plain CSS
- Browser `localStorage`

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

## Project structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
`-- src
    |-- App.jsx       # Page content, interactions, and consent logic
    |-- index.css     # Responsive layout and visual styling
    `-- main.jsx      # React application entry point
```

## Consent flow

1. A new visitor sees the cookie banner because no saved consent exists.
2. **Accept all** enables analytics and personalization cookies.
3. **Reject optional** keeps only essential cookies enabled.
4. **Manage preferences** opens the privacy center for a custom selection.
5. The saved choice hides the banner and can be changed later using **Privacy settings**, **Cookie preferences**, or the floating **Privacy** button.

> This project demonstrates a consent interface only. It does not load analytics or advertising services, and the policy link is a placeholder for a real cookie policy.
