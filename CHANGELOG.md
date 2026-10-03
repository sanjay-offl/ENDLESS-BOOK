# Changelog

## Unreleased

- Bootstrapped the Next.js web app, Kotlin/Ktor API skeleton, Firebase environment template, editor configuration, and project documentation.
- Verified the Next.js build and lint checks, generated the Gradle 8.10 wrapper, and completed the Kotlin API build.
- Replaced the generated starter screen with the first Endless Book editorial homepage and responsive mobile layout.
- Added root hydration warnings suppression for browser extensions that inject attributes before React hydrates.
- Added the navigable chapter directory, chapter detail and memory page routes, submit/login/profile/about screens, shared shell, and typed seed content.
- Replaced the Next.js prototype with the specified React 18 + Vite frontend in `frontend/` and Kotlin + Ktor API in `backend/`; removed the superseded `apps/` tree.
- Removed stale build output (`.idea/`, `backend/build/`, `backend/bin/`) and rewrote `.vscode/launch.json`, `DECISIONS.md`, `.gitignore`, and `SETUP.md` so no reference points at the deleted `apps/` code.
