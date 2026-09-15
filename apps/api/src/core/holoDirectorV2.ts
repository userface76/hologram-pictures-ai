import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { fallbackParse } from "./fallbackParser.js";
import { routeHoloSkills, type RoutedCandidate, type SkillRoutingPlan } from "./skillRouter.js";
import type { VideoIntent, VideoMediaInputs } from "./types.js";

export type DirectorCandidateId = "stable" | "cinematic" | "user_based";

export type DirectorCandidate = {
  id: DirectorCandidateId;
  label: string;
  summary: string;
  reason: string;
  recommended: boolean;
  score: number;
  preservationScore?: number;
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
    detectedRoutes?: string[];
  };
  candidates: DirectorCandidate[];
  plan: VideoIntent;
};

const FALLBACK_SKILLS = `HOLO Director Runtime v1.7\nA CONTROL = identity/product accuracy, continuity, restrained camera, readable blocking.\nB IMPACT = different shot architecture, stronger hook/angle/lens/reveal, cinematic payoff.\nC USER BASED = preserve user's story/event order; add production language only.\nA and B must not share the same primary directing strategy.`;

function resolveOpenAIModel() {
  const configured = (process.env.OPENAI_MODEL || "").trim();
  if (!configured || configured === "gpt-6-astra") return "gpt-5.6-sol";
  return configured;
}

function readSkill(name: string) {
  const candidates = [
    path.resolve(process.cwd(), `apps/api/src/holo/skills/${name}`),
    path.resolve(process.cwd(), `src/holo/skills/${name}`),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
    } catch (error) {
      console.warn("HOLO skill read skipped:", error);
    }
  }
  return "";
}

function loadRuntimeSkills(routing?: SkillRoutingPlan) {
  const base = readSkill("HOLO_DIRECTOR_RUNTIME_v1.6.md");
  const routingOverlay = readSkill("HOLO_DIRECTOR_RUNTIME_v1.7.md");
  const specialized: string[] = [];

  if (routing?.detected.includes("commercial-product")) {
    specialized.push(readSkill("HOLO_MARKETING_COMMERCIAL_SKILL_v1.0.md"));
  }

  const merged = [base, routingOverlay, ...specialized]
    .filter(Boolean)
    .join("\n\n--- ACTIVE SPECIALIZED SKILL ---\n\n");
  return merged ? merged.slice(0, 48000) : FALLBACK_SKILLS;
}

function mediaNotes(media?: VideoMediaInputs) {
  const notes: string[] = [];
  if (media?.firstFrameUrl) notes.push("START FRAME: opening composition/state is a hard constraint.");
  if (media?.referenceImageUrl) notes.push("REFERENCE IMAGE: identity/product/style/world consistency is a hard constraint.");
  if (media?.lastFrameUrl) notes.push("END FRAME: intended final composition/state is a hard constraint.");
  return notes.length ? notes.join("\n") : "No image inputs.";
}

function routeBlock(label: string, route: RoutedCandidate) {
  return `${label}\nPRIMARY SKILLS: ${route.primary.join(", ")}\nSUPPORTING: ${route.supporting.join(", ")}\nAVOID: ${route.avoid.join(", ")}\nDIRECTIVE: ${route.directive}`;
}

