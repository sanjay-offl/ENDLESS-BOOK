# The Endless Book Kotlin application

The active implementation is a Kotlin Multiplatform project. The old Next.js
and FastAPI implementation is retained as read-only reference under
`../legacy/`.

## Run the server

From this directory:

```bash
./gradlew :server:run
```

Open:

- http://localhost:8080/
- http://localhost:8080/health
- http://localhost:8080/ready

## Run the web client

Start the Wasm browser development server from this directory:

```bash
./gradlew :composeApp:wasmJsBrowserDevelopmentRun
```

Open http://localhost:8081/ in a browser. The client calls the server at
`http://localhost:8080` and displays its connection status at the bottom of
the landing screen.

Android is an optional target and is disabled by default. Enable it only on a
machine with the Android SDK and Android Gradle plugin available:

```bash
./gradlew -PenableAndroid build
```

The web target does not require an Android SDK. Android target wiring is
intentionally property-gated because this development environment does not
have the Android SDK/plugin artifacts available.
