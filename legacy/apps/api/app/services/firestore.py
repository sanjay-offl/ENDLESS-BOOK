from google.cloud import firestore
from google.cloud.firestore import AsyncClient
import asyncio
from typing import Optional
from app.core.config import settings

_db: Optional[AsyncClient] = None


def get_db() -> AsyncClient:
    global _db
    if _db is None:
        _db = AsyncClient(project=settings.GOOGLE_CLOUD_PROJECT)
    return _db


async def get_chapter(chapter_id: str) -> Optional[dict]:
    db = get_db()
    doc = await db.collection("chapters").document(chapter_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data


async def list_chapters(status: Optional[str] = None, limit: int = 100) -> list[dict]:
    db = get_db()
    query = db.collection("chapters")
    if status:
        query = query.where("status", "==", status)
    query = query.order_by("chapterNumber", direction="DESCENDING").limit(limit)
    docs = await query.get()
    result = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)
    return result


async def create_chapter(data: dict) -> dict:
    db = get_db()
    # Get next chapter number
    counter_ref = db.collection("counters").document("chapters")
    @firestore.async_transactional
    async def get_next_number(transaction):
        counter_doc = await transaction.get(counter_ref)
        if counter_doc.exists:
            current = counter_doc.to_dict().get("count", 0)
        else:
            current = 0
        transaction.set(counter_ref, {"count": current + 1})
        return current + 1

    transaction = db.transaction()
    chapter_number = await get_next_number(transaction)

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    data["chapterNumber"] = chapter_number
    data["status"] = "pending"
    data["featured"] = False
    data["createdAt"] = now
    data["updatedAt"] = now

    doc_ref = await db.collection("chapters").add(data)
    data["id"] = doc_ref[1].id
    return data


async def update_chapter(chapter_id: str, data: dict) -> Optional[dict]:
    db = get_db()
    from datetime import datetime, timezone
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    await db.collection("chapters").document(chapter_id).update(data)
    return await get_chapter(chapter_id)


async def delete_chapter(chapter_id: str) -> bool:
    db = get_db()
    # Delete translations subcollection
    translations = await db.collection("chapters").document(chapter_id).collection("translations").get()
    for t in translations:
        await t.reference.delete()
    # Delete chapter
    await db.collection("chapters").document(chapter_id).delete()
    return True


async def get_translation(chapter_id: str, lang: str) -> Optional[dict]:
    db = get_db()
    doc = await db.collection("chapters").document(chapter_id).collection("translations").document(lang).get()
    if not doc.exists:
        return None
    return doc.to_dict()


async def save_translation(chapter_id: str, lang: str, data: dict):
    db = get_db()
    from datetime import datetime, timezone
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.collection("chapters").document(chapter_id).collection("translations").document(lang).set(data)


async def search_similar(embedding: list[float], limit: int = 3) -> list[dict]:
    db = get_db()
    # Firestore vector search
    try:
        query = db.collection("chapters").find_nearest(
            vector_field="embedding",
            query_vector=embedding,
            distance_measure="COSINE",
            limit=limit,
        )
        docs = await query.get()
        result = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            result.append(data)
        return result
    except Exception:
        # Fallback: return recent published chapters
        return await list_chapters(status="published", limit=limit)
