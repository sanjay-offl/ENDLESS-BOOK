from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from app.core.auth import get_current_user
from app.models.schemas import ChapterCreate, ChapterUpdate, ChapterResponse
from app.services import firestore as fs
from app.services.pubsub import publish_moderation_request
from app.core.logging import logger

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("", response_model=list[ChapterResponse])
async def list_chapters(status: Optional[str] = "published"):
    chapters = await fs.list_chapters(status=status)
    return chapters


@router.get("/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(chapter_id: str):
    chapter = await fs.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.post("", response_model=ChapterResponse, status_code=201)
async def create_chapter(data: ChapterCreate, user: dict = Depends(get_current_user)):
    chapter_data = data.model_dump()
    chapter_data["authorUid"] = user["uid"]
    chapter_data["authorName"] = user.get("name", "Anonymous")
    chapter_data["authorPhoto"] = user.get("picture")

    chapter = await fs.create_chapter(chapter_data)

    # Publish moderation request
    try:
        publish_moderation_request(chapter["id"], chapter_data)
    except Exception as e:
        logger.error(f"Failed to publish moderation request: {e}")

    return chapter


@router.patch("/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(chapter_id: str, data: ChapterUpdate, user: dict = Depends(get_current_user)):
    existing = await fs.get_chapter(chapter_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if existing["authorUid"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Not your chapter")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = await fs.update_chapter(chapter_id, update_data)
    return updated


@router.delete("/{chapter_id}")
async def delete_chapter(chapter_id: str, user: dict = Depends(get_current_user)):
    existing = await fs.get_chapter(chapter_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if existing["authorUid"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Not your chapter")

    await fs.delete_chapter(chapter_id)
    return {"ok": True}
