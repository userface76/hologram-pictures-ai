# HOLO AI Daily Skill Update — 2026-09-23

## Review policy
8 categories reviewed: 광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험.

Priority: factual realism, reproducibility, character/product/brand consistency. Trend-only or weakly supported prompt tips excluded.

## New Skill — Boundary Frame Transition Lock

**Categories:** 광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험

**Core principle**
When the creative requirement is not merely “start from this image” but “arrive at this exact visual state,” lock both temporal boundaries with an approved first frame and approved last frame, then let the model solve only the motion/transition between them. Treat boundary frames as continuity constraints, not as general style references.

**Why add it**
Adobe Premiere's Generative Media workflow (updated 2026-09-09) explicitly supports a first-frame reference for image-to-video and first+last-frame references for transitions. Google Veo 3.1 likewise supports generating transitions between a supplied first and last frame. This is production-supported behavior across more than one ecosystem, not a prompt-only trick.

**Apply when**
- product reveal must end on an exact approved packshot
- logo/object morph or transformation has a fixed destination state
- character/action shot must connect cleanly into the next approved shot
- vertical short needs a precise end-card pose/composition
- generated insert must bridge two existing timeline shots

**Good example**
A beverage commercial begins on an approved close-up of the sealed can and must end on an approved hero frame with the can upright, label readable and condensation intact. Supply those two approved boundary frames; prompt HOLO only for the physically plausible opening/reveal motion between them.

**Avoid / downgrade when**
- the ending composition is intentionally open-ended or exploratory
- first and last frames imply impossible geometry, lighting, identity, wardrobe or object-state changes without an explicit transformation beat
- the interval contains too many independent actions for the available duration
- exact typography/logo integrity cannot be trusted to generation alone; preserve or composite the approved graphic asset instead

**HOLO QA fields**
`first_boundary_identity -> transition_motion -> last_boundary_identity`
Check: subject/product identity, silhouette, camera axis, lighting direction, object state, label/logo state, motion plausibility, destination composition.

## Before → After

**Before:** HOLO could lock assets, route references, structure beat timing, preserve physical state across cuts, and repair local/time-range failures.

**After:** HOLO can additionally distinguish an ordinary reference from a **hard temporal boundary**. When both the entry and destination visual states matter, it constrains generation to the interval between two approved frames instead of asking the model to invent the destination.

## Evidence checked
- Adobe Premiere Generative Media Tool, updated 2026-09-09: reference frames can guide generation; first frame supports image-to-video and first+last frames support transition generation.
- Google Veo 3.1 official developer announcement: supports reference images, video extension, and transitions between first and last frames.
- Adobe Firefly September 2026 update: reference images are now available with Kling 3.0 Omni. This supports broader reference-conditioned workflows, but was not registered as a separate HOLO skill because it overlaps Multi-shot Asset Lock / Reference routing.
- Adobe Research GimbalDiffusion (ECCV 2026) was reviewed for gravity-aware camera control, but not promoted to a production HOLO skill today because it remains research rather than a broadly available production workflow.

## Duplicate screening
Not re-added: Reference Motion Isolation, Multi-shot Asset Lock, Edit Memory Lock, Timeline Patch Generation, Reference Budget Router, Timing Anchor, Physics-Aware Multi-Shot Continuity Gate, Subject Matte Repair Gate.

Boundary Frame Transition Lock is distinct: it constrains the **start and destination states of one generated interval**, rather than preserving identity across multiple shots or repairing an already generated interval.
