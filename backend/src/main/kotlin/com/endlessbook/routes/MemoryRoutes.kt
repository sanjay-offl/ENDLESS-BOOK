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
            val uid = principal?.uid ?: "anonymous-contributor"
            val body = call.receive<NewMemory>()
            try {
                val created = service.createMemory(body, uid)
                call.respond(HttpStatusCode.Created, created)
            } catch (e: IllegalStateException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Invalid state")))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Failed to save memory")))
            }
        }
    }
}
