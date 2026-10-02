package com.endlessbook.server

import com.endlessbook.server.config.serverModule
import com.endlessbook.server.plugins.configureCallLogging
import com.endlessbook.server.plugins.configureStatusPages
import com.endlessbook.server.routes.*
import com.endlessbook.server.domain.ChapterRepository
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.koin.ktor.ext.inject

fun main() {
    embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                ignoreUnknownKeys = true
                encodeDefaults = true
            },
        )
    }
    configureCallLogging()
    configureStatusPages()
    install(CORS) {
        val configuredOrigins = (System.getenv("CORS_ORIGINS") ?: "http://localhost:8081,http://localhost:3000")
            .split(",")
            .map(String::trim)
            .filter(String::isNotBlank)
        configuredOrigins.forEach { origin ->
            val uri = java.net.URI(origin)
            allowHost(uri.authority, schemes = listOf(uri.scheme))
        }
    }
    install(Koin) {
        slf4jLogger()
        modules(serverModule)
    }

    val chapterRepo by inject<ChapterRepository>()

    healthRoutes()
    chaptersRoutes(chapterRepo)
    adminRoutes(chapterRepo)
    agentRoutes()
    searchRoutes(chapterRepo)
    internalRoutes()
    adminExportRoutes(chapterRepo)

    routing {
        get("/") {
            call.respondText(
                """
                <!doctype html>
                <html lang="en">
                <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>The Endless Book API</title>
                <style>
                  :root { color-scheme: light; }
                  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
                    background: #F6F3EC; color: #0B0A09; font-family: Inter, system-ui, sans-serif; }
                  main { max-width: 38rem; padding: 3rem; }
                  h1 { font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: clamp(2.5rem, 8vw, 5rem); line-height: .98; }
                  a { color: #0B0A09; margin-right: 1.5rem; }
                </style></head>
                <body><main><p>THE ENDLESS BOOK API</p><h1>The Endless Book API is running</h1>
                <p><a href="/health">Health</a><a href="/ready">Readiness</a></p></main></body>
                </html>
                """.trimIndent(),
                io.ktor.http.ContentType.Text.Html,
            )
        }
    }
}
