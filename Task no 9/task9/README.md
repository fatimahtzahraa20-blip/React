# Task 9 — React Hooks Demo

A small React application that demonstrates state management, event handling, and data fetching with React Hooks.

## Features

- Counter with **Increment**, **Decrement**, and **Reset** controls
- State management using `useState`
- API data fetching using `useEffect`
- Displays five posts from the JSONPlaceholder API
- Built with React and Vite

## Technologies

- React 19
- Vite 8
- JavaScript (JSX)
- ESLint
- JSONPlaceholder API

## Prerequisites

Install [Node.js](https://nodejs.org/) before running the project. A current LTS version is recommended.

## Installation

Open a terminal in the `task9` directory and install the dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server with hot module replacement.

```bash
npm run build
```

Creates an optimized production build in the `dist` directory.

```bash
npm run preview
```

Serves the production build locally for testing.

```bash
npm run lint
```

Checks the project for code-quality issues with ESLint.

## Project Structure

```text
task9/
├── public/
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## How It Works

The counter value is stored in component state with `useState`. Button click handlers update or reset that value.

When the component first loads, `useEffect` requests five posts from:

```text
https://jsonplaceholder.typicode.com/posts?_limit=5
```

The response is stored in state and rendered as a list of post cards. An internet connection is required to load the posts.
