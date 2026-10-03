plugins {
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.serialization") version "2.1.20"
    id("io.ktor.plugin") version "3.1.3"
    application
}

group = "app.endless"
version = "0.1.0"

application {
    mainClass.set("app.endless.ApplicationKt")
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    implementation("io.ktor:ktor-server-cors-jvm")
    implementation("io.ktor:ktor-server-status-pages-jvm")
    implementation("io.ktor:ktor-server-call-logging-jvm")
    implementation("io.ktor:ktor-server-call-id-jvm")
    implementation("io.ktor:ktor-server-rate-limit-jvm")
    implementation("io.ktor:ktor-server-auth-jvm")
    implementation("com.google.firebase:firebase-admin:9.4.3")
    implementation("com.google.cloud:google-cloud-firestore:3.30.3")
    implementation("com.google.cloud:google-cloud-speech:4.49.0")
    implementation("com.google.cloud:google-cloud-translate:2.48.0")
    implementation("com.google.genai:google-genai:1.0.0")
    implementation("ch.qos.logback:logback-classic:1.5.18")

    testImplementation("io.ktor:ktor-server-test-host-jvm")
    testImplementation(kotlin("test"))
    testImplementation("io.mockk:mockk:1.14.5")
}

kotlin {
    jvmToolchain(21)
}
