# Login and Signup UI

A responsive authentication interface built with React, TypeScript, and Vite. It includes a validated login form, a three-step signup flow, password visibility controls, loading states, and a login-success modal.

## Features

- Email and password validation
- Show/hide password controls
- Remember-me option
- Three-step account creation flow
- Responsive, accessible form components
- Simulated loading and success states

> This project is a front-end demo. Authentication and account creation are simulated in the browser and are not connected to a backend.

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

Open the local URL shown by Vite in your browser.

### Production build

```bash
npm run build
```

The compiled application is written to `dist/`.

### Preview the production build

```bash
npm run preview
```

## Project structure

```text
src/
├── components/   Reusable form controls
├── pages/        Login and signup screens
├── utils/        Form validation helpers
├── App.tsx       Page state and navigation
├── main.tsx      Application entry point
└── styles.css    Global and component styles
```

## Tech stack

- React
- TypeScript
- Vite
- Lucide React