function buildInput(text: string, media: VideoMediaInputs | undefined, routing: SkillRoutingPlan) {
  const skillPack = loadRuntimeSkills(routing);
  const system = `You are HOLO DIRECTOR MODE for HOLOGRAM PICTURES AI.\nReturn ONLY valid JSON.\n\nUse the HOLO runtime skill knowledge as directing rules, but obey the deterministic ROUTING PLAN below. Do not make A and B two paraphrases of the same plan.\n\nHOLO RUNTIME SKILL KNOWLEDGE:\n${skillPack}\n\nDETECTED ROUTES: ${routing.detected.join(", ")}\n\n${routeBlock("OPTION A / CONTROL", routing.stable)}\n\n${routeBlock("OPTION B / IMPACT", routing.cinematic)}\n\n${routeBlock("OPTION C / USER BASED", routing.userBased)}\n\nDIFFERENCE GATE:\n1. A and B must use different primary skill families.\n2. A and B must use different opening camera/shot strategy.\n3. B must contain at least one meaningful impact decision absent from A.\n4. A must contain at least one control/continuity decision absent from B.\n5. C must preserve the user's story, subject order, event order and core intent; only add camera/framing/lens/lighting/motion/ending production language.\n6. Exactly one option has recommended=true.\n\nDo not invent visual facts not supported by the user's text or supplied images. Preserve names, brands, product facts and character identity. Respect duration feasibility and model constraints.\n\nJSON schema:\n{\n  \"analysis\": {\"intent\":string,\"subject\":string,\"format\":string,\"duration\":number,\"risks\":string[]},\n  \"plan\": {\"title\":string,\"model\":string,\"duration\":number,\"aspectRatio\":string,\"resolution\":string,\"audio\":boolean,\"style\":string,\"camera\":string[],\"scenes\":[{\"index\":number,\"seconds\":number,\"description\":string}]},\n  \"candidates\": [\n    {\"id\":\"stable\",\"label\":string,\"summary\":string,\"reason\":string,\"recommended\":boolean,\"score\":number,\"skills\":string[],\"prompt\":string},\n    {\"id\":\"cinematic\",\"label\":string,\"summary\":string,\"reason\":string,\"recommended\":boolean,\"score\":number,\"skills\":string[],\"prompt\":string},\n    {\"id\":\"user_based\",\"label\":string,\"summary\":string,\"reason\":string,\"recommended\":boolean,\"score\":number,\"preservationScore\":number,\"skills\":string[],\"prompt\":string}\n  ]\n}\n\nDefaults: model=minimax-h3, duration 4-15 seconds, resolution=768p. Use 9:16 for explicit vertical/short-form requests; otherwise preserve requested format or use 16:9.\n\nMEDIA:\n${mediaNotes(media)}\n\nUSER IDEA:\n${text}`;

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

function clamp(value: unknown, fallback: number, min = 0, max = 100) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeCandidate(raw: any, id: DirectorCandidateId, fallbackPrompt: string, route: RoutedCandidate): DirectorCandidate {
  const fallbackScore = id === "stable" ? 92 : id === "cinematic" ? 90 : 90;
  const labels: Record<DirectorCandidateId, string> = {
    stable: "안정형 · 일관성 우선",
    cinematic: "시네마틱 · 임팩트 우선",
    user_based: "내 문장 유지 · 연출 보강",
  };
  const summaries: Record<DirectorCandidateId, string> = {
    stable: "인물·제품·공간의 일관성과 생성 안정성을 우선합니다.",
    cinematic: "다른 샷 구조와 카메라 전략으로 시각적 임팩트를 강화합니다.",
    user_based: "원래 이야기와 순서를 유지하고 카메라·구도·조명만 보강합니다.",
  };
  const routedSkills = unique([...route.primary, ...(Array.isArray(raw?.skills) ? raw.skills.map(String) : [])]).slice(0, 7);
  const candidate: DirectorCandidate = {
    id,
    label: String(raw?.label || labels[id]),
    summary: String(raw?.summary || summaries[id]),
    reason: String(raw?.reason || route.directive),
    recommended: Boolean(raw?.recommended),
    score: clamp(raw?.score, fallbackScore),
    skills: routedSkills,
    prompt: String(raw?.prompt || fallbackPrompt),
  };
  if (id === "user_based") candidate.preservationScore = clamp(raw?.preservationScore, 96);
  return candidate;
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

function words(text: string) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, " ").split(/\s+/).filter((w) => w.length > 2));
}

function similarity(a: string, b: string) {
  const aa = words(a);
  const bb = words(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const word of aa) if (bb.has(word)) intersection += 1;
  const union = new Set([...aa, ...bb]).size;
  return union ? intersection / union : 0;
}

function ensureOneRecommendation(candidates: DirectorCandidate[]) {
  const marked = candidates.filter((candidate) => candidate.recommended);
  if (marked.length === 1) return;
  const best = [...candidates].sort((a, b) => b.score - a.score)[0] || candidates[0];
  for (const candidate of candidates) candidate.recommended = candidate === best;
}

