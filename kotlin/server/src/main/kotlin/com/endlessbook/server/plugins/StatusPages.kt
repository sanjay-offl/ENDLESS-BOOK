package com.endlessbook.server.plugins

import com.endlessbook.server.domain.*
import com.endlessbook.shared.model.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callid.callId
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<NotFoundException> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse(error = "not_found", detail = cause.message, requestId = call.callId)
            )
        }
        exception<ValidationException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(error = "validation_error", detail = cause.message, requestId = call.callId)
            )
        }
        exception<UnauthorizedException> { call, cause ->
            call.respond(
                HttpStatusCode.Unauthorized,
                ErrorResponse(error = "unauthorized", detail = cause.message, requestId = call.callId)
            )
        }
        exception<ForbiddenException> { call, cause ->
            call.respond(
                HttpStatusCode.Forbidden,
                ErrorResponse(error = "forbidden", detail = cause.message, requestId = call.callId)
            )
        }
        exception<ConflictException> { call, cause ->
            call.respond(
                HttpStatusCode.Conflict,
                ErrorResponse(error = "conflict", detail = cause.message, requestId = call.callId)
            )
        }
        exception<RateLimitException> { call, cause ->
            call.respond(
                HttpStatusCode.TooManyRequests,
                ErrorResponse(error = "rate_limited", detail = cause.message, requestId = call.callId)
            )
        }
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(error = "internal_error", detail = cause.message, requestId = call.callId)
            )
        }
    }
}
