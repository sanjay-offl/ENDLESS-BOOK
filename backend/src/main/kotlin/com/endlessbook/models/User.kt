package com.endlessbook.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val uid: String = "",
    val email: String? = null,
    val displayName: String? = null,
    val photoUrl: String? = null,
    val city: String? = null,
    val createdAt: Long = 0L,
)
