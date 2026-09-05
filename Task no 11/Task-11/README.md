# Task 11: Zustand Shopping Cart

A simple React shopping cart application created for **Task 11**. The project demonstrates global state management with Zustand by allowing users to add products to a cart, remove products, and view a dynamically calculated order summary.

## Task Objective

Build a React application that uses Zustand to manage shopping-cart state outside individual components.

The application should:

- Display a list of available products
- Add selected products to a shared cart
- Remove products from the cart
- Display an empty-cart message when no products are selected
- Calculate the total number of cart items
- Calculate the total price automatically
- Share cart state between separate React components

## Requirements and Implementation

| Requirement | Implementation |
| --- | --- |
| Create a global store | `src/store/cartStore.js` creates the store with Zustand |
| Store cart products | The `cart` array contains the selected products |
| Add products | `addItem` appends a product to the cart |
| Remove products | `removeItem` filters products by ID |
| Display products | `ProductList.jsx` renders the available product data |
| Display cart details | `Cart.jsx` reads and renders the shared cart state |
| Calculate totals | `reduce()` calculates the total price from cart items |
| Handle an empty cart | `Cart.jsx` conditionally displays an empty-cart message |

## Features

- Lightweight global state management with Zustand
- Product catalog containing a laptop, phone, and headphones
- Add-to-cart buttons for every product
- Remove buttons for cart items
- Live cart item count
- Automatic total-price calculation
- Free-shipping indicator
- Empty-cart feedback
- Responsive card-based interface
- Vite development and production tooling

## How State Management Works

The Zustand store exposes three values:

```js
{
  cart: [],
  addItem: (item) => {},
  removeItem: (id) => {}
}
```

`ProductList` subscribes to `addItem`, while `Cart` subscribes to the cart data and `removeItem`. Zustand updates every subscribed component whenever the relevant state changes, so no prop drilling is required.

> **Current behavior:** A product can be added more than once. Selecting **Remove** removes every cart entry with the same product ID.

## Technology Stack

- React 19
- Zustand 5
- Vite 8
- JavaScript (ES modules and JSX)
- CSS
- ESLint

## Getting Started

### Prerequisites

Install Node.js and npm. Vite 8 requires Node.js `20.19+` or `22.12+`.

### Installation

1. Open a terminal in the `Task-11` directory.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local address shown by Vite, usually `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot module replacement |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project Structure

```text
Task-11/
|-- public/                    # Static public files
|-- src/
|   |-- assets/                # Project images and assets
|   |-- components/
|   |   |-- Cart.jsx           # Cart items, empty state, and summary
|   |   |-- ProductCrad.jsx    # Additional product-card markup
|   |   `-- ProductList.jsx    # Product data and add-to-cart actions
|   |-- store/
|   |   `-- cartStore.js       # Zustand cart store and actions
|   |-- App.css                # Application component styles
|   |-- App.jsx                # Main application layout
|   |-- index.css              # Global styles
|   `-- main.jsx               # React application entry point
|-- index.html
|-- package.json
`-- vite.config.js
```

## Using the Application

1. Select **Add to Cart** below a product.
2. View the selected product in the Shopping Cart section.
3. Add more products and watch the item count and total update.
4. Select **Remove** to delete that product from the cart.
5. When all products are removed, the empty-cart message appears again.

The **Proceed to Checkout** button is currently presentational and is not connected to payment or checkout functionality.

## Production Build

Create and preview a production build with:

```bash
npm run build
npm run preview
```

## Possible Improvements

- Track product quantities instead of storing duplicate entries
- Remove only one unit or provide quantity controls
- Persist cart state in local storage
- Format prices with `Intl.NumberFormat`
- Connect the checkout button to a checkout flow
- Move product data to an API or dedicated data file
- Add unit and component tests
- Rename `ProductCrad.jsx` to `ProductCard.jsx` and integrate it into the product list
