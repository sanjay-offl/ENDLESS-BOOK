package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

fun chapterSummaryOf(chapter: Chapter, excerptMaxChars: Int = 160): ChapterSummary =
    ChapterSummary(
        id = chapter.id,
        chapterNumber = chapter.chapterNumber,
        authorName = chapter.authorName,
        title = chapter.title,
        language = chapter.language,
        locationCity = chapter.locationCity,
        coverImageUrl = chapter.coverImageUrl,
        status = chapter.status,
        featured = chapter.featured,
        readingMinutes = chapter.readingMinutes,
        createdAt = chapter.createdAt,
    ).withExcerpt(chapter.excerpt(excerptMaxChars))

fun ChapterSummary.withExcerpt(text: String): ChapterSummary {
    excerptOverride = text
    return this
}

/** Build a summary from a chapter, keeping the excerpt separate from the row. */
fun summaryWithExcerpt(chapter: Chapter, excerptMaxChars: Int = 160): ChapterSummary =
    chapterSummaryOf(chapter, excerptMaxChars)