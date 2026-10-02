package com.endlessbook.server.routes

import com.endlessbook.server.domain.ChapterRepository
import com.endlessbook.shared.model.OkResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing

fun Application.searchRoutes(chapterRepo: ChapterRepository) {
    routing {
        get("/v1/search/similar") {
            // Placeholder - returns empty for now
            call.respond(emptyList<String>())
        }
        post("/v1/translate/{chapterId}") {
            call.respond(HttpStatusCode.NotImplemented, mapOf("error" to "not_implemented"))
        }
        post("/v1/upload/sign") {
            call.respond(HttpStatusCode.NotImplemented, mapOf("error" to "not_implemented"))
        }
        post("/v1/analytics/event") {
            call.respond(OkResponse(true))
        }
    }
}
