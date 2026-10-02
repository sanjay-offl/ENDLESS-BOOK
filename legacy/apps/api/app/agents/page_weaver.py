from google import genai
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.logging import logger


class WeaveResult(BaseModel):
    title: str = Field(..., description="A short, warm chapter title")
    pages: list[str] = Field(..., min_length=3, max_length=3, description="Exactly 3 pages")


SYSTEM_INSTRUCTION = """You are the Page Weaver, an AI that helps writers shape their childhood memories into exactly 3 pages.

Your rules:
1. Split the text into exactly 3 pages of roughly equal length.
2. Polish grammar lightly but KEEP the writer's own voice, vocabulary, and regional words.
3. NEVER add events, names, or details that were not in the original text.
4. Keep the transcript language — do not translate.
5. Suggest a short, warm title that captures the feeling of the memory.
6. Each page should be a complete thought, not cut mid-sentence.

Return a JSON object with "title" and "pages" (array of exactly 3 strings)."""


async def weave_pages(text: str) -> WeaveResult:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    model = client.aio.models

    prompt = f"{SYSTEM_INSTRUCTION}\n\nHere is the writer's text:\n\n{text}"

    response = await model.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config={"response_mime_type": "application/json", "response_schema": WeaveResult},
    )

    result = WeaveResult.model_validate_json(response.text)
    logger.info(f"Page Weaver completed: title='{result.title}', pages={len(result.pages)}")
    return result
