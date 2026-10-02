package com.endlessbook.server.routes

import com.endlessbook.server.auth.Role
import com.endlessbook.server.auth.authenticated
import com.endlessbook.server.auth.requirePrincipal
import com.endlessbook.server.domain.ChapterRepository
import com.endlessbook.server.domain.ForbiddenException
import com.endlessbook.server.domain.NotFoundException
import com.endlessbook.shared.model.ChapterStatus
import com.endlessbook.shared.model.FeatureRequest
import com.endlessbook.shared.model.ModerateRequest
import com.endlessbook.shared.model.OkResponse
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.routing

fun Application.adminRoutes(chapterRepo: ChapterRepository) {
    routing {
        adminRoutesInternal(chapterRepo)
    }
}

fun Route.adminRoutesInternal(chapterRepo: ChapterRepository) {
    authenticated {
        post("/v1/admin/chapters/{id}/moderate") {
            val principal = call.requirePrincipal
            if (principal.role != Role.FOUNDER) throw ForbiddenException("Founder only")
            val id = call.parameters["id"] ?: throw NotFoundException("Chapter", "missing")
            val req = call.receive<ModerateRequest>()
            val status = when (req.action.lowercase()) {
                "publish" -> ChapterStatus.published
                "reject" -> ChapterStatus.rejected
                else -> throw com.endlessbook.server.domain.ValidationException("action must be 'publish' or 'reject'")
            }
            chapterRepo.setStatus(id, status, req.reason)
            call.respond(OkResponse(true, "moderated"))
        }

        post("/v1/admin/chapters/{id}/feature") {
            val principal = call.requirePrincipal
            if (principal.role != Role.FOUNDER) throw ForbiddenException("Founder only")
            val id = call.parameters["id"] ?: throw NotFoundException("Chapter", "missing")
            val req = call.receive<FeatureRequest>()
            val existing = chapterRepo.getById(id) ?: throw NotFoundException("Chapter", id)
            val updated = existing.copy(featured = req.featured)
            chapterRepo.update(id, updated)
            call.respond(OkResponse(true, "featured"))
        }
    }
}
