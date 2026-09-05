# Task 22 - Responsive Checkout Form

A polished checkout experience built with React and Vite. The page combines customer and shipping details, multiple payment methods, an order summary, inline validation, and a confirmation state in a responsive layout.

## Features

- Contact and shipping address forms
- Credit card, PayPal, and cash-on-delivery payment options
- Payment fields that change with the selected method
- Live card-number and expiration-date formatting
- Client-side validation with clear inline error messages
- Automatic focus on the first invalid field after submission
- Sticky desktop order summary with product, tax, delivery, and total details
- Successful order confirmation screen
- Responsive layouts for desktop, tablet, and mobile screens
- Accessible labels, radio groups, focus states, and error announcements

## Validation

The checkout validates the following information before placing an order:

- Email address
- Full name
- Street address
- City and postal code
- 16-digit card number
- Name on card
- Future expiration date in `MM/YY` format
- 3-4 digit security code

Card details are only required when **Credit card** is selected.

## Tech Stack

- React 18
- Vite 5
- Plain CSS
- Inline SVG icons

No CSS framework or external component library is used.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Production Build

Create and preview a production build:

```bash
npm run build
npm run preview
```

## Project Structure

```text
task-22/
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.jsx       # Checkout UI, form state, validation, and order summary
    |-- index.css     # Responsive styling and component states
    `-- main.jsx      # React entry point
```

## Notes

This project is a front-end demonstration. Placing an order does not contact a payment processor or backend service; valid submission displays the local confirmation state.
