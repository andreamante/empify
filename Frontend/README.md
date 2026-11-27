# Empify frontend

Angular standalone application for a personal music library. The current build
uses local mock data and runs without the Quarkus backend.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`. The app starts in demo mode with a sample
collection. Use **Esci** in the sidebar to reach the login/register screen; the
login form is prefilled for the mock account.

## Mock data and API

`AuthService`, `TrackService`, and `PlaylistService` expose `useMock = true`.
Set these flags to `false` when the backend is ready. API requests use
`http://localhost:8080/api`; the auth interceptor adds the Bearer token to
requests to that API. Track stream and cover URLs are derived from the
`/tracks/:id/stream` and `/tracks/:id/cover` endpoints when the API response
does not provide them.

The TypeScript models are in `src/app/core/models.ts`. Mock users, tracks, and
playlists are in `src/app/core/mock-data.ts`. Original local audio samples are
in `public/mock-audio/`; they are WAV files so the player can be tested without
the backend. The browser audio element also accepts uploaded MP3 files.

Display headings use the locally served Amatic SC font. Its SIL Open Font
License is included in `public/fonts/OFL.txt`.

## Verify

```bash
npm test -- --watch=false
npm run build
```
