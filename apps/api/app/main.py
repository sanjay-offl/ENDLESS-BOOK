from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger, get_request_id
from app.routers import chapters, voice, translate, agent, search, upload, analytics, admin
from app.agents.moderator import moderate_chapter
from app.services import firestore as fs
from app.services.embeddings import generate_embedding
import json
import os

app = FastAPI(
    title="What I Saw When I Was a Kid — API",
    version="1.0.0",
    description="An endless book of childhood memories",
)

# CORS ----------------------------------------------------------------------
# Origins come from the CORS_ORIGINS environment variable (comma separated).
# `os.getenv` is read as a direct override so the process can be pointed at a
# different web origin without touching a .env file; otherwise the value
# already resolved by pydantic-settings is used.
DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://localhost:3001,http://localhost:3002"
cors_raw = os.getenv("CORS_ORIGINS") or settings.CORS_ORIGINS or DEFAULT_CORS_ORIGINS
origins = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = get_request_id()
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", extra={"request_id": getattr(request.state, "request_id", None)})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Include routers
app.include_router(chapters.router, prefix="/v1")
app.include_router(voice.router, prefix="/v1")
app.include_router(translate.router, prefix="/v1")
app.include_router(agent.router, prefix="/v1")
app.include_router(search.router, prefix="/v1")
app.include_router(upload.router, prefix="/v1")
app.include_router(analytics.router, prefix="/v1")
app.include_router(admin.router, prefix="/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    return {"status": "ready"}


@app.post("/internal/moderate")
async def internal_moderate(request: Request):
    """Pub/Sub push endpoint for moderation."""
    body = await request.body()
    try:
        data = json.loads(body)
        # Handle Pub/Sub push format
        if "message" in data:
            message = data["message"]
            payload = json.loads(message.get("data", "{}").decode("utf-64") if isinstance(message.get("data"), str) else "{}")
        else:
            payload = data

        chapter_id = payload.get("chapter_id")
        title = payload.get("title", "")
        pages = payload.get("pages", [])

        if not chapter_id:
            return {"ok": False, "error": "No chapter_id"}

        # Run moderation
        verdict = await moderate_chapter(title, pages)

        # Update chapter status
        await fs.update_chapter(chapter_id, {
            "status": verdict.status,
            "moderationReason": verdict.reason,
            "moderationConfidence": verdict.confidence,
        })

        # If published, generate embedding
        if verdict.status == "published":
            text = f"{title} {' '.join(pages)}"
            embedding = await generate_embedding(text)
            await fs.update_chapter(chapter_id, {"embedding": embedding})

        return {"ok": True, "status": verdict.status}
    except Exception as e:
        logger.error(f"Moderation failed: {e}")
        return {"ok": False, "error": str(e)}
