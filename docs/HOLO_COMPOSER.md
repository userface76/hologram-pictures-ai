# HOLO Composer

HOLO Composer is the final assembly layer between generated media and the member's finished video.

## Pipeline

HOLO Director
→ Video Engine Router (MiniMax / Higgsfield / Seedance / Kling)
→ Voice / narration
→ HOLO Composer
→ HyperFrames-compatible renderer
→ R2 / MY STUDIO

## API

- `GET /api/composer/status`
- `POST /api/composer/plan` — validates and normalizes a composition without spending render resources.
- `POST /api/composer/render` — sends a normalized composition to the configured renderer.
- `GET /api/composer/jobs/:id` — polls the renderer job.

## Railway environment variables

```
HOLO_COMPOSER_URL=https://your-renderer.example.com
HOLO_COMPOSER_API_KEY=
HOLO_COMPOSER_RENDER_PATH=/render
HOLO_COMPOSER_STATUS_PATH=/jobs
```

Only `HOLO_COMPOSER_URL` is required to mark the composer as configured. Keep it unset until the HyperFrames render service is deployed; planning remains available through `/composer/plan`.

## Renderer contract

Render request:

```json
{
  "spec": {
    "title": "30s brand film",
    "aspectRatio": "16:9",
    "resolution": "1080p",
    "fps": 30,
    "clips": [{"url": "https://..."}],
    "overlays": [],
    "transitions": []
  }
}
```

The renderer should return a job identifier as one of `id`, `job_id`, `request_id`, or `task_id`.

The status endpoint should expose a recognizable status and may return the completed video URL through `outputUrl`, `output_url`, `videoUrl`, `video_url`, `result.url`, or `result.video_url`.


## Standalone renderer service

The first concrete HyperFrames renderer now lives at `services/composer`.

It is intentionally isolated from the root npm workspace so the normal HOLO API/WEB deployments do not install Chromium, FFmpeg, or HyperFrames.

Deployment sequence:

1. Create a new Railway service from this repository.
2. Set the service root directory to `services/composer`.
3. Deploy with the included Dockerfile.
4. Set `COMPOSER_PUBLIC_BASE_URL` to the new Railway domain.
5. Set a shared `COMPOSER_API_KEY` on the renderer.
6. Put that same value into the HOLO API as `HOLO_COMPOSER_API_KEY`.
7. Set the HOLO API `HOLO_COMPOSER_URL` to the renderer domain.

The first renderer supports clip assembly, narration, music, overlays, aspect-ratio canvases, queueing, and MP4 output. Rich crossfades, shader transitions, automatic R2 archival, and MY STUDIO persistence remain follow-up work.
