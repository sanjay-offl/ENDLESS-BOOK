from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.auth import get_current_user
from app.models.schemas import TranscribeResponse
from app.services.speech import transcribe_audio
from app.core.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if audio.size and audio.size > settings.MAX_AUDIO_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Audio too large. Max {settings.MAX_AUDIO_MB}MB")

    audio_bytes = await audio.read()
    language_hints = settings.GOOGLE_SPEECH_LANGUAGES.split(",") if hasattr(settings, 'GOOGLE_SPEECH_LANGUAGES') else ["en-US", "ta-IN", "hi-IN", "te-IN", "ml-IN", "kn-IN"]
    result = await transcribe_audio(audio_bytes, language_hints)
    return result
