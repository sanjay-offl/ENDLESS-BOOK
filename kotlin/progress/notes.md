# Progress Notes - The Endless Book (Kotlin rebuild)

## Phase 0 - Exploration (complete)
- JDK 21, Gradle 8.10.2, Kotlin 2.2.21, Ktor 3.3.1 confirmed
- Existing skeleton compiles; added TokenVerifier interface and fixed Auth plugin issues
- Tests: all 3 server tests passing

## Phase 1 - Skeleton & shared (mostly done)
- Shared models (Chapter, requests, responses, validation) exist
- Config, health routes, root page exist - enhanced
- Version catalog has required deps (Ktor, Koin, serialization, etc.)

## Phase 2 - Backend core (in progress)
- Domain exceptions, ChapterRepository interface, InMemory implementation done
- Auth (principal, token verifier fake) done
- Routes: chapters CRUD (get list, get by id, create, update, delete, my chapters) done
- Routes: admin (moderate, feature), agent stubs, search/upload/analytics stubs, internal stubs, export done
- Status pages with proper error mapping done
- CallId and CallLogging configured
- Added missing libs (call-id) - fixed
