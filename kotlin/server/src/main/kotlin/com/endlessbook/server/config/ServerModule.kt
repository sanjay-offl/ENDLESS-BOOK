package com.endlessbook.server.config

import com.endlessbook.shared.config.AppConfig
import org.koin.core.module.Module
import org.koin.dsl.module

val serverModule: Module = module {
    single { AppConfig.load() }
}
