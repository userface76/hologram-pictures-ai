# HOLO Director Runtime Skill v1.7.2 — Candidate Routing Overlay

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
- preserve the user's original prompt granularity unless a missing production detail would make generation unreliable
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

## 9. Prompt granularity ladder
HOLO supports three prompt-detail levels. Choose the lowest level that gives enough control for the user's request.

### LEVEL 1 — ONE-LINE CREATIVE PROMPT
Goal: maximum creative latitude, minimum control.

Use when:
- the user gives a short idea or concept
- the exact camera/timing is not important
- playful ideation or rapid variation matters more than repeatability

Preferred shape:
```text
[STYLE optional] + [SUBJECT / SITUATION] + [ONE PRIMARY ACTION or ONE LINE OF DIALOGUE]
```

Rules:
- keep it to one clear visual idea
- one primary action is better than several unrelated events
- dialogue, if present, should be short
- do not inflate a one-line idea into a shot-by-shot screenplay unless the user asks for more control
- A may clarify missing visual facts; B may strengthen style/camera; C should preserve the one-line nature as much as possible

### LEVEL 2 — BASIC STRUCTURED PROMPT
Goal: balanced creativity and control.

Use when:
- the scene needs a clear shot, mood, action, dialogue or sound
- one scene contains several coordinated elements
- the user wants more reliable generation without full timeline choreography

Recommended structure:
```text
SCENE DESCRIPTION
CAMERA SHOT / ANGLE
MOOD
ACTIONS
DIALOGUE optional
SOUND optional
```

Rules:
- scene description establishes who/where/what
- camera describes shot size/angle and only necessary movement
- mood should be translated into visible lighting/color/performance cues where possible
- actions should be sequential and physically observable
- dialogue and sound remain concise and subordinate to the visual action

### LEVEL 3 — ADVANCED CAMERA & TIMING PROMPT
Goal: high control over a short cinematic sequence.

Use when:
- the user specifies timing, lenses, depth of field, camera movement, shot progression, lighting logic or sound design
- a 6–15 second clip needs beat-by-beat choreography
- action, food/product macro, commercial hero shots or cinematic sequences require precise progression

Recommended structure:
```text
SCENE DESCRIPTION
LENS / SHOT / DEPTH OF FIELD
CAMERA MOVEMENT
TIMING BEATS
ACTIONS
LIGHTING / PALETTE
DIALOGUE optional
SOUND / MUSIC
EMOTIONAL INTENT / END FRAME
```

Rules:
- timing beats must fit the requested total duration
- each beat should have one dominant visual purpose
- camera/lens changes must be motivated by story or visual function, not decoration
- preserve screen direction, lighting logic and identity continuity across beats
- advanced detail must improve controllability; remove detail that competes with the model's motion budget

## 10. Granularity preservation rule
Do not assume "more detailed" always means "better".

HOLO should first infer the user's current level:
- very short concept / one clear sentence → Level 1
- labeled or clearly structured scene/camera/action/dialogue → Level 2
- explicit timestamps, multiple lens/shot instructions, DoF or beat choreography → Level 3

Routing behavior:
- OPTION A may increase detail by one level when needed for reliability
- OPTION B may increase detail by one level when stronger visual direction is beneficial
- OPTION C should normally remain at the user's current level and only fill missing camera/framing/lighting/motion information

Never convert every Level 1 idea into Level 3. Complexity is a tool, not a quality score.

## 11. Timing choreography rule
For advanced short-video prompts:
- define the total duration first
- split time into readable beats
- prefer 3–5 meaningful beats for a 10-second clip unless a simpler scene needs fewer
- each beat should describe camera + action + visible consequence
- avoid simultaneous unrelated actions that exceed the motion budget
- leave a short final hold when a hero/product/poster frame matters

Useful pattern for 10 seconds:
```text
0–2s OPEN / HOOK
2–4s ACTION SETUP
4–6s MAIN ACTION / TRANSITION
6–8s RESPONSE / REVEAL
8–10s PAYOFF / END HOLD
```

This is a template, not a mandatory rhythm.

## 12. Lens, DoF and camera progression
Advanced prompts may specify lens and depth of field when they materially change the visual result.

Guidelines:
- macro / long focal lengths support texture, food, product detail and facial emphasis
- wider lenses support geography, speed and spatial energy
- shallow DoF supports emphasis but can reduce environmental readability
- medium DoF supports action geography and continuity
- lens or shot changes inside one short clip should feel like a coherent progression, not a list of camera gear
- if multiple lens changes are requested, verify that the model/workflow can plausibly express the intended transition; otherwise simplify to a dominant lens/look

## 13. Dialogue and sound by prompt level
Level 1:
- dialogue optional; one short line
- sound usually omitted unless central to the idea

Level 2:
- dialogue may identify speaker + line
- sound may include 1–2 important ambient/effect cues

Level 3:
- dialogue timing may be placed inside a beat when needed
- sound design may include ambience, critical effects, breath/foley and intentional no-BGM
- do not overcrowd the soundtrack; dialogue intelligibility and critical effects outrank decorative audio

## 14. End-frame / poster-frame rule
When the final image matters, design the last beat deliberately.

Possible endings:
- product hero frame
- character emotional hold
- reveal of destination/object
- stable poster-like composition
- logo-safe negative space when post-production branding is expected

For short clips, a brief final hold can improve readability. Do not freeze the image if the requested style calls for continuous motion.

## 15. Physical realism in advanced action
For grounded cinematic action:
- establish corridor/room geography before rapid motion
- track direction of travel and cover positions
- use environmental effects such as water, sparks, reflections, smoke or debris only when they respond plausibly to the scene
- lighting effects should have a source: practical lights, emergency lights, muzzle flash, reflected water, etc.
- camera shake should communicate urgency without destroying readability
- the emotional objective should remain legible beneath technical choreography

The purpose of technical detail is to make the scene more believable and controllable, not merely more complicated.
