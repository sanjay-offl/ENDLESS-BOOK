package com.endlessbook.plugins

import com.endlessbook.routes.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("The Endless Book API is running.", ContentType.Text.Plain)
        }
        route("/api") {
            chapterRoutes()
            memoryRoutes()
            userRoutes()
        }
    }
}
