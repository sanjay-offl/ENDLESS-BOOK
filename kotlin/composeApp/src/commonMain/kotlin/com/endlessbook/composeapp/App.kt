package com.endlessbook.composeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
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
private val Muted = Color(0xFF6B675F)
private val Hairline = Color(0x1F0B0A09)

data class ClientConfig(val apiBaseUrl: String = "http://localhost:8080")

@Composable
fun App(config: ClientConfig = ClientConfig()) {
    var apiStatus by remember { mutableStateOf("API offline") }
    var openFaq by remember { mutableStateOf<Int?>(null) }
    val scrollState = rememberScrollState()

    LaunchedEffect(config.apiBaseUrl) {
        apiStatus = checkApiHealth(config.apiBaseUrl)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas)
            .verticalScroll(scrollState)
            .padding(horizontal = 32.dp, vertical = 28.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "THE ENDLESS BOOK",
                color = Ink,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 2.sp,
            )
            Text(
                text = "A living archive",
                color = Muted,
                fontSize = 12.sp,
            )
        }

        Spacer(Modifier.height(96.dp))
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Text(
                text = "A BOOK THAT NEVER ENDS",
                color = Muted,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 2.sp,
            )
            Text(
                text = "What I Saw\nWhen I Was a Kid",
                color = Ink,
                fontSize = 58.sp,
                lineHeight = 58.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
                fontWeight = FontWeight.Normal,
            )
            Row(verticalAlignment = Alignment.Top) {
                Text("●", color = Accent, fontSize = 20.sp)
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "Childhood memories, shared one chapter at a time.",
                    color = Muted,
                    fontSize = 17.sp,
                    lineHeight = 26.sp,
                )
            }
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Canvas),
            ) {
                Text("Read chapter one")
            }
        }

        Spacer(Modifier.height(144.dp))
        EditorialSection(
            eyebrow = "The book",
            title = "You remember it.\nYou write it in three pages.",
            body = "A quiet place for the details that stay with us: a street after rain, a familiar voice, the small rituals of an ordinary day.",
        )

        Spacer(Modifier.height(120.dp))
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "3",
                color = Ink,
                fontSize = 180.sp,
                lineHeight = 150.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
            )
        }
        Text(
            text = "Every chapter is exactly three pages.\nLong enough to remember. Short enough to return to.",
            color = Muted,
            fontSize = 16.sp,
            lineHeight = 24.sp,
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(120.dp))
        EditorialSection(
            eyebrow = "A shared memory",
            title = "The world reads it.",
            body = "Chapter one begins with The Wheel Cart of Bangles. The next chapter can be yours.",
        )

        Spacer(Modifier.height(120.dp))
        Text(
            text = "Questions",
            color = Muted,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 2.sp,
        )
        Spacer(Modifier.height(16.dp))
        listOf(
            "What is The Endless Book?" to "A growing collection of real childhood memories.",
            "How long is a chapter?" to "Each chapter has three pages and takes about two to three minutes to read.",
            "Can I add my own memory?" to "Yes. Sign in, write your three pages, and send them for review.",
        ).forEachIndexed { index, (question, answer) ->
            HorizontalDivider(color = Hairline)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { openFaq = if (openFaq == index) null else index }
                    .padding(vertical = 18.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(question, color = Ink, fontSize = 16.sp)
                    Text(
                        text = if (openFaq == index) "−" else "+",
                        color = Ink,
                        fontSize = 20.sp,
                    )
                }
                if (openFaq == index) {
                    Spacer(Modifier.height(10.dp))
                    Text(answer, color = Muted, fontSize = 15.sp, lineHeight = 23.sp)
                }
            }
            if (index == 2) HorizontalDivider(color = Hairline)
        }

        Spacer(Modifier.height(120.dp))
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                text = "A place for what remains.",
                color = Ink,
                fontSize = 34.sp,
                lineHeight = 36.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
            )
            Text(
                text = "Made with care by Sanjay.",
                color = Muted,
                fontSize = 14.sp,
            )
            Text(
                text = apiStatus,
                color = Muted,
                fontSize = 12.sp,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun EditorialSection(
    eyebrow: String,
    title: String,
    body: String,
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text(
            text = eyebrow.uppercase(),
            color = Muted,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 2.sp,
        )
        Text(
            text = title,
            color = Ink,
            fontSize = 40.sp,
            lineHeight = 41.sp,
            fontStyle = FontStyle.Italic,
            fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
        )
        Text(
            text = body,
            color = Muted,
            fontSize = 17.sp,
            lineHeight = 27.sp,
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
