from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import require_founder
from app.models.schemas import ChapterResponse, ModerateRequest, FeatureRequest
from app.services import firestore as fs
from app.services.bigquery import get_analytics_summary
from app.services.embeddings import generate_embedding

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/chapters", response_model=list[ChapterResponse])
async def list_all_chapters(user: dict = Depends(require_founder)):
    return await fs.list_chapters(limit=200)


@router.post("/chapters/{chapter_id}/moderate", response_model=ChapterResponse)
async def moderate_chapter(chapter_id: str, request: ModerateRequest, user: dict = Depends(require_founder)):
    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    new_status = "published" if request.action == "publish" else "rejected"
    updated = await fs.update_chapter(chapter_id, {"status": new_status})
    return updated


@router.post("/chapters/{chapter_id}/feature", response_model=ChapterResponse)
async def feature_chapter(chapter_id: str, request: FeatureRequest, user: dict = Depends(require_founder)):
    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    updated = await fs.update_chapter(chapter_id, {"featured": request.featured})
    return updated


@router.get("/analytics")
async def get_analytics(user: dict = Depends(require_founder)):
    return await get_analytics_summary()


@router.post("/chapters/{chapter_id}/embed", response_model=ChapterResponse)
async def embed_chapter(chapter_id: str, user: dict = Depends(require_founder)):
    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    text = f"{chapter['title']} {' '.join(chapter['pages'])}"
    embedding = await generate_embedding(text)
    updated = await fs.update_chapter(chapter_id, {"embedding": embedding})
    return updated
