# HOLO ComfyUI backend pilot

2026-11-24. Status: planning only; no production changes or GPU provisioning.

- Preserve MiniMax as default, Railway and existing eight skill categories unchanged.
- Add opt-in admin-only experimental provider behind a disabled-by-default feature flag. Keep credentials server-side; private authenticated GPU endpoint; allowlisted versioned workflows, no arbitrary nodes or user URLs.
- Pilot image-to-video with Wan or LTX after checking model license and VRAM. Test 5-second clips first, then 10–15-second composition, MP4 and separate Korean speech.
- Use async submit/status/result adapter, persistent job IDs, idempotency, timeout, cancellation where supported, explicit approval before paid fallback, cost ledger and concurrency=1 initially.
- Test identity, product geometry, temporal consistency, successful-output cost, latency, failures and retries against MiniMax. No release until regression checks pass.
- Budget: proposed first-month incremental infrastructure cap KRW 100,000–200,000, excluding labor and existing services. RunPod A6000 48GB pod listed $0.69/hour (https://www.runpod.io/pricing, Nov 12 2026); assumed KRW 1450/USD. 30 GPU hours about KRW 30,000 before storage/taxes. Runtime assumptions are not benchmarks. Stop idle GPU; storage may persist. Confirm actual pricing and user approval before purchase.
- Next: inspect API provider integration and job persistence, implement adapter with mocked tests, then provision GPU only after budget approval.
