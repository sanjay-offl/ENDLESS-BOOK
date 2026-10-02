package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

/** Request body for creating a chapter. */
@Serializable
data class CreateChapterRequest(
    val title: String,
    val pages: List<String>,
    val language: String = "en",
    val locationCity: String = "",
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
)

/** Request body for updating a chapter (all fields optional). */
@Serializable
data class UpdateChapterRequest(
    val title: String? = null,
    val pages: List<String>? = null,
    val language: String? = null,
    val locationCity: String? = null,
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
)

/** Paginated list response. */
@Serializable
data class ChapterListResponse(
    val chapters: List<ChapterSummary>,
    val total: Int,
    val page: Int,
    val pageSize: Int,
    val hasMore: Boolean,
)

/** Moderation action for the admin endpoint. */
@Serializable
data class ModerateRequest(
    val action: String,   // "publish" | "reject"
    val reason: String? = null,
)

/** Feature toggle for admin endpoint. */
@Serializable
data class FeatureRequest(
    val featured: Boolean,
)

/** Generic OK response. */
@Serializable
data class OkResponse(val ok: Boolean = true, val message: String? = null)

/** Error response returned for all 4xx/5xx. */
@Serializable
data class ErrorResponse(
    val error: String,
    val detail: String? = null,
    val requestId: String? = null,
)

/** Translation response. */
@Serializable
data class Translation(
    val chapterId: String,
    val language: String,
    val title: String,
    val pages: List<String>,
    val cachedAt: String,
)
