package com.endlessbook.services

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class FirebaseService {
    suspend fun getUser(uid: String): UserRecord? = withContext(Dispatchers.IO) {
        try {
            FirebaseAuth.getInstance().getUser(uid)
        } catch (e: Exception) {
            null
        }
    }
}
