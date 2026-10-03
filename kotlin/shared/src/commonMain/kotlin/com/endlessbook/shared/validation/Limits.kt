package com.endlessbook.shared.validation

import com.endlessbook.shared.model.ChapterLimits

/** Query parameter bounds, shared so the client cannot ask for a silly page size. */
object Paging {
    const val DEFAULT_PAGE_SIZE = 20
    const val MAX_PAGE_SIZE = 50
    const val DEFAULT_PAGE = 1

    fun normalisePage(raw: String?): Int {
        val parsed = raw?.toIntOrNull() ?: return DEFAULT_PAGE
        return if (parsed < 1) DEFAULT_PAGE else parsed
    }

    fun normalisePageSize(raw: String?): Int {
        val parsed = raw?.toIntOrNull() ?: return DEFAULT_PAGE_SIZE
        return parsed.coerceIn(1, MAX_PAGE_SIZE)
    }

    fun normaliseLimit(raw: String?, fallback: Int = 3): Int {
        val parsed = raw?.toIntOrNull() ?: return fallback
        return parsed.coerceIn(1, 12)
    }
}

/** Request caps. Applied by the rate limiter plugin and by request bodies. */
object RequestCaps {
    /** Largest JSON body the writer studio ever sends. */
    const val MAX_BODY_BYTES = 1_500_000L

    /** Longest title allowed in a URL path segment. */
    const val MAX_TITLE_PATH = 80

    /** Upload kinds the sign endpoint accepts. */
    val UPLOAD_KINDS = listOf("cover", "audio")

    /** Upload content types, deliberately narrow. */
    val UPLOAD_CONTENT_TYPES = listOf(
        "image/jpeg",
        "image/png",
        "image/webp",
        "audio/mpeg",
        "audio/mp4",
        "audio/webm",
        "audio/wav",
        "audio/ogg",
    )

    fun isSupportedUpload(kind: String, contentType: String): Boolean =
        kind in UPLOAD_KINDS && contentType.lowercase() in UPLOAD_CONTENT_TYPES
}

/** Analytics events we accept, to keep BigQuery clean. */
object AnalyticsEvents {
    const val CHAPTER_VIEW = "chapter_view"
    const val PAGE_TURN = "page_turn"
    const val AUDIO_PLAY = "audio_play"
    val ALL = listOf(CHAPTER_VIEW, PAGE_TURN, AUDIO_PLAY)
}