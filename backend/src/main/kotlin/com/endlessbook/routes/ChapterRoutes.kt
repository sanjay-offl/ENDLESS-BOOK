package com.endlessbook.routes

import com.endlessbook.models.NewChapter
import com.endlessbook.plugins.FirebasePrincipal
import com.endlessbook.services.ChapterService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.chapterRoutes() {
    val service = ChapterService()

    get("/chapters") {
        call.respond(service.getAllChapters())
    }

    get("/chapters/{id}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
        val detail = service.getChapterWithMemories(id)
            ?: return@get call.respond(HttpStatusCode.NotFound)
        call.respond(detail)
    }

    authenticate("firebase") {
        post("/chapters") {
            val principal = call.principal<FirebasePrincipal>()
                ?: return@post call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Sign in to start a chapter."))
            val body = call.receive<NewChapter>()
            call.respond(HttpStatusCode.Created, service.createChapter(body, principal.uid))
        }
    }
}
