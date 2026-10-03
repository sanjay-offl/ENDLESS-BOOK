# The Endless Book — Setup Guide

## Development

### Frontend (React + Vite) — localhost:5173

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Backend (Kotlin + Ktor) — localhost:8080

```bash
cd backend
./gradlew run
```

The Vite dev server proxies `/api/*` → `http://localhost:8080` automatically.

---

## Firebase Configuration

1. Copy `.env.example` → `frontend/.env.local`
2. Fill in your Firebase project values (Project ID: `endless-ebook`)

```
VITE_FIREBASE_API_KEY=<your key>
VITE_FIREBASE_AUTH_DOMAIN=endless-ebook.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=endless-ebook
VITE_FIREBASE_STORAGE_BUCKET=endless-ebook.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=524097848411
VITE_FIREBASE_APP_ID=<your app id>
VITE_API_URL=http://localhost:8080
```

3. For the Ktor backend to talk to Firestore, authenticate locally:
   ```bash
   gcloud auth application-default login
   ```

---

## API Endpoints (Ktor)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/chapters | — | All chapters |
| POST | /api/chapters | ✓ | Create chapter |
| GET | /api/chapters/:id | — | Chapter + its memories |
| GET | /api/memories/:id | — | Single memory |
| POST | /api/memories | ✓ | Submit a memory page |
| GET | /api/users/:uid/memories | ✓ | User's written pages |

> **Dev note:** Bearer tokens starting with `mock-` bypass Firebase Auth for local testing.

---

## Project Structure

```
ENDLESS BOOK/
├── frontend/              ← Vite + React 18 app (THIS IS THE APP)
│   ├── src/
│   │   ├── pages/         ← All route pages
│   │   ├── components/    ← UI + layout + form components
│   │   ├── hooks/         ← useAuth, useChapter, useMemory
│   │   ├── store/         ← Zustand auth store
│   │   ├── firebase.ts    ← Firebase SDK init
│   │   └── api.ts         ← Typed API client
│   └── index.html
│
├── backend/               ← Kotlin + Ktor REST API
│   └── src/main/kotlin/com/endlessbook/
│       ├── Application.kt
│       ├── plugins/       ← Auth, CORS, Routing, Serialization
│       ├── routes/        ← ChapterRoutes, MemoryRoutes, UserRoutes
│       ├── services/      ← ChapterService, MemoryService
│       ├── models/        ← Chapter, Memory, User data classes
│       └── firebase/      ← FirebaseAdmin singleton
│
├── firestore.rules        ← Firestore security rules
├── storage.rules          ← Firebase Storage rules
└── apps/                  ← Legacy Next.js app (kept for reference)
```

---

## Deploying

### Frontend → Firebase Hosting
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend → Google Cloud Run
```bash
cd backend
./gradlew shadowJar
docker build -t endless-book-api .
gcloud run deploy endless-book-api --image ...
```
