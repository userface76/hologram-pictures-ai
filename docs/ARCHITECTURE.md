# Architecture

```text
Voice / Text
    ↓
HOLOGRAM CORE (GPT-6 Astra)
    ↓ structured production plan
Model Router
    ↓
MiniMax H3 (V1)
    ↓
Render Job → future: queue/database/R2
```

## Product principle
The UI is not a normal dashboard. The main screen is a conversational visual operating system: a central AI core, orbiting data nodes, and one command surface.

## V1
- Korean text command
- Browser Korean speech recognition
- Astra command interpretation with local fallback
- MiniMax H3 adapter
- In-memory job list
- Railway API deployment
- Cloudflare-ready static web build

## V2
- PostgreSQL users/projects/jobs
- Redis/BullMQ queue
- Cloudflare R2 video storage
- H3 task polling + result ingestion
- Authentication/credits/billing
- Asset upload and multimodal references
- Kling/Veo/etc adapters
