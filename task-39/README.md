# Task 39 - Reusable API Data-Fetching Hook

A React and Vite demonstration of a custom `useFetch` hook with shared caching, request deduplication, and stale-while-revalidate behavior. The project uses a simulated API, so it can be run locally without a backend or API credentials.

## Features

- Shared module-level cache for components that use the same request key
- Deduplication of simultaneous requests
- Stale-while-revalidate updates
- Configurable cache freshness with `staleTime`
- Separate initial-loading and background-validation states
- Loading skeletons and API error messages
- Manual refetching and cache clearing
- Cache inspector showing each entry's status and age
- Mock API with realistic latency and intermittent failures

## Hook API

```js
const {
  data,
  error,
  isLoading,
  isValidating,
  isStale,
  refetch,
} = useFetch(key, fetcher, options);
```

### Parameters

- `key`: A unique string used to identify the cached request. Pass `null` to skip fetching.
- `fetcher`: A function that returns a promise containing the requested data.
- `options.staleTime`: Time in milliseconds before cached data becomes stale. The default is 10 seconds.
- `options.enabled`: Controls whether the request is allowed to run. The default is `true`.

### Returned values

- `data`: The latest successfully cached response, or `null` before data is available.
- `error`: The latest request error, or `null` when no error exists.
- `isLoading`: `true` while the first request is loading and no cache entry exists.
- `isValidating`: `true` while a request or manual refetch is in progress.
- `isStale`: Indicates whether the current cache entry has exceeded `staleTime`.
- `refetch`: Starts a new request for the current key.

## Demo behavior

The application renders two users widgets with the same `/api/users` key. They share one cache entry and reuse the same in-flight request. The second widget can be mounted or unmounted to demonstrate that cached data remains available across component lifecycles.

The profile widget uses a four-second stale window to demonstrate per-request configuration. The cache inspector displays cached keys and their age, and it can clear the shared cache so the initial loading flow can be tested again.

Because the mock API intentionally fails some requests, error states may appear during normal use. Use **Refetch** to retry them.

## Project structure

```text
src/
|-- App.jsx       # Demo widgets and cache inspector
|-- main.jsx      # React entry point
|-- mockApi.js    # Simulated API data, latency, and failures
|-- useFetch.js   # Reusable hook and cache utilities
`-- index.css     # Application styles
```

## Getting started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Production build

```bash
npm run build
npm run preview
```

The optimized output is generated in the `dist` directory.
