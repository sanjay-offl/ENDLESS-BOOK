package com.endlessbook.server.infra

import com.endlessbook.server.domain.*
import com.endlessbook.shared.model.Chapter
import com.endlessbook.shared.model.ChapterStatus
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.time.Instant
import java.util.UUID
import kotlin.math.sqrt

/**
 * Thread-safe in-memory ChapterRepository.
 * Used for local development, integration tests, and CI.
 * Every mutating operation locks a single mutex so concurrent number allocation is safe.
 */
class InMemoryChapterRepository : ChapterRepository {

    private val mutex = Mutex()
    private val store = mutableMapOf<String, Chapter>()
    private var counter = 0

    override suspend fun nextChapterNumber(): Int = mutex.withLock { ++counter }

    override suspend fun create(chapter: Chapter): Chapter = mutex.withLock {
        val saved = chapter.copy(
            createdAt = Instant.now().toString(),
            updatedAt = Instant.now().toString(),
        )
        store[saved.id] = saved
        saved
    }

    override suspend fun getById(id: String): Chapter? = mutex.withLock { store[id] }

    override suspend fun list(filter: ChapterFilter): PagedResult<Chapter> = mutex.withLock {
        var items = store.values.toList()

        // Filter
        if (filter.status != null) items = items.filter { it.status == filter.status }
        if (filter.featured != null) items = items.filter { it.featured == filter.featured }
        if (filter.authorUid != null) items = items.filter { it.authorUid == filter.authorUid }
        if (filter.language != null) items = items.filter { it.language == filter.language }

        // Sort
        items = when (filter.sortBy) {
            SortBy.NEWEST -> items.sortedByDescending { it.createdAt }
            SortBy.OLDEST -> items.sortedBy { it.createdAt }
            SortBy.PLACE  -> items.sortedBy { it.locationCity }
        }

        val total = items.size
        val from = ((filter.page - 1) * filter.pageSize).coerceAtMost(total)
        val to   = (from + filter.pageSize).coerceAtMost(total)
        PagedResult(items = items.subList(from, to), total = total, page = filter.page, pageSize = filter.pageSize)
    }

    override suspend fun update(id: String, patch: Chapter): Chapter = mutex.withLock {
        val existing = store[id] ?: throw NotFoundException("Chapter", id)
        val updated = existing.copy(
            title         = patch.title.ifBlank { existing.title },
            pages         = patch.pages.ifEmpty  { existing.pages },
            language      = patch.language.ifBlank { existing.language },
            locationCity  = patch.locationCity,
            coordinates   = patch.coordinates ?: existing.coordinates,
            coverImageUrl = patch.coverImageUrl ?: existing.coverImageUrl,
            audioUrl      = patch.audioUrl      ?: existing.audioUrl,
            updatedAt     = Instant.now().toString(),
        )
        store[id] = updated
        updated
    }

    override suspend fun delete(id: String) = mutex.withLock {
        store.remove(id) ?: throw NotFoundException("Chapter", id)
        Unit
    }

    override suspend fun setStatus(id: String, status: ChapterStatus, reason: String?): Chapter = mutex.withLock {
        val existing = store[id] ?: throw NotFoundException("Chapter", id)
        val updated = existing.copy(status = status, updatedAt = Instant.now().toString())
        store[id] = updated
        updated
    }

    override suspend fun setEmbedding(id: String, embedding: List<Double>): Chapter = mutex.withLock {
        val existing = store[id] ?: throw NotFoundException("Chapter", id)
        val updated = existing.copy(embedding = embedding, updatedAt = Instant.now().toString())
        store[id] = updated
        updated
    }

    override suspend fun findSimilar(
        embedding: List<Double>,
        excludeId: String,
        limit: Int,
    ): List<Chapter> = mutex.withLock {
        store.values
            .filter { it.id != excludeId && it.status == ChapterStatus.published && it.embedding != null }
            .map { chapter -> chapter to cosineSimilarity(embedding, chapter.embedding!!) }
            .sortedByDescending { (_, score) -> score }
            .take(limit)
            .map { (chapter, _) -> chapter }
    }

    override suspend fun listByAuthor(authorUid: String): List<Chapter> = mutex.withLock {
        store.values.filter { it.authorUid == authorUid }.sortedByDescending { it.createdAt }
    }

    /** Exposed for seeding in tests. */
    fun seed(chapter: Chapter) {
        store[chapter.id] = chapter
        if (chapter.chapterNumber > counter) counter = chapter.chapterNumber
    }

    fun clear() {
        store.clear()
        counter = 0
    }

    // ── cosine similarity ──────────────────────────────────────────────────
    private fun cosineSimilarity(a: List<Double>, b: List<Double>): Double {
        if (a.size != b.size || a.isEmpty()) return 0.0
        var dot = 0.0; var normA = 0.0; var normB = 0.0
        for (i in a.indices) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i] }
        val denom = sqrt(normA) * sqrt(normB)
        return if (denom == 0.0) 0.0 else dot / denom
    }
}
