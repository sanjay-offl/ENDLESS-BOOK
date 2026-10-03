# What I Saw When I Was a Kid

What I Saw When I Was a Kid, also called the Endless Book, is a community book of childhood memories. Each contributor writes one memory in exactly three pages, and every chapter adds another real voice to a book that never ends.

## Stack

| Area | Technology |
| --- | --- |
| Web | React, Vite, TypeScript |
| API | Kotlin 2.x, Ktor 3, Netty, JDK 21 |
| Data and identity | Firebase Firestore, Authentication, Storage |
| Cloud services | Cloud Run, Google GenAI, Speech-to-Text, Translation |

## Run locally

Prerequisites: Node.js 20+, npm, and JDK 21. Gradle is optional for generating the API wrapper.

```bash
npm install
npm install --prefix frontend
npm run dev:frontend
```

The API runs separately with `npm run dev:backend`.

## Deploy the web app to Vercel

The Vercel configuration in [`vercel.json`](./vercel.json) builds the Vite app in `frontend`. To deploy from GitHub:

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. Set the Vercel **Root Directory** to the repository root (`./`). The checked-in configuration installs and builds `frontend`.
3. Add the variables from `.env.example` in **Project Settings → Environment Variables**. Use the Firebase values from the Firebase console; do not commit `.env.local`.
4. Set `VITE_API_URL` to the deployed API URL if the frontend uses the API in that environment.
5. Deploy.

For a local production check, run:

```bash
npm run build
```
