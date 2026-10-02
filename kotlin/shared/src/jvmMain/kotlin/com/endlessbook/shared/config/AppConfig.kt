package com.endlessbook.shared.config

import kotlinx.serialization.Serializable

@Serializable
data class AppConfig(
    val appName: String = "the-endless-book",
    val environment: String = System.getenv("APP_ENV") ?: "local",
    val port: Int = (System.getenv("PORT") ?: "8080").toInt(),
    val firebaseProjectId: String? = System.getenv("FIREBASE_PROJECT_ID"),
    val corsOrigins: List<String> = (System.getenv("CORS_ORIGINS") ?: "http://localhost:3000").split(",").map(String::trim).filter(String::isNotBlank),
    val founderUid: String? = System.getenv("FOUNDER_UID"),
    val googleSpeechLanguages: String = System.getenv("GOOGLE_SPEECH_LANGUAGES") ?: "en,hi,ta,te,ml,kn",
) {
    companion object {
        fun load(): AppConfig = AppConfig()
    }
}
