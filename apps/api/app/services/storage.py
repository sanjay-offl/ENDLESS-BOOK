from google.cloud import storage
from app.core.config import settings
import uuid

_client = None


def get_client():
    global _client
    if _client is None:
        _client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
    return _client


def generate_signed_upload(file_name: str, content_type: str) -> tuple[str, str]:
    client = get_client()
    bucket = client.bucket(settings.GCS_BUCKET)
    ext = file_name.rsplit(".", 1)[-1] if "." in file_name else "bin"
    blob_name = f"uploads/{uuid.uuid4().hex}.{ext}"
    blob = bucket.blob(blob_name)
    upload_url = blob.generate_signed_url(
        version="v4",
        expiration=3600,
        method="PUT",
        content_type=content_type,
    )
    public_url = f"https://storage.googleapis.com/{settings.GCS_BUCKET}/{blob_name}"
    return upload_url, public_url
