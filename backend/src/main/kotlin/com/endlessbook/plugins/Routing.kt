package com.endlessbook.plugins

import com.endlessbook.firebase.FirebaseAdmin
import com.endlessbook.routes.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            val mode = if (FirebaseAdmin.isConfigured) {
                "connected to Firestore"
            } else {
                "serving in-memory seed content (no Firebase credentials found)"
            }
            call.respondText("The Endless Book API is running, $mode.", ContentType.Text.Plain)
        }
        route("/api") {
            chapterRoutes()
            memoryRoutes()
            userRoutes()
        }
    }
}
