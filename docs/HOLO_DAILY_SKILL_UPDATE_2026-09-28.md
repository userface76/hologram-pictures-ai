# HOLO AI Daily Skill Update — 2026-09-28

## Review scope
Reviewed all 8 HOLO categories: Advertising/Brand, Cinematic, Short-form, Product/Food, People/Character, Anime/Fantasy, Fashion/Beauty, Art/Experimental.

Existing daily skills through 2026-09-27 were checked first. Previously covered reference-role routing, asset locks, timing anchors, selective/local repair, multi-shot physics continuity, boundary frames, reaction holds, soundscape anchors, aspect-ratio intent, HDR safety, spatial-temporal repair, and sequence color reference were excluded as duplicates.

## Adopted skill: Control Conflict Gate

### Core principle
Do not stack every available generation control into one request. Before generation, HOLO should resolve which constraint has priority and remove controls that are unavailable, contradictory, or likely to over-constrain the selected model/workflow.

Use a priority order based on the shot's non-negotiable requirement:
1. Identity / product / brand geometry
2. Required boundary state (first/last frame) when the ending must land precisely
3. Composition / shot size / angle when framing is the key requirement
4. Camera motion when movement is the key requirement
5. Style and secondary aesthetic controls

The exact supported combination remains model-specific; HOLO must query the selected adapter's capability matrix rather than assuming all controls can coexist.

### Evidence / reproducibility
Adobe Firefly's current Generate Video documentation explicitly exposes control conflicts. With a first frame, Shot size, Camera angle, Style, Composition reference, and Transparent background can become unavailable; adding an end frame also disables Motion options. Adobe's Motion Reference workflow separately shows that motion-reference input, style presets, frames, and advanced controls have model/workflow-specific availability. This makes control compatibility a reproducible production constraint rather than a prompt preference.

Official references checked 2026-09-28:
- Adobe Firefly Help — Generate videos using images (current documentation)
- Adobe Firefly Help — Match camera motion to reference video, updated 2026-08-18
- Adobe Firefly Help — Set shot size and angle for video generations

### Apply when
- a shot uses first/last frames plus requested camera movement
- identity/product references are combined with composition/style controls
- HOLO routes one shot among Firefly, Kling, Veo, Seedance, Runway or another adapter
- a generation request contains several simultaneous camera/composition/reference constraints
- repeated generations fail despite individually reasonable controls

### Good example
A beverage hero shot must finish with the bottle label perfectly frontal. HOLO marks the final product state as non-negotiable and selects a boundary-frame workflow. If that workflow disables camera-motion controls in the chosen model, HOLO does not silently promise both. It either uses a simpler compatible camera treatment or routes the shot to another model/workflow that supports the required combination.

### Avoid / do not use as simplification
Do not remove controls merely to make prompts shorter when the selected model demonstrably supports them and they are essential to the shot. This gate is about compatibility and priority, not minimal prompting for its own sake.

## Category mapping
Primary: Advertising/Brand, Product/Food, Cinematic, People/Character, Fashion/Beauty.
Secondary: Short-form, Anime/Fantasy, Art/Experimental whenever multiple generation controls are combined.

## Pipeline change
Before:
Reference/Asset Lock → Timing → Generation → Visual/Physics QA → Repair → Sequence Color QA → Export

After:
Shot Intent → **Control Conflict Gate / Capability Check** → Reference/Asset Lock → Timing → Generation → Visual/Physics QA → Repair → Sequence Color QA → Export

## Why only one skill today
Current research surfaced additional camera-motion and multi-shot features, but those substantially overlap existing HOLO Motion Reference, Multi-shot Asset Lock, Timing Anchor, and Boundary Frame skills. A second permanent rule was not justified by sufficiently distinct evidence today.

## Expected effect
Reduce wasted generations caused by mutually unavailable or competing controls, prevent false promises in the UI, and preserve the highest-priority identity/product/brand constraint before spending generation credits. This should also make model routing more deterministic as HOLO adds Seedance, Kling and other APIs.