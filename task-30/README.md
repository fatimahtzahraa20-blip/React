# Shopping Cart Drawer

A responsive shopping interface built with React and Vite. Products can be added to a slide-out cart where quantities, item counts, and order totals update instantly.

## Features

- Six-product responsive catalog
- Slide-out cart drawer with a dimmed page overlay
- Automatic drawer opening when an item is added
- Cart badge showing the total number of units
- Increase and decrease quantity controls
- Automatic item removal when its quantity reaches zero
- Dedicated remove action for each cart item
- Live subtotal, 8% tax, shipping, and grand total calculations
- Free shipping on orders of $100 or more; otherwise shipping is $8.99
- Empty-cart state and accessible labels for cart controls

## Tech Stack

- React 18
- Vite 5
- Plain CSS

No CSS framework or external component library is used.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create an optimized production build
npm run preview  # Preview the production build locally
```

## How It Works

Cart state stores each selected product's ID and quantity. React derives the displayed cart items and pricing summary from that state:

```text
subtotal = sum of product price x quantity
tax      = subtotal x 8%
shipping = free when subtotal is $100 or more, otherwise $8.99
total    = subtotal + tax + shipping
```

Shipping is also shown as free while the cart is empty, and the pricing summary appears only when the cart contains an item.

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.jsx      # Product data, cart state, calculations, and UI
    |-- index.css    # Layout, drawer animation, and component styles
    `-- main.jsx     # React application entry point
```

## Production Build

Run the following command to generate the deployable files in `dist/`:

```bash
npm run build
```
