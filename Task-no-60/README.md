# Task 70: Production Deployment

Task 70 is a full-stack task-management application built with:

- React and Vite for the frontend
- Express for the backend API
- Supabase Authentication and PostgreSQL for users and tasks
- Vercel for the React production deployment
- Render for the Express production deployment

## Project structure

```text
src/                 React application
server/index.js      Express API
supabase/schema.sql  Database table and RLS policies
vercel.json          Vercel configuration
render.yaml          Render service configuration
```

## Run locally

### 1. Configure Supabase

Create a Supabase project, then run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. The script creates the `tasks` table and enables row-level security so users can only access their own tasks.

### 2. Configure environment variables

Copy `.env.example` to `.env` and provide the Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CLIENT_URL=http://localhost:5173
PORT=3000
```

### 3. Install and start

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3000`.

## Deploy the Express API to Render

1. Push this project to GitHub.
2. In Render, create a **New Web Service** and select the repository.
3. Use these settings:

	```text
	Runtime: Node
	Build command: npm ci
	Start command: npm start
	Health check path: /api/health
	```

4. Add these Render environment variables:

	```text
	SUPABASE_URL       Your Supabase project URL
	SUPABASE_ANON_KEY  Your Supabase anon key
	CLIENT_URL         Your Vercel frontend URL
	NODE_VERSION       20
	```

The included [`render.yaml`](render.yaml) can also be used to configure the service. After deployment, verify that `https://your-render-service.onrender.com/api/health` returns a JSON response with `"status":"ok"`.

## Deploy the React frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Keep the project root as the repository root.
3. Use these settings:

	```text
	Framework preset: Vite
	Build command: npm run build
	Output directory: dist
	```

4. Add these Vercel environment variables:

	```text
	VITE_SUPABASE_URL      Your Supabase project URL
	VITE_SUPABASE_ANON_KEY Your Supabase anon key
	VITE_API_URL           Your deployed Render API URL
	```

5. Redeploy after adding the variables.

The included [`vercel.json`](vercel.json) enables the Vite build and routes browser refreshes to `index.html`.

## Supabase authentication settings

In Supabase **Authentication > URL Configuration**:

- Set **Site URL** to the Vercel production URL.
- Add the Vercel production URL to **Redirect URLs**.
- Add the local URL `http://localhost:5173` while developing locally.

## Production verification

After both services are deployed:

1. Open the Vercel URL.
2. Create a user account and confirm the email if email confirmation is enabled.
3. Create, edit, complete, filter, and delete a task.
4. Confirm the task appears in the Supabase `tasks` table.
5. Open the Render `/api/health` endpoint and confirm it reports `status: ok`.

## Available commands

```bash
npm run dev      # Start Vite and Express together
npm run build    # Build the React frontend for production
npm start        # Start the Express API
npm run preview  # Preview the production frontend build locally
```
