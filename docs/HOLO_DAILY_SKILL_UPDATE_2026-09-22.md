# HOLO AI Daily Skill Update — 2026-09-22

## Review policy
8 categories reviewed: 광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험.

Priority: factual realism, reproducibility, character/product/brand consistency. Weak trend-only tips excluded.

## New Skill 1 — Physics-Aware Multi-Shot Continuity Gate

**Categories:** 시네마틱 / 인물·캐릭터 / 애니·판타지 / 광고·브랜드

**Core principle**
When a scene contains consecutive shots, HOLO should preserve not only asset identity but also the physical state carried across the cut: movement direction, velocity/inertia, body orientation, contact/collision result, prop state, and environment state.

**Why add it**
Kling 3.0/Omni documentation surfaced through Adobe explicitly describes consecutive multi-shot generation with consistent characters, props and environments, plus physics-driven camera movements responding to gravity, inertia and collision. This suggests continuity QA should extend beyond appearance lock into physical-state continuity.

**Apply when**
- chase, dodge, fight, fall, vehicle, transformation, object interaction
- a moving subject crosses a cut
- a prop/object changes state in one shot and remains present in the next

**Good example**
Shot A: runner dodges left while a zombie lunges and overshoots. Shot B begins with the runner still carrying leftward momentum and the zombie recovering forward balance; clothing/hair lag follows the same motion.

**Avoid / downgrade when**
- intentional jump cut, dream transition, montage, teleportation or discontinuity is the creative goal
- static talking-head or product beauty shot where physical carry-over is negligible

**QA fields**
`entry_state -> action -> exit_state -> next_shot_entry_state`
Check: direction, velocity class, body orientation, contact state, object state, environment state.

## New Skill 2 — Subject Matte Repair Gate

**Categories:** 광고·브랜드 / 제품·푸드 / 인물·캐릭터 / 패션·뷰티 / 아트·실험

**Core principle**
If the generated performance is already good but a local subject/background element is wrong, prefer tracked subject isolation and compositing repair before full regeneration.

**Why add it**
Adobe After Effects 26.5 (2026-09-09) retains propagated AI Object Matte results through disk caching, while the 26.2 release introduced one-click AI subject selection/isolation/tracking. This strengthens a production workflow where accepted motion and identity are preserved while only the defective region is repaired.

**Apply when**
- logo/package text or a small product region is wrong
- background artifact appears around an otherwise accepted person/product
- wardrobe/accessory/local object needs replacement
- regeneration risks losing a strong face, motion, camera move or product pose

**Good example**
A beverage hero shot has excellent condensation, camera move and hand interaction but the label is distorted. Isolate/track the bottle region and repair/replace the label rather than regenerating the full shot.

**Avoid / downgrade when**
- anatomy or whole-body motion is fundamentally wrong
- lighting/reflections/shadows are globally inconsistent
- the faulty object drives large occlusions or collisions across most frames

## Before → After

**Before:** Reference routing → asset lock → beat timing → generation → QA → timeline patch/full repair.

**After:** Reference routing → asset lock → beat timing → generation → **physical-state continuity QA across cuts** → failure localization → **subject-matte repair when local** / timeline patch when temporal / full regeneration only when structural.

## Evidence checked
- Adobe Firefly / Kling 3.0 & Kling 3.0 Omni: consecutive multi-shot generation, consistent characters/props/environments, physics-driven camera movement with gravity/inertia/collision.
- Adobe After Effects What's New, updated 2026-09-09: AI Object Matte and persistent disk caching for propagated matte results.
- Adobe Research Memory-V2V, published 2026-09-12: prior edits treated as structured constraints to improve cross-turn editing consistency. This supports preserving accepted state during iterative repair; it was not added as a separate skill because HOLO already has Edit Memory Lock.

## Duplicate screening
Not re-added: Reference Motion Isolation, Multi-shot Asset Lock, Edit Memory Lock, Timeline Patch Generation, Reference Budget Router, Timing Anchor. Today's additions extend identity continuity into physical-state continuity and add a repair-mode decision for localized tracked regions.
