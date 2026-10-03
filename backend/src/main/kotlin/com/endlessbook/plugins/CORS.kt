package com.endlessbook.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*

/**
 * Origins used by the local development servers: the Vite dev server (5173) and
 * `vite preview` (4173).
 */
private val LOCAL_ORIGINS = listOf(
    "localhost:5173",
    "127.0.0.1:5173",
    "localhost:4173",
    "127.0.0.1:4173",
    "localhost:4174",
    "127.0.0.1:4174",
)

fun Application.configureCORS() {
    val extraOrigins = System.getenv("CORS_ALLOWED_ORIGINS")
        .orEmpty()
        .split(",")
        .map { it.trim() }
        .filter { it.isNotEmpty() }

    // `allowHost("*")` silently becomes `anyHost()` in Ktor, which combined with
    // allowCredentials makes this API readable from any website. Reject it up front
    // so a misconfigured deploy fails loudly instead of opening a CORS bypass.
    require(extraOrigins.none { it == "*" }) {
        "CORS_ALLOWED_ORIGINS must list explicit hosts (for example your Vercel domain), not '*'."
    }

    install(CORS) {
        // Do not call anyHost() here: Ktor echoes the caller's Origin back when
        // anyHost() is combined with allowCredentials.
        (LOCAL_ORIGINS + extraOrigins).forEach { allowHost(it) }

        allowHeader(HttpHeaders.Authorization)
        // Sets allowNonSimpleContentTypes so `Content-Type: application/json` is accepted.
        allowHeader(HttpHeaders.ContentType)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Options)
        allowCredentials = true
    }
}
