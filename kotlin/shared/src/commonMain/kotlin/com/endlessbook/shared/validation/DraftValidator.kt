package com.endlessbook.shared.validation

/**
 * Validation for the writer studio's Weaver input and for the voice
 * transcript before it reaches the model.
 */
object DraftValidator {

    /** Long enough to weave, short enough to stay inside a model context. */
    const val DRAFT_MAX_CHARS = 20_000
    const val DRAFT_MIN_CHARS = 40

    fun validate(draft: String): ValidationErrors {
        val errors = linkedMapOf<String, String>()
        val trimmed = draft.trim()
        when {
            trimmed.isEmpty() -> errors["draft"] = "Write or record something first."
            trimmed.length < DRAFT_MIN_CHARS ->
                errors["draft"] = "A little more, at least ${DRAFT_MIN_CHARS} characters."
            trimmed.length > DRAFT_MAX_CHARS ->
                errors["draft"] = "That is over ${DRAFT_MAX_CHARS} characters."
        }
        return ValidationErrors(errors)
    }
}