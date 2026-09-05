# Task 20 — User Profile Editor

A responsive account-settings interface built with React 18 and Vite. The project demonstrates optimistic UI updates: submitted changes appear immediately, while a simulated API request runs in the background. If the request fails, the editor restores the last successfully saved profile.

## Features

- Edit profile details, including name, username, email, location, website, bio, and profile photo
- Configure notification, privacy, security, and appearance preferences
- Switch between light, dark, and system themes
- Validate profile fields before saving
- Preview unsaved changes and discard them at any time
- Persist successful saves in `localStorage`
- Show saving, success, and error feedback
- Roll back optimistic updates after a simulated API failure
- Adapt the navigation and settings layout for mobile screens

## Test the rollback behavior

1. Change the username to `taken`.
2. Select **Save changes**.
3. The UI updates optimistically while the simulated request is pending.
4. After the request fails, the previously saved profile is restored and an error message is displayed.

Any valid username other than `taken` completes the simulated save successfully.

## Validation

- Full name is required.
- Username must contain 3–20 lowercase letters, numbers, or underscores.
- Email must use a valid email format.
- Bio is limited to 160 characters.
- Website URLs must begin with `http://` or `https://`.
- Uploaded profile photos must be JPG, GIF, or PNG files no larger than 2 MB.

## Tech stack

- React 18
- Vite 5
- Plain CSS
- Browser `localStorage`

No CSS framework or external component library is used.

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite. By default, the app runs at `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── App.jsx      # Settings UI, validation, persistence, and save logic
├── index.css    # Responsive layout, components, and themes
└── main.jsx     # React application entry point
```
