package com.endlessbook.server.auth

/**
 * Fake token verifier for local development and integration tests.
 *
 * SAFETY GUARANTEE: This implementation checks for the K_SERVICE environment
 * variable, which Cloud Run sets automatically. If K_SERVICE is set, the fake
 * verifier refuses to verify any token and always returns null, making it
 * impossible to accidentally enable on a deployed service.
 *
 * Token format: "fake:<uid>:<displayName>:<email>"
 * Example:      "fake:user-abc:Sanjay:sanjay@example.com"
 *
 * The founderUid is injected so the verifier can assign the FOUNDER role.
 */
class FakeTokenVerifier(private val founderUid: String?) : TokenVerifier {

    override suspend fun verify(idToken: String): AuthPrincipal? {
        // Hard block on Cloud Run
        if (System.getenv("K_SERVICE") != null) {
            return null
        }

        if (!idToken.startsWith("fake:")) return null
        val parts = idToken.removePrefix("fake:").split(":")
        if (parts.size < 1) return null

        val uid         = parts.getOrElse(0) { "" }.ifBlank { return null }
        val displayName = parts.getOrElse(1) { "Test User" }
        val email       = parts.getOrElse(2) { "$uid@example.com" }
        val role        = if (uid == founderUid) Role.FOUNDER else Role.AUTHOR

        return AuthPrincipal(uid = uid, email = email, displayName = displayName, role = role)
    }
}
