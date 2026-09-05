# Responsive Pricing Section

A responsive pricing page built with React and Vite. It presents three subscription tiers, supports monthly and yearly billing, and includes a demo checkout experience.

## Features

- Monthly and yearly pricing toggle with a yearly savings badge
- Starter, Pro, and Enterprise pricing plans
- Highlighted "Most popular" plan
- Responsive card grid for desktop, tablet, and mobile screens
- Selected-plan feedback and visual states
- Checkout modal with customer and card-detail validation
- Simulated payment confirmation (no real payment is processed)
- Keyboard focus styles, dialog semantics, live status updates, and reduced-motion support

## Tech Stack

- React 18
- Vite 5
- Plain CSS

No CSS framework or external UI library is used.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create an optimized production build
npm run preview  # Preview the production build locally
```

## Project Structure

```text
task-16/
|-- src/
|   |-- App.jsx      # Pricing data, components, and interaction state
|   |-- index.css    # Layout, theme, responsive styles, and modal styles
|   `-- main.jsx     # React application entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## How It Works

1. Choose monthly or yearly billing.
2. Select one of the pricing plans.
3. Complete the demo checkout form.
4. Submit the form to see the simulated payment-success state.

> This project is a front-end demonstration. It does not connect to a payment provider or process real payments.

## Production Build

```bash
npm run build
npm run preview
```

The optimized output is generated in the `dist` directory.
