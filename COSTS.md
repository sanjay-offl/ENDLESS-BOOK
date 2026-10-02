# Costs and Free Tier Design

This document lists every paid trigger in the system and how it is capped to stay within Google Cloud free tiers.

## Free Tier Budgets

| Service | Free Tier | Our Usage Pattern |
|---|---|---|
| Cloud Run | 2M requests/month, 360K GB-seconds | Scale to zero, low traffic |
| Firestore | 50K reads/day, 20K writes/day | Cached reads, batch writes |
| BigQuery | 1 TB queries/month, 10 GB storage | Sandbox or free allowance |
| Cloud Storage | 5 GB-month | Images and audio only |
| Pub/Sub | 10 GB/month | Moderation messages only |
| Speech-to-Text | 60 minutes/month | Voice transcripts |
| Translation | 500K characters/month | Cached translations |
| Gemini | 1,500 requests/day | Page Weaver + Moderator |
| MapLibre | Free (OpenStreetMap tiles) | No Google Maps billing |

## Paid Triggers and Caps

### 1. Speech-to-Text
- **Trigger**: User records a voice memory
- **Cap**: 3 minutes max per recording, 10MB max file size
- **Mitigation**: Client-side compression, rate limit per user
- **Free tier**: 60 minutes/month ≈ 20 recordings

### 2. Gemini API (Page Weaver)
- **Trigger**: User clicks "AI Page Weaver"
- **Cap**: Rate limit per user (5/minute), text max 10K characters
- **Mitigation**: Only runs on explicit user action
- **Free tier**: 1,500 requests/day

### 3. Gemini API (Moderator)
- **Trigger**: Every new chapter published
- **Cap**: Only runs on new chapter creation
- **Mitigation**: Async via Pub/Sub, no user waiting
- **Free tier**: 1,500 requests/day

### 4. Translation API
- **Trigger**: User switches language on a chapter
- **Cap**: Translations cached in Firestore per chapter per language
- **Mitigation**: Same text never translated twice
- **Free tier**: 500K characters/month

### 5. BigQuery
- **Trigger**: Every analytics event
- **Cap**: Events are small JSON, batched inserts
- **Mitigation**: Use BigQuery sandbox (free, no credit card)
- **Free tier**: 1 TB queries/month

### 6. Cloud Storage
- **Trigger**: Image/audio uploads
- **Cap**: Client-side image resize before upload, signed URLs expire in 1 hour
- **Mitigation**: Only store what users explicitly upload
- **Free tier**: 5 GB-month

### 7. Firestore Vector Search
- **Trigger**: Similar chapter search
- **Cap**: Embeddings generated only for published chapters
- **Mitigation**: Fallback to recent chapters if vector search unavailable
- **Free tier**: Included in Firestore free tier for small datasets

## Cost-Saving Architecture Decisions

1. **Scale to zero**: Both Cloud Run services scale to zero when idle
2. **Translation cache**: Same text never paid for twice
3. **Embedding reuse**: Embeddings stored in Firestore, not regenerated
4. **MapLibre over Google Maps**: Free OpenStreetMap tiles
5. **Client-side image resize**: Reduces storage and bandwidth
6. **Async moderation**: Pub/Sub queue prevents API overload
7. **Firestore caching**: Frequently read chapters cached client-side

## Estimated Monthly Cost (100 users)

| Service | Estimated Cost |
|---|---|
| Cloud Run | $0 (free tier) |
| Firestore | $0 (free tier) |
| BigQuery | $0 (sandbox) |
| Speech-to-Text | $0 (free tier) |
| Gemini | $0 (free tier) |
| Translation | $0 (free tier) |
| Storage | $0 (free tier) |
| **Total** | **$0** |

## When Costs Would Appear

- More than 60 minutes of voice recordings per month
- More than 1,500 Gemini requests per day
- More than 500K characters of uncached translations per month
- More than 5 GB of stored media
- More than 2M Cloud Run requests per month

All of these are unlikely for a small community book.
