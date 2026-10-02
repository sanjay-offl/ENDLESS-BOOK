from google.cloud import speech
from app.core.config import settings
import io

_client = None


def get_client():
    global _client
    if _client is None:
        _client = speech.SpeechClient()
    return _client


async def transcribe_audio(audio_bytes: bytes, language_hints: list[str] | None = None) -> dict:
    client = get_client()
    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code=language_hints[0] if language_hints else "en-US",
        alternative_language_codes=language_hints[1:] if language_hints and len(language_hints) > 1 else [],
        enable_automatic_punctuation=True,
    )
    response = await client.recognize(config=config, audio=audio)
    if not response.results:
        return {"transcript": "", "language": "en"}
    transcript = " ".join(result.alternatives[0].transcript for result in response.results)
    detected_lang = response.results[0].language_code if response.results[0].language_code else "en-US"
    return {"transcript": transcript, "language": detected_lang}
