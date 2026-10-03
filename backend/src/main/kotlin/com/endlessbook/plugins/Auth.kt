package com.endlessbook.plugins

import com.endlessbook.firebase.FirebaseAdmin
import com.google.firebase.auth.FirebaseAuth
import io.ktor.server.application.*
import io.ktor.server.auth.*

data class FirebasePrincipal(val uid: String, val email: String?)

/**
 * Bearer authentication backed by Firebase ID tokens.
 *
 * Local development tokens (`mock-`, `demo-`, `anonymous-token`) are only accepted when
 * Firebase itself is unavailable. If a real project is configured, every token is
 * verified for real and the bypass is off, so it cannot be used to reach production data.
 */
fun Application.configureAuth() {
    install(Authentication) {
        bearer("firebase") {
            authenticate { tokenCredential ->
                val token = tokenCredential.token

                if (FirebaseAdmin.isConfigured) {
                    try {
                        val decoded = FirebaseAuth.getInstance().verifyIdToken(token)
                        FirebasePrincipal(uid = decoded.uid, email = decoded.email)
                    } catch (e: Exception) {
                        null
                    }
                } else if (
                    token.startsWith("mock-") ||
                    token.startsWith("demo-") ||
                    token == "anonymous-token"
                ) {
                    FirebasePrincipal(uid = "demo-user-1", email = "demo@endlessbook.org")
                } else {
                    null
                }
            }
        }
    }
}
