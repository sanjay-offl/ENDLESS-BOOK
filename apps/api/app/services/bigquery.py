from google.cloud import bigquery
from app.core.config import settings
from app.core.logging import logger
from datetime import datetime, timezone
import json

_client = None


def get_client():
    global _client
    if _client is None:
        _client = bigquery.Client(project=settings.GOOGLE_CLOUD_PROJECT)
    return _client


async def stream_event(event: str, properties: dict):
    client = get_client()
    table_id = f"{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.{settings.BIGQUERY_TABLE}"
    row = {
        "event": event,
        "properties": json.dumps(properties),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    errors = await client.insert_rows_json(table_id, [row])
    if errors:
        from app.core.logging import logger
        logger.error(f"BigQuery insert errors: {errors}")


async def get_analytics_summary() -> dict:
    client = get_client()
    query = f"""
        SELECT event, COUNT(*) as count
        FROM `{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.{settings.BIGQUERY_TABLE}`
        WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        GROUP BY event
    """
    try:
        results = await client.query(query)
        return {row["event"]: row["count"] for row in results}
    except Exception:
        return {}
