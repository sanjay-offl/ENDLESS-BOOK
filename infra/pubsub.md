# Pub/Sub Setup

## Topic: `moderation-requests`

Created automatically by the API on first publish, or manually:

```bash
gcloud pubsub topics create moderation-requests \
  --project=$GOOGLE_CLOUD_PROJECT \
  --message-retention-duration=1d
```

## Push Subscription

The API exposes `POST /internal/moderate` which is called by Pub/Sub push.

```bash
gcloud pubsub subscriptions create moderation-push \
  --project=$GOOGLE_CLOUD_PROJECT \
  --topic=moderation-requests \
  --push-endpoint=https://api-xxx-uc.a.run.app/internal/moderate \
  --push-auth-service-account=api-push@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --push-auth-token-audience=api-push \
  --ack-deadline=60 \
  --message-retention-duration=1d
```

## Message Format

```json
{
  "chapter_id": "abc123",
  "title": "The Wheel Cart of Bangles",
  "pages": ["Page 1", "Page 2", "Page 3"],
  "author_uid": "user-uid"
}
```

## Flow

1. User publishes a chapter → status set to `pending`
2. API publishes message to `moderation-requests` topic
3. Pub/Sub pushes to `/internal/moderate`
4. Moderator agent checks content
5. Chapter status updated to `published`, `needs_review`, or `rejected`
6. If published, embedding is generated for vector search
