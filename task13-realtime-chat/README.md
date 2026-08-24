# Realtime Chat

A lightweight shared chat room built with React, Vite, and Supabase Realtime. Messages are stored in Supabase and appear for every connected client as soon as they are sent.

## Features

- Loads the existing room history on startup
- Receives new messages live through Supabase Realtime
- Lets each visitor choose a display name, saved locally in the browser
- Supports anonymous senders when no name is provided
- Shows connection, loading, empty-room, and send-error states
- Scrolls to the newest message automatically

## Tech stack

- React 19
- Vite
- Supabase JavaScript client
- Supabase Postgres and Realtime

## Prerequisites

- Node.js 20.19+ or 22.12+
- A Supabase project

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. In your Supabase project, open the SQL Editor and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `messages` table, adds the required Row Level Security policies, and enables realtime changes for the table.

3. Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   You can find these values in your Supabase project's API settings. Do not commit private credentials.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown by Vite. To confirm realtime behavior, open the app in two browser windows and send a message from either one.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Project structure

```text
src/
  App.jsx                 App entry component
  componenets/ChatBox.jsx Chat UI, message loading, sending, and subscriptions
  lib/supabase.js         Supabase client and configuration check
supabase/schema.sql       Database table, policies, and Realtime setup
```

## Troubleshooting

- **"Setup required"**: confirm both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present in `.env`, then restart `npm run dev`.
- **Messages do not update live**: ensure `supabase/schema.sql` ran successfully and that the `messages` table is part of the `supabase_realtime` publication.
- **Messages cannot be sent or loaded**: check the table policies and the browser console for the Supabase error message.

## Security note

The included SQL intentionally permits anonymous clients to read and insert chat messages so the room works without authentication. For a production app, add authentication and replace these permissive policies with rules appropriate to your users.
