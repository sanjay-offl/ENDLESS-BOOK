package com.endlessbook.shared.model

/**
 * Every chapter is exactly three pages, which is roughly two to three minutes
 * of reading. The count is a constant, never a preference.
 */
const val PAGES_PER_CHAPTER = 3

/** Hard limits shared by client and server so both sides agree. */
object ChapterLimits {
    /** Maximum chapter title length. */
    const val TITLE_MAX = 80

    /** Exactly three pages, never fewer, never more. */
    const val PAGE_COUNT = PAGES_PER_CHAPTER

    /** Maximum characters in a single page. */
    const val PAGE_MAX_CHARS = 1500

    /** City level only. Never a street address. */
    const val LOCATION_CITY_MAX = 120

    /** Dimensionality of the stored chapter embedding. */
    const val EMBEDDING_DIMS = 768

    /** Languages the reader interface supports, in display order. */
    val READER_LANGUAGES: List<String> = listOf("en", "ta", "hi", "te", "ml", "kn")

    /** Translation targets offered by the reader. English is the source. */
    val TRANSLATION_TARGETS: List<String> = listOf("ta", "hi", "te", "ml", "kn")

    /** BCP-47 hints handed to Speech-to-Text for each supported language. */
    val SPEECH_LOCALES: Map<String, List<String>> = mapOf(
        "en" to listOf("en-IN", "en-US"),
        "ta" to listOf("ta-IN"),
        "hi" to listOf("hi-IN"),
        "te" to listOf("te-IN"),
        "ml" to listOf("ml-IN"),
        "kn" to listOf("kn-IN"),
    )

    /** Human readable names, used by the language dropdown in the reader. */
    val LANGUAGE_NAMES: Map<String, String> = mapOf(
        "en" to "English",
        "ta" to "தமிழ்",
        "hi" to "हिन्दी",
        "te" to "తెలుగు",
        "ml" to "മലയാളം",
        "kn" to "ಕನ್ನಡ",
    )
}