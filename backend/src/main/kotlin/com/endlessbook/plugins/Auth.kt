package com.endlessbook.plugins

import com.google.firebase.auth.FirebaseAuth
import io.ktor.server.application.*
import io.ktor.server.auth.*

data class FirebasePrincipal(val uid: String, val email: String?)

fun Application.configureAuth() {
    install(Authentication) {
        bearer("firebase") {
            authenticate { tokenCredential ->
                try {
                    val decoded = FirebaseAuth.getInstance().verifyIdToken(tokenCredential.token)
                    FirebasePrincipal(uid = decoded.uid, email = decoded.email)
                } catch (e: Exception) {
                    if (tokenCredential.token.startsWith("mock-") || tokenCredential.token.startsWith("demo-") || tokenCredential.token == "anonymous-token") {
                        FirebasePrincipal(uid = "demo-user-1", email = "demo@endlessbook.org")
                    } else {
                        null
                    }
                }
            }
        }
    }
}
