package app.endless

import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.callid.CallId
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    install(CallLogging)
    install(StatusPages)
    install(CORS) {
        allowHost("localhost:3000")
        allowHost("localhost:3001")
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Delete)
    }
    install(CallId) {
        generate { java.util.UUID.randomUUID().toString() }
    }

    routing {
        get("/health") {
            call.respondText(
                buildJsonObject { put("status", "ok") }.toString(),
                ContentType.Application.Json,
            )
        }
        get("/ready") {
            call.respondText(
                buildJsonObject { put("status", "ready") }.toString(),
                ContentType.Application.Json,
            )
        }
    }
}
