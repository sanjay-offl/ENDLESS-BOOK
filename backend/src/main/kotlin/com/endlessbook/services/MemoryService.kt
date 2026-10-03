package com.endlessbook.services

import com.endlessbook.firebase.FirebaseAdmin
import com.endlessbook.models.*
import com.google.cloud.firestore.Query
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MemoryService {
    private val db get() = FirebaseAdmin.firestore

    suspend fun getMemory(id: String): Memory? = withContext(Dispatchers.IO) {
        try {
            val doc = db.collection("memories").document(id).get().get()
            if (!doc.exists()) {
                ChapterService.fallbackMemories.find { it.id == id }
            } else {
                doc.toObject(Memory::class.java)!!.copy(id = doc.id)
            }
        } catch (e: Exception) {
            ChapterService.fallbackMemories.find { it.id == id }
        }
    }

    suspend fun createMemory(data: NewMemory, uid: String): Memory = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val displayName = try {
            FirebaseAuth.getInstance().getUser(uid).displayName ?: "Anonymous"
        } catch (e: Exception) {
            "Community Contributor"
        }

        try {
            val existing = db.collection("memories")
                .whereEqualTo("chapterId", data.chapterId).get().get().size()
            if (existing >= 3) error("Chapter is already full (3/3 pages)")

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
            val ref = db.collection("memories").add(memory).get()

            db.collection("chapters").document(data.chapterId)
                .update(mapOf("pageCount" to pageNum, "isOpen" to (pageNum < 3), "updatedAt" to now)).get()

            memory.copy(id = ref.id)
        } catch (e: Exception) {
            val existing = ChapterService.fallbackMemories.filter { it.chapterId == data.chapterId }.size
            if (existing >= 3) error("Chapter is already full (3/3 pages)")
            val pageNum = existing + 1
            val mem = Memory(
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
            ChapterService.fallbackMemories.add(mem)
            val chapIndex = ChapterService.fallbackChapters.indexOfFirst { it.id == data.chapterId }
            if (chapIndex >= 0) {
                val chap = ChapterService.fallbackChapters[chapIndex]
                ChapterService.fallbackChapters[chapIndex] = chap.copy(
                    pageCount = pageNum,
                    isOpen = pageNum < 3,
                    updatedAt = now
                )
            }
            mem
        }
    }

    suspend fun getMemoriesByUser(uid: String): List<Memory> = withContext(Dispatchers.IO) {
        try {
            db.collection("memories")
                .whereEqualTo("authorId", uid)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get().get().documents
                .map { it.toObject(Memory::class.java).copy(id = it.id) }
        } catch (e: Exception) {
            ChapterService.fallbackMemories.filter { it.authorId == uid }
        }
    }
}
