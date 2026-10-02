# MASTER PROMPT: Rebuild "What I Saw When I Was a Kid" in Kotlin

You are a senior Kotlin engineer. Rebuild my existing project, The Endless Book, entirely in Kotlin. The original is a Next.js 15 frontend with a FastAPI backend on Google Cloud. Read README.md, DESIGN.md, DECISIONS.md and COSTS.md at the project root for context. Treat everything outside the kotlin folder as read only.

I want a production quality Kotlin version that runs locally, is tested, is containerized, and can deploy to the Google Cloud free tier.

How to work
- Do one phase at a time. At the end of each phase run ./gradlew build and ./gradlew test, fix every failure, then give me a short summary and the exact commands to verify it. Then stop and wait for me to say continue.
- Ask me nothing unless you are truly blocked. Make sensible decisions and record each one as a short entry in DECISIONS.md inside the kotlin folder.
- If a library is unstable on a target, tell me and pick the closest working alternative.
- Do not invent API keys or pretend a cloud call succeeded. Fakes are for tests and local emulator mode only.
- Check current official documentation or library versions before choosing them. Do not rely on memory for version numbers or model names.

## 1. Product vision
A collaborative, endless digital book of childhood memories.
- Every chapter is exactly 3 pages, about 2 to 3 minutes of reading.
- Chapter 1, "The Wheel Cart of Bangles", is written by the founder, Sanjay.
- From Chapter 2 onward, anyone can sign in with Google and add their own childhood memory. The book never ends.
- Mood: calm, literary, meditative. Warm off white canvas, deep ink, hairline dividers, italic serif headlines.

## 2. Architecture
Kotlin Multiplatform monorepo inside the kotlin folder:
1. shared: common models, DTOs (kotlinx.serialization), validation rules, API contract, constants.
2. server: Ktor 3 backend on Netty, replacing FastAPI. Listens on the PORT environment variable, default 8080.
3. composeApp: Compose Multiplatform client for Android and Web (Wasm). Desktop is optional.
4. tools: Kotlin module for the data seeder and the character asset checks.

## 3. Backend (server module)
Plugins: ContentNegotiation (JSON), CORS, CallId (X-Request-ID), CallLogging with structured JSON logs that follow Google Cloud Logging format, StatusPages for typed errors, Authentication with a Firebase ID token verifier, Koin.

Configuration keys (typed config, loaded from environment variables):
FIREBASE_PROJECT_ID, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_EMBEDDING_MODEL, GOOGLE_SPEECH_LANGUAGES, GCS_BUCKET, PUBSUB_TOPIC, BIGQUERY_DATASET, FOUNDER_UID, CORS_ORIGINS, FIRESTORE_EMULATOR_HOST (optional).
Provide a .env.example with names only. Both Gemini model names must come from config, never hardcoded.

Authentication and roles
- Verify Firebase ID tokens with the Firebase Admin Java SDK.
- Roles: public reader, signed in author, founder (UID equals FOUNDER_UID).
- Authors can edit or delete only their own chapters. Only the founder can use admin routes.

Data (Firestore)
- Collections: chapters, translations (subcollection of each chapter), counters.
- Chapter fields: id, chapterNumber, authorUid, authorName, title (max 80 characters), pages (exactly 3 strings, each max 1500 characters), language, locationCity, coordinates (city or locality level only, for privacy), coverImageUrl, audioUrl, status (pending, published, rejected), featured, readingMinutes, embedding (768 dimensions), createdAt, updatedAt.
- Assign chapterNumber with a Firestore transaction so numbering is atomic and sequential.

Routes under /v1
- GET /v1/chapters with filters (newest, featured, by place) and pagination
- GET /v1/chapters/{id}
- POST /v1/chapters (authenticated; validates exactly 3 pages and length limits; publishes a moderation event)
- PUT /v1/chapters/{id} and DELETE /v1/chapters/{id} (owner or founder)
- POST /v1/agent/weave (AI Page Weaver)
- POST /v1/voice/transcribe
- POST /v1/translate/{chapterId} with target codes ta, hi, te, ml, kn, cached in Firestore so the same translation is never billed twice
- GET /v1/search/similar (Firestore vector search, KNN, cosine) for "Others who remember too"
- POST /v1/upload/sign (signed PUT URLs for cover images and audio in Cloud Storage)
- POST /v1/analytics/event (chapter_view, page_turn, audio_play into BigQuery)
- Admin: POST /v1/admin/chapters/{id}/moderate, POST /v1/admin/chapters/{id}/feature, GET /v1/admin/export
- Internal: POST /internal/moderate, the Pub/Sub push endpoint, which must verify the Pub/Sub OIDC token
- GET /health and GET /ready

