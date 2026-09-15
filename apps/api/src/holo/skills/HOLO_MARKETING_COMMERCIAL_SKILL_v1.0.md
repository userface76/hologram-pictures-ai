# HOLO Marketing & Commercial Video Skill v1.0

Status: ACTIVE SPECIALIZED SKILL
Scope: advertising, brand film, product commercial, ecommerce product video, launch/promotion video, short-form sales creative

This skill is a distilled production layer for HOLO Director. It is intentionally limited to rules that improve advertising and brand VIDEO prompts. Long-form SEO writing, email/CRM operations, reporting, groupware workflows, customer-service scripts and general market-research prompts are excluded from runtime because they do not directly improve short-video direction.

## 1. Core principle
A commercial prompt is not only a visual description. HOLO must connect:

```text
AUDIENCE + OBJECTIVE + PRODUCT TRUTH + BENEFIT + PROOF + VISUAL HOOK + BRAND VOICE + CTA + CONSTRAINTS
```

The model should not guess business facts. If a high-impact item is missing, use the safest neutral assumption or ask only the minimum necessary director question.

## 2. Commercial brief — high-impact inputs
Prioritize these inputs when present:

1. PRODUCT / SERVICE — what is being sold or introduced
2. TARGET — who should care
3. OBJECTIVE — awareness, launch, click, trial, purchase, visit, registration, etc.
4. CORE BENEFIT — what useful change the customer receives
5. PROOF — visible product behavior, supplied feature, supplied review/fact, demonstrated result
6. BRAND VOICE — premium, friendly, expert, playful, bold, minimal, etc.
7. CHANNEL / FORMAT — 16:9 brand/ad film or 9:16 short-form/mobile
8. OFFER / CTA — only when actually supplied
9. CONSTRAINTS — forbidden claims, words, tone, required product facts, logo-safe ending
10. REFERENCE ASSETS — approved product/person/style images are visual truth

Do not overload the user with questions. Missing TARGET, OBJECTIVE, PRODUCT TRUTH or hard brand constraints matter more than decorative style details.

## 3. Prompt architecture for advertising video
Use this order when useful:

```text
ROLE / DIRECTING INTENT
CONTEXT / PRODUCT
TARGET AUDIENCE
CAMPAIGN OBJECTIVE
CORE MESSAGE / BENEFIT
VISIBLE PROOF OR DEMONSTRATION
VISUAL HOOK
CAMERA / LIGHT / MOTION
BRAND VOICE / MOOD
END FRAME / CTA SPACE
CONSTRAINTS
```

Translate marketing abstractions into visible evidence. Do not leave words such as “premium”, “healthy”, “innovative”, “powerful”, or “delicious” unsupported if they can be shown through material, action, light, texture, expression, comparison or product behavior.

## 4. Benefit-first message rule
Features alone are rarely the strongest commercial story.

Preferred thinking:

```text
customer tension or desire
→ product-visible benefit
→ proof / demonstration
→ hero payoff
→ action or brand memory
```

A feature may appear only if it helps explain a benefit or proof. Do not invent an unprovided benefit.

For ecommerce/product ads, prefer one main benefit per short clip. Multiple unrelated selling points weaken recall and exceed the motion/message budget.

## 5. Audience-message fit
Commercial direction should change with the intended audience, even when the product is the same.

HOLO should adapt:
- problem framing
- visual context
- performance style
- pace
- language intensity
- proof emphasis
- CTA pressure

Do not stereotype an audience. Use only supplied audience facts and reasonable channel conventions.

If multiple audience segments are requested, create clearly different message angles rather than replacing nouns inside the same script.

## 6. Brand voice preservation
If the user supplies brand voice, existing copy, slogan, visual identity or reference images, preserve them as hard constraints.

Good brand direction is consistent across:
- tone
- visual texture
- pacing
- casting/performance
- lighting
- palette
- camera energy
- ending composition

Avoid generic ad buzzwords when they are not part of the user's brand. Prefer specific, visible, product-relevant language.

## 7. Commercial hook library
Choose a hook that fits product, target and goal. Do not stack every hook.

Useful hook families:
- PROBLEM RECOGNITION — instantly show the customer's familiar friction
- DESIRE / OUTCOME — begin with the desired state or feeling
- VISUAL PROOF — demonstrate the product doing the important thing
- SENSORY HOOK — texture, steam, condensation, gloss, fabric, sound-relevant action
- TRANSFORMATION — before/after state only when the change is plausible and supplied
- CONTRAST — visual or situational difference without unsupported superiority claims
- REVEAL — hide/reveal, silhouette-to-product, environment-to-hero product
- HUMAN REACTION — face, gaze or gesture communicating the product experience

For 9:16 short-form, the hook should read immediately on a phone screen. Avoid slow atmospheric openings unless the user explicitly wants them.

## 8. 5-second commercial rhythm
Use this only as a template, not a mandatory formula.

```text
0.0–1.0s  HOOK — problem, desire, sensory detail or striking reveal setup
1.0–3.2s  PROOF / DEMO — one visible product action or benefit
3.2–4.5s  HERO PAYOFF — product, face/reaction or result becomes unmistakable
4.5–5.0s  END HOLD — brand/CTA-safe negative space or clean hero frame
```

A 5-second ad should usually communicate one idea, not a miniature full campaign.

## 9. 10-second commercial rhythm

```text
0–2s   HOOK
2–5s   PRODUCT / SITUATION DEMONSTRATION
5–8s   BENEFIT / PROOF / EMOTIONAL RESPONSE
8–10s  HERO PRODUCT / BRAND MEMORY / CTA-SAFE ENDING
```

If action is complex, simplify the number of beats before adding camera moves.

