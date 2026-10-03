package com.endlessbook.routes

import com.endlessbook.models.NewMemory
import com.endlessbook.plugins.FirebasePrincipal
import com.endlessbook.services.MemoryService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.memoryRoutes() {
    val service = MemoryService()

    get("/memories/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        val memory = service.getMemory(id) ?: return@get call.respond(HttpStatusCode.NotFound)
        call.respond(memory)
    }

    authenticate("firebase") {
        post("/memories") {
            val principal = call.principal<FirebasePrincipal>()
                ?: return@post call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Sign in to contribute."))
            val body = call.receive<NewMemory>()
            call.respond(HttpStatusCode.Created, service.createMemory(body, principal.uid))
        }
    }
}
