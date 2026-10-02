# Setup Guide

Complete Google Cloud setup for "What I Saw When I Was a Kid".

> **Deploying to Google Cloud is optional.** Sections 1–14 below are only needed
> if you want to actually deploy. For local development — including the API
> tests, which run against an in-memory fake Firestore and need no GCP project at
> all — read [Local development](#local-development) at the end instead.

## 1. Create a Google Cloud Project

```bash
gcloud projects create what-i-saw-when-i-was-a-kid --name="What I Saw When I Was a Kid"
gcloud config set project what-i-saw-when-i-was-a-kid
export GOOGLE_CLOUD_PROJECT=what-i-saw-when-i-was-a-kid
```

## 2. Enable Billing

```bash
gcloud billing accounts list
gcloud billing projects link what-i-saw-when-i-was-a-kid --billing-account=XXXXXX-XXXXXX-XXXXXX
```

## 3. Enable Required APIs

```bash
gcloud services enable \
  firestore.googleapis.com \
  firestore-vector-search.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  pubsub.googleapis.com \
  bigquery.googleapis.com \
  storage.googleapis.com \
  speech.googleapis.com \
  translate.googleapis.com \
  aiplatform.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  firebase.googleapis.com
```

## 4. Create Service Accounts

```bash
# API service account
gcloud iam service-accounts create api-runtime \
  --display-name="API Runtime"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Pub/Sub push service account
gcloud iam service-accounts create api-push \
  --display-name="API Push"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:api-push@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

## 5. Create Firestore Database

```bash
gcloud firestore databases create --location=asia-south1 --type=firestore-native
```

## 6. Create Storage Bucket

```bash
gsutil mb -l asia-south1 -c standard gs://$GOOGLE_CLOUD_PROJECT-memory-media
gsutil iam ch serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com:objectAdmin gs://$GOOGLE_CLOUD_PROJECT-memory-media
```

## 7. Create BigQuery Dataset

```bash
bq mk --location=asia-south1 --dataset $GOOGLE_CLOUD_PROJECT:analytics
bq mk --table $GOOGLE_CLOUD_PROJECT:analytics.events \
  event:STRING,properties:STRING,timestamp:TIMESTAMP
```

## 8. Create Pub/Sub Topic and Subscription

```bash
gcloud pubsub topics create moderation-requests \
  --message-retention-duration=1d

# After deploying the API, create the push subscription:
gcloud pubsub subscriptions create moderation-push \
  --topic=moderation-requests \
  --push-endpoint=https://api-xxx-uc.a.run.app/internal/moderate \
  --push-auth-service-account=api-push@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --push-auth-token-audience=api-push \
  --ack-deadline=60
```

## 9. Set Secrets

```bash
gcloud secrets create gemini-api-key --data-file=- <<< "your-gemini-api-key"
gcloud secrets create firebase-api-key --data-file=- <<< "your-firebase-api-key"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 10. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Google Sign-In
4. Add a web app and get the config
5. Set the founder UID as a custom claim:

```bash
# Get the founder's UID from Firebase Auth console, then:
gcloud firestore documents update users/<founder-uid> \
  --field=role=founder
```

## 11. Create Artifact Registry

```bash
gcloud artifacts repositories create containers \
  --repository-format=docker \
  --location=asia-south1
```

## 12. Deploy

### Option A: Cloud Build (recommended)

```bash
gcloud builds submit --config infra/cloudbuild.yaml
```

### Option B: Manual

```bash
# Build and push API
docker build -f infra/Dockerfile.api -t gcr.io/$GOOGLE_CLOUD_PROJECT/api:latest .
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/api:latest

# Deploy API
gcloud run deploy api \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/api:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account api-runtime@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT

# Build and push web
docker build -f infra/Dockerfile.web -t gcr.io/$GOOGLE_CLOUD_PROJECT/web:latest .
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/web:latest

# Deploy web
gcloud run deploy web \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/web:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated
```

## 13. Set Up Cloud Build Triggers

```bash
# Production trigger (main branch)
gcloud beta builds triggers create github \
  --name=deploy-main \
  --repo-owner=your-github-username \
  --repo-name=what-i-saw-when-i-was-a-kid \
  --branch-pattern="^main$" \
  --build-config=infra/cloudbuild.yaml

# Preview trigger (pull requests)
gcloud beta builds triggers create github \
  --name=preview-pr \
  --repo-owner=your-github-username \
  --repo-name=what-i-saw-when-i-was-a-kid \
  --pull-request-pattern="^.*$" \
  --build-config=infra/cloudbuild.yaml
```

## 14. Monitoring

```bash
# Uptime check
gcloud monitoring uptime-check create \
  --display-name="API Health" \
  --resource-type=cloud-run-revision \
  --resource-labels=service-name=api \
  --path=/health \
  --period=300

# Alert policy for error rate
gcloud alpha monitoring policies create \
  --display-name="API Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\"" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300
```

## 15. Seed the Database

```bash
cd apps/api
uv run python seed.py
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

---

# Local development

None of the Google Cloud setup above is required to run the site or the tests.
The API test suite substitutes an in-memory fake for Firestore, and
`tests/conftest.py` **fails the run loudly if any real GCP client is
constructed**, so you cannot accidentally make a network call from a test.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js 18+ | for the web app |
| `uv` | for the API and the test suite. Install without root: `curl -LsSf https://astral.sh/uv/install.sh \| sh` (lands in `~/.local/bin`) |
| `gs` + `pdftocairo` | only for the character pipeline: `sudo apt-get install -y ghostscript poppler-utils` |
| Python 3.10+ | the character pipeline uses its own venv, see below |

## The API

```bash
npm run dev:api      # cd apps/api && uv run uvicorn app.main:app --reload --port 8000
```

Listens on `:8000`. The client reads its base URL from `NEXT_PUBLIC_API_URL`
(`apps/web/.env.local`, defaulting to `http://localhost:8000`).

The API's allow-list of browser origins comes from `CORS_ORIGINS`, checked in
this order: the process environment, then `apps/api/.env` (the working directory
when `dev:api` starts), then the built-in default
`http://localhost:3000,http://localhost:3001,http://localhost:3002` — which is
why local dev works with no configuration at all. To allow another origin, set
`CORS_ORIGINS` in `apps/api/.env` (see `apps/api/.env.example`).

```bash
uv run pytest tests/ -v     # or: npm run test
```

Health check: `curl http://localhost:8000/health`

> **Without Google ADC, the data routes return 500.** `/health` works, but
> `/v1/chapters` raises
> `google.auth.exceptions.DefaultCredentialsError: Your default credentials were
> not found.` That is a missing-credentials environment problem, not a code
> defect — the route is correctly mounted at `/v1/chapters`. Either run
> `gcloud auth application-default login`, or rely on the fake Firestore in
> `tests/` and the offline banner on the web side.

## The character animation pipeline

Fully scripted, no GUI required, no `sudo` needed. Full documentation in
[`docs/ANIMATION.md`](docs/ANIMATION.md#automated-pipeline--what-is-actually-implemented).

```bash
npm run tools:setup     # once — python3 -m venv .venv-tools + lxml, cairosvg, svgwrite, numpy, pillow
npm run character       # convert -> optimise -> extract -> verify
```

Individual stages, if you need them:

```bash
npm run character:convert     # EPS -> character-source.svg (+ PNG preview)
npm run character:extract     # -> 6 pose SVGs + manifest.json + character-poses.generated.ts
npm run character:optimise    # svgo, with a savings table
npm run character:verify      # frame, baseline, clipping and distinctness checks
```

The order matters: `optimise` rewrites the pose files, so it has to run *after*
`extract` has produced them (it aborts with a clear message if the poses
directory is empty). `npm run character` chains them in the right order.

**`character-poses.generated.ts` is auto-generated — never hand-edit it.**
Re-running the extractor rewrites it.

`.venv-tools/` is gitignored. If `npm run character:extract` reports a missing
module, re-run `npm run tools:setup` rather than installing globally.

### The no-`sudo` converter fallback

`scripts/convert-character.sh` prefers Inkscape because it preserves the
Illustrator layer structure. When Inkscape is not installed it falls back to:

```bash
gs -dEPSCrop -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=out.pdf in.eps
pdftocairo -svg out.pdf out.svg
```

That fallback is deliberate — `sudo apt-get` is password-blocked on some
machines, and this keeps the pipeline runnable anyway. The cost is that the
result is a **flat** SVG: 714 paths, no `<g>` layers, layer names gone. The
extractor detects that and switches from group clustering to geometric
connected-component detection. Either way the output poses are identical in
framing, because the extractor normalises every pose to one frame
(150.06 × 256.36 user units) and one foot baseline.

Two side effects worth knowing:

- **Pose names are positional.** With no layer names to read, the six figures
  are named in reading order (`idle`, `wave`, `thinking` / `celebrating`,
  `encouraging`, `walk`). Pass `--names a,b,c,d,e,f` to remap, and check
  `apps/web/public/character/poses/manifest.json`.
- **svgo 4 config format changed.** Configs are `.mjs`, not `.json` — svgo 4
  loads them with a dynamic `import()`. See `scripts/svgo.config.mjs` and
  `scripts/svgo.poses.config.mjs`.

## Everything

```bash
npm run dev     # web + api together
```

## The full gate

```bash
npx tsc --noEmit            # type check
npm run lint                # eslint
npm run build               # next build
uv run pytest tests/ -v     # API tests
npm run character:verify    # pose geometry
```

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `ERR_CONNECTION_REFUSED` in the browser | API not running | `npm run dev:api` |
| `DefaultCredentialsError` on `/v1/chapters` | no Google ADC | `gcloud auth application-default login`, or use the fake Firestore in tests |
| CORS error in the console | origin not allow-listed | add it to `CORS_ORIGINS` |
| 404 on a video in the footer | `public/media/` is empty | `VideoBackdrop` probes with `HEAD` and falls back to a gradient; drop real files in `public/media/` |
| `ModuleNotFoundError: lxml` | venv missing or broken | `npm run tools:setup` |
| `gs: command not found` | Ghostscript absent | `sudo apt-get install -y ghostscript poppler-utils` |
| `ERR_IMPORT_ATTRIBUTE_MISSING` from svgo | a `.json` svgo config | use the `.mjs` configs in `scripts/` |

