import type { VideoMediaInputs } from "./types.js";

export type RoutedCandidate = {
  primary: string[];
  supporting: string[];
  avoid: string[];
  directive: string;
};

export type SkillRoutingPlan = {
  detected: string[];
  stable: RoutedCandidate;
  cinematic: RoutedCandidate;
  userBased: RoutedCandidate;
};

function has(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function routeHoloSkills(text: string, media?: VideoMediaInputs): SkillRoutingPlan {
  const detected: string[] = [];
  const stableGenre: string[] = [];
  const impactGenre: string[] = [];
  const userGenre: string[] = [];

  if (has(text, ["광고", "commercial", "브랜드", "brand", "제품", "product", "상품"])) {
    detected.push("commercial-product");
    stableGenre.push("product-integrity", "commercial-clarity");
    impactGenre.push("commercial-ad-psychology", "product-reveal", "hero-ending");
    userGenre.push("preserve-product-facts", "camera-style-enhancement");
  }
  if (has(text, ["음식", "food", "버거", "burger", "피자", "pizza", "커피", "coffee", "요리", "먹", "맛있"])) {
    detected.push("food");
    stableGenre.push("food-texture-continuity", "controlled-food-motion");
    impactGenre.push("food-macro-language", "appetite-lighting", "hero-product-shot");
    userGenre.push("preserve-food-action", "physical-motion-wording");
  }
  if (has(text, ["액션", "action", "달리", "뛰", "싸움", "fight", "추격", "chase", "좀비", "전투", "battle"])) {
    detected.push("action");
    stableGenre.push("action-geography", "axis-continuity", "one-scene-per-clip");
    impactGenre.push("action-choreography-camera-logic", "hit-marking", "dynamic-tracking");
    userGenre.push("preserve-action-order", "physical-action-description");
  }
  if (has(text, ["대화", "dialogue", "말한다", "말하며", "인터뷰", "interview", "목소리", "voice"])) {
    detected.push("dialogue");
    stableGenre.push("dialogue-performance-blocking", "dialogue-readability");
    impactGenre.push("dialogue-performance-blocking", "emotional-push-in", "audio-camera-coordination");
    userGenre.push("preserve-dialogue-content", "restrained-audio-cues");
  }
  if (has(text, ["패션", "fashion", "런웨이", "runway", "화보", "editorial", "모델"])) {
    detected.push("fashion");
    stableGenre.push("fashion-identity-lock", "clean-composition");
    impactGenre.push("fashion-editorial-language", "lens-compression", "fabric-motion");
    userGenre.push("preserve-look", "visible-attribute-lock");
  }
  if (has(text, ["9:16", "쇼츠", "shorts", "릴스", "reels", "틱톡", "tiktok", "세로", "short-form"])) {
    detected.push("short-form");
    stableGenre.push("mobile-readability", "safe-area", "one-scene-per-clip");
    impactGenre.push("first-second-hook", "short-drama-hook-engineering", "payoff-design");
    userGenre.push("preserve-user-flow", "mobile-readability", "ending-framing");
  }
  if (has(text, ["영화", "cinematic", "시네마틱", "드라마", "dramatic", "판타지", "fantasy", "sf", "sci-fi"])) {
    detected.push("cinematic-story");
    stableGenre.push("cinematic-story-clarity", "lighting-continuity");
    impactGenre.push("cinematic-story-architecture", "director-visual-language", "shot-progression");
    userGenre.push("preserve-story-order", "visible-style-translation");
  }
  if (has(text, ["풍경", "environment", "도시", "city", "시장", "market", "숲", "forest", "바다", "desert", "폐허", "ruin"])) {
    detected.push("environment");
    stableGenre.push("environment-scene-bible", "world-continuity", "background-place-time-light");
    impactGenre.push("environment-motion", "palette-design", "scale-reveal");
    userGenre.push("preserve-location-facts", "background-place-time-light");
  }

  const exactTextRequested = has(text, ["글자", "텍스트", "자막", "subtitle", "caption", "문구", "logo text"]);
  if (exactTextRequested) detected.push("onscreen-text");

  const faceCloseupRequested = has(text, ["얼굴 클로즈업", "face close-up", "face closeup", "extreme close-up face"]);
  if (faceCloseupRequested) detected.push("face-closeup");

  const advancedTiming = /\d+(?:\.\d+)?\s*[–—-]\s*\d+(?:\.\d+)?\s*초/.test(text)
    || has(text, ["depth of field", "camera move", "timing:", "렌즈 / 샷", "렌즈/샷", "타이밍", "0.0–", "poster frame", "포스터 프레임"]);
  const basicStructured = !advancedTiming && has(text, ["장면 서술", "camera shot", "mood:", "actions:", "dialogue:", "sound:", "카메라연출"]);
  const nonEmptyLines = text.trim().split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const oneLineCreative = !advancedTiming && !basicStructured && nonEmptyLines.length <= 2 && text.trim().length <= 220;

  if (advancedTiming) detected.push("prompt-level-3-advanced");
  else if (basicStructured) detected.push("prompt-level-2-structured");
  else if (oneLineCreative) detected.push("prompt-level-1-one-line");
  else detected.push("prompt-level-2-balanced");

  const promptLevelSkills = advancedTiming
    ? ["advanced-timing-choreography", "lens-dof-progression", "timed-sound-design", "end-frame-hold"]
    : basicStructured
      ? ["basic-structured-prompt", "scene-camera-action-dialogue-sound"]
      : oneLineCreative
        ? ["one-line-creative-prompt", "granularity-restraint"]
        : ["balanced-prompt-structure"];

  if (!detected.some((item) => !item.startsWith("prompt-level-"))) detected.unshift("general-video");

  const hasReference = Boolean(media?.referenceImageUrl);
  const hasFrame = Boolean(media?.firstFrameUrl || media?.lastFrameUrl);
  const hasApprovedImage = hasReference || hasFrame;
  const productLike = detected.includes("commercial-product") || detected.includes("food");

  const stablePrimary = unique([
    "subject-attribute-specificity",
    "physical-action-description",
    "background-place-time-light",
    "prompt-granularity-selection",
    ...(advancedTiming ? ["timing-feasibility", "continuity-across-timed-beats"] : []),
    ...(hasReference ? ["world-asset-identity-lock", "reference-driven-video-prompting"] : ["subject-clarity"]),
    ...(hasFrame ? ["start-end-frame-continuity"] : []),
    ...(hasApprovedImage && productLike ? ["image-first-product-control"] : []),
    "continuity-editing-axis-match",
    "lighting-continuity-design",
    "camera-restraint",
    ...stableGenre,
  ]).slice(0, 11);

  const impactPrimary = unique([
    "director-visual-language",
    "shot-size-and-angle-language",
    "camera-purpose-mapping",
    "visible-style-translation",
    "prompt-granularity-selection",
    ...(advancedTiming ? ["shot-progression", "timed-payoff-design"] : []),
    ...impactGenre,
  ]).filter((skill) => !stablePrimary.includes(skill)).slice(0, 10);

  const userPrimary = unique([
    "preserve-user-intent",
    "preserve-prompt-granularity",
    "four-material-prompt-formula",
    "subject-attribute-specificity",
    "physical-action-description",
    "background-place-time-light",
    ...(hasReference ? ["world-asset-identity-lock"] : []),
    ...(hasApprovedImage && productLike ? ["image-first-product-control"] : []),
    "camera-grammar",
    "framing-enhancement",
    "lighting-source-rule",
    ...userGenre,
  ]).slice(0, 11);

  const sharedSupporting = [
    "duration-feasibility",
    "one-scene-per-clip",
    "abstract-to-visible-description",
    ...promptLevelSkills,
    ...(advancedTiming ? ["physical-realism-check", "final-hold-when-useful"] : []),
    ...(exactTextRequested ? ["text-postproduction"] : []),
    ...(faceCloseupRequested ? ["face-fidelity-fallback"] : []),
  ];

  const levelDirective = advancedTiming
    ? "The user is operating at Level 3 advanced timing. Preserve the total duration, validate each timed beat, and simplify only when camera/lens/action density exceeds feasible motion budget."
    : basicStructured
      ? "The user is operating at Level 2 structured prompting. Keep scene, camera, mood, actions, dialogue and sound organized without unnecessarily expanding into a timed screenplay."
      : oneLineCreative
        ? "The user is operating at Level 1 one-line prompting. Keep the creative concept compact; do not inflate it into a full shot list unless reliability truly requires one extra layer of detail."
        : "Use balanced prompt detail: enough structure for control without unnecessary technical density.";

  return {
    detected,
    stable: {
      primary: stablePrimary,
      supporting: unique([...sharedSupporting, "director-check", "ending-readability"]),
      avoid: unique([
        "camera-overload",
        "unnecessary-story-rewrite",
        "identity-drift",
        "decorative-motion",
        "multiple-unrelated-scenes-per-clip",
        "unnecessary-granularity-escalation",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: `Build the most controllable version using concrete visible subject attributes, physical action wording, clear place/time/light and restrained camera language. Use one primary scene per short clip. When an approved product/reference image exists, keep it as visual truth and add motion/camera rather than redesigning it. Accuracy and repeatability outrank spectacle. ${levelDirective}`,
    },
    cinematic: {
      primary: impactPrimary.length ? impactPrimary : ["director-visual-language", "shot-size-and-angle-language", "cinematic-story-architecture", "hero-ending"],
      supporting: unique([...sharedSupporting, "hook-design", "environment-motion", "lighting-mood-design", "director-check"]),
      avoid: unique([
        "same-camera-plan-as-option-a",
        "flat-opening",
        "weak-payoff",
        "random-camera-combination",
        "multiple-unrelated-scenes-per-clip",
        "gratuitous-lens-switching",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: `Re-direct the same core idea for substantially stronger visual impact. Preserve subject/action/background facts, but change camera/style architecture from Option A with a stronger angle, lens, reveal, lighting or rhythm. Translate vague style words into concrete visible decisions while keeping the clip physically executable. ${levelDirective}`,
    },
    userBased: {
      primary: userPrimary,
      supporting: unique([...sharedSupporting, "mobile-readability", "ending-framing", "motion-wording"]),
      avoid: unique([
        "new-story-event",
        "character-rewrite",
        "product-fact-change",
        "world-fact-change",
        "multiple-unrelated-scenes-per-clip",
        "prompt-level-overwrite",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: `Keep the user's story, event order and wording as intact as possible. Evaluate the prompt as SUBJECT + ACTION + BACKGROUND + CAMERA/STYLE. Preserve the materials already present and fill only missing production details minimally; usually improve camera, framing, lens, lighting, physical motion wording and ending composition without rewriting the story. Preserve the user's current prompt granularity whenever possible. ${levelDirective}`,
    },
  };
}
