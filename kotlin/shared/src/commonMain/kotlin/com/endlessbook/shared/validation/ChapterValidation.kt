package com.endlessbook.shared.validation

/** All hard limits shared between client and server so they stay in sync. */
object ChapterLimits {
    const val TITLE_MAX = 80
    const val PAGE_COUNT = 3
    const val PAGE_MAX_CHARS = 1500
    const val LOCATION_CITY_MAX = 120
    const val SUPPORTED_LANGUAGES = "en,ta,hi,te,ml,kn"
}

/** Returns null if valid, else a human-readable error string. */
fun validateCreateChapter(
    title: String,
    pages: List<String>,
    language: String,
    locationCity: String,
): String? {
    if (title.isBlank()) return "title must not be blank"
    if (title.length > ChapterLimits.TITLE_MAX)
        return "title must be at most ${ChapterLimits.TITLE_MAX} characters"
    if (pages.size != ChapterLimits.PAGE_COUNT)
        return "a chapter must have exactly ${ChapterLimits.PAGE_COUNT} pages"
    pages.forEachIndexed { i, page ->
        if (page.isBlank()) return "page ${i + 1} must not be blank"
        if (page.length > ChapterLimits.PAGE_MAX_CHARS)
            return "page ${i + 1} must be at most ${ChapterLimits.PAGE_MAX_CHARS} characters"
    }
    val supported = ChapterLimits.SUPPORTED_LANGUAGES.split(",")
    if (language !in supported) return "language '$language' is not supported; use one of $supported"
    if (locationCity.length > ChapterLimits.LOCATION_CITY_MAX)
        return "locationCity must be at most ${ChapterLimits.LOCATION_CITY_MAX} characters"
    return null
}
