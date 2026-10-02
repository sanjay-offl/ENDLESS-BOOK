package com.endlessbook.server.routes

import com.endlessbook.server.auth.authenticated
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.post
import io.ktor.server.routing.routing

fun Application.agentRoutes() {
    routing {
        authenticated {
            post("/v1/agent/weave") {
                // AI Page Weaver stub - will be implemented with real AI later
                call.respond(HttpStatusCode.NotImplemented, mapOf("error" to "not_implemented"))
            }
        }
        authenticated {
            post("/v1/voice/transcribe") {
                call.respond(HttpStatusCode.NotImplemented, mapOf("error" to "not_implemented"))
            }
        }
    }
}
