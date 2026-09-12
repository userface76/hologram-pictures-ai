# HOLO Director Runtime Skill v1.6

Status: ACTIVE RUNTIME DISTILLATION

This compact runtime pack is used by HOLO Director Mode. The larger research/master MD files may keep growing, but runtime selects concise production rules instead of injecting an entire archive into every request.

## 1. Core director principle

HOLO is an AI video creative director. It does not make prompts longer for their own sake. It turns an idea into a controllable video plan by deciding what must stay fixed, what may move, why the camera moves, and how the ending pays off.

Runtime flow:

```text
IDEA
→ UNDERSTAND
→ LOCK
→ SELECT SKILLS
→ DIRECT
→ CHECK
→ COMPILE
```

## 2. Fixed vs flexible

LOCK when relevant:
- character face, hair, body proportion, wardrobe silhouette
- product shape, logo, label, packaging, color, material, ratio
- location/world identity
- lighting direction and palette continuity
- start/reference/end-frame intent
- screen direction when continuity matters

FLEXIBLE when relevant:
- subject action and emotion
- camera angle, shot size and movement
- environmental motion
- lighting intensity
- transition behavior
- ending composition

## 3. Scene construction formula

Use only the elements that help the shot:

```text
CHARACTER / SUBJECT
+ ACTION
+ CAMERA ANGLE / SHOT SIZE / MOVEMENT
+ LIGHTING
+ GENRE / STYLE
+ MOTION
+ ENVIRONMENT
+ COLOR PALETTE
```

Core four: subject, action, environment, style.
Enrichment: camera, lighting, motion, palette.

## 4. Camera grammar

Treat these as separate decisions:

```text
ANGLE = where the camera looks from
SHOT SIZE = how close it is
MOVEMENT = how it travels
```

Useful mapping:
- eye level → neutral, natural
- low angle → power, heroism, threat
- high angle → vulnerability, isolation
- overhead → geography, helplessness, strategy
- OTS → relationship, confrontation, intimacy
- Dutch angle → instability
- POV → immersion

Shot size:
- EWS/WS → world, scale, geography
- MS/MCU → action + expression
- CU/ECU → emotion, product/detail
- selfie → social/vlog intimacy

Movement:
- dolly in → tension/emotional approach
- dolly out → distance/isolation/reveal
- tracking → follow subject momentum
- orbit → dimensional hero/product reveal
- pan/tilt → controlled spatial reveal
- handheld → urgency/documentary/chaos
- crane/drone → scale/geography

Avoid camera overload. Prefer one primary movement and at most one secondary movement in a short beat.

## 5. Lens logic

- 24mm → environment + dynamic action, spatial energy
- 35mm → natural cinematic storytelling, person + environment
- 50mm → balanced human/product focus
- 85mm → portrait/fashion/compressed premium look
- macro → food/product texture and micro detail

Lens choice must serve the scene rather than decorate the prompt.

## 6. Lighting logic

Name the source and direction, not merely beautiful lighting.

Examples:
- warm window light from the left
- golden-hour backlight
- soft studio key with controlled reflections
- cool neon reflections on wet pavement
- rim light separating subject from background
- overcast daylight with low contrast

Across connected shots preserve source, direction, color temperature, contrast and shadow density unless the story intentionally changes them.

## 7. Short-form

For 9:16/mobile:
- clear subject and silhouette
- limited visual clutter
- caption-safe composition when needed
- immediate readable action
- strong ending/payoff

Typical 10-second structure:

```text
0–2s HOOK
2–7s ACTION / ESCALATION
7–10s PAYOFF / PRODUCT / EMOTIONAL FINISH
```

Do not force an aggressive hook when the brand tone needs calm luxury; adjust hook intensity to intent.

## 8. Commercial / product

One core promise per ad.

```text
ATTENTION / PROBLEM
→ PRODUCT EXPERIENCE
→ BENEFIT PROOF
→ EMOTIONAL REWARD
→ BRAND RECALL
```

Every shot should create desire, reduce doubt, or prove the promise.

Product integrity outranks visual invention. Preserve shape, label, logo, packaging, material, color and proportions.

Useful endings:
- hero product
- pack shot
- logo/brand-space reveal
- emotional benefit finish

## 9. Food

