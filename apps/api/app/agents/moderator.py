from google import genai
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.logging import logger


class ModerationVerdict(BaseModel):
    status: str = Field(..., description="One of: published, needs_review, rejected")
    reason: str = Field(..., description="Explanation for the decision")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    flags: list[str] = Field(default=[], description="List of flagged issues")


SYSTEM_INSTRUCTION = """You are the Moderator for a public book of childhood memories.

Check each chapter for:
1. Hate speech or harassment
2. Adult or inappropriate content
3. Personal data: phone numbers, exact addresses, full names of children
4. Plagiarism indicators

Rules:
- If the chapter is clean, return status "published" with high confidence.
- If there are minor concerns (e.g., a phone number that could be fictional), return "needs_review".
- If there are serious violations (hate, harassment, adult content, real personal data), return "rejected".
- Always provide a clear reason and list any flags.

Return a JSON object with "status", "reason", "confidence", and "flags"."""


async def moderate_chapter(title: str, pages: list[str]) -> ModerationVerdict:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    model = client.aio.models

    text = f"Title: {title}\n\n" + "\n\n".join(f"Page {i+1}: {p}" for i, p in enumerate(pages))
    prompt = f"{SYSTEM_INSTRUCTION}\n\nChapter to review:\n\n{text}"

    response = await model.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config={"response_mime_type": "application/json", "response_schema": ModerationVerdict},
    )

    result = ModerationVerdict.model_validate_json(response.text)
    logger.info(f"Moderation complete: status={result.status}, confidence={result.confidence}, flags={result.flags}")
    return result
