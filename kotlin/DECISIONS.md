# Phase 1 decisions

- Created a Kotlin multi-module skeleton under `kotlin/` to keep the roadmap aligned with the project architecture and to make the first build reproducible.
- Chose Ktor + Koin for the server foundation because they match the brief's requirement for typed config, health routes, and a small, testable backend footprint.
- Kept the health endpoints deliberately minimal for Phase 1 so the project can compile cleanly before moving into Firestore and AI layers.
- The project uses Kotlin 2.2.21, Compose Multiplatform 1.9.3, Ktor 3.3.1, kotlinx.serialization 1.9.0, kotlinx.coroutines 1.10.2, Koin 4.0.0, and Logback 1.5.18. Compose Multiplatform 1.9.3 is used because it is the latest stable version available in the configured local dependency cache; JetBrains' compatibility guide currently documents 1.12.1, which requires dependency refresh before adoption here.
- The web client uses the Wasm browser target. Android is conditional on `-PenableAndroid` so web builds remain usable when the Android SDK is unavailable.
- The client uses a shared Ktor HTTP client and the shared `HealthResponse` DTO. Network failures are represented as `API offline` rather than crashing the UI.
- The client status endpoint defaults to `http://localhost:8080`; the web development server is documented on `http://localhost:8081` to avoid a port collision.
- Legacy Next.js, FastAPI, scripts, and deployment files were moved to `legacy/` with `git mv`; the six pose SVGs, manifest, and hero image were copied into Compose resources.
