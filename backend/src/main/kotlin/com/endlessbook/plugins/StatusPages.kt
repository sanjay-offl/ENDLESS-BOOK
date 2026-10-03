package com.endlessbook.plugins

import com.endlessbook.services.ChapterFullException
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("StatusPages")

/**
 * Converts thrown exceptions into JSON error bodies.
 *
 * Without this, a failed content negotiation or a missing auth header produced a `500`
 * with an empty body, and the frontend's `res.json()` rejected with an opaque parse
 * error instead of surfacing the actual problem.
 */
fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<ChapterFullException> { call, cause ->
            call.respond(HttpStatusCode.Conflict, mapOf("error" to (cause.message ?: "Chapter is full")))
        }

        exception<BadRequestException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (cause.message ?: "Malformed request body"))
            )
        }

        exception<Throwable> { call, cause ->
            logger.error("Unhandled failure while serving {}", call.request.local.uri, cause)
            val message = cause.message ?: cause::class.simpleName ?: "Unexpected server error"
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to message))
        }
    }
}
