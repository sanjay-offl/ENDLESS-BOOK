package com.endlessbook.server.routes

import com.endlessbook.shared.model.HealthResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing

fun Application.healthRoutes() {
    routing {
        get("/health") {
            call.respond(HttpStatusCode.OK, HealthResponse(status = "ok", service = "server", environment = "local"))
        }

        get("/ready") {
            call.respond(HttpStatusCode.OK, HealthResponse(status = "ready", service = "server", environment = "local"))
        }
    }
}
