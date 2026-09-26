# HOLO AI Daily Skill Update — 2026-09-26

## Review scope
8 categories: 광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험

Selection rule: prioritize factuality, reproducibility, brand/person/product consistency, and production value. Exclude trend-only tips and skills already covered by HOLO's reference routing, asset lock, timing, boundary-frame, patch repair, audio continuity, and aspect-ratio rules.

## Added Skill 1 — Highlight-Safe HDR Lighting Gate

### Core principle
Treat HDR as a capture/output decision, not as a generic “more cinematic contrast” prompt. When the selected model and delivery pipeline support HDR, preserve highlight detail, skin tone, product material response, deep-shadow separation, and brand color before pursuing dramatic contrast.

### Apply when
- premium product/food advertising with metal, glass, liquid, gloss, fire, neon, or strong specular highlights
- cinematic scenes with windows, practical lights, sunset, night signage, or mixed exposure
- fashion/beauty where skin and fabric texture must survive bright highlights
- art/experimental work intentionally using an expanded luminance range

### Good example
A perfume bottle on a dark set: retain readable label/brand color, controlled glass-edge highlights, visible liquid, and separated shadow detail; use HDR only when the downstream edit/master supports it.

### Avoid when
- the destination is SDR-only and no controlled tone-map/master step exists
- HDR contrast causes label, logo, skin, or food highlights to clip or shift color
- “HDR” is being used only as a style adjective without a technical output need

### HOLO rule
`HDR capable? -> delivery supports HDR? -> protect identity-critical highlights/colors -> generate -> inspect clipping/color shifts -> tone-map or fall back to SDR`

### Priority categories
광고·브랜드 / 시네마틱 / 제품·푸드 / 패션·뷰티 / 아트·실험

## Added Skill 2 — Spatial-Temporal Edit Anchor

### Core principle
When a defect is local and the editing model supports frame-level sketch/reference guidance, point to *where* and *when* the change belongs instead of rewriting the entire scene in text or regenerating the whole clip.

### Apply when
- one prop, hand contact point, accessory, local costume detail, reflection, or background object needs correction
- the source motion, face, camera, lighting, and most of the frame are already approved
- the model supports a sketch/reference attached to a specific source frame

### Good example
At the exact frame where a hand should grip a cup handle, mark the handle/contact area and instruct the edit there while preserving the approved face, cup identity, camera path, lighting, and surrounding motion.

### Avoid when
- body mechanics or scene geometry are globally wrong
- the desired change spans most of the shot
- the edit model cannot preserve temporal propagation around the marked frame

### HOLO rule
`local defect? -> choose defect frame -> attach spatial mark/reference -> lock approved assets/motion -> localized edit -> inspect temporal propagation -> escalate to Timeline Patch only if needed`

### Priority categories
광고·브랜드 / 제품·푸드 / 인물·캐릭터 / 패션·뷰티 / 시네마틱

## Before → After
Before:
`Asset/Reference Lock -> Timing -> Generation -> QA -> Matte/Timeline Repair -> Export`

After:
`Asset/Reference Lock -> Delivery Dynamic-Range Gate -> Timing -> Generation -> QA -> Spatial-Temporal Edit for local defects -> Matte/Timeline Repair only when necessary -> Export/Tone-map`

## Evidence reviewed
- Adobe Firefly / Luma Ray3 documentation: Ray3 supports native HDR and professional HDR formats, plus motion-preserving video edits.
- Runway Seedance 2.5 documentation: Edit/Extend modes support drawing directly on a source-video frame; that drawing becomes an image reference attached to that moment.
- Existing HOLO daily skill docs (2026-09-19 through 2026-09-25) were checked to avoid duplicating prior reference, continuity, repair, timing, audio, and aspect-ratio skills.

## Expected effect
- better preservation of product materials, skin, brand color, and highlight detail in premium imagery
- fewer full regenerations for small localized defects
- lower risk that a successful face/camera/product state is destroyed by an unnecessary global retry
