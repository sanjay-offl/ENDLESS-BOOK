# Phase 1 decisions

- Created a Kotlin multi-module skeleton under `kotlin/` to keep the roadmap aligned with the project architecture and to make the first build reproducible.
- Chose Ktor + Koin for the server foundation because they match the brief's requirement for typed config, health routes, and a small, testable backend footprint.
- Kept the health endpoints deliberately minimal for Phase 1 so the project can compile cleanly before moving into Firestore and AI layers.
