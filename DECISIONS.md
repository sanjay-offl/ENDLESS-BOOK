# Decisions

- The repository already existed, so phase 0 adds the requested application structure without reinitialising or rewriting its Git history.
- The web app is a Vite + React app in `frontend/` and the Kotlin API lives in `backend/`.
- The API serves in-memory seed content when Firebase credentials are unavailable, so the book is readable and writable without a cloud project. The mode is reported by `GET /` and logged at startup.
- Local auth placeholders (`anonymous-token`, `mock-*`) are accepted only while the API has no Firebase credentials. Once a project is connected, every token is verified.
- CORS never uses `anyHost()`. Allowed origins come from `CORS_ALLOWED_ORIGINS` alongside the local dev ports, because `anyHost()` plus credentials would let any website make authenticated requests.
- Gradle is not installed in this environment. The build files are written now, and the wrapper is generated with Gradle 8.10 after installing Gradle.
- `ContentNegotiation` sets `encodeDefaults = true`. Without it kotlinx.serialization omits any field that still holds its declared default, so `isOpen: true`, `tags: []` and `imageUrl: null` never reach the client and the API's shape no longer matches the TypeScript interfaces.
- The frontend always attempts reads over the network and only falls back to the bundled seed data when the request fails. Short-circuiting reads to seed data while writes went to the API made contributions disappear on reload.
- Identity resolution lives in one `useContributor` hook that covers both a Firebase session and the offline demo contributor, and reports `loading` separately so a redirect guard never treats "still resolving" as "signed out".
- The demo session is a tiny observable store (`demoSession.ts`) read through `useSyncExternalStore`, because `localStorage` writes happen outside React and would otherwise leave redirect guards acting on a stale value.
- Write requests never fall back to seed data. A write that resolved locally would report success and then vanish.
