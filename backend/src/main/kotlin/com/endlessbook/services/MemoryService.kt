package com.endlessbook.services

import com.endlessbook.firebase.FirebaseAdmin
import com.endlessbook.models.*
import com.google.cloud.firestore.Query
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Every chapter holds exactly three pages. */
const val PAGES_PER_CHAPTER = 3

/** Raised when a contribution targets a chapter that already holds all of its pages. */
class ChapterFullException :
    IllegalStateException("Chapter is already full ($PAGES_PER_CHAPTER/$PAGES_PER_CHAPTER pages)")

/**
 * Reads and writes memory pages, falling back to the in-memory seed data in
 * [ChapterService] when Firestore is unavailable.
 */
class MemoryService {
    private val db get() = FirebaseAdmin.firestore

    suspend fun getMemory(id: String): Memory? = withContext(Dispatchers.IO) {
        val firestore = db
        if (firestore == null) return@withContext offlineMemories().find { it.id == id }
        try {
            val doc = firestore.collection("memories").document(id).get().get()
            if (doc.exists()) {
                doc.toObject(Memory::class.java)!!.copy(id = doc.id)
            } else {
                offlineMemories().find { it.id == id }
            }
        } catch (e: Exception) {
            offlineMemories().find { it.id == id }
        }
    }

    suspend fun createMemory(data: NewMemory, uid: String): Memory = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val displayName = FirebaseService().getUser(uid)?.displayName ?: "Community Contributor"

        // The capacity guard is a separate function on purpose. An `error(...)` call inside
        // the try block below would be caught by that same block's catch, which then fell
        // through to the offline branch and accepted a fourth page.
        val enforceCapacity: (Int) -> Unit = { existing ->
            if (existing >= PAGES_PER_CHAPTER) throw ChapterFullException()
        }

        val firestore = db
        if (firestore != null) {
            try {
                val existing = firestore.collection("memories")
                    .whereEqualTo("chapterId", data.chapterId).get().get().size()
                enforceCapacity(existing)

                val pageNum = existing + 1
                val memory = Memory(
                    chapterId = data.chapterId,
                    pageNum = pageNum,
                    title = data.title,
                    body = data.body,
                    authorId = uid,
                    authorName = displayName,
                    authorCity = data.authorCity,
                    imageUrl = data.imageUrl,
                    tags = data.tags,
                    createdAt = now,
                )
                val ref = firestore.collection("memories").add(memory).get()

                firestore.collection("chapters").document(data.chapterId)
                    .update(
                        mapOf(
                            "pageCount" to pageNum,
                            "isOpen" to (pageNum < PAGES_PER_CHAPTER),
                            "updatedAt" to now
                        )
                    ).get()

                return@withContext memory.copy(id = ref.id)
            } catch (e: ChapterFullException) {
                // A full chapter is a client error, not a reason to fall back to offline
                // storage, which would otherwise append past the three-page limit.
                throw e
            } catch (e: Exception) {
                // Fall through to the offline branch below.
            }
        }

        val pageNum = synchronized(ChapterService.fallbackMemories) {
            val existing = ChapterService.fallbackMemories.count { it.chapterId == data.chapterId }
            enforceCapacity(existing)
            existing + 1
        }

        val memory = Memory(
            id = "mem-${data.chapterId}-$pageNum-$now",
            chapterId = data.chapterId,
            pageNum = pageNum,
            title = data.title,
            body = data.body,
            authorId = uid,
            authorName = displayName,
            authorCity = data.authorCity,
            imageUrl = data.imageUrl,
            tags = data.tags,
            createdAt = now,
        )

        synchronized(ChapterService.fallbackMemories) { ChapterService.fallbackMemories.add(memory) }
        synchronized(ChapterService.fallbackChapters) {
            val index = ChapterService.fallbackChapters.indexOfFirst { it.id == data.chapterId }
            if (index >= 0) {
                val chapter = ChapterService.fallbackChapters[index]
                ChapterService.fallbackChapters[index] = chapter.copy(
                    pageCount = pageNum,
                    isOpen = pageNum < PAGES_PER_CHAPTER,
                    updatedAt = now
                )
            }
        }

        memory
    }

    suspend fun getMemoriesByUser(uid: String): List<Memory> = withContext(Dispatchers.IO) {
        val firestore = db
        if (firestore == null) return@withContext offlineMemories().filter { it.authorId == uid }
        try {
            firestore.collection("memories")
                .whereEqualTo("authorId", uid)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get().get().documents
                .map { it.toObject(Memory::class.java).copy(id = it.id) }
        } catch (e: Exception) {
            offlineMemories().filter { it.authorId == uid }
        }
    }

    private fun offlineMemories(): List<Memory> =
        synchronized(ChapterService.fallbackMemories) { ChapterService.fallbackMemories.toList() }
}
