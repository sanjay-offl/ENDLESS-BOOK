package com.endlessbook.server.auth

import com.endlessbook.server.domain.UnauthorizedException
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.request.header
import io.ktor.server.routing.Route
import io.ktor.server.routing.application
import io.ktor.util.AttributeKey
import org.koin.ktor.ext.inject

val AuthAttributeKey = AttributeKey<AuthPrincipal>("AuthPrincipal")

val ApplicationCall.principal: AuthPrincipal?
    get() = attributes.getOrNull(AuthAttributeKey)

val ApplicationCall.requirePrincipal: AuthPrincipal
    get() = principal ?: throw UnauthorizedException()

val AuthPlugin = createRouteScopedPlugin("AuthPlugin", createConfiguration = {}) {
    onCall { call ->
        val verifier by call.application.inject<TokenVerifier>()
        val header = call.request.header("Authorization") ?: return@onCall
        if (!header.startsWith("Bearer ")) return@onCall
        val token = header.removePrefix("Bearer ").trim()
        val principal = verifier.verify(token) ?: return@onCall
        call.attributes.put(AuthAttributeKey, principal)
    }
}

fun Route.authenticated(build: Route.() -> Unit): Route {
    val authenticatedRoute = createChild(object : io.ktor.server.routing.RouteSelector() {
        override suspend fun evaluate(context: io.ktor.server.routing.RoutingResolveContext, segmentIndex: Int) =
            io.ktor.server.routing.RouteSelectorEvaluation.Transparent
    })
    authenticatedRoute.install(AuthPlugin)
    authenticatedRoute.build()
    return authenticatedRoute
}
