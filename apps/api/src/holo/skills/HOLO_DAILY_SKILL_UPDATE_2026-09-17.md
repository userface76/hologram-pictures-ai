# HOLO Daily Skill Update — 2026-09-17

Status: VERIFIED ADDITIVE SKILL PACK

## 1. Continuity Bridge Frame
Categories: 시네마틱 / 숏폼 / 광고·브랜드 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티

Core principle: For a multi-shot sequence, treat the approved ending frame of shot N as a continuity asset for shot N+1 instead of asking the next generation to reconstruct the previous state from text alone. Preserve only the state that must carry across the cut: subject identity, product geometry, wardrobe, prop state, screen direction, environment state and the intended handoff composition.

Routing:
1. After approving a shot, identify whether the next shot is CONTINUOUS or a DELIBERATE CUT.
2. CONTINUOUS: capture/use the approved final frame as the next shot's first-frame anchor when the target model supports it.
3. Carry forward a compact continuity ledger: IDENTITY / PRODUCT / WARDROBE / PROP STATE / SCREEN DIRECTION / ENVIRONMENT STATE.
4. Prompt the next clip primarily for the new motion/action, not a full re-description of already anchored visual facts.
5. DELIBERATE CUT: do not force bridge-frame continuity; establish the new shot intentionally.

Good pattern: A burger hero shot ends with the package and burger in a stable three-quarter composition. The next macro shot begins from that approved end state, then performs only the new push-in/steam motion. A character walking through a fantasy corridor carries the approved last frame into the next continuation clip so wardrobe, face, corridor state and travel direction do not reset.

Avoid: using a blurry or distorted last frame as the next anchor; chaining every shot when an editorial cut is intended; carrying a bridge frame after an identity/product error; re-describing the anchored frame with conflicting wardrobe, lighting or geometry instructions.

Why HOLO needs it: Long-form or 30-second work is usually assembled from multiple short generations. A continuity bridge reduces visual resets between clips and gives HOLO a reproducible rule for building longer sequences from approved shots.

Evidence: Runway's current Image-to-Video Prompting Guide recommends creating longer sequences by extracting the last frame of a completed generation and using it as the image input for the next video, then combining the clips in an editor. Adobe Firefly also supports using the current timeline frame as a first/last frame and describes first/last frames as fixed visual guidance for how a generated clip begins and ends.

## 2. Control-Budget Arbitration
Categories: 전체 8개 카테고리

Core principle: Do not activate every available control at once. Before generation, choose the smallest compatible control set that protects the shot's highest-risk requirement. Treat controls as a limited budget and resolve conflicts before rendering.

Priority by shot risk:
- Identity/product fidelity critical → prioritize first/reference frame and explicit identity/product facts.
- Exact beginning/end state critical → prioritize first/last keyframes.
- Camera path critical → prioritize motion reference or camera controls when the provider allows them.
- Composition/depth critical → prioritize composition reference.
- Pure style exploration → style control can lead when identity/product/endpoint locks are not critical.

Arbitration:
1. Rank constraints as MUST PRESERVE / SHOULD GUIDE / OPTIONAL.
2. Query the selected provider's capability matrix before compiling the final request.
3. If two controls are incompatible, keep the higher-ranked MUST PRESERVE control and express the lower-ranked intent in plain motion/style language where safe.
4. Never silently drop an identity, product-truth or required endpoint constraint for a decorative style/camera option.
5. Keep the final prompt direct and physical; do not compensate for unavailable controls by piling on contradictory prose.

Good pattern: For a product commercial requiring an exact package and exact end card, use product/first-last frame locks first; keep camera language simple if the provider disables motion-reference controls with keyframes. For an environment fly-through where camera choreography is the selling point and no exact character/product identity is required, prefer a clean motion-reference route.

Avoid: simultaneously demanding incompatible keyframe, composition, motion-reference and style controls; sacrificing product geometry to keep a decorative style preset; hiding provider limitations from the routing layer; repeating the same control intent in several conflicting ways.

Why HOLO needs it: Model interfaces increasingly expose reference video, first/last frames, composition, camera motion, shot size, angle, style and seed, but these controls are not always simultaneously available. HOLO should decide which control matters most instead of passing an impossible bundle to the provider.

Evidence: Adobe Firefly documentation states that adding first/last frames can disable composition reference, motion reference, shot size, camera angle and style controls, and that selecting style can disable start/end frames. Firefly separately supports composition-reference video and camera-motion-reference video. Runway recommends direct, simple prompts and notes that the input image already establishes subjects, composition, color, lighting and style, so image-to-video text should focus mainly on desired motion.

## Runtime compatibility
These skills are additive to:
- 2026-09-15 Reference Role Separation / Performance Transfer Clean Plate.
- 2026-09-16 Motion-Cue Alignment Check / Selective Repair Before Full Regeneration.

Recommended HOLO decision order:
1. Identify category and provider/model.
2. Validate reference roles.
3. Rank constraints: MUST PRESERVE / SHOULD GUIDE / OPTIONAL.
4. Apply CONTROL_BUDGET_ARBITRATION against provider capabilities.
5. Run MOTION_CUE_ALIGNMENT_CHECK for image-to-video inputs.
6. Generate the simplest sufficient shot.
7. If continuing the same scene, create/validate a CONTINUITY_BRIDGE_FRAME for the next shot.
8. Evaluate defects and use SELECTIVE_REPAIR before full regeneration.

A · CONTROL: prioritize continuity ledger, bridge-frame quality and the smallest stable control set.
B · IMPACT: allow stronger camera choreography only after MUST PRESERVE identity/product/endpoint constraints are secured.
C · USER BASED: preserve user intent and wording, while silently resolving impossible provider-control combinations without inventing new story facts.

Sources reviewed 2026-09-17: Adobe Firefly Help — Match camera motion to reference video (updated 2026-08-18); Use video as composition reference (updated 2026-06-16); Generate video with Firefly models; Generate videos using images; Runway Help — Gen-4 Video Prompting Guide; Creating with Gen-4 Video; Image-to-Video Prompting Guide.