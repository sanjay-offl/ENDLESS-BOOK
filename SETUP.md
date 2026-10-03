# The Endless Book — Setup Guide

## Development

### Frontend (React + Vite) — localhost:5173

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` → `http://localhost:8080`.

### Backend (Kotlin + Ktor) — localhost:8080

```bash
cd backend
./gradlew run
```

Both together from the repository root:

```bash
npm install
npm install --prefix frontend
npm run dev
```

The API works without Firebase credentials: it logs that it is serving in-memory seed
content, and `GET http://localhost:8080/` reports the active mode. Contributions made in
this mode are kept in memory and reset when the API restarts.

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

Leave `VITE_API_URL` empty to render entirely from the bundled seed content, which is
useful when the API is not running.

3. For the Ktor backend to talk to Firestore, authenticate locally:
   ```bash
   gcloud auth application-default login
   ```

4. Point the API at the project if it is not `endless-ebook`:
   ```bash
   FIREBASE_PROJECT_ID=your-project ./gradlew run
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
| GET | /api/users/:uid/memories | ✓ | Caller's own written pages |

> **Dev note:** while the API has no Firebase credentials it accepts `anonymous-token`
> (also `mock-*` and `demo-*`) so the write flow can be tested locally. Once credentials
> are present the bypass is disabled and all tokens are verified. `GET /api/users/:uid/memories`
> only ever returns the authenticated caller's own pages.

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `8080` |
| `FIREBASE_PROJECT_ID` | Firestore project | `endless-ebook` |
| `CORS_ALLOWED_ORIGINS` | Extra allowed origins, comma separated | — |

---

## Project Structure

```
ENDLESS BOOK/
├── frontend/              ← Vite + React 18 app (THIS IS THE APP)
│   ├── src/
│   │   ├── pages/         ← All route pages
│   │   ├── components/    ← UI + layout + form components
│   │   ├── hooks/         ← useAuth, useContributor, useChapter, useMemory
│   │   ├── store/         ← Zustand auth store
│   │   ├── firebase.ts    ← Firebase SDK init
│   │   ├── demoSession.ts ← Offline demo contributor session
│   │   └── api.ts         ← Typed API client
│   └── index.html
│
├── backend/               ← Kotlin + Ktor REST API
│   └── src/main/kotlin/com/endlessbook/
│       ├── Application.kt
│       ├── plugins/       ← StatusPages, Auth, CORS, Routing, Serialization
│       ├── routes/        ← ChapterRoutes, MemoryRoutes, UserRoutes
│       ├── services/      ← ChapterService, MemoryService
│       ├── models/        ← Chapter, Memory, User data classes
│       └── firebase/      ← FirebaseAdmin singleton
│
├── firestore.rules        ← Firestore security rules
└── storage.rules          ← Firebase Storage rules
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

Set `CORS_ALLOWED_ORIGINS` on the Cloud Run service to the deployed frontend origin, and
`FIREBASE_PROJECT_ID` to the target project.
