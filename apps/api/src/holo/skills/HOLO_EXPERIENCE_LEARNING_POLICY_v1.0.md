# HOLO Experience Learning Policy v1.0

Status: ACTIVE GOVERNANCE POLICY

Purpose: allow HOLO to improve from accumulated production experience while protecting each member's private work, personal data and unique creative assets.

This policy governs the future EXPERIENCE MEMORY → GLOBAL SKILL learning pipeline. It is intentionally separate from ordinary project storage and prompt generation.

## 1. Core principle

HOLO may learn from repeated production patterns, but it must not treat one member's raw work as reusable content for another member.

```text
USER WORK
→ PRIVATE PROJECT MEMORY
→ PRIVACY FILTER
→ DE-IDENTIFIED EXPERIENCE SIGNALS
→ AGGREGATED PATTERN
→ SKILL CANDIDATE
→ REVIEW / EVALUATION
→ ACTIVE GLOBAL SKILL
```

The object of learning is the GENERAL PRODUCTION TECHNIQUE, not the member's original work.

## 2. Three-layer memory separation

### Layer A — PROJECT MEMORY
Private to the member/project.

May contain:
- project title
- raw user prompt
- A/B/C prompt candidates
- selected final prompt
- uploaded start/reference/end images
- generated videos and thumbnails
- character names and identity details
- private products/brands
- world-building, story and episode continuity
- project-specific camera, lighting and state information

Rule:

```text
PROJECT MEMORY
≠ GLOBAL SKILL DATA
```

Project Memory must not be retrieved to help a different member unless the original owner explicitly shared that content through a dedicated sharing feature.

### Layer B — EXPERIENCE MEMORY
De-identified or aggregated production signals used to understand what tends to work or fail.

Preferred fields are structural signals rather than raw creative content, for example:
- genre/category
- output format / aspect ratio
- duration bucket
- generation model + model version
- selected A/B/C route
- routed skill IDs
- camera strategy category
- reference-image presence
- start/end-frame presence
- retry count bucket
- edit magnitude bucket
- failure category
- user rating / success signal where available
- save/final-selection signal

Avoid storing raw prompt text, raw images or raw videos in Experience Memory when the same learning objective can be achieved from structured signals.

### Layer C — GLOBAL HOLO SKILL
Generalized, reusable production knowledge available to all users.

Examples of valid Global Skill knowledge:
- a short-form food ad often benefits from one clear macro hook rather than several unrelated opening shots
- identity drift rises when camera complexity and motion complexity are both high
- an approved product reference should be treated as visual truth rather than redesigned from text

Global Skill must contain generalized production logic, not a reconstructable member work.

## 3. Content that must never be copied into Global Skills

Do not promote or reproduce these as shared skill content:
- raw member prompts
- raw uploaded images
- raw generated videos
- names, email addresses, account IDs or contact details
- face images, face embeddings or identity-specific biometric representations
- private character identity descriptions tied to a real member/project
- private brand assets, package artwork, logos or unreleased product details
- project titles when they can identify a private work
- unique storylines, scripts, dialogue or world-building from a member project
- private client briefs
- confidential business information
- any other data that would allow another user to reconstruct the original member work

Rule:

```text
NO RAW CROSS-USER REUSE
NO PRIVATE WORK IN GLOBAL SKILLS
NO RECONSTRUCTABLE MEMBER CONTENT
```

## 4. Consent / notice gate

Before HOLO collects or uses member activity for service-improvement learning beyond what is necessary to provide the requested service, the product must provide appropriate notice and user choice for the intended use.

Product requirement before activating the learning pipeline:
- explain what production signals may be used
- explain the purpose: service and skill improvement
- distinguish private project storage from aggregated learning
- provide an appropriate opt-out or control where the product policy requires it
- avoid silently changing a private project into shared training material

This file defines a product governance rule. It does not by itself constitute legal compliance for any jurisdiction.

## 5. Privacy filter before Experience Memory

Before an event is eligible for Experience Memory, remove or avoid:
- direct identifiers
- usernames / emails
- project titles
- raw prompt text when structured features are sufficient
- image/video URLs
- face or identity-specific descriptors
- client/company secrets
- unique copyrighted or proprietary creative passages

Prefer categorical or bucketed representations.

Example:

```text
BAD EXPERIENCE RECORD
user_email: person@example.com
prompt: "SEOA runs through ... MR. BURGER ..."
image_url: https://...

BETTER EXPERIENCE RECORD
category: action-commercial
format: 9:16
duration_bucket: 8-10s
model: MiniMax-H3
route: B_IMPACT
skills: [dynamic-tracking, action-geography, hero-ending]
reference_present: true
retry_bucket: 0-1
final_selected: true
failure_tags: []
```

## 6. Learning signals

HOLO may use privacy-safe outcome signals to estimate production quality, including:
- which of A/B/C the member selected
- whether the first generation was accepted
- number of retries as a bucketed signal
- whether the member substantially edited the proposed prompt
- whether the final result was saved/selected
- optional thumbs-up / thumbs-down or explicit feedback
- failure reason categories such as identity drift, camera mismatch, product distortion, motion failure, lighting mismatch or continuity failure

