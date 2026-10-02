# HOLO Daily Skill Update — 2026-10-02

## Review scope
8 categories: 광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험

## Adopted skill: Structural Composition Reference Lock

### Why
Text prompts often describe a shot semantically but do not reliably preserve exact spatial structure. For shots where blocking, foreground/background depth, negative space, product placement, or subject-to-camera relationship matters, use an approved reference clip for composition/structure rather than asking the model to reinterpret the layout from text alone.

Adobe Firefly documents a Composition Reference workflow that uses a 5–10 second reference video to preserve arrangement of edges, depth, and composition while changing generated content. This is distinct from Motion Reference, which extracts pans, zooms, tilts, and camera paths.

### Core principle
Lock **where things are** separately from **how the camera moves** and **what the scene looks like**.

Priority:
1. Identity / Product / Brand truth
2. Structural composition (blocking, depth, negative space)
3. Required action
4. Camera motion
5. Style

### Apply when
- product hero shot needs exact pack position and clean negative space for copy
- fashion/beauty needs repeatable body-to-frame placement
- cinematic shot needs foreground/midground/background depth to survive model routing
- short-form hook depends on a reveal entering a specific region of frame
- character scene needs stable blocking across variants

### Good example
Cosmetics ad:
- approved reference has face on left third, product on right foreground, soft background depth
- preserve that spatial skeleton
- swap wardrobe/background/lighting only if they do not move the protected product/face zones
- QA: face zone, product zone, horizon/depth layers, copy-safe negative space

### Avoid when
- composition is intentionally chaotic or exploratory
- the reference contains perspective or blocking errors
- the shot requires a radical aspect-ratio change that destroys the spatial relationship
- First/Last Frame or another model control conflicts with composition reference; route through Control Conflict Gate first

### Category priority
Highest: 광고·브랜드, 제품·푸드, 패션·뷰티, 시네마틱
High: 숏폼, 인물·캐릭터
Conditional: 애니·판타지, 아트·실험

## Difference from existing HOLO skills
- Storyboard Contract Gate: approves sequence-level key shots.
- Aspect-Ratio Intent Lock: protects subjects during reframing.
- Motion Reference: transfers camera movement.
- Structural Composition Reference Lock: transfers spatial layout/depth while allowing content/style changes.

## Pipeline change
Before:
Sequence/Shot Intent → Control Conflict Gate → Reference/Asset Lock → Timing → Generation → QA

After:
Sequence/Shot Intent → Control Conflict Gate → Reference/Asset Lock → **Structural Composition Reference Lock (when layout is critical)** → Timing/Motion → Generation → Composition QA → Continuity QA

## Evidence
- Adobe Firefly Help, “Use video as composition reference,” updated June 9, 2026: reference video can guide arrangement of edges, depth, and composition.
- Adobe Firefly Help, “Match camera motion to reference video,” updated June 2026: motion reference separately extracts pans, zooms, tilts, and motion path.

## Rejected / merged candidates
- Motion Reference: already covered by existing HOLO camera/motion-reference practice.
- Native vertical / 4K output in Veo 3.1: useful capability, but already overlaps Aspect-Ratio Intent Lock and export/upscale handling; not promoted to a new skill.
- Generic prompt-template tips: excluded as weakly differentiated and insufficiently reproducible.
