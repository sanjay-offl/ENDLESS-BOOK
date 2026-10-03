# Decisions

- The repository already existed, so phase 0 adds the requested application structure without reinitialising or rewriting its Git history.
- The web app is a Vite + React app in `frontend/` and the Kotlin API lives in `backend/`.
- The API serves in-memory seed content when Firebase credentials are unavailable, so the book is readable and writable without a cloud project. The mode is reported by `GET /` and logged at startup.
- Local auth placeholders (`anonymous-token`, `mock-*`) are accepted only while the API has no Firebase credentials. Once a project is connected, every token is verified.
- CORS never uses `anyHost()`. Allowed origins come from `CORS_ALLOWED_ORIGINS` alongside the local dev ports, because `anyHost()` plus credentials would let any website make authenticated requests.
- Gradle is not installed in this environment. The build files are written now, and the wrapper is generated with Gradle 8.10 after installing Gradle.
