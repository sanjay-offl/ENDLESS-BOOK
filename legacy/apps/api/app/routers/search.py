from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.models.schemas import ChapterResponse
from app.services import firestore as fs
from app.services.embeddings import generate_embedding

router = APIRouter(tags=["search"])


@router.get("/chapters/{chapter_id}/similar", response_model=list[ChapterResponse])
async def similar_chapters(chapter_id: str):
    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Generate embedding from chapter text
    text = f"{chapter['title']} {' '.join(chapter['pages'])}"
    embedding = await generate_embedding(text)

    # Search for similar
    results = await fs.search_similar(embedding, limit=4)
    # Remove self from results
    results = [r for r in results if r["id"] != chapter_id]
    return results[:3]
