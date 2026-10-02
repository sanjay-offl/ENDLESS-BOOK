from fastapi import APIRouter, Depends
from app.models.schemas import EventRequest
from app.services.bigquery import stream_event

router = APIRouter(tags=["analytics"])


@router.post("/events")
async def track_event(request: EventRequest):
    await stream_event(request.event, request.model_dump(exclude={"event"}))
    return {"ok": True}
