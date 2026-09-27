# HOLO AI Daily Skill Update — 2026-09-27

## Review scope
Reviewed all 8 HOLO categories: Advertising/Brand, Cinematic, Short-form, Product/Food, People/Character, Anime/Fantasy, Fashion/Beauty, Art/Experimental.

Existing daily skills through 2026-09-26 were checked first. Previously covered asset/reference locks, timing anchors, selective repair, multi-shot continuity, boundary frames, reaction holds, soundscape anchors, aspect-ratio intent, HDR safety, and spatial-temporal repair were excluded from consideration as duplicates.

## Adopted skill: Sequence Color Reference Lock

### Core principle
Do not let independently generated shots define their own color identity. Once a hero/reference shot is approved, store a representative reference frame for the scene or brand look and evaluate subsequent shots against it before export.

The lock covers four practical targets:
- overall exposure/contrast family
- white balance / color temperature
- protected brand/product colors
- skin-tone continuity when people are present

This is a post-generation continuity gate, not a prompt-style adjective. Generation may vary by model or shot, but the final sequence should converge on an approved visual reference.

### Evidence / reproducibility
Adobe Premiere's 2026 Comparison View and Match Color workflow explicitly supports choosing a reference frame and matching other shots to it across a sequence. Its face-detection option gives higher weighting to facial regions to improve skin-tone matching. Premiere's newer Color mode also supports persistent Color Reference markers that can be pinned and reused while working through a longer sequence.

Official references:
- Adobe Premiere Help — Match color between shots (updated 2026-04-22)
- Adobe Premiere Help — Comparison View / Color Reference markers (updated 2026-04-23)
- Adobe Premiere Color mode documentation (updated 2026-08-18)

### Apply when
- multiple AI-generated shots belong to the same scene or campaign
- the same product appears across different angles/models/generations
- skin tone changes noticeably between cuts
- a brand has a controlled color palette
- generated and live-action footage are mixed

### Good example
A cosmetics campaign has four independently generated shots. Shot 1 is approved as the hero reference. HOLO stores its exposure, temperature, skin appearance and protected package color as the scene reference. Shots 2–4 are compared and corrected toward that reference before final export rather than regenerating otherwise successful shots.

### Avoid / do not force when
- a deliberate time-of-day or location change requires a different color state
- dream/flashback/fantasy sequences intentionally change palette
- matching would destroy a purposeful lighting transition

In those cases, create a new scene-level Color Reference rather than forcing the previous one.

## Category mapping
Primary: Advertising/Brand, Product/Food, People/Character, Fashion/Beauty, Cinematic.
Secondary: Short-form, Anime/Fantasy, Art/Experimental when continuity across cuts is intended.

## Pipeline change
Before:
Reference/Asset Lock → Timing → Generation → Visual/Physics QA → Local/Timeline Repair → Export

After:
Reference/Asset Lock → Timing → Generation → Visual/Physics QA → Local/Timeline Repair → **Sequence Color Reference QA/Match** → Export

## Why only one skill today
Other newly surfaced capabilities were either already represented by existing HOLO skills (multi-shot consistency, Elements, timeline generation, iterative edit memory) or were not sufficiently distinct/reproducible to justify another permanent rule. HOLO should prefer a small validated skill library over daily feature accumulation.

## Expected effect
Reduce visible cut-to-cut drift without spending another full video generation. Improve brand color, product appearance and skin-tone continuity while preserving successful motion, identity and camera work.