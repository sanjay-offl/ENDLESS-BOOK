package com.endlessbook.server.config

import com.endlessbook.server.auth.FakeTokenVerifier
import com.endlessbook.server.auth.TokenVerifier
import com.endlessbook.server.domain.ChapterRepository
import com.endlessbook.server.infra.InMemoryChapterRepository
import com.endlessbook.shared.config.AppConfig
import org.koin.core.module.Module
import org.koin.dsl.module

val serverModule: Module = module {
    single { AppConfig.load() }
    single<ChapterRepository> { InMemoryChapterRepository() }
    single<TokenVerifier> { FakeTokenVerifier(get<AppConfig>().founderUid) }
}
