# Searcher

Searcher is a React task explorer built for Task 67: optimizing a list of 1,000+ items with `useMemo` and `useCallback`. It includes 1,500 demo tasks and can load tasks from Supabase.

The interface uses a muted blue palette, category badges, and a compact list focused on finding tasks.

## Features

- Search tasks by name, with case-insensitive matching.
- Filter by Engineering, Design, Product, or Marketing.
- Sort by task number or name.
- Select tasks across pages and clear the selection.
- Browse 50 tasks per page.
- View total, completed, and selected task counts.
- Handle loading, connection errors, and empty search results.
- Use a responsive layout with horizontal scrolling for the task list on smaller screens.

Selection is stored in React state. It is not saved to Supabase and resets when the page reloads.

## Technology

- React 19
- Vite 7
- Supabase JavaScript client
- Plain CSS

## Run locally

Install Node.js and npm with a version compatible with Vite 7, then run these commands from the project folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Without Supabase configuration, Searcher uses its built-in dataset of 1,500 tasks. If Supabase is configured, the app loads database records instead; connection failures display an error rather than falling back to demo data.

## Connect Supabase

1. Open your Supabase project's SQL Editor.
2. Run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates `public.task_67_items`, enables row-level security, adds a public read policy, and seeds 1,500 tasks. Existing rows with matching IDs are preserved.
3. Create or update `.env` in the project root with your project settings:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Restart the development server after changing environment variables.

Use a publishable key, never a service-role or secret key: Vite exposes `VITE_` variables to the browser. The supplied policy makes this demo table publicly readable and does not grant browser write access.

The app reads `id`, `name`, `category`, and `status` from `task_67_items`. The loader requests 500 rows at a time, ordered by ID, and combines them before displaying the list. Search, sorting, and pagination then run locally on the loaded dataset.

## React performance optimizations

| Technique | Use in Searcher |
| --- | --- |
| `useMemo` | Caches filtered and sorted results, completed counts, and the visible page until their dependencies change. |
| `useCallback` | Keeps the selection handler stable through a functional state update. |
| `React.memo` | Allows unchanged task rows to skip rendering when selection changes. |
| Pagination | Limits mounted task rows to 50 while searching the full loaded dataset. |

The selection handler creates a new `Set` instead of mutating existing state. Each row receives an unchanged item reference, a boolean selection value, and the stable callback. This lets `React.memo` skip rows whose props have not changed.

These optimizations reduce repeated calculations and row rendering. All fetched tasks still remain in browser memory; the app does not implement server-side search or pagination.

### Check rendering behavior

Use React DevTools Profiler to record selecting a task. The parent and changed row should render, while unchanged memoized rows can skip rendering. Changing the search or category should recompute the filtered list; changing selection should not.

Development StrictMode can invoke renders more than once. No benchmark or measured speedup is claimed.

## Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`. Preview serves that build locally. Supabase environment values are included at build time, so rebuild after changing them for a production deployment.

## Project structure

```text
src/
  main.jsx             React components, list logic, and Supabase loader
  style.css            Responsive Searcher styles
supabase/
  schema.sql           Table, read policy, and seed data
index.html             HTML entry point and page title
package.json           Dependencies and npm scripts
README.md              Setup and implementation notes
```
