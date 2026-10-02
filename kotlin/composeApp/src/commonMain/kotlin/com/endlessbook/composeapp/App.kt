package com.endlessbook.composeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.endlessbook.shared.model.HealthResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

private val Canvas = Color(0xFFF6F3EC)
private val Ink = Color(0xFF0B0A09)
private val Accent = Color(0xFFE8B93C)

data class ClientConfig(val apiBaseUrl: String = "http://localhost:8080")

@Composable
fun App(config: ClientConfig = ClientConfig()) {
    var apiStatus by remember { mutableStateOf("API offline") }

    LaunchedEffect(config.apiBaseUrl) {
        apiStatus = checkApiHealth(config.apiBaseUrl)
    }

    Column(
        modifier = Modifier.fillMaxSize().background(Canvas).padding(32.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Text(
                text = "A BOOK THAT NEVER ENDS",
                color = Ink.copy(alpha = .58f),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 2.sp,
            )
            Text(
                text = "What I Saw When I Was a Kid",
                color = Ink,
                fontSize = 56.sp,
                lineHeight = 58.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
                fontWeight = FontWeight.Normal,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("●", color = Accent, fontSize = 24.sp)
                Text(
                    text = " An endless book of childhood memories, shared one chapter at a time.",
                    color = Ink.copy(alpha = .72f),
                    fontSize = 17.sp,
                    lineHeight = 26.sp,
                )
            }
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Canvas),
            ) {
                Text("Read Chapter 1")
            }
        }
        Text(
            text = apiStatus,
            color = Ink.copy(alpha = .58f),
            fontSize = 12.sp,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

private suspend fun checkApiHealth(baseUrl: String): String = withContext(Dispatchers.Default) {
    val client = HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }
    try {
        val response: HealthResponse = client.get("$baseUrl/health").body()
        if (response.status == "ok") "API connected" else "API offline"
    } catch (_: Exception) {
        "API offline"
    } finally {
        client.close()
    }
}
