# HOLO Reference-First Video Workflow v1.0

Status: ACTIVE SUPPORTING SKILL

Purpose: improve visual consistency and controllability by treating reference images as production anchors before video motion is designed.

## 1. Reference-first production loop

Preferred workflow when character, product, environment or art direction consistency matters:

```text
1. PREPARE / SELECT REFERENCE IMAGE
2. WRITE VIDEO MOTION PROMPT
3. GENERATE VIDEO
4. INSPECT FAILURES
5. REVISE PROMPT OR REFERENCE STRATEGY
6. REGENERATE
```

Text-only generation is allowed, but reference-first is preferred when exact appearance matters.

## 2. Reference image preparation

A useful reference should establish as many of these as necessary:
- SUBJECT: visible identity, shape, wardrobe/product details
- BACKGROUND: place, spatial layout, materials
- CAMERA / COMPOSITION: framing, distance, angle
- STYLE / LIGHT: visual treatment, lighting source/direction, palette

Do not rely on vague labels when visible descriptions are available.

Reference-image principle:

```text
VISUAL IDENTITY FIRST
→ MOTION SECOND
```

If an approved image already communicates appearance, do not redesign it in the video prompt.

## 3. Aspect ratio is composition, not metadata only

Aspect ratio changes how subject and environment share the frame.

HOLO should consider:
- 9:16 → mobile readability, centered or deliberately offset subject, safe text zones, tighter environmental budget
- 16:9 → wider spatial storytelling, stronger environment/context, lateral movement and multi-subject composition
- 1:1 → balanced central composition where relevant

Do not treat ratio as a final export setting only. It affects reference-image composition and video camera planning.

## 4. Image prompt vs video prompt

IMAGE PROMPT primarily defines a moment:
```text
SUBJECT + BACKGROUND + CAMERA/COMPOSITION + STYLE/LIGHT
```

VIDEO PROMPT adds time:
```text
SOURCE VISUAL STATE
+ SUBJECT MOTION
+ ENVIRONMENT MOTION
+ CAMERA MOTION
+ TEMPORAL PROGRESSION
+ END STATE
```

The video prompt should not unnecessarily repeat the entire visual design when the reference already establishes it.

## 5. Image-to-video motion control

When a reference/start image exists:
- preserve visible identity and composition unless the user requests a transition
- describe subject motion physically
- describe environment motion separately when useful
- describe camera movement separately
- make timing/progression clear when needed

Avoid vague instructions such as:
- “look cool”
- “everything moves”
- sudden unexplained motion changes

Prefer:
- controlled directional movement
- motivated camera movement
- gentle environmental motion tied to wind/light/water/traffic/etc.
- clear start → progression → end

## 6. Background-motion rule

A video scene is not only a moving subject.

When the environment should feel alive, specify only relevant motion such as:
- leaves or fabric moving in wind
- sunlight shifting as subject/camera moves
- water reflections changing
- traffic or crowd motion at a controlled level
- steam, dust, rain or particles when physically justified

Background motion must support the subject, not compete with it.

## 7. Dual-frame transition control

When both START and END frames exist:

```text
START FRAME = opening state/composition
END FRAME = intended final state/composition
PROMPT = plausible motion bridge between them
```

HOLO should preserve:
- character/product identity
- major environment facts
- lighting logic unless intentionally changing
- travel direction / screen direction where relevant

If the two frames conflict, flag the transition risk instead of inventing impossible continuity.

## 8. Reference recommendation rule

When no image is provided but the request depends heavily on exact visual consistency, HOLO may recommend preparing a reference before rendering.

Strong triggers:
- recurring named character
- exact product/package/logo appearance
- exact costume/look
- a highly specific location/world
- a shot intended to continue into future episodes

Do not block simple creative text-to-video ideas that do not need a reference.

## 9. Regeneration diagnosis loop

When a generated result fails, diagnose the failure category before rewriting everything.

Check:
- identity / face drift
- product shape or label drift
- camera movement mismatch
- background/world mismatch
- motion too abrupt or too broad
- lighting mismatch
- rhythm/timing mismatch
- start/end continuity failure

Then revise the smallest relevant part.

Operational principle:

```text
GENERATE
→ OBSERVE FAILURE
→ EDIT THE RESPONSIBLE CONTROL
→ REGENERATE
```

Do not treat the first output as final by default.

## 10. Tool/model separation

Different video generators interpret prompts and reference controls differently.

CORE stores universal workflow principles only.
Model-specific reference limits, camera features, sound behavior and frame-control syntax belong in MODEL ADAPTER skills and must be validated separately.

## 11. HOLO A/B/C application

### A — CONTROL
Prefer reference-first when fidelity matters. Keep appearance locked, motion moderate, camera clear, and start/end continuity explicit.

### B — IMPACT
Preserve reference facts but redesign camera, shot scale, reveal and environment motion for stronger impact. Do not sacrifice identity/product fidelity without user intent.

### C — USER BASED
Preserve the user's original content. If a reference image exists, treat it as visual truth and add only the motion/camera/time details needed to animate it.

## 12. Director Check additions

Before finalizing, ask:
- Would a reference image materially improve consistency?
- Is aspect ratio reflected in composition, not just metadata?
- Are subject motion, environment motion and camera motion clearly separated?
- If START/END exist, is the transition physically plausible?
- Did we avoid vague or sudden motion instructions?
- If this is a retry, did we change the failed control rather than rewrite everything?
