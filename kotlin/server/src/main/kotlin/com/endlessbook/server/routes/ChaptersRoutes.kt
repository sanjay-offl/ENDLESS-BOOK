package com.endlessbook.server.routes

import com.endlessbook.server.auth.Role
import com.endlessbook.server.auth.authenticated
import com.endlessbook.server.auth.requirePrincipal
import com.endlessbook.server.domain.*
import com.endlessbook.server.infra.InMemoryChapterRepository
import com.endlessbook.shared.model.*
import com.endlessbook.shared.validation.ChapterLimits
import com.endlessbook.shared.validation.validateCreateChapter
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.util.UUID

fun Application.chaptersRoutes(
    chapterRepo: ChapterRepository,
) {
    routing {
        // Public list endpoints
        get("/v1/chapters") {
            val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
            val pageSize = call.request.queryParameters["pageSize"]?.toIntOrNull() ?: 20
            val featured = call.request.queryParameters["featured"]?.toBooleanStrictOrNull()
            val statusParam = call.request.queryParameters["status"]
            val sortBy = when (call.request.queryParameters["sort"]) {
                "oldest" -> SortBy.OLDEST
                "place" -> SortBy.PLACE
                else -> SortBy.NEWEST
            }

            val filter = ChapterFilter(
                status = statusParam?.let { runCatching { ChapterStatus.valueOf(it) }.getOrNull() },
                featured = featured,
                sortBy = sortBy,
                page = page,
                pageSize = pageSize
            )

            val result = chapterRepo.list(filter)
            call.respond(
                ChapterListResponse(
                    chapters = result.items.map { it.toSummary() },
                    total = result.total,
                    page = result.page,
                    pageSize = result.pageSize,
                    hasMore = result.hasMore
                )
            )
        }

        get("/v1/chapters/{id}") {
            val id = call.parameters["id"] ?: throw ValidationException("id required")
            val chapter = chapterRepo.getById(id) ?: throw NotFoundException("Chapter", id)
            call.respond(chapter)
        }

        // Authenticated routes
        authenticated {
            post("/v1/chapters") {
                val principal = call.requirePrincipal
                val req = call.receive<CreateChapterRequest>()
                val err = validateCreateChapter(req.title, req.pages, req.language, req.locationCity)
                if (err != null) throw ValidationException(err)

                val chapterNumber = chapterRepo.nextChapterNumber()
                val now = Instant.now().toString()
                val chapter = Chapter(
                    id = UUID.randomUUID().toString(),
                    chapterNumber = chapterNumber,
                    authorUid = principal.uid,
                    authorName = principal.displayName ?: principal.email ?: "Author",
                    title = req.title,
                    pages = req.pages,
                    language = req.language,
                    locationCity = req.locationCity,
                    coordinates = req.coordinates,
                    coverImageUrl = req.coverImageUrl,
                    audioUrl = req.audioUrl,
                    status = ChapterStatus.pending,
                    featured = false,
                    readingMinutes = estimateReadingMinutes(req.pages),
                    createdAt = now,
                    updatedAt = now
                )
                val created = chapterRepo.create(chapter)
                call.respond(HttpStatusCode.Created, created)
            }

            get("/v1/me/chapters") {
                val principal = call.requirePrincipal
                val list = chapterRepo.listByAuthor(principal.uid)
                call.respond(list)
            }

            put("/v1/chapters/{id}") {
                val principal = call.requirePrincipal
                val id = call.parameters["id"] ?: throw ValidationException("id required")
                val existing = chapterRepo.getById(id) ?: throw NotFoundException("Chapter", id)
                if (existing.authorUid != principal.uid && principal.role != Role.FOUNDER) {
                    throw ForbiddenException("Only owner or founder can edit")
                }
                val req = call.receive<UpdateChapterRequest>()
                val updated = Chapter(
                    title = req.title ?: existing.title,
                    pages = req.pages ?: existing.pages,
                    language = req.language ?: existing.language,
                    locationCity = req.locationCity ?: existing.locationCity,
                    coordinates = req.coordinates,
                    coverImageUrl = req.coverImageUrl,
                    audioUrl = req.audioUrl,
                )
                val result = chapterRepo.update(id, updated)
                call.respond(result)
            }

            delete("/v1/chapters/{id}") {
                val principal = call.requirePrincipal
                val id = call.parameters["id"] ?: throw ValidationException("id required")
                val existing = chapterRepo.getById(id) ?: throw NotFoundException("Chapter", id)
                if (existing.authorUid != principal.uid && principal.role != Role.FOUNDER) {
                    throw ForbiddenException("Only owner or founder can delete")
                }
                chapterRepo.delete(id)
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

private fun estimateReadingMinutes(pages: List<String>): Int {
    val words = pages.sumOf { it.split("\\s+".toRegex()).size }
    return (words / 200).coerceAtLeast(2).coerceAtMost(5)
}
