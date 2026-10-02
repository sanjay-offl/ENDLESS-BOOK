package com.endlessbook.server

import com.endlessbook.server.config.serverModule
import com.endlessbook.server.routes.healthRoutes
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.plugins.statuspages.statusFile
import io.ktor.server.response.respondText
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

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
            },
        )
    }
    install(CallLogging)
    install(CORS) {
        anyHost()
    }
    install(Koin) {
        slf4jLogger()
        modules(serverModule)
    }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(text = "Internal Server Error: ${cause.message}", status = io.ktor.http.HttpStatusCode.InternalServerError)
        }
    }

    healthRoutes()
}
