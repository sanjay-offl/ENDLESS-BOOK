package com.endlessbook.routes

import com.endlessbook.plugins.FirebasePrincipal
import com.endlessbook.services.MemoryService
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.userRoutes() {
    val memoryService = MemoryService()
    authenticate("firebase") {
        get("/users/{uid}/memories") {
            val uid = call.parameters["uid"] ?: ""
            call.respond(memoryService.getMemoriesByUser(uid))
        }
    }
}
