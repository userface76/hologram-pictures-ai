import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { fallbackParse } from "./fallbackParser.js";
import type { VideoIntent, VideoMediaInputs } from "./types.js";

export type DirectorCandidate = {
  id: "stable" | "cinematic";
  label: string;
  summary: string;
  reason: string;
  recommended: boolean;
  score: number;
  skills: string[];
  prompt: string;
};

export type DirectorResult = {
  source: "astra" | "fallback";
  analysis: {
    intent: string;
    subject: string;
    format: string;
    duration: number;
    risks: string[];
    selectedSkills: string[];
  };
  candidates: DirectorCandidate[];
  plan: VideoIntent;
};

const FALLBACK_SKILLS = `HOLO Director Runtime Skill v1.5\n- LOCK identity/product/reference first.\n- Separate angle, shot size and movement.\n- Use one primary camera movement in short beats.\n- 9:16 short-form: clear subject, early hook, readable action, strong ending.\n- Maintain lighting and screen direction continuity.\n- Product accuracy outranks visual invention.\n- Candidate A = stable/controlled; Candidate B = cinematic/impact.\n- Exactly one recommendation.`;

function resolveOpenAIModel() {
  const configured = (process.env.OPENAI_MODEL || "").trim();
  if (!configured || configured === "gpt-6-astra") return "gpt-5.6-sol";
  return configured;
}

function loadRuntimeSkills() {
  const candidates = [
    path.resolve(process.cwd(), "apps/api/src/holo/skills/HOLO_DIRECTOR_RUNTIME_v1.5.md"),
    path.resolve(process.cwd(), "src/holo/skills/HOLO_DIRECTOR_RUNTIME_v1.5.md"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").slice(0, 24000);
    } catch (error) {
      console.warn("HOLO runtime skill pack read skipped:", error);
    }
  }
  return FALLBACK_SKILLS;
}

function mediaNotes(media?: VideoMediaInputs) {
  const notes: string[] = [];
  if (media?.firstFrameUrl) notes.push("START FRAME exists: opening composition/state is a hard constraint.");
  if (media?.referenceImageUrl) notes.push("REFERENCE IMAGE exists: identity/product/style consistency is a hard constraint.");
  if (media?.lastFrameUrl) notes.push("END FRAME exists: final composition/state is a hard constraint.");
  return notes.length ? notes.join("\n") : "No image inputs.";
}

function buildInput(text: string, media?: VideoMediaInputs) {
  const skillPack = loadRuntimeSkills();
  const system = `You are HOLO DIRECTOR MODE for HOLOGRAM PICTURES AI.\nYou are a senior AI video director and prompt-intelligence system.\nUse the runtime skill pack below as production rules, not as text to repeat.\nReturn ONLY valid JSON.\n\nRUNTIME SKILL PACK:\n${skillPack}\n\nTASK:\nAnalyze the user's idea and return exactly two genuinely different production-ready prompt strategies.\nCandidate stable prioritizes identity/product continuity, controlled motion, simpler camera logic and feasibility.\nCandidate cinematic prioritizes stronger visual impact, lens/angle/reveal design and cinematic energy while remaining feasible.\nExactly one candidate must have recommended=true.\nDo not produce two paraphrases.\nDo not invent visual details that are not visible in supplied images.\nPreserve user-supplied names/brands.\nPrompts should be production-ready, usually English, concise enough for a video generator, and include only relevant constraints.\n\nJSON schema:\n{\n  \"analysis\": {\"intent\":string,\"subject\":string,\"format\":string,\"duration\":number,\"risks\":string[],\"selectedSkills\":string[]},\n  \"plan\": {\"title\":string,\"model\":string,\"duration\":number,\"aspectRatio\":string,\"resolution\":string,\"audio\":boolean,\"style\":string,\"camera\":string[],\"scenes\":[{\"index\":number,\"seconds\":number,\"description\":string}]},\n  \"candidates\": [\n    {\"id\":\"stable\",\"label\":string,\"summary\":string,\"reason\":string,\"recommended\":boolean,\"score\":number,\"skills\":string[],\"prompt\":string},\n    {\"id\":\"cinematic\",\"label\":string,\"summary\":string,\"reason\":string,\"recommended\":boolean,\"score\":number,\"skills\":string[],\"prompt\":string}\n  ]\n}\n\nDefaults: model=minimax-h3, duration within 4-15 seconds, resolution=768p. If the user clearly asks vertical short-form use 9:16; otherwise preserve requested format or use 16:9.\n\nMEDIA CONTROL:\n${mediaNotes(media)}\n\nUSER IDEA:\n${text}`;

  const content: any[] = [{ type: "input_text", text: system }];
  if (media?.firstFrameUrl) {
    content.push({ type: "input_text", text: "START FRAME IMAGE" });
    content.push({ type: "input_image", image_url: media.firstFrameUrl, detail: "low" });
  }
  if (media?.referenceImageUrl) {
    content.push({ type: "input_text", text: "REFERENCE IMAGE" });
    content.push({ type: "input_image", image_url: media.referenceImageUrl, detail: "low" });
  }
  if (media?.lastFrameUrl) {
    content.push({ type: "input_text", text: "END FRAME IMAGE" });
    content.push({ type: "input_image", image_url: media.lastFrameUrl, detail: "low" });
  }
  return [{ role: "user", content }] as any;
}

function clampDuration(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(4, Math.min(15, Math.round(n))) : fallback;
}

