package com.endlessbook.firebase

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import org.slf4j.LoggerFactory

object FirebaseAdmin {
    private val logger = LoggerFactory.getLogger(FirebaseAdmin::class.java)

    fun initialize() {
        if (FirebaseApp.getApps().isEmpty()) {
            val projectId = System.getenv("FIREBASE_PROJECT_ID") ?: "endless-ebook"
            val optionsBuilder = FirebaseOptions.builder()
                .setProjectId(projectId)

            try {
                optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault())
                logger.info("Firebase initialized with Google Application Default Credentials for project: {}", projectId)
            } catch (e: Exception) {
                logger.warn("Application Default Credentials not found; initialized Firebase in offline/mock-ready mode: {}", e.message)
            }

            try {
                FirebaseApp.initializeApp(optionsBuilder.build())
            } catch (e: Exception) {
                logger.error("Failed to initialize FirebaseApp: {}", e.message)
            }
        }
    }

    val firestore get() = FirestoreClient.getFirestore()
}
