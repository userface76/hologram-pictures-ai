# HOLO Director Runtime Skill v1.7.1 — Candidate Routing Overlay

Status: ACTIVE RUNTIME ROUTING OVERLAY

This file supplements the active core runtime pack. It exists specifically to prevent A, B and C from becoming paraphrases of the same directing plan while sharing the same factual source material.

## 1. Shared core
All options must preserve hard facts from uploaded references, user-supplied names/products, duration feasibility, model constraints and obvious continuity requirements.

Shared facts are not the same thing as shared directing strategy.

All three routes may use the compact 4-material skeleton when useful:

```text
SUBJECT — concrete visible attributes
+ ACTION — physical observable motion
+ BACKGROUND — place, time, light
+ CAMERA / STYLE — how the scene is shot and delivered
```

Shared quality rules:
- translate abstract adjectives into visible evidence
- describe motion physically rather than vaguely
- keep one primary scene per short clip
- use approved product/reference images as visual truth when available
- do not rely on generated on-screen text when exact copy is critical

## 2. OPTION A — CONTROL route
Purpose: maximize controllability, identity/product accuracy and continuity.

Primary skill families:
- subject-attribute-specificity
- physical-action-description
- background-place-time-light
- world-asset-identity-lock
- reference-driven-video-prompting
- continuity-editing-axis-match
- lighting-continuity-design
- scene-blocking-and-staging
- duration-feasibility
- camera-restraint
- image-first-product-control when relevant
- product-integrity when relevant

Director behavior:
- build the 4 materials clearly and conservatively
- prefer clear geography and readable staging
- use one primary camera intention
- keep motion budget conservative
- keep screen direction and lighting stable
- simplify events when duration is tight
- protect faces, wardrobe, product shape/logo/packaging and recurring props
- if an approved product image exists, keep it fixed and add motion/camera rather than redesigning it

A must not become "cinematic B with fewer adjectives". It should be structurally safer.

## 3. OPTION B — IMPACT route
Purpose: reinterpret the same core story with a substantially stronger visual strategy while preserving hard facts.

Primary skill families:
- director-visual-language
- shot-size-and-angle-language
- cinematic-story-architecture
- camera-purpose-mapping
- visible-style-translation
- action-choreography-camera-logic when relevant
- cinematic-hit-marking-action-director when relevant
- short-drama-hook-engineering when relevant
- commercial-ad-psychology when relevant
- lighting mood / palette design
- product reveal / hero ending when relevant

Director behavior:
- preserve subject/action/background facts, but redesign CAMERA / STYLE more aggressively
- change the opening shot strategy from A
- use a more expressive angle/lens relationship when justified
- create a stronger hook, reveal, escalation or emotional payoff
- use contrast between shot scale or perspective where feasible
- allow more expressive camera motion, but never random camera stacking
- convert vague style requests into concrete shot, light, color or motion decisions
- end with a deliberate visual payoff

B must have a different camera/shot architecture from A, not merely richer wording.

## 4. OPTION C — USER BASED route
Purpose: preserve the user's own story and wording as much as possible.

Primary skill families:
- preserve-user-intent
- four-material-prompt-formula
- subject-attribute-specificity
- physical-action-description
- background-place-time-light
- camera-grammar
- framing-enhancement
- lighting-source-rule
- motion-wording
- ending-framing
- reference/identity lock only when required

Director behavior:
- do not add new story events
- do not reorder events unless required for feasibility
- do not change personality, product facts or world facts
- inspect the user's original text through the 4-material lens
- if SUBJECT / ACTION / BACKGROUND are already present, preserve them and mainly improve CAMERA / STYLE
- if one material is missing, fill it minimally without changing the story
- add camera angle, shot size, lens, composition, lighting, motion and ending framing only
- target preservationScore 90–100

## 5. Genre routing
The deterministic Skill Router may append genre skills.

Commercial/product:
A → product-integrity, image-first-product-control, commercial-clarity
B → commercial-ad-psychology, product-reveal, hero-ending
C → preserve-product-facts, camera-style-enhancement

Food:
A → food-texture-continuity, controlled-food-motion
B → food-macro-language, appetite-lighting, hero-product-shot
C → preserve-food-action, physical-motion-wording, camera-style-enhancement

Action:
A → action-geography, axis-continuity, one-scene-per-clip
B → action-choreography-camera-logic, hit-marking, dynamic-tracking
C → preserve-action-order, physical-action-description, camera-enhancement

Dialogue:
A → dialogue-performance-blocking, dialogue-readability
B → emotional-push-in, audio-camera-coordination
C → preserve-dialogue-content, restrained-audio-cues, camera-framing

Fashion:
A → fashion-identity-lock, clean-composition
B → fashion-editorial-language, lens-compression, fabric-motion
C → preserve-look, visible-attribute-lock, camera-style-enhancement

Short-form:
A → mobile-readability, safe-area, one-scene-per-clip
B → first-second-hook, short-drama-hook-engineering, payoff-design
C → preserve-user-flow, mobile-readability, ending-framing

Cinematic story:
A → cinematic-story-clarity, lighting-continuity
B → cinematic-story-architecture, director-visual-language, shot-progression
C → preserve-story-order, visible-style-translation, camera-enhancement

Environment:
A → environment-scene-bible, world-continuity, background-place-time-light
B → environment-motion, palette-design, scale-reveal
C → preserve-location-facts, background-place-time-light, camera-style-enhancement

## 6. Common failure routing
When relevant, append these support rules:
- vague-style-only → visible-style-translation
- too-many-scenes → one-scene-per-clip
- exact-generated-text → text-postproduction
- unstable-face-closeup → face-fidelity-fallback
- approved-product-image → image-first-product-control
- unsupported/random physical effects → physical-effect-relevance

## 7. Difference gate
Before returning results, HOLO must verify:
- A and B do not use the same primary skill list
- A and B do not use the same opening camera strategy
- A and B do not use the same shot progression unless the user's constraints leave no alternative
- B contains at least one meaningful impact decision absent from A
- A contains at least one continuity/control decision absent from B
- C preserves the user's event sequence and does not introduce a new narrative beat
- C should usually improve missing CAMERA / STYLE rather than rewrite SUBJECT / ACTION / BACKGROUND

If these conditions fail, rewrite the relevant candidate before returning.

## 8. Output discipline
Each candidate returns 3–7 skill tags that reflect the actual route used. Do not invent decorative skill names after writing the prompt. Skill tags should explain why that prompt differs from the other options.
