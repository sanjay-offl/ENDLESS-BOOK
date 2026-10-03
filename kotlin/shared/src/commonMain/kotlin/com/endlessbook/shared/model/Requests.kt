package com.endlessbook.shared.model

import kotlinx.serialization.Serializable

/** Body of `POST /v1/chapters`. */
@Serializable
data class CreateChapterRequest(
    val title: String = "",
    val pages: List<String> = emptyList(),
    val language: String = "en",
    /** City only. Moderation flags anything that looks like a full address. */
    val locationCity: String = "",
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
    /** The writer must tick this before a chapter can be published. */
    val consent: Boolean = false,
)

/** Body of `PUT /v1/chapters/{id}`. Absent fields are left untouched. */
@Serializable
data class UpdateChapterRequest(
    val title: String? = null,
    val pages: List<String>? = null,
    val language: String? = null,
    val locationCity: String? = null,
    val coordinates: GeoPoint? = null,
    val coverImageUrl: String? = null,
    val audioUrl: String? = null,
)

/** Body of `POST /v1/agent/weave`, the AI Page Weaver. */
@Serializable
data class WeaveRequest(
    /** Rambling draft or voice transcript, in any supported language. */
    val draft: String = "",
    val language: String = "en",
    /** Optional nudge for the title the model proposes. */
    val titleHint: String? = null,
)

/**
 * Weaver output. Always a poetic title and exactly three balanced pages.
 * [accepted] marks which pages the writer kept, used for the diff underline.
 */
@Serializable
data class WeaveResponse(
    val title: String = "",
    val pages: List<String> = emptyList(),
    val language: String = "en",
    /** One short note per page explaining what changed, shown under the diff. */
    val notes: List<String> = emptyList(),
    /** False when the model failed twice and the raw draft was returned instead. */
    val modelUsed: Boolean = true,
)

/** Body of `POST /v1/voice/transcribe`. */
@Serializable
data class TranscribeRequest(
    /** Signed URL of the uploaded audio, or a data URL for small clips. */
    val audioUrl: String = "",
    /** Language hints, e.g. ["ta-IN", "en-IN"]. Empty means automatic. */
    val languageHints: List<String> = emptyList(),
    /** Preferred language of the writer, used to order the hints. */
    val language: String? = null,
)

/** Speech-to-Text result. */
@Serializable
data class TranscribeResponse(
    val transcript: String = "",
    /** Detected or supplied language code. */
    val language: String = "en",
    /** Per word timings are not stored; this is the overall confidence. */
    val confidence: Double = 0.0,
)

/** A cached translation of one chapter into one language. */
@Serializable
data class Translation(
    val chapterId: String = "",
    val language: String = "en",
    val title: String = "",
    val pages: List<String> = emptyList(),
    /** True when served from Firestore instead of calling the model again. */
    val fromCache: Boolean = false,
    val createdAt: String = "",
)

/** Body of `POST /v1/upload/sign`. */
@Serializable
data class SignUploadRequest(
    /** `cover` or `audio`. */
    val kind: String = "cover",
    val contentType: String = "image/jpeg",
    /** Original file name, used to build a readable object path. */
    val fileName: String = "upload.jpg",
)

/** Response of `POST /v1/upload/sign`. */
@Serializable
data class SignUploadResponse(
    /** PUT this URL with the raw bytes. */
    val uploadUrl: String = "",
    /** Store this on the chapter once the upload succeeds. */
    val fileUrl: String = "",
    val expiresInSeconds: Int = 900,
)

/** Body of `POST /v1/analytics/event`. */
@Serializable
data class AnalyticsEventRequest(
    /** `chapter_view`, `page_turn`, or `audio_play`. */
    val name: String = "",
    val chapterId: String? = null,
    val chapterNumber: Int? = null,
    val page: Int? = null,
    val language: String? = null,
    val uid: String? = null,
)

/** Body of `POST /v1/admin/chapters/{id}/moderate`. */
@Serializable
data class ModerateRequest(
    /** `publish`, `reject`, or `hold`. */
    val action: String = "",
    val reason: String? = null,
)

/** Body of `POST /v1/admin/chapters/{id}/feature`. */
@Serializable
data class FeatureRequest(
    val featured: Boolean = false,
)

/** Body of the internal Pub/Sub moderation push endpoint. */
@Serializable
data class ModerationEvent(
    val chapterId: String = "",
    val authorUid: String = "",
    val submittedAt: String = "",
)

/** Result of running the moderator agent over one chapter. */
@Serializable
data class ModerationOutcome(
    val chapterId: String = "",
    val status: ChapterStatus = ChapterStatus.pending,
    val reason: String = "",
    /** Personal data the moderator spotted, for the founder dashboard. */
    val flags: List<String> = emptyList(),
    val moderatedAt: String = "",
)