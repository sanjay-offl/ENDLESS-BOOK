package com.endlessbook.firebase

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.cloud.firestore.Firestore
import com.google.firebase.cloud.FirestoreClient
import org.slf4j.LoggerFactory

/**
 * Owns the single [FirebaseApp] used by the services.
 *
 * When no Application Default Credentials are available (a normal local run without
 * `gcloud auth application-default login`) there is no way to talk to Firestore, so the
 * app stays uninitialised and the services fall back to their in-memory seed content.
 * [isConfigured] reports which of those two modes is active.
 */
object FirebaseAdmin {
    private val logger = LoggerFactory.getLogger(FirebaseAdmin::class.java)

    @Volatile
    var isConfigured: Boolean = false
        private set

    fun initialize() {
        if (FirebaseApp.getApps().isNotEmpty()) {
            isConfigured = true
            return
        }

        val projectId = System.getenv("FIREBASE_PROJECT_ID") ?: "endless-ebook"

        val credentials = try {
            GoogleCredentials.getApplicationDefault()
        } catch (e: Exception) {
            logger.warn(
                "Application Default Credentials not found, so Firestore is unavailable and the API " +
                    "will serve in-memory seed content. Run 'gcloud auth application-default login' to " +
                    "connect a real project. Cause: {}",
                e.message
            )
            return
        }

        try {
            FirebaseApp.initializeApp(
                FirebaseOptions.builder()
                    .setProjectId(projectId)
                    .setCredentials(credentials)
                    .build()
            )
            isConfigured = true
            logger.info("Firebase initialized with Application Default Credentials for project: {}", projectId)
        } catch (e: Exception) {
            logger.error("Failed to initialize FirebaseApp, falling back to in-memory seed content: {}", e.message)
        }
    }

    /**
     * The Firestore handle, or `null` when Firebase is unavailable. Callers use this to
     * choose between Firestore and the offline seed data instead of catching the
     * [IllegalStateException] that `FirestoreClient.getFirestore()` throws per request.
     */
    val firestore: Firestore?
        get() = if (!isConfigured) null else runCatching { FirestoreClient.getFirestore() }.getOrNull()

    /** Returns the Firestore handle or throws a message that names the real problem. */
    fun requireFirestore(): Firestore = firestore
        ?: throw IllegalStateException(
            "Firestore is not configured. Provide Application Default Credentials to enable persistence."
        )
}
