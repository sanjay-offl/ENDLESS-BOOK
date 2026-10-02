from google.cloud import translate_v3 as translate
from app.core.config import settings

_client = None


def get_client():
    global _client
    if _client is None:
        _client = translate.TranslationServiceClient()
    return _client


async def translate_text(text: str, target_lang: str, source_lang: str = "en") -> str:
    client = get_client()
    parent = f"projects/{settings.GOOGLE_CLOUD_PROJECT}/locations/global"
    response = await client.translate_text(
        request={
            "parent": parent,
            "contents": [text],
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "mime_type": "text/plain",
        }
    )
    return response.translations[0].translated_text


async def translate_chapter(title: str, pages: list[str], target_lang: str, source_lang: str = "en") -> dict:
    client = get_client()
    parent = f"projects/{settings.GOOGLE_CLOUD_PROJECT}/locations/global"
    all_texts = [title] + pages
    response = await client.translate_text(
        request={
            "parent": parent,
            "contents": all_texts,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "mime_type": "text/plain",
        }
    )
    translations = [t.translated_text for t in response.translations]
    return {
        "title": translations[0],
        "pages": translations[1:4],
    }
