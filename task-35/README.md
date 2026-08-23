# Pak Chat

Pak Chat is a WhatsApp-inspired Pakistani group chat built with React, Vite, and the Gemini API. It creates contextual Roman Urdu and English conversations with different AI participants in each room.

## Features

- Three topic-specific rooms: General, Engineering, and Random
- Different members and personalities in every room
- Context-aware Gemini replies based on recent conversation history
- Natural Roman Urdu and English conversation style
- Typing indicators and optimistic message delivery
- Separate handling for message delivery and AI reply failures
- Structured Gemini JSON responses for reliable speaker selection
- Pakistan-green interface with responsive chat bubbles
- Server-side API key handling

## Room personalities

| Room | Participants | Conversation style |
| --- | --- | --- |
| General | Ayesha Khan, Hamza Ali | Pakistani community and everyday conversation |
| Engineering | Saad Dev, Maham Raza | Development, pull requests, APIs, bugs, and team coordination |
| Random | Bilal Ahmed, Zoya Khan | Cricket, food, weekends, memes, and casual chat |

## Tech stack

- React 18
- Vite 5
- Gemini GenerateContent REST API
- CSS
- Vite development-server middleware

No Gemini client SDK is required. The server middleware calls Gemini with the native `fetch` API.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Gemini API key

Create or copy a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Never place the key in React source code or commit it to Git.

### 3. Configure the environment

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the placeholder:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
```

The model can be changed through `GEMINI_MODEL` without editing the source.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Restart the development server whenever environment variables change.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite app and local `/api/chat` middleware |
| `npm run build` | Creates an optimized frontend build in `dist` |
| `npm run preview` | Previews the static frontend build |

## How it works

1. A message appears immediately in the interface.
2. The room transport stores recent messages as conversation context.
3. The browser sends the room ID and history to `POST /api/chat`.
4. Vite's server middleware adds the room topic and participant personalities.
5. The server calls Gemini using the secret environment variable.
6. Gemini returns structured JSON containing a participant name and message.
7. The selected participant appears to type and then posts the reply.

The user's message is marked as sent independently from AI generation. If Gemini is unavailable, the original message remains sent and the chat displays a separate service notice.

## Project structure

```text
.
|-- src/
|   |-- App.jsx          # Chat UI, rooms, state, and optimistic messages
|   |-- index.css        # Layout and Pakistan-themed styling
|   |-- main.jsx         # React entry point
|   `-- mockSocket.js    # Chat transport and Gemini request coordination
|-- vite.config.js       # Vite setup and server-side /api/chat endpoint
|-- .env.example         # Safe environment-variable template
|-- index.html
`-- package.json
```

## API and security

The Gemini key is read by the server middleware from `.env.local`. It is never returned to the browser. The project already excludes `.env.local` from Git.

The endpoint sends only the latest 20 messages to limit context size. Gemini replies use a JSON schema with two required fields:

```json
{
  "speaker": "Hamza Ali",
  "text": "Walaikum Assalam, aap sunao?"
}
```

## Troubleshooting

### `GEMINI_API_KEY is not configured`

Confirm that `.env.local` exists, contains `GEMINI_API_KEY`, and that the development server was restarted.

### Gemini returns a quota or rate-limit error

Check the selected project, API limits, and billing status in Google AI Studio.

### AI reply is unavailable

Review the terminal running `npm run dev` for the Gemini error. Your outgoing message will remain marked as sent.

### The frontend builds but AI replies do not work in preview

The `/api/chat` route currently runs through Vite's development middleware. `npm run preview` serves the static frontend and is not a production API server.

## Deployment

Deploy the frontend from `dist`, and move the `/api/chat` handler from `vite.config.js` into a server or serverless function. Configure `GEMINI_API_KEY` and `GEMINI_MODEL` through the hosting provider's secret environment settings.

Do not expose the Gemini key through a `VITE_`-prefixed variable, because those variables are included in browser bundles.
