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
