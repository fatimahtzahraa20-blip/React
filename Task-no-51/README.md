# Task 61: Storage & Uploads

## Profile Picture Upload API with React, Express, and Supabase Storage

### Objective

Build a profile picture upload application with a React interface and an Express API that stores authenticated users' pictures in Supabase Storage.

### Features

- Supabase email/password sign-in and account creation.
- Image selection through a file picker or drag and drop.
- Square image preview before saving.
- JPEG, PNG, and WebP uploads up to 5 MiB.
- Server-side image validation, metadata removal, and conversion to 512 × 512 WebP.
- Private storage with a separate avatar path for each authenticated user.
- Save, replace, and remove a profile picture.
- Upload progress, cancellation, validation feedback, and retryable error messages.
- Temporary viewing URLs that refresh while the page is open.
- A responsive interface for desktop and mobile.

### Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, CSS |
| API | Node.js, Express |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Multipart processing | Multer |
| Image processing | Sharp |
| Request protection | Helmet, express-rate-limit |
| Testing | Node test runner, Supertest, Playwright |

### Project Structure

```text
web/
  main.jsx                 React profile editor and authentication
  style.css                Responsive application styles
src/
  app.js                   Upload, retrieval, and deletion API
  server.js                Express startup and Supabase client
supabase/
  storage.sql              Private avatars bucket setup
test/                      API tests
browser-tests/             Browser interaction tests
dev.js                     Combined development launcher
vite.config.js             Frontend configuration and API proxy
.env.example               Environment variable template
```

### Setup

1. Install Node.js 22.12 or newer.
2. Run `npm install` in the Task-no-61 folder.
3. Copy `.env.example` to `.env` and replace the placeholders:

```env
PORT=3000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=avatars
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

The service-role key belongs only on the Express server. Never place it in a VITE_ variable or commit .env. Both URLs must point to the same Supabase project.

4. Run `supabase/storage.sql` in the Supabase SQL Editor. If the avatars bucket already exists, verify that it is private and accepts WebP images.
5. Start the application:

```sh
npm run dev
```

Open the Vite URL printed in the terminal. This command starts React and starts Express when server credentials are configured. The API defaults to port 3000; the Vite proxy reads PORT automatically. Restart after changing .env.

### Using the Application

1. Create an account or sign in with an existing Supabase user. Confirm your email first if required by your project.
2. Select or drop one supported image.
3. Review the square preview and click **Save picture**.
4. Use **Cancel** to discard a pending selection or cancel an active upload.
5. Select another image to replace the saved picture, or use **Remove picture** and confirm removal.

The selected image is retained during sign-in. Cancelling a request that already reached the server does not guarantee rollback; reload to check the saved picture.

### Upload Flow

React submits the original image as multipart/form-data with a Supabase Bearer access token. Express verifies the token, validates the image, and converts it into a square WebP. The API uploads it to the private avatars bucket at:

```text
<authenticated-user-id>/avatar.webp
```

A successful request returns a signed viewing URL valid for one hour. Each upload replaces the user's previous avatar. Concurrent uploads use last-write-wins behavior. If URL signing fails after storage succeeds, the image remains saved; reload to retry retrieval.

### API Endpoints

All profile-picture endpoints require `Authorization: Bearer USER_ACCESS_TOKEN`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /api/profile-picture | Upload or replace a picture using the avatar file field |
| GET | /api/profile-picture | Retrieve a fresh signed URL; returns data: null when no picture exists |
| DELETE | /api/profile-picture | Remove the authenticated user's picture |
| GET | /health | Check whether Express is running; no authentication required |

Example upload on Windows PowerShell:

```powershell
curl.exe -X POST http://localhost:3000/api/profile-picture -H "Authorization: Bearer YOUR_USER_ACCESS_TOKEN" -F "avatar=@photo.jpg"
```

Let curl set the multipart Content-Type boundary. A successful upload returns HTTP 200:

```json
{
  "data": {
    "path": "USER_UUID/avatar.webp",
    "url": "https://YOUR_PROJECT.supabase.co/storage/v1/object/sign/...",
    "expiresIn": 3600
  }
}
```

### Validation and Error Handling

The server accepts one JPEG, PNG, or WebP file, limited to 5 MiB and 25 million decoded pixels. It rejects corrupt files, animated images, extra fields, and unsupported formats. Object paths come from verified user IDs, not client-supplied names.

| Status | Meaning |
| --- | --- |
| 400 | Missing file or invalid multipart fields |
| 401 | Missing, invalid, or expired access token |
| 413 | Image exceeds the size limit |
| 415 | Unsupported or invalid image |
| 429 | Request rate limit exceeded |
| 500 | Unexpected server error |
| 502 | Supabase Storage operation failed |
| 503 | Development proxy cannot reach Express |

Errors use `{ "error": "message" }`. Avatar endpoints allow 30 requests per minute per IP with an in-process limiter. For multiple server instances, use a shared limiter and configure trust proxy for the actual deployment. Anyone holding a signed viewing URL can access the image until it expires.

### Browser-Only Mode

Without frontend Supabase configuration, the editor explicitly runs in browser-only mode. It saves the normalized image in localStorage on the current browser and origin. The image survives refreshes but is removed when site data is cleared. It is not uploaded to Supabase.

After configuring Supabase, sign in and select the picture again to upload it. Local pictures are not migrated automatically. Browser-only mode converts the selected image frame to a static picture; cloud uploads apply the stricter server validation described above.

### Available Commands

| Command | Purpose |
| --- | --- |
| npm run dev | Launch React and the configured Express API |
| npm run dev:web | Launch only React |
| npm run dev:api | Launch only Express |
| npm start | Run Express without watch mode |
| npm test | Run API tests |
| npm run test:browser | Run browser interaction tests |
| npm run build | Build the React frontend into dist/ |
| npm run preview | Preview the frontend build locally |

Browser tests default to installed Google Chrome. To use Playwright Chromium, install it with `npx playwright install chromium` and set PLAYWRIGHT_CHANNEL to chromium. The browser tests exercise browser-only mode and should run without frontend Supabase credentials.

### Troubleshooting

- **Picture saved in this browser:** Configure all Supabase values in .env, restart, and sign in to enable cloud uploads.
- **Upload API unavailable:** Run `npm run dev:api` in another terminal, or stop the existing frontend and restart with `npm run dev`. Check the API at http://localhost:3000/health when using the default port.
- **Storage operation failed:** Verify the project credentials and private avatars bucket setup.
- **Sign-in requires confirmation:** Confirm the account email, then sign in again.

### Testing and Deployment

API tests cover authentication, image normalization, invalid uploads, safe storage errors, URL retrieval, deletion, and missing-picture responses. Browser tests cover local persistence, cancellation, removal, corrupt-file feedback, and mobile layout. API tests mock Supabase; live cloud verification requires a configured project and authenticated user.

For production, serve dist/ and route /api to Express under the same origin. Vite environment values are embedded at build time; keep server secrets exclusively in the Express environment.

