package com.endlessbook.models

import kotlinx.serialization.Serializable

@Serializable
data class Memory(
    val id: String = "",
    val chapterId: String = "",
    val pageNum: Int = 0,
    val title: String = "",
    val body: String = "",
    val authorId: String = "",
    val authorName: String = "",
    val authorCity: String = "",
    val imageUrl: String? = null,
    val tags: List<String> = emptyList(),
    val createdAt: Long = 0L,
)

@Serializable
data class NewMemory(
    val chapterId: String,
    val title: String,
    val body: String,
    val authorCity: String,
    val imageUrl: String? = null,
    val tags: List<String> = emptyList(),
)
