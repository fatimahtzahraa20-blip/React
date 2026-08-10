# Users Dashboard

A simple React dashboard that fetches user records from Supabase and displays them in a responsive table.

## Features

- Fetches users from a Supabase database
- Displays loading and error states
- Shows each user's ID, name, email, and age
- Responsive table layout
- Built with React and Vite

## Tech Stack

- React 19
- Vite 8
- Supabase JavaScript client
- CSS

## Getting Started

### Prerequisites

- Node.js installed
- A Supabase project with a `users` table

### Installation

Clone the repository, open the project directory, and install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Only use a Supabase anonymous/publishable key in client-side environment variables. Never expose a service-role key.

### Database Setup

Create a `users` table in Supabase with these columns:

| Column | Suggested type |
| --- | --- |
| `id` | `bigint` or `uuid` |
| `name` | `text` |
| `email` | `text` |
| `age` | `integer` |

Configure Row Level Security policies so anonymous users can read the table if the dashboard is intended to be public.

### Run Locally

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Project Structure

```text
src/
├── components/
│   └── UsersTable.jsx
├── App.css
├── App.jsx
├── index.css
├── main.jsx
└── supabase.js
```

## Production Build

```bash
npm run build
```

The generated production files will be placed in the `dist` directory.
