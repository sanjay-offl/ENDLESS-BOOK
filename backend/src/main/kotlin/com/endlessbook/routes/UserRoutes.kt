package com.endlessbook.routes

import com.endlessbook.plugins.FirebasePrincipal
import com.endlessbook.services.MemoryService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.userRoutes() {
    val memoryService = MemoryService()
    authenticate("firebase") {
        get("/users/{uid}/memories") {
            val requestedUid = call.parameters["uid"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val principal = call.principal<FirebasePrincipal>()
                ?: return@get call.respond(HttpStatusCode.Unauthorized)

            // The bearer token identifies the caller, so it decides whose memories are
            // readable. Trusting the path segment would let any caller list any other
            // contributor's pages by editing the URL.
            if (requestedUid != principal.uid) {
                return@get call.respond(
                    HttpStatusCode.Forbidden,
                    mapOf("error" to "You can only read your own memories.")
                )
            }

            call.respond(memoryService.getMemoriesByUser(principal.uid))
        }
    }
}
