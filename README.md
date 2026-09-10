# HOLOGRAM PICTURES AI

> **말하면, 영상이 된다.**

A Korean-first conversational AI video operating system. Instead of navigating a conventional form-heavy video website, users speak or type an intent and HOLOGRAM CORE turns it into a production plan, then routes it to a video engine.

## V0.2 architecture
- **HOLOGRAM CORE:** GPT-6 Astra (optional; falls back locally without API key)
- **Video engine V1:** MiniMax H3 adapter
- **UI:** React/Vite JARVIS-inspired orbital data interface
- **API:** Node/Express/TypeScript
- **Backend deployment:** Railway
- **Frontend/CDN/domain:** Cloudflare
- **Source/CI:** GitHub + GitHub Actions

## Run locally
```bash
cp .env.example .env
npm install
npm run dev
```
Web: `http://localhost:5173`  
API: `http://localhost:8080/health`

## Safe first run
Leave `DEMO_VIDEO_MODE=true`. You can test command analysis, voice input, the JARVIS UI, and render-job creation without spending video-generation credits.

## Enable Astra
Add `OPENAI_API_KEY` to `.env`. The default model is `gpt-6-astra`.

## Enable MiniMax H3
Add `MINIMAX_API_KEY`, verify the current H3 request schema in MiniMax's official API docs, then set `DEMO_VIDEO_MODE=false`.

## Important production TODOs
Before public paid launch, add authentication, persistent DB, queue/polling, R2 storage, rate limiting, abuse controls, credits/billing, audit logs, and provider webhook/poll handling.

See `docs/DEPLOY.md` and `docs/ARCHITECTURE.md`.
