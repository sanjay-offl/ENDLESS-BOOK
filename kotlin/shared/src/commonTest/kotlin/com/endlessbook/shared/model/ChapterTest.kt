package com.endlessbook.shared.model

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ChapterTest {

    private val chapter = Chapter(
        id = "c1",
        chapterNumber = 1,
        title = "The Wheel Cart of Bangles",
        authorName = "Sanjay",
        pages = listOf(
            "The cart came down our street on Tuesdays, pulled by a man who never spoke.",
            "We chose one bangle each and paid in coins warm from my mother's tin.",
            "I still hear the small bell when he turned the corner, even now.",
        ),
    )

    @Test
    fun withoutInternalsStripsEmbedding() {
        val withEmbedding = chapter.copy(embedding = List(ChapterLimits.EMBEDDING_DIMS) { 0.1 })
        assertNull(withEmbedding.withoutInternals().embedding)
        assertEquals(ChapterLimits.EMBEDDING_DIMS, withEmbedding.embedding?.size)
    }

    @Test
    fun excerptStopsAtAWordBoundary() {
        val long = Chapter(pages = listOf("one two three four five six seven eight nine ten"))
        val excerpt = long.excerpt(maxChars = 20)
        assertFalse(excerpt.endsWith(" "))
        assertTrue(excerpt.length <= 21)
    }

    @Test
    fun excerptHandlesEmptyPages() {
        assertEquals("", Chapter(pages = emptyList()).excerpt())
    }

    @Test
    fun onlyPublishedIsPublic() {
        assertTrue(ChapterStatus.published.isPublic)
        assertFalse(ChapterStatus.pending.isPublic)
        assertFalse(ChapterStatus.rejected.isPublic)
        assertFalse(ChapterStatus.needsReview.isPublic)
    }

    @Test
    fun statusLabelsAreShort() {
        assertEquals("pending", ChapterStatus.pending.label)
        assertEquals("live", ChapterStatus.published.label)
        assertEquals("declined", ChapterStatus.rejected.label)
        assertEquals("in review", ChapterStatus.needsReview.label)
    }

    @Test
    fun summaryCarriesAnExcerpt() {
        val summary = chapterSummaryOf(chapter)
        assertEquals("The Wheel Cart of Bangles", summary.title)
        assertTrue(summary.excerpt.startsWith("The cart came down"))
        assertEquals(1, summary.chapterNumber)
    }
}

class LanguageTest {

    @Test
    fun everyReaderLanguageHasANameAndSpeechHints() {
        for (code in ChapterLimits.READER_LANGUAGES) {
            assertTrue(ChapterLimits.LANGUAGE_NAMES.containsKey(code), "missing name for $code")
            assertTrue(ChapterLimits.SPEECH_LOCALES.containsKey(code), "missing speech hints for $code")
        }
    }

    @Test
    fun translationTargetsExcludeEnglish() {
        assertFalse(ChapterLimits.TRANSLATION_TARGETS.contains("en"))
        assertEquals(5, ChapterLimits.TRANSLATION_TARGETS.size)
    }
}