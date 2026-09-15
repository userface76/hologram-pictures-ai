# HOLO Daily Skill Update — 2026-09-15

Status: VERIFIED ADDITIVE SKILL PACK

## 1. Reference Role Separation
Categories: 광고·브랜드 / 제품·푸드 / 인물·캐릭터 / 패션·뷰티 / 애니·판타지

Core principle: When multiple references are supplied, assign each one a clear production role before prompt construction: SUBJECT/IDENTITY, PRODUCT/OBJECT, ENVIRONMENT/STYLE, MOTION/CAMERA, or AUDIO/RHYTHM.

Routing:
- SUBJECT / IDENTITY: face, body, wardrobe, character design
- PRODUCT / OBJECT: package geometry, logo placement, material, color
- ENVIRONMENT / STYLE: location, palette, art direction
- MOTION / CAMERA: body movement, gesture, camera path, scene structure
- AUDIO / RHYTHM: speech, beat, pacing

Good pattern: Preserve identity and wardrobe from SUBJECT_REF. Preserve package shape and colors from PRODUCT_REF. Use MOTION_REF only for hand movement and camera timing. Use ENV_REF for lighting and atmosphere.

Avoid: letting a motion reference overwrite an approved face or product; adding many references without defining their jobs; forcing one reference to control conflicting visual dimensions.

Evidence: Current Minimax H3 guidance distinguishes image references for subject/style/composition, video references for motion/camera/scene structure, and audio references for pacing/rhythm. Seedance 2.5 and Cinema Studio 4.0 also support large mixed-reference workflows.

## 2. Performance Transfer Clean Plate
Categories: 인물·캐릭터 / 패션·뷰티 / 숏폼 / 시네마틱 / 애니·판타지

Core principle: When a performance video drives a generated character, treat the source as a clean motion plate rather than finished cinematography.

Prefer: one clearly visible performer; continuous shot; stable framing; limited occlusion; moderate readable movement; required limbs visible.

Routing:
1. Decide whether the video reference controls PERFORMANCE or CAMERA.
2. For PERFORMANCE, preserve identity from the approved character reference and use the video for movement, gesture and expression.
3. Add cinematic camera language separately when the selected workflow can support it reliably.
4. Reduce complexity when the performance source contains cuts, heavy occlusion or conflicting camera movement.

Good pattern: Use PERFORMANCE_REF only for walking rhythm, hand gesture and facial reaction. Preserve CHARACTER_REF identity, hair and clothing. Keep a restrained medium tracking shot.

Avoid: edited montages as a body-performance source; multiple overlapping performers for a single target; contradictory source-camera and requested-camera instructions.

Evidence: Current Kling 3.0 Motion Control guidance recommends a single continuous performance shot, clear body visibility, minimal occlusion, relatively stable actions and avoidance of cuts/camera movement for reliable motion transfer.

## Runtime compatibility
These additions refine existing identity-lock and reference-driven prompting rather than replacing them. OPTION A should use them strongly for control; OPTION B should preserve reference locks before adding impact camera choices; OPTION C should apply only the minimum clarification needed to preserve user intent.

Sources reviewed: Runway Help — Minimax H3; Seedance 2.5; Kling 3.0 Motion Control; Gen-4 Image References. Higgsfield — Cinema Studio 4.0 (2026-08-12).
