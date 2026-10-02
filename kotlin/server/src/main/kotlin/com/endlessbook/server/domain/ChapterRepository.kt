package com.endlessbook.server.domain

import com.endlessbook.shared.model.Chapter
import com.endlessbook.shared.model.ChapterStatus

/** Filter options for listing chapters. */
data class ChapterFilter(
    val status: ChapterStatus? = null,
    val featured: Boolean? = null,
    val authorUid: String? = null,
    val language: String? = null,
    val sortBy: SortBy = SortBy.NEWEST,
    val page: Int = 1,
    val pageSize: Int = 20,
) {
    init {
        require(page >= 1) { "page must be >= 1" }
        require(pageSize in 1..100) { "pageSize must be between 1 and 100" }
    }
}

enum class SortBy { NEWEST, OLDEST, PLACE }

/** Result from a paginated list query. */
data class PagedResult<T>(
    val items: List<T>,
    val total: Int,
    val page: Int,
    val pageSize: Int,
) {
    val hasMore: Boolean get() = page * pageSize < total
}

/** Contract for chapter storage — swap between in-memory and Firestore. */
interface ChapterRepository {
    /** Returns the next chapter number, allocated atomically. */
    suspend fun nextChapterNumber(): Int

    suspend fun create(chapter: Chapter): Chapter
    suspend fun getById(id: String): Chapter?
    suspend fun list(filter: ChapterFilter): PagedResult<Chapter>
    suspend fun update(id: String, patch: Chapter): Chapter
    suspend fun delete(id: String)

    /** Atomically set status (called by moderation pipeline). */
    suspend fun setStatus(id: String, status: ChapterStatus, reason: String? = null): Chapter

    /** Store embedding alongside the chapter. */
    suspend fun setEmbedding(id: String, embedding: List<Double>): Chapter

    /** Find the N closest chapters by cosine similarity. */
    suspend fun findSimilar(embedding: List<Double>, excludeId: String, limit: Int = 3): List<Chapter>

    /** List all chapters for a given author. */
    suspend fun listByAuthor(authorUid: String): List<Chapter>
}
