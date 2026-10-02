package com.endlessbook.server.auth

/** Represents an authenticated caller, whether real or from the fake verifier. */
data class AuthPrincipal(
    val uid: String,
    val email: String?,
    val displayName: String?,
    val role: Role,
)

enum class Role { READER, AUTHOR, FOUNDER }

/** Token verification contract. Real = Firebase Admin SDK. Fake = parse a test header. */
interface TokenVerifier {
    suspend fun verify(idToken: String): AuthPrincipal?
}
