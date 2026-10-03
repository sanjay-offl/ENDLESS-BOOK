package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

/** Paginated chapter list. */
@Serializable
data class ChapterListResponse(
    val chapters: List<ChapterSummary> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val pageSize: Int = 20,
    val hasMore: Boolean = false,
)

/** `GET /health` and `GET /ready`. */
@Serializable
data class HealthResponse(
    val status: String = "ok",
    val version: String = "2.0.0",
    /** Storage mode in use, so the client can show a helpful banner. */
    val storageMode: String? = null,
)

/** Every non-2xx response uses this shape. */
@Serializable
data class ErrorResponse(
    val error: String = "",
    val detail: String? = null,
    val requestId: String? = null,
    /** Field level messages for form validation. */
    val fields: Map<String, String> = emptyMap(),
)

/** Simple acknowledgement. */
@Serializable
data class OkResponse(
    val ok: Boolean = true,
    val message: String? = null,
)

/** Everything the writer studio needs about the signed in user. */
@Serializable
data class MeResponse(
    val uid: String = "",
    val displayName: String? = null,
    val email: String? = null,
    /** `reader`, `author`, or `founder`. */
    val role: String = "reader",
    val chapterCount: Int = 0,
    val publishedCount: Int = 0,
)

/** `GET /v1/admin/export` payload, also used by the seeder. */
@Serializable
data class ExportResponse(
    val generatedAt: String = "",
    val chapterCount: Int = 0,
    val chapters: List<ChapterAdminRow> = emptyList(),
)

/** Founder dashboard numbers, drawn as thin ink lines. */
@Serializable
data class FounderMetricsResponse(
    val totalChapters: Int = 0,
    val published: Int = 0,
    val pending: Int = 0,
    val rejected: Int = 0,
    val featured: Int = 0,
    val contributors: Int = 0,
    val cities: Int = 0,
    val languages: Int = 0,
    val viewsLast7Days: List<Int> = emptyList(),
    val chaptersLast7Days: List<Int> = emptyList(),
    val topCities: List<CityCount> = emptyList(),
)

/** One row of a simple city histogram. */
@Serializable
data class CityCount(
    val city: String = "",
    val count: Int = 0,
)

/** `GET /v1/map/pins`, every published chapter as a city level pin. */
@Serializable
data class MapPinsResponse(
    val pins: List<MemoryPin> = emptyList(),
    val total: Int = 0,
)