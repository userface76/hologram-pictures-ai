# HOLO Daily Skill Update — 2026-09-24

## Review policy
8 categories reviewed: advertising/brand, cinematic, short-form, product/food, people/character, anime/fantasy, fashion/beauty, art/experimental. Priority: realism, reproducibility, brand/person/product consistency. Weak trends and duplicates excluded.

## New Skill 1 — Reaction Hold Buffer
**Principle:** Do not cut immediately after the primary action. When a reaction, reveal, product landing, or emotional beat needs readability, reserve a short post-action hold. If the generated clip ends too early, extend only the tail rather than regenerating the full shot.

**Apply when:** reaction shots, product reveals, logo/packshot landing, comedic beats, cinematic impacts, short-form payoff/endings.

**Good example:** Character sees an unexpected object → expression settles → hold long enough for the audience to read the reaction → cut. Product rotates into hero angle → brief stable hold → CTA/next cut.

**Avoid when:** intentional smash cuts, hyper-fast montage, or when the underlying subject/identity is already drifting; extension should not be used to conceal a structurally bad shot.

**Categories:** advertising/brand, cinematic, short-form, product/food, people/character, fashion/beauty.

**Evidence:** Adobe Premiere Generative Extend documentation (updated 2026-09-09) explicitly supports adding frames to hold a character reaction, smooth transitions, hit audio cues, and hide unwanted camera movement.

## New Skill 2 — Context-Matched Soundscape Anchor
**Principle:** Treat ambient sound and effects as continuity anchors, not decoration added at the end. Analyze the visual scene/beat first, then generate or select ambience/SFX matched to location, material, action and timing. Keep dialogue/music separate enough to rebalance later.

**Apply when:** food sizzle/crunch, product handling, footsteps/clothing movement, cinematic environments, fantasy impacts, short-form hook/payoff, fashion movement.

**Good example:** Close-up beverage pour → liquid/ice/glass layers timed to visible contact → room ambience maintained across the cut. Character enters rain → rain bed continues across shots while footsteps change with surface.

**Avoid when:** exact trademarked/recognizable sounds are required, when generated sound conflicts with visible physics, or when dialogue intelligibility would be reduced.

**Categories:** all 8 categories, especially product/food, cinematic, short-form, advertising/brand.

**Evidence:** Adobe's 2026-09-09 Premiere/After Effects update describes Generate Soundscape as analyzing up to 15 seconds of video and generating context-aware ambience/SFX layers with timing adjustment.

## Before → After
Before: Asset/reference lock → timing → generation → visual continuity QA → local repair.

After: Asset/reference lock → timing → generation → visual continuity QA → **reaction/payoff readability check** → **context-matched audio continuity check** → local tail/audio repair before considering full regeneration.

## Duplicate/research exclusions
- Memory-based iterative editing: already covered by Edit Memory Lock.
- First/last frame interpolation: already covered by Boundary Frame Transition Lock.
- Object matte/local repair: already covered by Subject Matte Repair Gate.

## Sources
- Adobe Premiere Generative Extend overview, updated 2026-09-09: https://helpx.adobe.com/premiere/desktop/edit-projects/edit-with-generative-ai/generative-extend-overview.html
- Adobe, Generate/Create directly in timeline, published 2026-09-09: https://blog.adobe.com/jp/publish/2026/09/09/cc-generate-create-directly-in-your-timeline-with-new-ai-powered-innovations-in-premiere-after-effects
