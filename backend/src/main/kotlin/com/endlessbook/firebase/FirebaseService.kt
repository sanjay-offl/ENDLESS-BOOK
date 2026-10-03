package com.endlessbook.firebase

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Reads Firebase Auth profiles, tolerating an uninitialised Firebase app. */
class FirebaseService {
    suspend fun getUser(uid: String): UserRecord? = withContext(Dispatchers.IO) {
        if (!FirebaseAdmin.isConfigured) return@withContext null
        try {
            FirebaseAuth.getInstance().getUser(uid)
        } catch (e: Exception) {
            null
        }
    }
}
