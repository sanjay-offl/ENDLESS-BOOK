# Changelog

## Unreleased

- Bootstrapped the Next.js web app, Kotlin/Ktor API skeleton, Firebase environment template, editor configuration, and project documentation.
- Verified the Next.js build and lint checks, generated the Gradle 8.10 wrapper, and completed the Kotlin API build.
- Replaced the generated starter screen with the first Endless Book editorial homepage and responsive mobile layout.
- Added root hydration warnings suppression for browser extensions that inject attributes before React hydrates.
- Added the navigable chapter directory, chapter detail and memory page routes, submit/login/profile/about screens, shared shell, and typed seed content.
- Replaced the Next.js prototype with the specified React 18 + Vite frontend in `frontend/` and Kotlin + Ktor API in `backend/`; removed the superseded `apps/` tree.
- Removed stale build output (`.idea/`, `backend/build/`, `backend/bin/`) and rewrote `.vscode/launch.json`, `DECISIONS.md`, `.gitignore`, and `SETUP.md` so no reference points at the deleted `apps/` code.

### Fixed

- **API silently dropped default-valued JSON fields.** `ContentNegotiation` did not set `encodeDefaults`, so kotlinx.serialization omitted every field still holding its declared default. Responses were missing `isOpen`, `tags`, `founderCity`, `imageUrl` and `pageCount`, which made open chapters read as closed and crashed the memory page on `tags.length` for a page written without tags.
- **Written pages were invisible after a reload.** `fetchJSON` short-circuited every read to the bundled seed data whenever `VITE_API_URL` was unset, while writes still went to the API through the dev proxy. Reads now always attempt the network and only fall back to the seed when the request fails; writes never fall back.
- **`POST /api/chapters` and `POST /api/memories` returned an empty 500.** The fetch layer spread `...options` after its own `headers` object, so a request carrying an `Authorization` header lost `Content-Type` and the API could not parse the body. Headers are now merged after the spread.
- **IDOR in `GET /api/users/:uid/memories`.** The route ignored the authenticated principal and returned any user's pages. It now compares the path `uid` against the principal and answers 401/403.
- **CORS allowed every origin.** `anyHost()` was present alongside four `allowHost` calls and, with `allowCredentials = true`, let any site make authenticated requests. Allowed origins now come from `LOCAL_ORIGINS` plus `CORS_ALLOWED_ORIGINS`, and `"*"` is rejected.
- **The three-page chapter limit could be exceeded.** The capacity check called `error()` inside its own `try`, so the throw was swallowed whenever Firestore was reachable. Capacity is now enforced by `ChapterFullException` with a dedicated rethrow, and a new `StatusPages` plugin maps it to 409 alongside 400 and 500 JSON bodies.
- **The dev auth bypass was reachable in production.** Mock, demo and anonymous tokens are now honoured only while `FirebaseAdmin.isConfigured` is false.
- **The demo contributor could not submit.** `SubmitPage` redirected to `/login` while `SubmitMemoryForm` hard-redirected on a missing Firebase user, deadlocking the offline demo path. Identity is now resolved by `useContributor`, which reports `loading` separately from "signed out" so redirect guards cannot fire mid-resolve.
- **Demo sign-in bounced back to `/login`.** The demo session was read from `localStorage` during render without a subscription, so the redirect guard acted on a stale value. `demoSession.ts` is now a small store consumed through `useSyncExternalStore`.
- **`/chapters/:id/:pageNum` showed the wrong page.** A missing page fell back to `memories[0]`, printing page 1's prose under a "page 03" heading. It now reports that the page is unwritten.
- **`SplitHeadline` dropped word breaks.** The gap between words came from a margin alone, so the accessible text was one unbroken string. Real space characters are now emitted between word spans.
- **`MemoryCard` ignored `memoryId`** and always linked by page number; it now links by id when one is supplied.
- **The submit form offered full chapters,** which then failed with a 409. Only chapters that are open and under the page limit are offered, and a requested-but-full chapter is called out.
- **`URL.createObjectURL` previews were never revoked** on replace or unmount.
- **The header was hidden behind page content** and short pages did not reach the bottom of the viewport.
- **Dead seed image URL** (`photo-1513688285373-4ec92273f679` returned 404); replaced, and memory images now degrade gracefully if a URL fails.
- Replaced the single 777 kB bundle with `react`, `firebase` and `animation` chunks, clearing the Vite chunk-size warning.
