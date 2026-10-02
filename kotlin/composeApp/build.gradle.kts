plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.compose)
    alias(libs.plugins.compose.compiler)
}

kotlin {
    wasmJs {
        browser()
        binaries.executable()
    }

    if (providers.gradleProperty("enableAndroid").isPresent) {
        androidTarget()
    }

    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(libs.ktor.client.core)
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json.client)
            implementation(project(":shared"))
        }
        wasmJsMain.dependencies {
            implementation(libs.ktor.client.wasm.js)
        }
        if (providers.gradleProperty("enableAndroid").isPresent) {
            androidMain.dependencies {
                implementation(libs.ktor.client.android)
            }
        }
    }
}
