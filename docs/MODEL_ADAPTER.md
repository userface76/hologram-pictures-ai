# Add another video model

1. Create `apps/api/src/providers/<provider>.ts`.
2. Implement `VideoProvider` (`id`, `displayName`, `create`, optional `status`).
3. Register it in `services/modelRouter.ts`.
4. Add provider secrets only to deployment environment variables; never commit keys.
5. Keep all provider-specific request/response field mapping inside the adapter.

This prevents UI and HOLOGRAM CORE code from changing every time a video vendor changes its API.