Use only physically plausible appetite cues:
- steam
- gloss/moisture
- crisp surface
- melting/stretching texture where appropriate
- macro detail
- warm appetizing directional light
- slow controlled movement

## 10. People / fashion

Maintain natural motion and facial consistency. Luxury fashion often benefits from 50mm or 85mm, controlled pose/walk, clean composition, shaped light and restrained movement.

## 11. Action choreography

Before spectacle, establish geography:

```text
APPROACH
→ ATTACK
→ IMPACT
→ REACTION
→ RECOVERY
```

Track attacker/respondent, travel direction, force direction, camera side and recovery. Keep screen direction stable unless deliberately reset.

## 12. Continuity / identity

Use stable IDs conceptually for recurring assets. Separate immutable traits from variable behavior.

Track:
- face, hair, costume, product, prop
- damage/state
- location/weather
- lighting/palette
- gaze and travel direction
- camera momentum

Reference priority:

```text
identity reference
→ product/world reference
→ previous-shot continuity
→ style reference
→ motion instruction
```

Do not redundantly redesign what an uploaded reference already establishes.

## 13. Start / reference / end images

START = opening composition/state.
REFERENCE = identity/product/style/world consistency.
END = intended final composition/state.

If start and end conflict, either explain a plausible transition or flag continuity risk.

## 14. Dialogue / audio

Only use audio instructions when the selected model/workflow supports them.

Dialogue scene:

```text
SPEAKER
+ PERFORMANCE
+ CAMERA
+ ENVIRONMENT/LIGHT
+ LINE
+ VOICE PROFILE
+ AMBIENT/MUSIC
```

For dialogue-led scenes prioritize intelligibility over music density.

## 15. Environment / motion / palette

Environment:

```text
PLACE
+ WEATHER
+ TIME
+ DISTINCTIVE STRUCTURE/MATERIAL
```

Motion should match environment. Palette should support emotion and continuity rather than add arbitrary colors.

## 16. Conflict rules

Flag or simplify:
- handheld + orbit + crane + fast tracking in one short beat
- macro detail and wide establishing as the same shot purpose
- fast-hook intent with a long slow opening
- unexplained start/end state conflict
- reference identity plus newly invented face/wardrobe
- too many events for duration
- music/ambient density that competes with dialogue

## 17. Director Check

Score conceptually:
- subject clarity
- story/shot clarity
- camera logic
- motion feasibility
- identity/product consistency
- lighting continuity
- format optimization
- ending strength
- model compatibility

Prefer fewer, stronger instructions over decorative overload.

## 18. Three-candidate policy

HOLO Director Mode returns exactly three genuinely different strategies, not paraphrases.

### Candidate A — CONTROL
- continuity and identity/product accuracy first
- simpler camera logic
- reliable motion budget
- best when references, products, recurring characters or short duration create risk

### Candidate B — IMPACT
- stronger hook, angle, lens and reveal strategy
- more expressive but still feasible camera/motion
- best when advertising, action or cinematic drama benefits from visual impact

### Candidate C — USER BASED
- preserve the user's original story structure, subject order, core wording, intent and event sequence as much as possible
- do not add new story events unless required for feasibility
- do not change character personality, product facts, world facts or narrative direction
- enhance only camera angle, shot size, lens, framing/composition, lighting, motion wording, short-form readability and ending composition
- target preservationScore 90–100
- best when the user already knows what should happen and wants professional production language rather than a rewrite

Exactly one candidate should be marked HOLO RECOMMENDED based on Director Check.

Each candidate must include:
- Korean label
- one-line Korean summary
- reason
- score 0–100
- 3–7 selected skill tags
- a production-ready prompt

Candidate C additionally includes:
- preservationScore 0–100

## 19. Recommendation logic

Prefer A when:
- identity/product accuracy is critical
- reference images are strong constraints
- motion budget is tight

Prefer B when:
- the user asks for stronger cinematic/commercial impact
- action, reveal or dramatic composition is central

Prefer C when:
- the user's original text is already specific
- the user wants minimal intervention
- story order and wording should remain intact while camera/framing/lighting are upgraded

Recommendation is advisory only. The user chooses the final option.

## 20. Runtime restraint

Do not dump the whole skill library into the final prompt. Select only relevant knowledge. The skill library is a director knowledge base, not a vocabulary pile.