function fallbackDirector(text: string, media?: VideoMediaInputs): DirectorResult {
  const base = fallbackParse(text);
  const routing = routeHoloSkills(text, media);
  const stablePrompt = `${base.refinedPrompt}\n\nCONTROL DIRECTOR: preserve identity/product facts and continuity. Use readable blocking, consistent lighting/screen direction, one restrained camera intention, conservative motion and a clear ending. Simplify rather than overload.`;
  const cinematicPrompt = `${base.refinedPrompt}\n\nIMPACT DIRECTOR: redesign the shot architecture for a stronger opening and payoff. Use a purposeful cinematic angle/lens relationship, a more expressive but feasible camera move, stronger visual rhythm and a deliberate reveal/hero ending. Keep hard identity/product facts unchanged.`;
  const userPrompt = `${text}\n\nUSER-BASED PRODUCTION ENHANCEMENT: keep the original story and event order. Add only camera angle, shot size, lens, composition, lighting source/direction, natural motion wording and ending framing.`;
  const candidates = [
    normalizeCandidate({ recommended: true, prompt: stablePrompt }, "stable", stablePrompt, routing.stable),
    normalizeCandidate({ recommended: false, prompt: cinematicPrompt }, "cinematic", cinematicPrompt, routing.cinematic),
    normalizeCandidate({ recommended: false, preservationScore: 98, prompt: userPrompt }, "user_based", userPrompt, routing.userBased),
  ];
  return {
    source: "fallback",
    analysis: {
      intent: base.intent || "video",
      subject: base.title || "video subject",
      format: base.aspectRatio,
      duration: base.duration,
      risks: [],
      selectedSkills: unique(candidates.flatMap((candidate) => candidate.skills)),
      detectedRoutes: routing.detected,
    },
    candidates,
    plan: { ...base, refinedPrompt: candidates[0].prompt },
  };
}

export async function generateDirectorRecommendationsV2(text: string, media?: VideoMediaInputs): Promise<DirectorResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackDirector(text, media);
  const routing = routeHoloSkills(text, media);

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: resolveOpenAIModel(),
      reasoning: { effort: "medium" },
      input: buildInput(text, media, routing),
    });
    const rawText = response.output_text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const raw = JSON.parse(rawText);
    const base = fallbackParse(text);
    const rawCandidates = Array.isArray(raw?.candidates) ? raw.candidates : [];
    const stableRaw = rawCandidates.find((c: any) => c?.id === "stable") || rawCandidates[0] || {};
    const cinematicRaw = rawCandidates.find((c: any) => c?.id === "cinematic") || rawCandidates[1] || {};
    const userRaw = rawCandidates.find((c: any) => c?.id === "user_based") || rawCandidates[2] || {};

    const stableFallback = `${base.refinedPrompt}\n\nUse the HOLO CONTROL route.`;
    const cinematicFallback = `${base.refinedPrompt}\n\nUse a substantially different HOLO IMPACT shot architecture.`;
    const userFallback = `${text}\n\nPreserve the story; enhance production language only.`;

    const stable = normalizeCandidate(stableRaw, "stable", stableFallback, routing.stable);
    const cinematic = normalizeCandidate(cinematicRaw, "cinematic", cinematicFallback, routing.cinematic);
    const userBased = normalizeCandidate(userRaw, "user_based", userFallback, routing.userBased);

    if (similarity(stable.prompt, cinematic.prompt) > 0.78) {
      cinematic.reason = `DIFFERENCE GATE WARNING: A/B similarity was high. ${cinematic.reason}`;
      cinematic.skills = unique([...routing.cinematic.primary, ...cinematic.skills]).slice(0, 7);
    }

    const candidates = [stable, cinematic, userBased];
    ensureOneRecommendation(candidates);
    const recommended = candidates.find((candidate) => candidate.recommended) || stable;
    const planRaw = raw?.plan || {};
    const duration = clamp(planRaw.duration ?? raw?.analysis?.duration, base.duration, 4, 15);
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
        selectedSkills: unique(candidates.flatMap((candidate) => candidate.skills)).slice(0, 18),
        detectedRoutes: routing.detected,
      },
      candidates,
      plan,
    };
  } catch (error) {
    console.error("HOLO Director V2 failed; falling back.", error);
    return fallbackDirector(text, media);
  }
}