function normalizeCandidate(raw: any, id: "stable" | "cinematic", fallbackPrompt: string): DirectorCandidate {
  return {
    id,
    label: String(raw?.label || (id === "stable" ? "안정형 · 일관성 우선" : "시네마틱 · 임팩트 우선")),
    summary: String(raw?.summary || (id === "stable" ? "인물·제품 일관성과 안정적인 카메라를 우선합니다." : "강한 렌즈·앵글·리빌 연출로 시각적 임팩트를 높입니다.")),
    reason: String(raw?.reason || "HOLO Director Check를 기준으로 구성했습니다."),
    recommended: Boolean(raw?.recommended),
    score: Math.max(0, Math.min(100, Number(raw?.score) || (id === "stable" ? 91 : 88))),
    skills: Array.isArray(raw?.skills) ? raw.skills.slice(0, 7).map(String) : [],
    prompt: String(raw?.prompt || fallbackPrompt),
  };
}

function normalizeCamera(value: unknown, fallback?: string[]) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).slice(0, 6);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeScenes(value: unknown, fallback: VideoIntent["scenes"]): VideoIntent["scenes"] {
  if (!Array.isArray(value) || !value.length) return fallback;
  return value.slice(0, 8).map((scene: any, index: number) => {
    const seconds = Number(scene?.seconds);
    return {
      index: Number(scene?.index) || index + 1,
      ...(Number.isFinite(seconds) ? { seconds } : {}),
      description: String(scene?.description || "Scene beat"),
    };
  });
}

function fallbackDirector(text: string): DirectorResult {
  const base = fallbackParse(text);
  const stablePrompt = `${base.refinedPrompt}\n\nDirector strategy: preserve identity/product continuity, use one clear camera intention, controlled natural motion, consistent lighting and screen direction, and a readable final payoff. Avoid camera overload, identity drift and unnecessary scene changes.`;
  const cinematicPrompt = `${base.refinedPrompt}\n\nDirector strategy: strengthen the visual opening with a purposeful cinematic angle/lens choice, use one expressive but feasible camera move, build clear action progression, and finish with a strong reveal or emotional hero ending. Maintain continuity and avoid chaotic camera changes.`;
  const candidates = [
    normalizeCandidate({ recommended: true, score: 91, skills: ["identity-lock", "camera-grammar", "continuity", "director-check"], prompt: stablePrompt }, "stable", stablePrompt),
    normalizeCandidate({ recommended: false, score: 88, skills: ["cinematic-story", "camera-angle", "lighting", "hero-ending"], prompt: cinematicPrompt }, "cinematic", cinematicPrompt),
  ];
  return {
    source: "fallback",
    analysis: {
      intent: base.intent || "video",
      subject: base.title || "video subject",
      format: base.aspectRatio,
      duration: base.duration,
      risks: [],
      selectedSkills: [...new Set(candidates.flatMap((c) => c.skills))],
    },
    candidates,
    plan: { ...base, refinedPrompt: candidates[0].prompt },
  };
}

export async function generateDirectorRecommendations(text: string, media?: VideoMediaInputs): Promise<DirectorResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackDirector(text);

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: resolveOpenAIModel(),
      reasoning: { effort: "medium" },
      input: buildInput(text, media),
    });
    const rawText = response.output_text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const raw = JSON.parse(rawText);
    const base = fallbackParse(text);
    const rawCandidates = Array.isArray(raw?.candidates) ? raw.candidates : [];
    const stableRaw = rawCandidates.find((c: any) => c?.id === "stable") || rawCandidates[0] || {};
    const cinematicRaw = rawCandidates.find((c: any) => c?.id === "cinematic") || rawCandidates[1] || {};
    const stable = normalizeCandidate(stableRaw, "stable", base.refinedPrompt);
    const cinematic = normalizeCandidate(cinematicRaw, "cinematic", base.refinedPrompt);

    if (stable.recommended === cinematic.recommended) {
      stable.recommended = stable.score >= cinematic.score;
      cinematic.recommended = !stable.recommended;
    }
    const candidates = [stable, cinematic];
    const recommended = candidates.find((c) => c.recommended) || stable;
    const planRaw = raw?.plan || {};
    const duration = clampDuration(planRaw.duration ?? raw?.analysis?.duration, base.duration);
    const plan: VideoIntent = {
      ...base,
      title: String(planRaw.title || base.title),
      refinedPrompt: recommended.prompt,
      model: String(planRaw.model || base.model || "minimax-h3"),
      duration,
      aspectRatio: String(planRaw.aspectRatio || raw?.analysis?.format || base.aspectRatio),
      resolution: String(planRaw.resolution || base.resolution || "768p"),
      audio: typeof planRaw.audio === "boolean" ? planRaw.audio : base.audio,
      style: String(planRaw.style || base.style || "cinematic"),
      camera: normalizeCamera(planRaw.camera, base.camera),
      scenes: normalizeScenes(planRaw.scenes, base.scenes),
      userRequest: text,
    };

    return {
      source: "astra",
      analysis: {
        intent: String(raw?.analysis?.intent || base.intent || "video"),
        subject: String(raw?.analysis?.subject || base.title || "video subject"),
        format: String(raw?.analysis?.format || plan.aspectRatio),
        duration,
        risks: Array.isArray(raw?.analysis?.risks) ? raw.analysis.risks.slice(0, 6).map(String) : [],
        selectedSkills: Array.isArray(raw?.analysis?.selectedSkills)
          ? raw.analysis.selectedSkills.slice(0, 12).map(String)
          : [...new Set(candidates.flatMap((c) => c.skills))],
      },
      candidates,
      plan,
    };
  } catch (error) {
    console.error("HOLO Director recommendation failed; falling back.", error);
    return fallbackDirector(text);
  }
}