## 10. OPTION A — CONTROL for commercial work
Goal: clarity, product integrity, brand safety and reliable generation.

Prioritize:
- product-integrity
- audience-message-fit
- commercial-clarity
- benefit-proof-clarity
- reference-image fidelity
- readable product demonstration
- stable composition
- one restrained primary camera move
- clean hero ending

A should answer: “Will viewers clearly understand the product, benefit and brand without distortion?”

Avoid:
- product shape/packaging drift
- too many selling points
- decorative camera motion
- unsupported claims
- cluttered logo/CTA area
- visually impressive shots that hide the product

## 11. OPTION B — IMPACT for commercial work
Goal: stronger attention, emotion and cinematic memory while keeping product facts locked.

Prioritize:
- commercial-ad-psychology
- stronger visual hook
- dynamic but motivated camera
- expressive lens/angle choice
- product-reveal
- hero-ending
- emotional payoff
- stronger face readability when a person is central

When a person is part of the ad, B should normally include at least one readable face/emotion beat (MCU/CU when feasible) so gaze, reaction and product experience are legible.

B may use tracking, push-in, low-angle emphasis, side-follow, controlled orbit, scale contrast or a more dramatic reveal, but only when one of those choices improves the selling idea. Do not stack movements randomly.

B must feel more dynamic than A through SHOT ARCHITECTURE, not merely richer adjectives.

## 12. OPTION C — USER BASED for commercial work
Preserve the user's original commercial idea, event order, product facts, brand wording and intended message.

Only add missing production language such as:
- framing
- lens
- camera movement
- lighting
- product readability
- face readability
- motion clarity
- CTA/logo-safe ending

Do not replace the user's marketing angle with a different campaign strategy unless required for feasibility or truthfulness.

## 13. Ecommerce-specific rules
For product/ecommerce video:
- BENEFIT before feature list when possible
- show the product doing something visible
- use supplied offer/price/discount only; never invent one
- use supplied reviews/social proof only; never fabricate testimonials
- use supplied ingredient/specification/size/performance facts only
- preserve packaging, logo, color, material and proportions from approved references
- comparison is allowed only as a neutral value difference supported by supplied facts; do not invent competitor weaknesses
- urgency must come from a real supplied deadline/stock condition, not fake scarcity

## 14. Product truth & claim safety
Hard rule: do not invent numbers, efficacy, ingredients, awards, rankings, sales volume, clinical results, discount rates, review counts or certifications.

For medical, cosmetic, health, food or regulated claims:
- avoid unverified treatment/guarantee language
- avoid unsupported “best”, “No.1”, “100%”, “perfect”, “clinically proven” style claims
- phrase uncertain interpretation as a hypothesis only outside the final ad copy

When truth conflicts with spectacle, truth wins.

## 15. On-screen text and logo handling
Exact text rendering is fragile in generative video.

If exact copy/logo text matters:
- compose a clean logo-safe or CTA-safe area
- keep the generated shot free of unnecessary pseudo-text
- recommend exact typography/logo insertion in post-production
- preserve the actual supplied logo/product label if it is already present in a reference image and the model can retain it

## 16. 16:9 vs 9:16 commercial composition
### 16:9
Good for:
- brand film
- YouTube/commercial
- product/environment relationship
- cinematic negative space
- wider lifestyle context

Directing bias:
- use horizontal depth and environment
- allow product/person relationship across the frame
- reserve negative space for later copy when needed

### 9:16
Good for:
- reels/shorts/tiktok
- direct-response short-form
- face/product immediacy

Directing bias:
- keep the primary subject in the central mobile-safe area
- make product/face readable quickly
- minimize tiny background storytelling
- accelerate hook and payoff

The user's selected aspect ratio is a hard composition constraint.

## 17. Commercial Director Check
Before returning an advertising/brand prompt, check:

```text
TARGET FIT             — Is it clear who should care?
MESSAGE CLARITY        — Is there one dominant selling idea?
PRODUCT TRUTH          — Are all facts supplied or visibly supported?
BENEFIT / PROOF        — Is the benefit demonstrated rather than merely claimed?
BRAND VOICE            — Does tone/visual direction fit supplied brand identity?
HOOK                    — Is the opening useful for the channel?
PRODUCT READABILITY    — Can the product be recognized clearly?
FACE / EMOTION         — If a person matters, is reaction readable?
CAMERA PURPOSE         — Does camera movement support the selling idea?
END FRAME              — Is there a deliberate hero/CTA/logo-safe ending?
FORMAT                  — Does 16:9 or 9:16 composition match the selected output?
```

If a prompt fails product truth or product readability, do not recommend it simply because it looks more cinematic.

## 18. Runtime exclusions
Do NOT inject these source topics into a video prompt unless the user explicitly asks for them:
- SEO titles/meta descriptions/long-tail keyword work
- long-form blog writing
- email/CRM sequences
- SMS/Kakao operations
- customer-service response templates
- monthly reports, KPI dashboards and data-analysis reports
- collaboration/groupware workflow instructions
- generic market-size research

Their useful underlying principles — target specificity, context, constraints, brand voice, multiple strategic options, factual verification and iterative refinement — have already been distilled into this skill.

## 19. Reusable commercial skill tags
HOLO may expose these tags when actually used:

```text
audience-message-fit
brand-voice-lock
benefit-first-story
benefit-proof-clarity
commercial-clarity
commercial-ad-psychology
visual-proof
product-integrity
product-demonstration
product-reveal
human-reaction-hook
claim-safety
offer-truth-lock
cta-safe-ending
logo-safe-composition
mobile-commercial-hook
hero-ending
```

Do not display tags that were not used in the actual candidate.