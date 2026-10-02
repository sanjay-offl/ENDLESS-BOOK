package com.endlessbook.server.routes

import com.endlessbook.server.auth.Role
import com.endlessbook.server.auth.authenticated
import com.endlessbook.server.auth.requirePrincipal
import com.endlessbook.server.domain.ChapterRepository
import com.endlessbook.server.domain.ForbiddenException
import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

fun Application.adminExportRoutes(chapterRepo: ChapterRepository) {
    routing {
        authenticated {
            get("/v1/admin/export") {
                val principal = call.requirePrincipal
                if (principal.role != Role.FOUNDER) throw ForbiddenException("Founder only")
                val all = chapterRepo.listByAuthor(principal.uid) // get all? - for now just export what we have
                val result = chapterRepo.list(com.endlessbook.server.domain.ChapterFilter(pageSize = 1000))
                val json = Json { prettyPrint = true }
                call.respondText(json.encodeToString(result.items), ContentType.Application.Json)
            }
        }
    }
}
