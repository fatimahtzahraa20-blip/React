# Task 10: React Router and Protected Routes

This project was created for **Task 10** to demonstrate routing and route protection in a React single-page application. It uses React Router to navigate between Home, About, and Dashboard pages without reloading the browser.

## Task Objective

Build a React application that:

- Uses `react-router-dom` for client-side navigation
- Provides separate Home, About, and Dashboard pages
- Displays a common navigation bar
- Protects the Dashboard from unauthenticated access
- Redirects unauthenticated users to the Home page

## Task Requirements and Implementation

| Requirement | Implementation |
| --- | --- |
| Configure routing | `BrowserRouter` is configured in `src/main.jsx` |
| Define application routes | `Routes` and `Route` are defined in `src/App.jsx` |
| Create multiple pages | Page components are stored in `src/pages/` |
| Add navigation | `Navbar.jsx` uses React Router's `Link` component |
| Protect a private page | `ProtectedRoute.jsx` checks the `isLoggedIn` prop |
| Redirect unauthorized users | `Navigate` redirects users from Dashboard to `/` |

## Features

- Client-side routing without full-page reloads
- Shared navigation bar across all pages
- Public Home and About routes
- Protected Dashboard route
- Automatic redirect to Home for unauthenticated users
- Simple card-based interface styled with CSS
- Fast local development and production builds with Vite

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/about` | About | Public |
| `/dashboard` | Dashboard | Protected |

The Dashboard is wrapped in `ProtectedRoute`. When `isLoggedIn` is `false`, React Router redirects the visitor to `/`.

> **Note:** Authentication is simulated for demonstration purposes. The `isLoggedIn` value is currently set to `true` in `src/App.jsx`; there is no login form, session, or backend authentication yet.

## Built With

- React 19
- React Router DOM 7
- Vite 8
- CSS
- ESLint

## Getting Started

### Prerequisites

Install a current version of [Node.js](https://nodejs.org/) and npm. Vite 8 requires Node.js `20.19+` or `22.12+`.

### Installation

1. Clone or download the project.
2. Open a terminal in the project directory.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check the project with ESLint |

## Project Structure

```text
Task-10/
|-- public/                 # Public static assets
|-- src/
|   |-- assets/             # Images and other imported assets
|   |-- components/
|   |   |-- Navbar.jsx      # Shared navigation links
|   |   `-- ProtectedRoute.jsx
|   |-- pages/
|   |   |-- About.jsx
|   |   |-- Dashboard.jsx
|   |   `-- Home.jsx
|   |-- App.css             # Application layout and component styles
|   |-- App.jsx             # Routes and simulated authentication state
|   |-- index.css           # Global styles
|   `-- main.jsx            # React entry point and BrowserRouter setup
|-- index.html
|-- package.json
`-- vite.config.js
```

## Testing the Protected Route

To see the redirect behavior, change the simulated authentication value in `src/App.jsx`:

```jsx
const isLoggedIn = false;
```

Then visit `/dashboard`. You will be redirected to the Home page. Set the value back to `true` to allow Dashboard access.

## Production Build

Create and test an optimized build with:

```bash
npm run build
npm run preview
```

The generated production files are written to the `dist/` directory.

## Possible Improvements

- Add a real login and logout flow
- Store authentication state with Context or a state manager
- Preserve sessions with secure server-side authentication
- Add a dedicated unauthorized or login page
- Highlight the active navigation link with `NavLink`
- Add a catch-all 404 page and automated route tests

