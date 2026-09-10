# Deploy

## 1. GitHub
Create a repository named `hologram-pictures-ai`, upload all files, and keep `main` as the production branch.

## 2. Railway (API)
Connect the GitHub repository. The included `railway.json` builds and starts only `apps/api`.
Set Variables:
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-6-astra`
- `MINIMAX_API_KEY`
- `MINIMAX_API_BASE=https://api.minimax.io`
- `MINIMAX_H3_CREATE_PATH=/video-generation-v2-create`
- `DEMO_VIDEO_MODE=true` initially
- `CORS_ORIGIN=https://YOUR-FRONTEND-DOMAIN`

After the first successful deployment, note the Railway public URL.

## 3. Cloudflare frontend
Create a Cloudflare project connected to the same GitHub repository.
- Root directory: `apps/web`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-RAILWAY-API`

## 4. First test
Keep `DEMO_VIDEO_MODE=true` and test the UI. When the official H3 request body is verified against your MiniMax account/docs, change the adapter if required and set `DEMO_VIDEO_MODE=false`.
