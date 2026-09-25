# HOLO Daily Skill Update — 2026-09-25

## Review policy
8 categories reviewed: advertising/brand, cinematic, short-form, product/food, people/character, anime/fantasy, fashion/beauty, art/experimental. Priority: realism, reproducibility, brand/person/product consistency. Weak trends and duplicates excluded.

## New Skill — Aspect-Ratio Intent Lock
**Principle:** Do not treat 16:9 → 9:16 / 1:1 delivery as a simple crop after generation. Before generation, classify the subject that must survive reframing (face, product, logo/packshot, action contact point), keep that subject inside a protected composition zone, then use subject-aware auto-reframe for derivative formats. Regenerate only when the destination ratio changes the storytelling itself.

**Apply when:** one master creative must produce YouTube/landscape plus Shorts/Reels/TikTok/social-square derivatives; product demonstrations; talking/character shots; fashion walk/tracking; branded packshots.

**Good example:** A beverage hero shot is generated with bottle, hand interaction and label inside the protected center/vertical-safe region. The 16:9 master is then reframed to 9:16 while tracking the bottle rather than regenerating the product, preserving label geometry, lighting and motion continuity.

**Avoid when:** essential action happens simultaneously at opposite frame edges; the wide composition itself is the storytelling device; reframing would hide a second character, text, or causal action. In those cases create a destination-specific shot rather than forcing auto-reframe.

**Categories:** advertising/brand, short-form, product/food, people/character, fashion/beauty; secondary use in cinematic, anime/fantasy and art/experimental distribution versions.

**Evidence:** Adobe Firefly What's New (updated 2026-09-22) documents Auto Reframe in the Video Editor beta, automatically adapting video to different aspect ratios while keeping the primary subject in frame throughout the video. This supports a reproducible production rule: preserve the approved subject/asset and derive alternate aspect ratios through tracked reframing before paying for a new generation.

## Before → After
Before: Asset/reference lock → timing → generation → visual/audio QA → local repair → export.

After: Asset/reference lock → **delivery-ratio + protected-subject planning** → timing → generation → visual/audio QA → local repair → **subject-aware derivative reframing** → regenerate only if narrative information cannot survive the target ratio.

## Why this is useful for HOLO
This separates **generation quality** from **distribution formatting**. A good approved face/product/brand shot should not be exposed to identity drift and extra token cost merely because a second platform needs 9:16 instead of 16:9. The gate also creates a measurable QA check: after reframing, verify subject visibility, label/logo integrity, head/limb safety, action contact point, and negative-space requirements.

## Duplicate/research exclusions
- Kling multi-shot consistency / Elements: already covered by Multi-shot Asset Lock and Physics-Aware Multi-Shot Continuity Gate.
- Video-to-video camera/framing edits: overlaps existing Reference Motion Isolation and local repair rules.
- Firefly Custom Models for reusable style/character foundations: useful, but overlaps current Asset Lock/identity-consistency architecture enough that it was not promoted to a separate HOLO skill today.

## Sources
- Adobe Firefly What's New, updated 2026-09-22: https://helpx.adobe.com/kr/firefly/web/whats-new/new-features/whats-new.html
- Adobe Firefly Kling 3.0 / Omni overview: https://www.adobe.com/products/firefly/partner-models/kling-ai.html
- Adobe Firefly video-to-video overview: https://www.adobe.com/products/firefly/features/video-to-video.html
