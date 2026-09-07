# Task 71: Testing with Vitest

A small, interactive React and Express project demonstrating unit tests with Vitest.

## What is included

- `TaskStatus`, a React component with incomplete and complete states.
- `GET /api/health`, an Express route that returns the API status.
- React Testing Library tests for rendering, accessibility state, and click callbacks.
- A Supertest test for the Express response status and JSON body.
- An interactive browser check that toggles the React state and calls the live API route.

## Setup

```bash
npm install
```

## Run the tests

Run the test suite once:

```bash
npm test
```

Run Vitest in watch mode while developing:

```bash
npm run test:watch
```

## Run the application

Start both the React development server and Express API together:

```bash
npm run dev:all
```

Alternatively, run them separately in two terminals:

```bash
npm run server
```

The Vite app proxies `/api` requests to the Express server, so the browser can use the same origin. The health endpoint is available at `http://localhost:3000/api/health`.

Open the Vite URL shown in the terminal and use the two cards to exercise the same behaviors covered by the tests. The API card reports a failure when the Express server is not running.

## Build

```bash
npm run build
```
