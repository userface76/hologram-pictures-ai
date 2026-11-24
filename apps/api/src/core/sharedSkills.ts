import { routeHoloSkills } from "./skillRouter.js";
import type { VideoMediaInputs } from "./types.js";

// Curated rules from daily research; no automatic ingestion of unreviewed documents.
// Sources: docs/HOLO_DAILY_SKILL_UPDATE_2026-11-19.md and 2026-11-23.md.
export function sharedSkillContext(text: string, media?: VideoMediaInputs) {
  const routing = routeHoloSkills(text, media);
  const rules = [
    "Preserve approved subject, product geometry, label and identity. Separate subject, environment and camera motion.",
    "Use only one supported media mode. For MiniMax H3, first/last frame mode excludes reference media from the provider payload; use reference only for prompt interpretation in that case.",
    "Do not promise middle keyframes, video/audio references, exact text or native speech controls unless the selected adapter explicitly supports them. Middle states may be described as narrative beats, not API inputs.",
    "For ComfyUI, all optional controls remain disabled until a specific workflow and its input schema are validated. Do not select an unregistered engine.",
    "Preserve the user's requested language and exact dialogue; do not invent claims or change approved assets.",
  ];
  return { routing, instructions: rules.join("\n") };
}

export function modelCapabilityNotes(model: string) {
  if (model === "minimax-h3") return "Current adapter supports first/last frame OR reference image, not both modes together. Frame mode uses adaptive ratio. No middle-frame or audio-reference field is implemented.";
  if (model.startsWith("comfyui")) return "Unregistered workflow: no optional capabilities verified; do not submit generation.";
  return "Use only capabilities explicitly implemented by the selected provider; do not infer support from another provider.";
}
