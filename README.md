# What I Saw When I Was a Kid

## Active Kotlin project

The active implementation is now in [`kotlin/`](kotlin/). The previous
Next.js/FastAPI stack is archived as read-only reference in [`legacy/`](legacy/)
and is preserved by the `legacy-nextjs-fastapi` Git tag.

Run the Kotlin server:

```bash
cd kotlin
./gradlew :server:run
```

Run the Compose Multiplatform web client:

```bash
cd kotlin
./gradlew :composeApp:wasmJsBrowserDevelopmentRun
```

Open http://localhost:8080/ for the API and http://localhost:8081/ for the
browser client.

An endless book of childhood memories. Every chapter is exactly 3 pages, written by a real person. Chapter one is by the founder, Sanjay. After that, anyone can sign in and add the next chapter. The book never ends.

## Quick Start

### Prerequisites

- JDK 21
- A Google Cloud project with billing enabled for future cloud features
- `gcloud` CLI authenticated when deploying

### Archived stack reference

```bash
# 1. Clone and install
git clone <repo-url>
cd "ENDLESS BOOK"
cp .env.example .env
# Fill in .env with your values

# 2. Install dependencies
cd legacy/apps/web && npm install
cd ../api && uv pip install -e ".[dev]"

# 3. Run both services
cd ../../.. && npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Seed the Database

```bash
cd legacy/apps/api
uv run python seed.py
```

This creates chapter one (The Wheel Cart of Bangles) and three sample chapters.

## Project Structure

```
.
├── legacy/
│   ├── apps/
│   │   ├── web/              # Archived Next.js frontend
│   │   └── api/              # Archived FastAPI backend
│   ├── scripts/              # Archived asset/deployment scripts
│   └── infra/                # Archived deployment manifests
├── infra/                # Active Firestore rules, indexes, and Pub/Sub notes
└── docs/                 # Documentation
```

## Features

- **Read the book** — Beautiful page-turning reader with keyboard, swipe, and click navigation
- **Write a chapter** — Guided 3-page writing flow with live preview
- **Speak your memory** — Microphone recording with Speech-to-Text (6 languages)
- **AI Page Weaver** — Splits rough text into 3 pages, polishes grammar, suggests title
- **Memory Map** — MapLibre map with glowing pins for each chapter
- **Read in your language** — Translation with caching (English, Tamil, Hindi, Telugu, Malayalam, Kannada)
- **Vector search** — "Others who remember too" — find similar memories
- **Moderation** — Async AI moderation via Pub/Sub
- **Analytics** — BigQuery event tracking
- **Founder tools** — Edit, feature, hide, export chapters

## Tech Stack

| Layer | Technology |
|---|---|
| Active frontend | Kotlin Multiplatform, Compose Multiplatform Wasm |
| Maps | MapLibre GL JS |
| Active backend | Kotlin, Ktor, Netty |
| AI | Gemini, Google ADK |
| Voice | Google Cloud Speech-to-Text |
| Translation | Google Cloud Translation |
| Database | Firestore |
| Analytics | BigQuery |
| Files | Cloud Storage |
| Vector Search | Firestore Vector Search |
| Async Jobs | Pub/Sub |
| Hosting | Cloud Run |
| CI/CD | Cloud Build |
| Auth | Firebase Authentication |

## Documentation

- [SETUP.md](SETUP.md) — Complete Google Cloud setup guide
- [docs/ANIMATION.md](docs/ANIMATION.md) — After Effects rig and Lottie export pipeline
- [COSTS.md](COSTS.md) — Free tier design and cost caps
- [DECISIONS.md](DECISIONS.md) — Architecture decisions
- [CHANGELOG.md](CHANGELOG.md) — What changed and when

## License

MIT
