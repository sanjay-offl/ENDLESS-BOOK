# Rules for The Endless Book Kotlin rebuild

Scope
- The existing Next.js and FastAPI code in apps, scripts, infra and docs is a read only reference. Never modify or delete it.
- All new code goes in a folder named kotlin at the project root, with its own settings.gradle.kts and Gradle wrapper.
- Never open, print or copy the contents of .env. Use .env.example for key names only. Never commit secrets.
- The full plan lives in docs/MASTER_PROMPT.md. Read it before starting any phase. Work on one phase at a time and stop when it is done.

Language and style
- Kotlin only for application code. Java appears only through library APIs.
- Kotlin 2.x, JDK 21, Gradle Kotlin DSL, version catalog in gradle/libs.versions.toml.
- Follow official Kotlin conventions. Use immutable data classes, sealed interfaces and coroutines with structured concurrency.
- Never block inside Ktor handlers or on the main thread. Wrap blocking Google client calls in Dispatchers.IO.

Error handling
- Use typed domain exceptions (for example NotFoundException, ForbiddenException, ValidationException, UpstreamException). Never swallow exceptions.
- Map exceptions to HTTP responses in one place, the StatusPages plugin. Do not use Result types in route code.

Architecture
- Modules: shared, server, composeApp, tools.
- Business rules live in shared or server domain packages, never in UI code.
- Koin for dependency injection.
- Every cloud service has an interface, a Google implementation and an in memory fake.
- Secrets come from environment variables locally and Secret Manager on Cloud Run.

Quality
- Every feature ships with tests, using kotlin.test and Ktor testApplication with in memory fakes.
- Tests must never call real Google Cloud. Fail the test if a real network call is attempted.
- After each task run ./gradlew build and ./gradlew test, then fix failures before finishing. Never disable or delete a test to make it pass.
- Keep functions small and well named. Add short KDoc to public APIs.

Design
- Editorial look: canvas #F6F3EC, ink #0B0A09, accent #E8B93C, hairline dividers.
- No dark mode, no heavy shadows, no glassmorphism.
- Headlines in Instrument Serif italic, body in Inter, regional scripts in the matching Noto Serif fonts, upright and not italic.
- Reading column maximum width 560dp.