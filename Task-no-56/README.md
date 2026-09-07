# Image Uploader - Task 66

A React image-sharing application for the task: **Login, Upload, List, and Download**. Users can sign in, upload images, organize their library, download originals, and create revocable sharing links.

## Features

- Account registration, login, and logout with a prefilled demo account.
- Multiple-image uploads through the file picker or drag and drop.
- JPEG, PNG, WebP, and GIF uploads, limited to 100 MB per image and 20 images per request.
- Image listing with list/grid layouts, search, format filters, and sorting by date, name, or size.
- Starred images and a dedicated shared-images view.
- Original-file downloads and sharing links that can be disabled.
- Permanent deletion and storage usage summaries.
- Responsive layout for desktop and mobile.

## Tech stack

- Frontend: React, Vite, CSS, and Lucide React icons.
- Backend: Node.js, Express, Multer, and cookie-parser.
- Storage: local uploaded files and a JSON account/image database.
- Authentication: salted scrypt password hashes and HTTP-only session cookies.

## Getting started

Install Node.js 20.19+ or 22.12+ and npm, then run these commands from the project directory:

```sh
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` requests to the backend at http://localhost:3001.

### Default account

The login form is prefilled with:

| Field | Value |
| --- | --- |
| Email | `demo@droply.com` |
| Password | `Droply123!` |

The server creates this demo account automatically if it does not exist. These credentials retain their original values after the Image Uploader rename. You can also register a separate account.

## Using the app

1. Click **Upload images** or the profile button and sign in.
2. Select images or drag them into the upload area.
3. Find uploads under **All images** or filter by image format.
4. Use the download icon to save an original image.
5. Use the star icon to add an image to **Starred**.
6. Use the link icon to generate and copy a download URL. Anyone with that URL can download the image. Choose **Disable sharing link** to revoke access.
7. Use the delete icon and confirm to permanently remove an image.

## Build and run

```sh
npm run build
npm start
```

Open http://localhost:3001. Express serves the production frontend and API. The backend port can be changed using the `PORT` environment variable; the development proxy expects port 3001 by default.

## Verification

```sh
npm run build
node smoke-test.js
```

The API smoke test uses a temporary database and port 3019. It checks registration, protected routes, image upload, rejection of non-image MIME types, listing, download, starring, sharing, link revocation, logout, login, and deletion.

## Project structure

```text
src/main.jsx       React dashboard, authentication forms, and image actions
src/styles.css     Responsive application styling
server.js          Authentication, uploads, downloads, and sharing API
smoke-test.js      API integration checks using isolated temporary storage
vite.config.js    Development server and API proxy
index.html        Application entry point
 data/            Runtime database and uploads (created automatically)
```

## Storage and deployment notes

Accounts and image metadata persist in `data/db.json`; originals are stored in `data/uploads/`. The `data/` directory is excluded from Git. Sessions expire after seven days and are cleared when the server restarts.

Upload format checks use the declared MIME type; the server does not decode or inspect image content. Existing uploads remain available after the rename, with unsupported formats shown under **Other**.

This project is intended for local demonstration. Before exposing it publicly, remove the shared demo credentials, use HTTPS, and add rate limiting, image-content validation, durable storage, and backups. The JSON database is designed for a single server process.
