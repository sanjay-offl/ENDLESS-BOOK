package com.endlessbook.shared.validation

import com.endlessbook.shared.model.ChapterLimits
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ChapterValidatorTest {

    private fun valid() = ChapterValidator.validate(
        title = "The Wheel Cart of Bangles",
        pages = listOf("One.", "Two.", "Three."),
        language = "en",
        locationCity = "Coimbatore",
        consent = true,
    )

    @Test
    fun acceptsAGoodChapter() {
        assertTrue(valid().isValid)
        assertNull(valid()["title"])
    }

    @Test
    fun rejectsBlankTitle() {
        val errors = ChapterValidator.validate("   ", listOf("a", "b", "c"), "en", "Chennai")
        assertNotNull(errors["title"])
    }

    @Test
    fun rejectsTitleOverLimit() {
        val long = "x".repeat(ChapterLimits.TITLE_MAX + 1)
        val errors = ChapterValidator.validate(long, listOf("a", "b", "c"), "en", "Chennai")
        assertNotNull(errors["title"])
    }

    @Test
    fun acceptsTitleExactlyAtLimit() {
        val exact = "x".repeat(ChapterLimits.TITLE_MAX)
        val errors = ChapterValidator.validate(exact, listOf("a", "b", "c"), "en", "Chennai")
        assertNull(errors["title"])
    }

    @Test
    fun rejectsWrongPageCount() {
        val twoPages = ChapterValidator.validate("Title", listOf("a", "b"), "en", "Chennai")
        assertNotNull(twoPages["pages"])

        val fourPages = ChapterValidator.validate("Title", listOf("a", "b", "c", "d"), "en", "Chennai")
        assertNotNull(fourPages["pages"])
    }

    @Test
    fun acceptsExactlyThreePages() {
        val errors = ChapterValidator.validate("Title", listOf("a", "b", "c"), "en", "Chennai")
        assertNull(errors["pages"])
    }

    @Test
    fun rejectsBlankPageAndNamesIt() {
        val errors = ChapterValidator.validate("Title", listOf("a", "  ", "c"), "en", "Chennai")
        assertNotNull(errors["page2"])
        assertNull(errors["page1"])
    }

    @Test
    fun rejectsPageOverCharacterLimit() {
        val long = "x".repeat(ChapterLimits.PAGE_MAX_CHARS + 1)
        val errors = ChapterValidator.validate("Title", listOf("a", "b", long), "en", "Chennai")
        assertNotNull(errors["page3"])
        println("DBG errors=$errors page1=${errors["page1"]} page3=${errors["page3"]}")
        assertNull(errors["page1"])
    }

    @Test
    fun acceptsPageExactlyAtCharacterLimit() {
        val exact = "x".repeat(ChapterLimits.PAGE_MAX_CHARS)
        val errors = ChapterValidator.validate("Title", listOf(exact, "b", "c"), "en", "Chennai")
        assertNull(errors["page1"])
    }

    @Test
    fun rejectsUnsupportedLanguage() {
        val errors = ChapterValidator.validate("Title", listOf("a", "b", "c"), "fr", "Chennai")
        assertNotNull(errors["language"])
    }

    @Test
    fun acceptsEveryReaderLanguage() {
        for (code in ChapterLimits.READER_LANGUAGES) {
            val errors = ChapterValidator.validate("Title", listOf("a", "b", "c"), code, "Chennai")
            assertNull(errors["language"], "expected $code to be supported")
        }
    }

    @Test
    fun rejectsStreetAddressInCityField() {
        val errors = ChapterValidator.validate("Title", listOf("a", "b", "c"), "en", "12 Gandhi Street")
        assertNotNull(errors["locationCity"])
    }

    @Test
    fun rejectsPinCodeInCityField() {
        assertTrue(ChapterValidator.containsStreetAddress("Coimbatore 641001"))
    }

    @Test
    fun acceptsPlainCityName() {
        assertFalse(ChapterValidator.containsStreetAddress("Coimbatore"))
        assertFalse(ChapterValidator.containsStreetAddress("New Delhi"))
        assertFalse(ChapterValidator.containsStreetAddress("Kochi"))
    }

    @Test
    fun detectsIndianPhoneNumbers() {
        assertTrue(ChapterValidator.containsPhoneNumber("call me on 9876543210"))
        assertTrue(ChapterValidator.containsPhoneNumber("98765 43210"))
        assertTrue(ChapterValidator.containsPhoneNumber("98765-43210"))
        assertTrue(ChapterValidator.containsPhoneNumber("+91 9876543210"))
        assertTrue(ChapterValidator.containsPhoneNumber("987-654-3210"))
        assertFalse(ChapterValidator.containsPhoneNumber("we lived at number 3"))
        assertFalse(ChapterValidator.containsPhoneNumber("three of us shared one cycle"))
        assertFalse(ChapterValidator.containsPhoneNumber("chapter 4 was written in 1998"))
    }

    @Test
    fun requiresConsent() {
        val errors = ChapterValidator.validate(
            "Title", listOf("a", "b", "c"), "en", "Chennai", consent = false
        )
        assertNotNull(errors["consent"])
    }

    @Test
    fun readingTimeStaysBetweenTwoAndThreeMinutes() {
        assertEquals(2, ChapterValidator.readingMinutes(listOf("short", "pages", "here")))
        val long = List(3) { "word ".repeat(400) }
        assertEquals(3, ChapterValidator.readingMinutes(long))
    }

    @Test
    fun pageBalanceDetectsLopsidedPages() {
        val even = listOf("a".repeat(100), "b".repeat(100), "c".repeat(100))
        assertTrue(PageBalance.isBalanced(even))

        val lopsided = listOf("a".repeat(10), "b".repeat(10), "c".repeat(1000))
        assertFalse(PageBalance.isBalanced(lopsided))
    }
}

class DraftValidatorTest {

    @Test
    fun rejectsEmptyDraft() {
        assertNotNull(DraftValidator.validate("").first)
    }

    @Test
    fun rejectsTooShortDraft() {
        assertNotNull(DraftValidator.validate("too short").first)
    }

    @Test
    fun acceptsAReasonableDraft() {
        assertTrue(DraftValidator.validate("Once there was a cart of bangles on our street.").isValid)
    }

    @Test
    fun rejectsEnormousDraft() {
        assertNotNull(DraftValidator.validate("x".repeat(DraftValidator.DRAFT_MAX_CHARS + 1)).first)
    }
}

class PagingTest {

    @Test
    fun defaultsAreApplied() {
        assertEquals(Paging.DEFAULT_PAGE, Paging.normalisePage(null))
        assertEquals(Paging.DEFAULT_PAGE_SIZE, Paging.normalisePageSize(null))
    }

    @Test
    fun pageSizeIsCapped() {
        assertEquals(Paging.MAX_PAGE_SIZE, Paging.normalisePageSize("5000"))
        assertEquals(1, Paging.normalisePageSize("0"))
    }

    @Test
    fun negativePagesFallBackToOne() {
        assertEquals(1, Paging.normalisePage("-3"))
        assertEquals(1, Paging.normalisePage("nonsense"))
    }

    @Test
    fun requestCapsAcceptOnlyKnownUploads() {
        assertTrue(RequestCaps.isSupportedUpload("cover", "image/jpeg"))
        assertTrue(RequestCaps.isSupportedUpload("audio", "audio/webm"))
        assertFalse(RequestCaps.isSupportedUpload("cover", "application/x-msdownload"))
        assertFalse(RequestCaps.isSupportedUpload("script", "image/jpeg"))
    }
}