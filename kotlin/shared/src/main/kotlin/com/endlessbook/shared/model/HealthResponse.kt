package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

@Serializable
data class HealthResponse(
    val status: String = "ok",
    val service: String = "server",
    val environment: String = "local",
)
