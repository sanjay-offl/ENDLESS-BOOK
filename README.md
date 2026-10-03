# What I Saw When I Was a Kid

What I Saw When I Was a Kid, also called the Endless Book, is a community book of childhood memories. Each contributor writes one memory in exactly three pages, and every chapter adds another real voice to a book that never ends.

## Stack

| Area | Technology |
| --- | --- |
| Web | React 19, Next.js 15, TypeScript, Tailwind CSS |
| API | Kotlin 2.x, Ktor 3, Netty, JDK 21 |
| Data and identity | Firebase Firestore, Authentication, Storage |
| Cloud services | Cloud Run, Google GenAI, Speech-to-Text, Translation |

## Run locally

Prerequisites: Node.js 20+, npm, and JDK 21. Gradle is optional for generating the API wrapper.

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev:web
```

The API will be added to the local command once its Gradle wrapper is generated. Until then, install Gradle on Ubuntu with `sudo apt-get update && sudo apt-get install -y gradle`, then run `cd apps/api && gradle wrapper --gradle-version 8.10`.
