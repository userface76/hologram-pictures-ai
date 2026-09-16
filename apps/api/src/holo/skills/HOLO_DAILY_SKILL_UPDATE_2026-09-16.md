# HOLO Daily Skill Update — 2026-09-16

Status: VERIFIED ADDITIVE SKILL PACK

## 1. Motion-Cue Alignment Check
Categories: 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 패션·뷰티 / 광고·브랜드

Core principle: Before image-to-video generation, compare the requested motion with motion already implied by the input image. Motion blur, dust, hair direction, fabric direction, body pose, wheel blur, splash shape, directional lines and mid-action posture can bias the generated motion. If the image visually says “moving fast” while the prompt says “perfectly still,” repair or replace the source frame before spending another render.

Routing:
1. Inspect SOURCE_FRAME for implied motion cues.
2. Classify requested motion as ALIGNED, NEUTRAL or CONTRADICTORY.
3. ALIGNED: keep the frame and use a simple motion prompt.
4. NEUTRAL: add only the subject/camera motion needed.
5. CONTRADICTORY: recommend or automatically prepare a cleaner source frame before video generation.
6. For static product/beauty shots, explicitly describe the motion that remains in-frame and use locked-camera language rather than negative phrasing.

Good pattern: A parked car hero shot uses a clean still image without dust trails or wheel blur; prompt the camera arc separately. A beauty portrait that should remain calm starts from relaxed hair/fabric rather than a wind-swept action frame.

Avoid: repeatedly strengthening “do not move” language against a source image full of motion cues; using negative prompt wording as the primary control; combining several unrelated actions into one short shot.

Why HOLO needs it: This is a pre-render quality gate. It can prevent wasted generations and protect product geometry, face stability and intended camera behavior.

Evidence: Runway's current Image-to-Video Prompting Guide states that input images can contain implied motion and shows that removing contradictory dust/motion blur can produce the desired stationary result with the same prompt. Its Gen-4 guide also recommends simple, positive, direct motion descriptions and iterative additions.

## 2. Selective Repair Before Full Regeneration
Categories: 광고·브랜드 / 제품·푸드 / 패션·뷰티 / 인물·캐릭터 / 시네마틱 / 아트·실험

Core principle: When a generated shot is mostly correct, do not default to full regeneration. First classify the defect and choose the smallest repair operation that preserves approved motion, composition, identity and product geometry.

Defect routing:
- LIGHTING / MOOD only → relight or palette treatment.
- BACKGROUND / unwanted object / local visual element → targeted video edit.
- PRODUCT or CHARACTER substitution → reference-guided edit while preserving shot structure.
- BEGIN/END transition problem → keyframe or first/last-frame regeneration.
- SHOT fundamentally wrong in action/camera/physics → regenerate the shot.

Repair priority:
1. Preserve approved motion and composition.
2. Preserve identity/product locks.
3. Change only the defective dimension.
4. Full regeneration is the fallback, not the first response.

Good pattern: If a burger commercial has correct hand movement and framing but the light is too flat, relight the existing clip instead of regenerating the actor, burger and camera motion. If a fashion clip is correct except for the background, edit the background while keeping the performance.

Avoid: regenerating an entire successful take for a color-temperature issue; allowing a local edit to redefine face/product shape; stacking many edits when the base shot itself is structurally wrong.

Why HOLO needs it: This turns HOLO from a prompt generator into a production decision layer. It reduces unnecessary retries, improves continuity and can lower credit/time waste.

Evidence: Runway Edit Studio supports targeted changes such as product/character swaps, background replacement, object removal, VFX and relighting on existing footage. Higgsfield's Video Relight and Color Palette tools similarly change lighting/color while preserving the overall composition and motion. Seedance 2.5 distinguishes Keyframe, Edit and Extend workflows so the operation can match the actual defect rather than restarting the shot.

## Runtime compatibility
These skills are additive and do not replace Reference Role Separation or Performance Transfer Clean Plate from 2026-09-15.

Recommended HOLO decision order:
1. Validate reference roles.
2. Run MOTION_CUE_ALIGNMENT_CHECK on image-to-video inputs.
3. Generate with the simplest sufficient positive motion prompt.
4. Evaluate output by defect type.
5. Route to SELECTIVE_REPAIR when the shot is mostly approved.
6. Regenerate only when action, camera path, physics or core composition is fundamentally wrong.

OPTION A: prioritize stability and pre-render checks.
OPTION B: allow stronger camera/impact choices only after identity/product/motion-cue locks pass.
OPTION C: preserve user wording while silently correcting contradictory motion instructions when possible.

Sources reviewed 2026-09-16: Runway Help — Gen-4 Video Prompting Guide; Image-to-Video Prompting Guide; Seedance 2.5; Edit Studio; Camera Terms. Higgsfield — Video Relight and Color Palette (2026-08-20).