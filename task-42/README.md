# Task 42 — Responsive Admin Dashboard

Dashboard Admin is a responsive, dark-themed dashboard built with React and Vite. It presents key business metrics, revenue and traffic charts, recent orders, and workspace activity in a layout that adapts from desktop to mobile screens.

## Features

- Four KPI cards for revenue, active users, churn rate, and average session duration
- Responsive revenue area chart and traffic-source donut chart
- Recent-orders table with paid, pending, and failed status badges
- Workspace activity feed
- Interactive date-range selector for 24 hours, 7 days, 30 days, and 90 days
- Sidebar navigation with active-item state
- Off-canvas mobile menu with a dismissible overlay
- Responsive layouts for desktop, tablet, and mobile devices

> The dashboard uses local mock data from `src/data.js`. Date-range controls update the KPI cards and revenue chart, navigation scrolls to dashboard sections, and the order table supports client-side search.

## Responsive behavior

- **Desktop (above 1100px):** fixed sidebar, four-column KPI grid, and two-column content sections
- **Tablet (781px–1100px):** two-column KPI grid with stacked chart and detail panels
- **Mobile (up to 780px):** off-canvas sidebar, sticky top bar, and compact spacing
- **Small mobile (up to 460px):** single-column KPI grid

## Tech stack

- React 18
- Vite 5
- Recharts
- CSS3

## Getting started

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

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized production files are generated in `dist/`.

## Project structure

```text
task-42/
├── src/
│   ├── App.jsx       # Dashboard components and interactive state
│   ├── data.js       # Mock dashboard data
│   ├── index.css     # Theme, layout, and responsive styles
│   └── main.jsx      # React application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates an optimized production build |
| `npm run preview` | Serves the production build locally |
