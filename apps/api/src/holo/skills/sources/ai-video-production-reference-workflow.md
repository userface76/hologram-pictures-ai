# Source Intake Notes — AI 영상 제작

Status: CURATED SOURCE NOTES
Reviewed: 2026-09-14
Source type: user-uploaded PDF

## Source structure
The source presents a 3-step AI-video workflow:

```text
1. Prepare or generate an image reference
2. Write a video prompt
3. Generate video using the reference + prompt
```

## Reusable production principles extracted

### Reference preparation
- reference images improve control over person design, background and visual direction
- image prompts should establish subject, background, camera/composition and style/light with concrete visible descriptions
- aspect ratio changes the balance between subject and environment, so it should be considered during reference preparation, not only at export

### Video prompting
- image-only generation is possible, but prompt text is needed for more precise control
- video prompts should specify motion, background movement, camera movement and temporal progression
- avoid vague motion language such as “look cool” or “everything moves”
- avoid sudden or unmotivated motion changes
- image prompts focus on a visual moment; video prompts add time, motion and progression

### Image-to-video
- when an image reference exists, use it as visual truth instead of asking the model to redesign appearance
- separate subject motion, environment motion and camera motion
- time/camera wording should be explicit when progression matters

### Start/end control
- using opening and ending reference states can improve transition control
- the prompt should bridge those states plausibly while preserving identity, environment and lighting continuity

### Iteration
- if a generated result is unsatisfactory, diagnose the failure and regenerate with revised controls rather than blindly rewriting everything
- failure categories include appearance, camera, motion, background, lighting, timing and continuity

## What was NOT promoted to universal CORE
- tool-specific quality claims about individual image/video products
- model/tool popularity claims
- style-copying examples tied to named living creators

Those items require separate current validation or should be translated into concrete visual traits.

## Promoted HOLO skill tags
- reference-first-workflow
- reference-image-recommended
- reference-as-visual-truth
- image-to-video-preservation
- aspect-ratio-composition
- subject-environment-camera-motion-separation
- background-motion-control
- camera-time-clarity
- temporal-progression
- dual-frame-transition-control
- regeneration-diagnosis-loop
- reference-preserving-impact-direction

## Runtime application
A CONTROL: reference fidelity and controllability first.
B IMPACT: stronger directing while preserving reference facts.
C USER BASED: preserve user story and use the reference as visual truth; add motion/camera/time only as needed.
