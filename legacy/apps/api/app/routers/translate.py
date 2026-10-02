from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.auth import get_current_user
from app.models.schemas import TranslationResponse
from app.services import firestore as fs
from app.services.translation import translate_chapter

router = APIRouter(tags=["translate"])


@router.get("/chapters/{chapter_id}/translate", response_model=TranslationResponse)
async def translate_chapter_endpoint(
    chapter_id: str,
    lang: str = Query(..., min_length=2, max_length=5),
):
    # Check cache first
    cached = await fs.get_translation(chapter_id, lang)
    if cached:
        return cached

    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    translated = await translate_chapter(chapter["title"], chapter["pages"], lang, chapter.get("language", "en"))

    # Cache translation
    await fs.save_translation(chapter_id, lang, translated)
    return translated
