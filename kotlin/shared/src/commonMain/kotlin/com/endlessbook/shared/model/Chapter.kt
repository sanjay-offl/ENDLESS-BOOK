package com.endlessbook.shared.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

private val NEWLINES = Regex("\\s+")

/**
 * Chapter lifecycle.
 *
 * A submitted chapter starts [pending]. Asynchronous moderation moves it to
 * [published] or [rejected]. [needsReview] is a manual hold used by the
 * founder dashboard when the moderator is unsure.
 */
@Serializable
enum class ChapterStatus {
    @SerialName("pending")
    pending,

    @SerialName("published")
    published,

    @SerialName("rejected")
    rejected,

    @SerialName("needs_review")
    needsReview,
    ;

    /** Only published chapters are visible to readers. */
    val isPublic: Boolean get() = this == published

    /** Short lowercase label for the dashboard status column. */
    val label: String
        get() = when (this) {
            pending -> "pending"
            published -> "live"
            rejected -> "declined"
            needsReview -> "in review"
        }
}

/** Collapses any run of whitespace, used when building editorial excerpts. */
internal val ANY_WHITESPACE = Regex("\\s+")

/** A city level point. Deliberately coarse so no one is located precisely. */
@Serializable
data class GeoPoint(
    val lat: Double = 0.0,
    val lng: Double = 0.0,
)

/**
 * The chapter document. Stored in Firestore under `chapters/{id}` and shared
 * with clients over JSON.
 */
@Serializable
data class Chapter(
    val id: String = "",
    /** Monotonic chapter number, allocated atomically. Chapter one is reserved. */
    val chapterNumber: Int = 0,
    val authorUid: String = "",
    val authorName: String = "",
    /** Display title. Max [ChapterLimits.TITLE_MAX] characters. */
    val title: String = "",
    /** Exactly [PAGES_PER_CHAPTER] pages, each at most [ChapterLimits.PAGE_MAX_CHARS]. */
    val pages: List<String> = emptyList(),
    /** BCP-47-ish code from [ChapterLimits.READER_LANGUAGES]. */
    val language: String = "en",
    /** City only. Never a street address. */
    val locationCity: String = "",
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
    val status: ChapterStatus = ChapterStatus.pending,
    val featured: Boolean = false,
    /** Approximate reading time in minutes, between two and three. */
    val readingMinutes: Int = 2,
    /** 768 dimensions. Server side only, stripped from every client response. */
    val embedding: List<Double>? = null,
    /** Human readable reason kept with a rejected or held chapter. */
    val moderationNote: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
) {
    /** Returns a copy without the server only fields, safe to send to a client. */
    fun withoutInternals(): Chapter = copy(embedding = null)

    /** The first sentence of page one, used for editorial excerpts. */
    fun excerpt(maxChars: Int = 220): String {
        val first = pages.firstOrNull().orEmpty().replace(ANY_WHITESPACE, " ").trim()
        if (first.length <= maxChars) return first
        val cut = first.take(maxChars)
        val lastSpace = cut.lastIndexOf(' ')
        return (if (lastSpace > maxChars / 2) cut.take(lastSpace) else cut).trimEnd(',', '.') + "…"
    }
}

/** Compact chapter shape for list rows. No pages beyond the opening line. */
@Serializable
data class ChapterSummary(
    val id: String,
    val chapterNumber: Int,
    val authorName: String,
    val title: String,
    val language: String,
    val locationCity: String,
    val coverImageUrl: String? = null,
    val status: ChapterStatus,
    val featured: Boolean,
    val readingMinutes: Int,
    val createdAt: String,
) {
    /** Editorial rows need one quiet line of text under the title. */
    val excerpt: String get() = excerptOverride ?: ""

    /** Filled in by the repository layer when building summaries. */
    var excerptOverride: String? = null
        internal set
}

/** Row shape for the founder and author dashboards. */
@Serializable
data class ChapterAdminRow(
    val id: String,
    val chapterNumber: Int,
    val title: String,
    val authorUid: String,
    val authorName: String,
    val language: String,
    val locationCity: String,
    val status: ChapterStatus,
    val featured: Boolean,
    val moderationNote: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

/** One marker on the memory map. City level only. */
@Serializable
data class MemoryPin(
    val chapterId: String,
    val chapterNumber: Int,
    val title: String,
    val city: String,
    val language: String,
    val lat: Double,
    val lng: Double,
)