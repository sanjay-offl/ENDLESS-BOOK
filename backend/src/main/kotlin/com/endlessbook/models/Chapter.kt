package com.endlessbook.models

import kotlinx.serialization.Serializable

@Serializable
data class Chapter(
    val id: String = "",
    val number: Int = 0,
    val title: String = "",
    val founderId: String = "",
    val founderName: String = "",
    val founderCity: String = "",
    val pageCount: Int = 0,
    val isOpen: Boolean = true,
    val tags: List<String> = emptyList(),
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
)

@Serializable
data class NewChapter(
    val title: String,
    val tags: List<String> = emptyList()
)

@Serializable
data class ChapterDetail(
    val chapter: Chapter,
    val memories: List<Memory>
)
