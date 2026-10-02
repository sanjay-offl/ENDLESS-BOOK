package com.endlessbook.server.domain

/** Typed exceptions that map to specific HTTP status codes via StatusPages. */
sealed class AppException(message: String) : Exception(message)

class NotFoundException(resource: String, id: String) :
    AppException("$resource '$id' not found")

class ValidationException(detail: String) :
    AppException(detail)

class UnauthorizedException(detail: String = "Authentication required") :
    AppException(detail)

class ForbiddenException(detail: String = "Insufficient permissions") :
    AppException(detail)

class ConflictException(detail: String) :
    AppException(detail)

class RateLimitException(detail: String = "Too many requests") :
    AppException(detail)
