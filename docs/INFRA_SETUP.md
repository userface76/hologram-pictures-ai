# HOLOGRAM PICTURES AI — Infrastructure Setup

## 1. Web → API
Production web builds use:

```env
VITE_API_URL=https://hologramapi-production.up.railway.app
```

The value is committed in `apps/web/.env.production` because it is a public URL, not a secret.

## 2. Supabase
Create a Supabase project, open SQL Editor, and run:

`supabase/migrations/001_hologram_core.sql`

Then add these variables to the Railway **API service only**:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Never expose the service-role key to the web/Vite application.

Tables created:
- `projects`
- `render_jobs`
- `videos`

## 3. Cloudflare R2
Create an R2 bucket named `hologram-pictures-ai` and generate an Object Read & Write API token scoped to that bucket.

Add to Railway API Variables:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=hologram-pictures-ai
R2_PUBLIC_BASE_URL=https://YOUR-R2-PUBLIC-DOMAIN
```

`R2_PUBLIC_BASE_URL` can be an R2 public development URL or a custom domain mapped to the bucket.

## 4. MiniMax H3
Add to Railway API Variables:

```env
MINIMAX_API_KEY=
MINIMAX_API_BASE=https://api.minimax.io
MINIMAX_H3_MODEL=MiniMax-H3
MINIMAX_H3_CREATE_PATH=/v2/video_generation
MINIMAX_H3_QUERY_PATH=/v2/query/video_generation
DEMO_VIDEO_MODE=false
```

The API creates an H3 task, returns a `task_id`, and `/api/jobs/:id` polls MiniMax. When the task succeeds, the generated URL is copied into R2 when R2 is configured, then persisted in Supabase.

## 5. OpenAI HOLOGRAM CORE
Add:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-astra
```

## 6. Verify

API health:

```text
https://hologramapi-production.up.railway.app/health
```

Infrastructure state:

```text
https://hologramapi-production.up.railway.app/api/system/status
```

Expected shape:

```json
{
  "ok": true,
  "api": true,
  "openai": true,
  "minimax": true,
  "demoVideoMode": false,
  "supabase": true,
  "r2": true
}
```

Web:

```text
https://hologramweb-production.up.railway.app
```
