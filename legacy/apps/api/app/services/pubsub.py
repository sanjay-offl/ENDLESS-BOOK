from google.cloud import pubsub_v1
from app.core.config import settings
import json

_publisher = None


def get_publisher():
    global _publisher
    if _publisher is None:
        _publisher = pubsub_v1.PublisherClient()
    return _publisher


def publish_moderation_request(chapter_id: str, chapter_data: dict):
    publisher = get_publisher()
    topic_path = publisher.topic_path(settings.GOOGLE_CLOUD_PROJECT, settings.PUBSUB_TOPIC)
    message = json.dumps({
        "chapter_id": chapter_id,
        "title": chapter_data.get("title", ""),
        "pages": chapter_data.get("pages", []),
        "author_uid": chapter_data.get("authorUid", ""),
    }).encode("utf-8")
    future = publisher.publish(topic_path, message)
    return future.result()
