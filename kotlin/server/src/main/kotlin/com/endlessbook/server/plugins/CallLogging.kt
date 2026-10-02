package com.endlessbook.server.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callid.CallId
import io.ktor.server.plugins.callid.callIdMdc
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import org.slf4j.event.Level

fun Application.configureCallLogging() {
    install(CallId) {
        header("X-Request-ID")
        generate { java.util.UUID.randomUUID().toString() }
    }
    install(CallLogging) {
        level = Level.INFO
        callIdMdc("X-Request-ID")
        filter { call -> call.request.path().startsWith("/") }
    }
}