## 4. AI agents
Use the Google GenAI Java SDK and the Google ADK for Java from Kotlin.
1. PageWeaver: takes a rough draft or a spoken transcript in any of the 6 supported languages and returns strict JSON with a poetic title and exactly 3 balanced pages. It fixes grammar, keeps the author's voice, and keeps the original language. Validate the JSON against the shared schema and retry once on failure.
2. Moderator: runs asynchronously after submission. It checks safety, checks that the text is a genuine childhood recollection, and flags personal data such as exact home addresses and phone numbers. It returns a verdict (published or rejected) with a short reason, updates the chapter status, then generates and stores the embedding.
Keep prompts in resource files so I can tune them. Hide both agents behind interfaces so tests can use a fake model.

## 5. Cloud service interfaces
Each one gets an interface, a Google implementation and an in memory fake:
FirestoreRepository, EmbeddingService, SpeechService (Speech to Text v2 with multi language hints), TranslationService (Translation v3 with Firestore cache), StorageService (signed URLs), PubSubPublisher, AnalyticsSink (BigQuery streaming with small batching).

## 6. Client (composeApp module)
Use Compose Multiplatform, Navigation, ViewModels with StateFlow, and the Ktor client with the shared DTOs.
1. Landing: hero with the bangles cart painting, a welcome animation of the character, Chapter 1 feature block, a large "3" figure callout, FAQ accordion, closing sign off footer.
2. Book directory with filters.
3. Reader: exactly 3 pages, horizontal page turns with direction, swipe, keyboard arrows on web, buttons. Language switcher for English, Tamil, Hindi, Telugu, Malayalam and Kannada with the correct Noto Serif fonts. Audio playback when a recording exists.
4. Writer Studio: single box draft, voice recording with transcription, or three separate pages. One tap AI Page Weaver with a side by side diff review dialog. A reactive character with states idle, walk, thinking, encouraging, celebrating.
5. Memory Map: MapLibre Compose with OpenFreeMap Positron tiles, desaturated look, pins at city level, preview card that links to the chapter.
6. Me: author dashboard showing chapter status, with editing.
7. Founder: moderation queue, feature toggle, simple metrics.
8. About: origin story and a message from Sanjay.

Animation: GSAP does not exist in Kotlin, so rebuild the same feel with Compose animation APIs (AnimatedVisibility, animate*AsState, Animatable, updateTransition). Include line masked headline reveals, scroll triggered section entrances using LazyListState, directional page turns, and a reduced motion setting that follows the system preference.

Character: load the six pose SVGs (idle, wave, thinking, celebrating, encouraging, walk) from legacy/apps/web/public/character/poses as Compose resources. Keep the frame size 150.06 by 256.36 units and identical foot baselines.

Sign in: Google Sign In with Firebase Authentication. Put platform specific code behind expect and actual. If web sign in cannot be done cleanly in Wasm, use a small JavaScript interop bridge and explain the choice in DECISIONS.md.

Theme: canvas F6F3EC, ink 0B0A09, accent E8B93C, hairline color, fluid type scale, reading column max 560dp, Instrument Serif italic headlines, Inter body.

## 7. Seeder and tools
- A Kotlin seeder that inserts Chapter 1 ("The Wheel Cart of Bangles") and three sample chapters, with a flag to target the Firestore emulator.
- Port the pose checks: exactly 6 poses, identical frame size, foot baselines within tolerance, no clipping.

## 8. Testing
- Server tests use Ktor testApplication and an in memory Firestore fake that fails if a real outbound call is attempted.
- Cover: chapter validation, permissions (owner, founder, reader), atomic chapter numbering, the translation cache, the weave endpoint with a fake model, and the full async moderation flow through /internal/moderate.
- Client tests cover ViewModels and the page turn logic.

## 9. Infrastructure and docs
- Dockerfile.server: multi stage build (Gradle, then slim JRE 21), non root user, port 8080, Ktor fat jar.
- Web client: build the Wasm production bundle and serve it from a small static container or Firebase Hosting.
- cloudbuild.yaml: build, test, verify poses, build images, push to Artifact Registry, deploy to Cloud Run.
- firestore.rules and firestore.indexes.json, including composite indexes (status plus createdAt descending, and status plus featured plus createdAt descending) and the vector index (768 dimensions, COSINE).
- Use Secret Manager on Cloud Run.
- Write README, SETUP, COSTS (stay inside the free tier, with safeguards such as request caps and translation caching), DECISIONS and CHANGELOG inside the kotlin folder.

## 10. Phases (stop after each one)
Phase 1: Gradle multimodule skeleton, version catalog, shared DTOs, typed config, Koin, health routes.
Phase 2: Firestore repository, chapters CRUD, auth, transactions, tests.
Phase 3: GenAI and ADK agents, weave endpoint, Pub/Sub moderation pipeline, embeddings, vector search, tests.
Phase 4: Speech, translation with cache, storage signed URLs, BigQuery analytics, admin routes.
Phase 5: Compose foundation: theme, fonts, navigation, API client, auth, landing, directory.
Phase 6: Reader with page turns and language switching, then Writer Studio with voice and the Weaver diff dialog.
Phase 7: Map, Me, Founder, About, character animation, reduced motion.
Phase 8: Docker, Cloud Build, Firestore rules and indexes, seeder, docs.

When you are ready, start with Phase 1 only.