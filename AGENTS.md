# Base44 Dev Notes

## What this app is
LingoQuest English Pro — a static, zero-dependency web app (HTML/CSS/JS) for learning English, served by a plain Node.js HTTP server (`server.js`). There is also an Android/Kotlin Compose project under `app/` (Gradle), but the **preview runs the web app only**.

## Running it
- `docker compose -f docker-compose.base44.yml up -d` starts the web service on port 3000.
- The web service uses `node:22-slim`, bind-mounts the repo at `/app`, and runs `node server.js`. No `npm install` — `server.js` uses only Node built-ins.
- `server.js` serves files from disk with `no-cache` headers, so editing HTML/CSS/JS takes effect on the next browser refresh. There is **no live-reload dev server**, so call `reload_preview` after changes to refresh the preview iframe.

## Secrets / external services
- `.env.example` lists `API_KEY=` and `metadata.json` mentions server-side Gemini, but the **web app does not reference any API key or external API**. No credentials are required to boot or run the preview.
- The Android app under `app/` is not built or run in this environment.

## Verifying it works
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return `200`.
- The page title is "LingoQuest Pro - Aprende Inglés Jugando".
