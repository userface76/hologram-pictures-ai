# HOLO Composer Renderer

Standalone HyperFrames render worker for HOLO AI.

This service lives outside the root npm workspace so the existing HOLO API and WEB services do not install Chromium or HyperFrames dependencies.

## Railway deployment

Create a separate Railway service from the same repository and set its root directory to:

`services/composer`

Railway should use the included Dockerfile.

Recommended variables for the Composer service:

```
PORT=8090
COMPOSER_API_KEY=<shared-secret>
COMPOSER_PUBLIC_BASE_URL=https://<composer-service-domain>
COMPOSER_MAX_CONCURRENT=1
```

Then add these variables to the existing HOLO API service:

```
HOLO_COMPOSER_URL=https://<composer-service-domain>
HOLO_COMPOSER_API_KEY=<same-shared-secret>
HOLO_COMPOSER_RENDER_PATH=/render
HOLO_COMPOSER_STATUS_PATH=/jobs
```

## Current render scope

- Sequential video or image clips
- Text, image and logo overlays
- Narration audio
- Background music
- 16:9, 9:16 and 1:1 canvases
- MP4 output
- In-memory queue with configurable concurrency

The first production version deliberately defaults to hard cuts. Selected crossfades and richer transitions can be added after the basic render pipeline is stable.

## Storage

Rendered MP4 files are currently served from the Composer service filesystem. Railway local storage is not the final archive. Completed Composer outputs should be copied into HOLO R2 and persisted into MY STUDIO by the HOLO API in the next integration step.
