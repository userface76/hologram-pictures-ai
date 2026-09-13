# HOLO Director Runtime Skill v1.7 — Candidate Routing Overlay

Status: ACTIVE RUNTIME ROUTING OVERLAY

This file supplements v1.6. It exists specifically to prevent A, B and C from becoming paraphrases of the same directing plan.

## 1. Shared core
All options must preserve hard facts from uploaded references, user-supplied names/products, duration feasibility, model constraints and obvious continuity requirements.

Shared facts are not the same thing as shared directing strategy.

## 2. OPTION A — CONTROL route
Purpose: maximize controllability, identity/product accuracy and continuity.

Primary skill families:
- world-asset-identity-lock
- reference-driven-video-prompting
- continuity-editing-axis-match
- lighting-continuity-design
- scene-blocking-and-staging
- duration-feasibility
- camera-restraint
- product-integrity when relevant

Director behavior:
- prefer clear geography and readable staging
- use one primary camera intention
- keep motion budget conservative
- keep screen direction and lighting stable
- simplify events when duration is tight
- protect faces, wardrobe, product shape/logo/packaging and recurring props

A must not become "cinematic B with fewer adjectives". It should be structurally safer.

## 3. OPTION B — IMPACT route
Purpose: reinterpret the same core story with a substantially stronger visual strategy while preserving hard facts.

Primary skill families:
- director-visual-language
- shot-size-and-angle-language
- cinematic-story-architecture
- camera-purpose-mapping
- action-choreography-camera-logic when relevant
- cinematic-hit-marking-action-director when relevant
- short-drama-hook-engineering when relevant
- commercial-ad-psychology when relevant
- lighting mood / palette design
- product reveal / hero ending when relevant

Director behavior:
- change the opening shot strategy from A
- use a more expressive angle/lens relationship when justified
- create a stronger hook, reveal, escalation or emotional payoff
- use contrast between shot scale or perspective where feasible
- allow more expressive camera motion, but never random camera stacking
- end with a deliberate visual payoff

B must have a different camera/shot architecture from A, not merely richer wording.

## 4. OPTION C — USER BASED route
Purpose: preserve the user's own story and wording as much as possible.

Primary skill families:
- preserve-user-intent
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
- add camera angle, shot size, lens, composition, lighting, motion and ending framing only
- target preservationScore 90–100

## 5. Genre routing
The deterministic Skill Router may append genre skills.

Commercial/product:
A → product-integrity, commercial-clarity
B → commercial-ad-psychology, product-reveal, hero-ending

Food:
A → food-texture-continuity, controlled-food-motion
B → food-macro-language, appetite-lighting, hero-product-shot

Action:
A → action-geography, axis-continuity
B → action-choreography-camera-logic, hit-marking, dynamic-tracking

Dialogue:
A → dialogue-performance-blocking, dialogue-readability
B → emotional-push-in, audio-camera-coordination

Fashion:
A → fashion-identity-lock, clean-composition
B → fashion-editorial-language, lens-compression, fabric-motion

Short-form:
A → mobile-readability, safe-area
B → first-second-hook, short-drama-hook-engineering, payoff-design

Cinematic story:
A → cinematic-story-clarity, lighting-continuity
B → cinematic-story-architecture, director-visual-language, shot-progression

Environment:
A → environment-scene-bible, world-continuity
B → environment-motion, palette-design, scale-reveal

## 6. Difference gate
Before returning results, HOLO must verify:
- A and B do not use the same primary skill list
- A and B do not use the same opening camera strategy
- A and B do not use the same shot progression unless the user's constraints leave no alternative
- B contains at least one meaningful impact decision absent from A
- A contains at least one continuity/control decision absent from B

If these conditions fail, rewrite B before returning.

## 7. Output discipline
Each candidate returns 3–7 skill tags that reflect the actual route used. Do not invent decorative skill names after writing the prompt. Skill tags should explain why that prompt differs from the other options.
