package com.endlessbook.shared.validation

import com.endlessbook.shared.model.ChapterLimits
import kotlin.math.roundToInt

/**
 * Every field level problem found in a chapter, keyed by field name so the
 * client can put the message under the right input.
 */
data class ValidationErrors(val fields: Map<String, String>) {
    val isValid: Boolean get() = fields.isEmpty()
    val first: String? get() = fields.values.firstOrNull()
    operator fun get(field: String): String? = fields[field]

    companion object {
        val NONE = ValidationErrors(emptyMap())
    }
}

/**
 * Validation shared by the writer studio and the API. The client runs it to
 * give instant feedback; the server runs it again because a client is never
 * trusted.
 */
object ChapterValidator {

    fun validate(
        title: String,
        pages: List<String>,
        language: String,
        locationCity: String,
        consent: Boolean = true,
    ): ValidationErrors {
        val errors = linkedMapOf<String, String>()

        val cleanTitle = title.trim()
        when {
            cleanTitle.isEmpty() -> errors["title"] = "Give the chapter a title."
            cleanTitle.length > ChapterLimits.TITLE_MAX ->
                errors["title"] = "Keep the title under ${ChapterLimits.TITLE_MAX} characters."
        }

        if (pages.size != ChapterLimits.PAGE_COUNT) {
            errors["pages"] = "A chapter is always exactly ${ChapterLimits.PAGE_COUNT} pages."
        } else {
            pages.forEachIndexed { index, page ->
                val trimmed = page.trim()
                when {
                    trimmed.isEmpty() ->
                        errors["page${index + 1}"] = "Page ${index + 1} is empty."
                    trimmed.length > ChapterLimits.PAGE_MAX_CHARS ->
                        errors["page${index + 1}"] =
                            "Page ${index + 1} is over ${ChapterLimits.PAGE_MAX_CHARS} characters."
                }
            }
        }

        if (language !in ChapterLimits.READER_LANGUAGES) {
            errors["language"] =
                "Write in one of ${ChapterLimits.READER_LANGUAGES.joinToString(", ")}."
        }

        val cleanCity = locationCity.trim()
        if (cleanCity.length > ChapterLimits.LOCATION_CITY_MAX) {
            errors["locationCity"] =
                "Use the city name only, under ${ChapterLimits.LOCATION_CITY_MAX} characters."
        }
        if (containsStreetAddress(cleanCity)) {
            errors["locationCity"] = "City only. Please leave out house and street numbers."
        }

        if (!consent) {
            errors["consent"] = "Please confirm you have permission to publish this memory."
        }

        return ValidationErrors(errors)
    }

    /**
     * A city field must not carry a street address. Moderation flags personal
     * data, so the client refuses it up front with a gentler message.
     */
    fun containsStreetAddress(text: String): Boolean {
        if (text.isBlank()) return false
        val digitThenWord = Regex("\\b\\d{1,5}\\s+[A-Za-z]{3,}")
        val pinCode = Regex("\\b[0-9]{6}\\b")
        val houseWord = Regex("\\b(house|flat|apartment|door|no\\.?|number)\\b", RegexOption.IGNORE_CASE)
        return digitThenWord.containsMatchIn(text) || pinCode.containsMatchIn(text) || houseWord.containsMatchIn(text)
    }

    /**
     * Phone numbers are personal data too. Used by the moderator and by the
     * weave diff so the writer sees the flag before publishing.
     *
     * Covers the formats Indian readers actually type: ten digits running
     * together, five and five, three-three-four, with an optional +91 or 0.
     */
    fun containsPhoneNumber(text: String): Boolean = PHONE_PATTERNS.any { it.containsMatchIn(text) }

    private val PHONE_PATTERNS = listOf(
        // 9876543210, +91 9876543210, 09876543210
        Regex("""(?<![\d])(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?![\d])"""),
        // 98765 43210, 98765-43210
        Regex("""(?<![\d])[6-9]\d{4}[\s-]\d{5}(?![\d])"""),
        // 98765 43210 with the leading zero and country code
        Regex("""(?<![\d])\+?91[\s-]?[6-9]\d{4}[\s-]?\d{5}(?![\d])"""),
        // 987-654-3210, older three three four grouping
        Regex("""(?<![\d])[6-9]\d{2}[\s-]\d{3}[\s-]\d{4}(?![\d])"""),
    )

    /** Rough reading time for three pages. Always between two and three. */
    fun readingMinutes(pages: List<String>): Int {
        val words = pages.sumOf { it.split(WHITESPACE).count(String::isNotBlank) }
        val minutes = (words / WORDS_PER_MINUTE).toDouble()
        return minutes.roundToInt().coerceIn(2, 3)
    }

    private const val WORDS_PER_MINUTE = 200
    private val WHITESPACE = Regex("\\s+")
}

/**
 * Approximate words per page. The Weaver asks the model for balanced pages
 * using this, and the diff view warns when a page is far off.
 */
object PageBalance {
    private const val IDEAL_CHARS_PER_PAGE = 900

    fun balance(pages: List<String>): List<Double> {
        if (pages.isEmpty()) return emptyList()
        val average = pages.sumOf(String::length).toDouble() / pages.size
        if (average <= 0) return pages.map { 0.0 }
        return pages.map { it.length / average }
    }

    fun isBalanced(pages: List<String>): Boolean =
        balance(pages).all { it in 0.6..1.4 }

    fun charsPerPage(pages: List<String>): Int = IDEAL_CHARS_PER_PAGE
}