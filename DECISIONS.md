# Decisions

- The repository already existed, so phase 0 adds the requested application structure without reinitialising or rewriting its Git history.
- The Kotlin API is kept under `apps/api` for compatibility with the supplied product specification; the later Kotlin rebuild can be moved under `kotlin/` as a separate migration phase.
- Gradle is not installed in this environment. The build files are written now, and the wrapper is generated with Gradle 8.10 after installing Gradle.