Do not treat a single signal as proof of quality.

Example:
- high selection rate + high retry rate may indicate attractive direction but poor execution stability
- lower selection rate + very low retry rate may indicate a reliable CONTROL pattern

## 7. Aggregation rule

A Global Skill must not be created from one user's session or one private project.

Promote only patterns that:
- recur across multiple independent sessions
- are not dependent on one user's unique story or identity
- remain useful after removing names, brands and plot-specific details
- show a meaningful production outcome signal
- survive evaluation on separate test ideas

The exact sample threshold may evolve, but a small isolated cluster must not become an ACTIVE global rule automatically.

## 8. Skill promotion lifecycle

```text
EXPERIENCE
→ CANDIDATE
→ PRIVACY REVIEW
→ TECHNICAL REVIEW
→ EVALUATION
→ ACTIVE
→ MONITOR
→ DEPRECATED / ARCHIVED if needed
```

### EXPERIENCE
Aggregated production observations only.

### CANDIDATE
A proposed generalized rule.

### PRIVACY REVIEW
Confirm that the candidate contains no raw or reconstructable member content.

### TECHNICAL REVIEW
Check production logic, conflict rules and model scope.

### EVALUATION
Run against independent canonical test prompts.

### ACTIVE
Eligible for Skill Router use.

A skill should not move directly from raw member output to ACTIVE.

## 9. Skill candidate schema

Recommended metadata:

```yaml
id: experience.food.shortform.hero-ending.v1
name: Short-form Food Hero Ending
version: 1.0.0
status: CANDIDATE
category:
  - EXPERIENCE
source_type: aggregated_experience
model_scope:
  - universal
  - minimax-h3
privacy_review: required
raw_user_content_embedded: false
last_reviewed: YYYY-MM-DD
```

Recommended body:
- observed pattern
- when to use
- avoid when
- generalized formula
- expected benefit
- known failure mode
- model scope
- evaluation notes
- privacy review notes

Do not store user IDs or raw example prompts inside the Global Skill file.

## 10. Model-specific learning

Production success must be associated with the model/version used.

```text
GLOBAL VIDEO PRINCIPLE
├── MiniMax H3 evidence
├── Veo evidence
├── Kling evidence
└── future model evidence
```

A pattern that works well for one model must not automatically be treated as universal.

## 11. Project Memory boundary

Within the same member/project, HOLO may use project-specific memory for continuity, including:
- character identity
- current wardrobe/state
- recurring product appearance
- location/world facts
- previous ending state
- selected camera/look

This information remains project-scoped.

If the member starts another unrelated project, do not silently transfer private character, client or story details unless the user explicitly chooses to reuse them.

## 12. Cross-user contamination check

Before producing a prompt or creating a skill, check:

```text
Is this detail from the current user's project?
Is it a generalized HOLO skill?
Could it belong to another member's private work?
```

If a detail cannot be justified as current-project context or generalized skill knowledge, do not inject it.

## 13. Deletion / retention design principle

Raw project content and derived aggregate learning must remain conceptually separable.

Future implementation should make it possible to:
- delete project-scoped raw assets according to the product's retention policy
- keep only non-reconstructable aggregated statistics when legitimately retained
- avoid storing permanent copies of raw member works inside skill Markdown files

Retention periods and legal requirements must be defined separately in the product privacy policy and data-retention implementation.

## 14. Audit and provenance

Every EXPERIENCE-derived skill should record:
- source_type = aggregated_experience
- model scope
- review date
- evaluation status
- privacy review status
- whether raw user content is embedded (must be false for ACTIVE global skills)

Keep an internal changelog for promotions, revisions and deprecations.

## 15. HOLO Director application

A/B/C generation may use:
- current member's current project memory
- current request + uploaded assets
- ACTIVE generalized HOLO skills
- validated model adapter knowledge

A/B/C generation must not use:
- another member's raw prompt
- another member's images/videos
- another member's private character/product/story bible
- unreleased client or brand data from unrelated projects

## 16. Product-learning architecture

Recommended long-term architecture:

```text
PROJECT MEMORY (private)
        ↓
PRIVACY FILTER
        ↓
EXPERIENCE EVENTS (structured / de-identified)
        ↓
AGGREGATOR
        ↓
PATTERN MINER
        ↓
SKILL CANDIDATE
        ↓
PRIVACY + QUALITY REVIEW
        ↓
EVALUATION SET
        ↓
ACTIVE GLOBAL SKILL
        ↓
SKILL ROUTER
```

## 17. Launch rule

The existence of this policy file does NOT mean member activity is currently being collected for global skill learning.

Before enabling automatic collection/promotion, HOLO must implement:
- user-facing notice/choice
- private-vs-experience data separation
- structured experience event schema
- privacy filtering
- review/evaluation pipeline
- deletion/retention handling
- audit logging

Until those controls are implemented, keep member raw work project-scoped and do not auto-promote it to Global Skills.

## 18. Final principle

```text
LEARN THE TECHNIQUE
NOT THE PERSON

LEARN THE PRODUCTION PATTERN
NOT THE PRIVATE WORK
```

HOLO should become better as usage grows, while each member's original work remains protected from cross-user reuse.