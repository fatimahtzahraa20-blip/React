# Fatima Flow

A professional Kanban board for Fatima's launch team. Tasks move through Backlog, In progress, Ready for review, and Done with native drag-and-drop and persist to an Express API.

## Features

- Drag tasks between columns and save the new status through the API
- Create, edit, and delete tasks in a detail modal
- Search by task title, description, or tag
- Filter by high, medium, and low priority
- Task metadata for assignee, due date, description, and tags
- Seeded local JSON data so the app is useful immediately
- Responsive board layout for desktop and smaller screens
- Fatima Flow workspace identity with a launch-focused visual system

## Stack

- React 19 + Vite
- Express + CORS
- Native HTML drag-and-drop
- Lucide React icons
- JSON file persistence in `data/tasks.json`

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

The React client runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

To run them separately:

```bash
npm run server
npm run dev
```

## API

- `GET /api/tasks` returns all tasks
- `POST /api/tasks` creates a task
- `PATCH /api/tasks/:id` updates task fields, including `status`
- `DELETE /api/tasks/:id` removes a task
- `GET /api/health` returns the API health status

## Verification

```bash
npm run build
npm run lint
node --check server/index.js
```
