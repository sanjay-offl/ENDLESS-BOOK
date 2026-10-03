package com.endlessbook

import com.endlessbook.firebase.FirebaseAdmin
import com.endlessbook.plugins.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    embeddedServer(
        Netty,
        port = System.getenv("PORT")?.toInt() ?: 8080,
        host = "0.0.0.0",
        module = Application::module
    ).start(wait = true)
}

fun Application.module() {
    FirebaseAdmin.initialize()
    configureSerialization()
    configureCORS()
    configureAuth()
    configureRouting()
}
