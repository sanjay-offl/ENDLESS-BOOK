package com.endlessbook.server

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApplicationTest {
    @Test
    fun rootReturnsEditorialHtml() = testApplication {
        application { module() }

        val response = client.get("/")

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.headers[HttpHeaders.ContentType]?.startsWith("text/html") == true)
        assertTrue(response.bodyAsText().contains("The Endless Book API is running"))
    }

    @Test
    fun healthReturnsOkStatus() = testApplication {
        application { module() }

        val response = client.get("/health")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("""{"status":"ok"}""", response.bodyAsText().replace("\\s".toRegex(), ""))
    }

    @Test
    fun readyReturnsReadyStatus() = testApplication {
        application { module() }

        val response = client.get("/ready")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("""{"status":"ready"}""", response.bodyAsText().replace("\\s".toRegex(), ""))
    }
}
