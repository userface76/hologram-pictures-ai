# Source Distillation — 15-2 영상 프롬프트 공식

Status: CURATED SOURCE DISTILLATION
Source: user-uploaded PDF `15md.pdf`
Reviewed: 2026-09-14
Runtime destination: HOLO Director core runtime + candidate routing overlay

This file keeps a concise, source-faithful record of the uploaded material so later runtime revisions can trace where the rules came from without copying the full source text.

## 1. Core premise
The source frames video prompting as an extension of image prompting: a static visual description gains movement/action and camera direction.

## 2. Compact 4-material formula

```text
1. SUBJECT / 피사체
2. ACTION / 동작
3. BACKGROUND / 배경
4. CAMERA · STYLE / 카메라·스타일
```

Operational interpretation:
- SUBJECT: describe concrete visible properties rather than vague labels.
- ACTION: describe physical movement in sentence form.
- BACKGROUND: identify place, time and light.
- CAMERA · STYLE: use recognizable shooting/style language.

## 3. Subject rule
Prefer visible attributes such as material, shape, color and distinctive components over abstract descriptions.

## 4. Action rule
Describe what physically moves, how fast it moves, and relevant visible physical phenomena such as steam, light changes or droplets when they naturally belong to the action.

## 5. Background rule
Use place + time + light as the basic background description.

## 6. Camera/style rule
The source uses practical examples such as close-up, wide shot, slow motion, tracking shot, low angle and film/cinematic tone to communicate shooting intent.

## 7. Audio note
The source states that sound directions such as background ambience or an object sound may be included. HOLO keeps this model/workflow-dependent rather than universal.

## 8. Image-first workflow
The source recommends starting from an already approved product image when product appearance must stay controlled, then mainly instructing movement and camera behavior.

HOLO operational mapping:

```text
APPROVED IMAGE
→ VISUAL LOCK
→ MOTION + CAMERA
```

## 9. Common mistakes and corrections
Source-derived cautions:
- abstract adjectives only → translate into visible descriptions
- many scenes in one clip → split into multiple clips / one primary scene per clip
- exact on-screen text → prefer subtitle/text work in editing when exact legibility matters
- unstable face close-up → consider back view, hands or silhouette as a fallback composition

The face-close-up point is treated as a fallback rule in HOLO runtime rather than an automatic restriction.

## 10. Runtime placement
These rules were integrated into:
- prompt architecture
- subject specificity
- action/motion
- background/environment
- camera/style
- lighting
- commercial/product image-first flow
- dialogue/audio
- one-scene-per-clip
- on-screen text policy
- common-failure rules
- Director Check
- A/B/C candidate routing
