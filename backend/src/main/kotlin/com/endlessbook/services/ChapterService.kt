package com.endlessbook.services

import com.endlessbook.firebase.FirebaseAdmin
import com.endlessbook.models.*
import com.google.cloud.firestore.Query
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ChapterService {
    private val db get() = FirebaseAdmin.firestore

    suspend fun getAllChapters(): List<Chapter> = withContext(Dispatchers.IO) {
        try {
            db.collection("chapters")
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get().get().documents
                .map { it.toObject(Chapter::class.java).copy(id = it.id) }
        } catch (e: Exception) {
            fallbackChapters
        }
    }

    suspend fun getChapterWithMemories(id: String): ChapterDetail? = withContext(Dispatchers.IO) {
        try {
            val doc = db.collection("chapters").document(id).get().get()
            if (!doc.exists()) {
                val fallback = fallbackChapters.find { it.id == id } ?: return@withContext null
                val mems = fallbackMemories.filter { it.chapterId == id }
                return@withContext ChapterDetail(fallback, mems)
            }
            val chapter = doc.toObject(Chapter::class.java)!!.copy(id = doc.id)
            val memories = db.collection("memories")
                .whereEqualTo("chapterId", id)
                .orderBy("pageNum")
                .get().get().documents
                .map { it.toObject(Memory::class.java).copy(id = it.id) }
            ChapterDetail(chapter, memories)
        } catch (e: Exception) {
            val fallback = fallbackChapters.find { it.id == id } ?: return@withContext null
            val mems = fallbackMemories.filter { it.chapterId == id }
            ChapterDetail(fallback, mems)
        }
    }

    suspend fun createChapter(data: NewChapter, uid: String): Chapter = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val displayName = try {
            FirebaseAuth.getInstance().getUser(uid).displayName ?: "Anonymous"
        } catch (e: Exception) {
            "Community Contributor"
        }

        try {
            val count = db.collection("chapters").get().get().size()
            val chapter = Chapter(
                number = count + 1,
                title = data.title,
                founderId = uid,
                founderName = displayName,
                founderCity = "",
                pageCount = 0,
                isOpen = true,
                tags = data.tags,
                createdAt = now,
                updatedAt = now,
            )
            val ref = db.collection("chapters").add(chapter).get()
            chapter.copy(id = ref.id)
        } catch (e: Exception) {
            val count = fallbackChapters.size
            val fallback = Chapter(
                id = "chapter-${count + 1}",
                number = count + 1,
                title = data.title,
                founderId = uid,
                founderName = displayName,
                founderCity = "",
                pageCount = 0,
                isOpen = true,
                tags = data.tags,
                createdAt = now,
                updatedAt = now,
            )
            fallbackChapters.add(0, fallback)
            fallback
        }
    }

    companion object {
        val fallbackChapters = mutableListOf(
            Chapter(
                id = "chapter-1",
                number = 1,
                title = "The Summer The Streetlights Never Came On",
                founderId = "user-1",
                founderName = "Elena Vance",
                founderCity = "Port Townsend, WA",
                pageCount = 3,
                isOpen = false,
                tags = listOf("Summer", "Storms", "1994"),
                createdAt = 1717200000000L,
                updatedAt = 1717250000000L
            ),
            Chapter(
                id = "chapter-2",
                number = 2,
                title = "The Blue Rooftops of Old Town",
                founderId = "user-2",
                founderName = "Marcus Thorne",
                founderCity = "Lisbon, Portugal",
                pageCount = 2,
                isOpen = true,
                tags = listOf("Rooftops", "Adventure", "Twilight"),
                createdAt = 1717300000000L,
                updatedAt = 1717350000000L
            ),
            Chapter(
                id = "chapter-3",
                number = 3,
                title = "The Attic With The Saltwater Smell",
                founderId = "user-3",
                founderName = "Aoi Takahashi",
                founderCity = "Kamakura, Japan",
                pageCount = 1,
                isOpen = true,
                tags = listOf("Ocean", "Attic", "Secret Places"),
                createdAt = 1717400000000L,
                updatedAt = 1717450000000L
            )
        )

        val fallbackMemories = mutableListOf(
            Memory(
                id = "mem-1-1",
                chapterId = "chapter-1",
                pageNum = 1,
                title = "When The Power Cut In August",
                body = "The storm did not arrive with rain. It came with a copper sky and a silence that felt heavier than wet wool blankets. Everyone in our neighborhood stopped mowing lawns and painting porches. By eight in the evening, the streetlights failed to hum their familiar amber song. In their absence, the stars were so thick you could read the headlines of the evening paper on our driveway.",
                authorId = "user-1",
                authorName = "Elena Vance",
                authorCity = "Port Townsend, WA",
                imageUrl = "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80",
                tags = listOf("Summer", "Storms"),
                createdAt = 1717200000000L
            ),
            Memory(
                id = "mem-1-2",
                chapterId = "chapter-1",
                pageNum = 2,
                title = "Ice Cream In The Darkness",
                body = "Every parent in the cul-de-sac brought their melting tubs of Neapolitan ice cream to the circle. We ate strawberry stripes with aluminum soup spoons before the chocolate turned to soup. Nobody scolded anyone for dripping onto their bare knees. We learned that night what darkness smelled like when you weren't afraid of it.",
                authorId = "user-4",
                authorName = "Julian Rowe",
                authorCity = "Seattle, WA",
                imageUrl = null,
                tags = listOf("Neighborhood", "Midnight"),
                createdAt = 1717220000000L
            ),
            Memory(
                id = "mem-1-3",
                chapterId = "chapter-1",
                pageNum = 3,
                title = "The Morning After The Blackout",
                body = "Waking up before dawn, the world felt reconstructed from memory alone. The birds didn't seem confused by the silence of the grid. By seven, the refrigerator gave a violent shudder and groaned back to life, and just like that, childhood resumed its ordinary broadcast.",
                authorId = "user-5",
                authorName = "Clara O'Shea",
                authorCity = "Tacoma, WA",
                imageUrl = null,
                tags = listOf("Morning", "Grid"),
                createdAt = 1717250000000L
            ),
            Memory(
                id = "mem-2-1",
                chapterId = "chapter-2",
                pageNum = 1,
                title = "The Terracotta Labyrinth",
                body = "From my grandmother's third-floor window, the city was not streets and cobblestones, but an endless staircase of fired clay. We could walk three whole city blocks without touching the pavement, jumping gutters where the pigeons gathered at dusk.",
                authorId = "user-2",
                authorName = "Marcus Thorne",
                authorCity = "Lisbon, Portugal",
                imageUrl = "https://images.unsplash.com/photo-1513688285373-4ec92273f679?auto=format&fit=crop&w=1200&q=80",
                tags = listOf("Rooftops", "Adventure"),
                createdAt = 1717300000000L
            ),
            Memory(
                id = "mem-2-2",
                chapterId = "chapter-2",
                pageNum = 2,
                title = "Losing A Shoe Over Rua Da Bica",
                body = "My left espadrille slipped between the rain gutters and plummeted into a stranger's laundry line three stories below. We spent forty-five minutes trying to fish it back with an unraveled wire hanger. We never got it, but the old woman gave us warm sweet bread anyway.",
                authorId = "user-6",
                authorName = "Sofia Silva",
                authorCity = "Lisbon, Portugal",
                imageUrl = null,
                tags = listOf("Laughter", "Laundry"),
                createdAt = 1717350000000L
            ),
            Memory(
                id = "mem-3-1",
                chapterId = "chapter-3",
                pageNum = 1,
                title = "The Cedar Trunk Behind The Screen",
                body = "In the monsoon month of June, my sister and I hid in the crawl space under the eaves. The sea breeze made the cedar rafters whistle like a bamboo flute. Inside an abandoned tea tin, we found postcards dated 1964 addressed to someone with our mother's maiden name.",
                authorId = "user-3",
                authorName = "Aoi Takahashi",
                authorCity = "Kamakura, Japan",
                imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                tags = listOf("Ocean", "Attic"),
                createdAt = 1717400000000L
            )
        )
    }
}
