# Notification Center

A responsive notification management interface built with React and Vite. Notifications are grouped by date, can be filtered or searched, and support common actions such as marking as read, replying, editing, and deleting.

## Features

- View notifications grouped under **Today**, **Yesterday**, and **Earlier**
- Switch between all notifications and unread notifications
- Search notification titles and descriptions
- Mark individual notifications as read or unread
- Mark all notifications as read at once
- Create, edit, and delete notifications
- Reply to notifications and view their reply counts
- Receive toast feedback after completed actions
- See dedicated empty states for filters and searches with no results
- Use the interface on desktop and mobile layouts

## Tech Stack

- React 18
- Vite 5
- Plain CSS
- Inline SVG icons

No component library or CSS framework is used.

## Getting Started

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

Open the local address shown by Vite, usually `http://localhost:5173`.

## Production Build

Create an optimized build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
src/
  App.jsx      Notification data, components, and interaction logic
  index.css    Layout, styling, animations, and responsive rules
  main.jsx     React application entry point
index.html     Vite HTML entry point
```

## Usage

Select a notification row to mark an unread item as read. Use the status dot to toggle read state directly, the reply icon to send a quick reply, or the three-dot menu for reply, edit, read/unread, and delete actions. The **Create** button opens a form for adding a new notification.

## Data Persistence

This project is a front-end demonstration. Notification data is stored in React state and resets to the seeded sample data whenever the page is refreshed. It does not require a backend or database.
