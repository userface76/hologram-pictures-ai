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

  const identitySensitive = has(text, [
    "인물", "사람", "캐릭터", "character", "woman", "man", "girl", "boy", "여자", "남자",
    "같은 얼굴", "동일 인물", "같은 사람", "same person", "same character", "일관성", "consistency",
  ]);
  if (identitySensitive) detected.push("identity-sensitive");

  const exactTextRequested = has(text, ["글자", "텍스트", "자막", "subtitle", "caption", "문구", "logo text"]);
  if (exactTextRequested) detected.push("onscreen-text");

  const faceCloseupRequested = has(text, ["얼굴 클로즈업", "face close-up", "face closeup", "extreme close-up face"]);
  if (faceCloseupRequested) detected.push("face-closeup");

  const explicitVertical = has(text, ["9:16", "세로", "vertical", "쇼츠", "shorts", "릴스", "reels", "틱톡", "tiktok"]);
  const explicitWide = has(text, ["16:9", "가로", "landscape", "wide"]);
  const explicitSquare = has(text, ["1:1", "정사각", "square"]);
  if (explicitVertical || explicitWide || explicitSquare) detected.push("aspect-ratio-aware");

  if (!detected.length) detected.push("general-video");

  const hasReference = Boolean(media?.referenceImageUrl);
  const hasStart = Boolean(media?.firstFrameUrl);
  const hasEnd = Boolean(media?.lastFrameUrl);
  const hasFrame = hasStart || hasEnd;
  const hasApprovedImage = hasReference || hasFrame;
  const hasDualFrame = hasStart && hasEnd;
  const productLike = detected.includes("commercial-product") || detected.includes("food");
  const fidelitySensitive = identitySensitive || productLike;

  const referenceSupporting = [
    ...(hasApprovedImage ? ["reference-first-workflow", "image-to-video-preservation"] : []),
    ...(!hasApprovedImage && fidelitySensitive ? ["reference-image-recommended"] : []),
    ...(hasDualFrame ? ["dual-frame-transition-control"] : []),
    ...(detected.includes("aspect-ratio-aware") ? ["aspect-ratio-composition"] : []),
    "background-motion-control",
    "camera-time-clarity",
  ];

  const stablePrimary = unique([
    "subject-attribute-specificity",
    "physical-action-description",
    "background-place-time-light",
    ...(hasReference ? ["world-asset-identity-lock", "reference-driven-video-prompting"] : ["subject-clarity"]),
    ...(hasFrame ? ["start-end-frame-continuity"] : []),
    ...(hasApprovedImage && productLike ? ["image-first-product-control"] : []),
    ...(hasDualFrame ? ["dual-frame-transition-control"] : []),
    "continuity-editing-axis-match",
    "lighting-continuity-design",
    "camera-restraint",
    ...stableGenre,
  ]).slice(0, 10);

  const impactPrimary = unique([
    "director-visual-language",
    "shot-size-and-angle-language",
    "camera-purpose-mapping",
    "visible-style-translation",
    ...(hasApprovedImage ? ["reference-preserving-impact-direction"] : []),
    ...impactGenre,
  ]).filter((skill) => !stablePrimary.includes(skill)).slice(0, 9);

  const userPrimary = unique([
    "preserve-user-intent",
    "four-material-prompt-formula",
    "subject-attribute-specificity",
    "physical-action-description",
    "background-place-time-light",
    ...(hasReference ? ["world-asset-identity-lock"] : []),
    ...(hasApprovedImage ? ["reference-as-visual-truth"] : []),
    ...(hasApprovedImage && productLike ? ["image-first-product-control"] : []),
    ...(hasDualFrame ? ["dual-frame-transition-control"] : []),
    "camera-grammar",
    "framing-enhancement",
    "lighting-source-rule",
    ...userGenre,
  ]).slice(0, 10);

  const sharedSupporting = [
    "duration-feasibility",
    "one-scene-per-clip",
    "abstract-to-visible-description",
    "temporal-progression",
    "subject-environment-camera-motion-separation",
    ...referenceSupporting,
    ...(exactTextRequested ? ["text-postproduction"] : []),
    ...(faceCloseupRequested ? ["face-fidelity-fallback"] : []),
  ];

  return {
    detected,
    stable: {
      primary: stablePrimary,
      supporting: unique([...sharedSupporting, "director-check", "ending-readability", "regeneration-diagnosis-loop"]),
      avoid: unique([
        "camera-overload",
        "unnecessary-story-rewrite",
        "identity-drift",
        "decorative-motion",
        "vague-everything-moves",
        "abrupt-unmotivated-motion",
        "multiple-unrelated-scenes-per-clip",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: hasApprovedImage
        ? "Build the most controllable version. Treat supplied images as visual truth: preserve identity/product/environment facts and animate them rather than redesigning them. Separate subject motion, environment motion and camera motion; keep timing readable and physically plausible. If START and END are both supplied, design a plausible bridge between them. Respect aspect ratio as a composition decision, not metadata only."
        : fidelitySensitive
          ? "Build the most controllable version using concrete visible attributes, physical action wording, clear place/time/light and restrained camera language. Because exact identity/product fidelity matters and no image is supplied, note reference-image preparation as a useful consistency upgrade without blocking text-to-video generation."
          : "Build the most controllable version using concrete visible subject attributes, physical action wording, clear place/time/light and restrained camera language. Use one primary scene per short clip and keep subject, environment and camera motion distinct. Accuracy and repeatability outrank spectacle.",
    },
    cinematic: {
      primary: impactPrimary.length ? impactPrimary : ["director-visual-language", "shot-size-and-angle-language", "cinematic-story-architecture", "hero-ending"],
      supporting: unique([...sharedSupporting, "hook-design", "environment-motion", "lighting-mood-design", "director-check", "regeneration-diagnosis-loop"]),
      avoid: unique([
        "same-camera-plan-as-option-a",
        "flat-opening",
        "weak-payoff",
        "random-camera-combination",
        "vague-everything-moves",
        "abrupt-unmotivated-motion",
        "multiple-unrelated-scenes-per-clip",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: hasApprovedImage
        ? "Re-direct the same core idea for stronger visual impact while keeping the supplied reference facts locked. Change camera/style architecture from Option A through angle, lens, reveal, rhythm, lighting or controlled environment motion. Do not redesign the approved subject/product simply to create impact; animate and photograph it more expressively instead."
        : "Re-direct the same core idea for substantially stronger visual impact. Preserve subject/action/background facts, but change camera/style architecture from Option A with a stronger angle, lens, reveal, lighting or rhythm. Translate vague style words into concrete visible decisions and keep motion physically executable.",
    },
    userBased: {
      primary: userPrimary,
      supporting: unique([...sharedSupporting, "mobile-readability", "ending-framing", "motion-wording", "regeneration-diagnosis-loop"]),
      avoid: unique([
        "new-story-event",
        "character-rewrite",
        "product-fact-change",
        "world-fact-change",
        "vague-everything-moves",
        "abrupt-unmotivated-motion",
        "multiple-unrelated-scenes-per-clip",
        ...(exactTextRequested ? ["generated-exact-text-assumption"] : []),
      ]),
      directive: hasApprovedImage
        ? "Keep the user's story, event order and wording as intact as possible. Treat supplied images as the visual truth. Do not redescribe or redesign what the reference already establishes; add only the motion, environment motion, camera movement, timing, lighting behavior and ending transition needed to animate it clearly."
        : "Keep the user's story, event order and wording as intact as possible. Evaluate the prompt as SUBJECT + ACTION + BACKGROUND + CAMERA/STYLE. Preserve the materials already present and fill only missing production details minimally; improve camera, framing, lens, lighting, physical motion wording and ending composition without rewriting the story.",
    },
  };
}
