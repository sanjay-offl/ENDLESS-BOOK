package com.endlessbook.server.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.post
import io.ktor.server.routing.routing

fun Application.internalRoutes() {
    routing {
        post("/internal/moderate") {
            call.respond(HttpStatusCode.OK, mapOf("status" to "received"))
        }
    }
}
