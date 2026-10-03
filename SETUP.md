# Setup

## Phase 0 bootstrap

1. Install Node.js 20 or newer and JDK 21.
2. Install Gradle if the wrapper is not present: `sudo apt-get update && sudo apt-get install -y gradle`.
3. Generate the API wrapper: `cd apps/api && gradle wrapper --gradle-version 8.10`.
4. Copy `.env.example` to `apps/web/.env.local` and add the Firebase web API key.

The Firebase web API key is read from the environment. Restrict it to the project domains in Google Cloud Console; Firestore and Storage rules provide the actual data protection.
