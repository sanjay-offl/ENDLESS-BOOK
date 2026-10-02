package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

/**
 * Chapter status lifecycle:
 *   pending (just submitted) → published or rejected (after moderation)
 *   needs_review is a special state that pauses auto-moderation for manual review.
 */
@Serializable
enum class ChapterStatus { pending, published, rejected, needs_review }

@Serializable
data class GeoPoint(
    val lat: Double = 0.0,
    val lng: Double = 0.0,
)

/** Full chapter document as stored and returned from the API. */
@Serializable
data class Chapter(
    val id: String = "",
    val chapterNumber: Int = 0,
    val authorUid: String = "",
    val authorName: String = "",
    val title: String = "",
    /** Exactly three pages. */
    val pages: List<String> = emptyList(),
    val language: String = "en",
    /** City-level location label only. Never a street address. */
    val locationCity: String = "",
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
    val status: ChapterStatus = ChapterStatus.pending,
    val featured: Boolean = false,
    /** Approximate reading time in minutes. */
    val readingMinutes: Int = 2,
    /** 768-dim embedding stored server-side; not sent to clients. */
    val embedding: List<Double>? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

/** Subset returned in list endpoints (no embedding, no full pages). */
@Serializable
data class ChapterSummary(
    val id: String,
    val chapterNumber: Int,
    val authorName: String,
    val title: String,
    val firstPage: String,
    val language: String,
    val locationCity: String,
    val coverImageUrl: String?,
    val status: ChapterStatus,
    val featured: Boolean,
    val readingMinutes: Int,
    val createdAt: String,
)

fun Chapter.toSummary() = ChapterSummary(
    id = id,
    chapterNumber = chapterNumber,
    authorName = authorName,
    title = title,
    firstPage = pages.firstOrNull() ?: "",
    language = language,
    locationCity = locationCity,
    coverImageUrl = coverImageUrl,
    status = status,
    featured = featured,
    readingMinutes = readingMinutes,
    createdAt = createdAt,
)
