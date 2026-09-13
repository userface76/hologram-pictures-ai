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

  if (has(text, ["광고", "commercial", "브랜드", "brand", "제품", "product", "상품"])) {
    detected.push("commercial-product");
    stableGenre.push("product-integrity", "commercial-clarity");
    impactGenre.push("commercial-ad-psychology", "product-reveal", "hero-ending");
  }
  if (has(text, ["음식", "food", "버거", "burger", "피자", "pizza", "커피", "coffee", "요리", "먹", "맛있"])) {
    detected.push("food");
    stableGenre.push("food-texture-continuity", "controlled-food-motion");
    impactGenre.push("food-macro-language", "appetite-lighting", "hero-product-shot");
  }
  if (has(text, ["액션", "action", "달리", "뛰", "싸움", "fight", "추격", "chase", "좀비", "전투", "battle"])) {
    detected.push("action");
    stableGenre.push("action-geography", "axis-continuity");
    impactGenre.push("action-choreography-camera-logic", "hit-marking", "dynamic-tracking");
  }
  if (has(text, ["대화", "dialogue", "말한다", "말하며", "인터뷰", "interview", "목소리", "voice"])) {
    detected.push("dialogue");
    stableGenre.push("dialogue-performance-blocking", "dialogue-readability");
    impactGenre.push("dialogue-performance-blocking", "emotional-push-in", "audio-camera-coordination");
  }
  if (has(text, ["패션", "fashion", "런웨이", "runway", "화보", "editorial", "모델"])) {
    detected.push("fashion");
    stableGenre.push("fashion-identity-lock", "clean-composition");
    impactGenre.push("fashion-editorial-language", "lens-compression", "fabric-motion");
  }
  if (has(text, ["9:16", "쇼츠", "shorts", "릴스", "reels", "틱톡", "tiktok", "세로", "short-form"])) {
    detected.push("short-form");
    stableGenre.push("mobile-readability", "safe-area");
    impactGenre.push("first-second-hook", "short-drama-hook-engineering", "payoff-design");
  }
  if (has(text, ["영화", "cinematic", "시네마틱", "드라마", "dramatic", "판타지", "fantasy", "sf", "sci-fi"])) {
    detected.push("cinematic-story");
    stableGenre.push("cinematic-story-clarity", "lighting-continuity");
    impactGenre.push("cinematic-story-architecture", "director-visual-language", "shot-progression");
  }
  if (has(text, ["풍경", "environment", "도시", "city", "시장", "market", "숲", "forest", "바다", "desert", "폐허", "ruin"])) {
    detected.push("environment");
    stableGenre.push("environment-scene-bible", "world-continuity");
    impactGenre.push("environment-motion", "palette-design", "scale-reveal");
  }

  if (!detected.length) detected.push("general-video");

  const hasReference = Boolean(media?.referenceImageUrl);
  const hasFrame = Boolean(media?.firstFrameUrl || media?.lastFrameUrl);

  const stablePrimary = unique([
    ...(hasReference ? ["world-asset-identity-lock", "reference-driven-video-prompting"] : ["subject-clarity"]),
    ...(hasFrame ? ["start-end-frame-continuity"] : []),
    "continuity-editing-axis-match",
    "lighting-continuity-design",
    "camera-restraint",
    ...stableGenre,
  ]).slice(0, 8);

  const impactPrimary = unique([
    "director-visual-language",
    "shot-size-and-angle-language",
    "camera-purpose-mapping",
    ...impactGenre,
  ]).filter((skill) => !stablePrimary.includes(skill)).slice(0, 8);

  const userPrimary = unique([
    "preserve-user-intent",
    ...(hasReference ? ["world-asset-identity-lock"] : []),
    "camera-grammar",
    "framing-enhancement",
    "lighting-source-rule",
  ]).slice(0, 7);

  return {
    detected,
    stable: {
      primary: stablePrimary,
      supporting: ["duration-feasibility", "director-check", "ending-readability"],
      avoid: ["camera-overload", "unnecessary-story-rewrite", "identity-drift", "decorative-motion"],
      directive: "Build the most controllable, continuity-safe version. Use the minimum camera complexity needed to communicate the user's idea clearly. Accuracy and repeatability outrank spectacle.",
    },
    cinematic: {
      primary: impactPrimary.length ? impactPrimary : ["director-visual-language", "shot-size-and-angle-language", "cinematic-story-architecture", "hero-ending"],
      supporting: ["hook-design", "environment-motion", "lighting-mood-design", "director-check"],
      avoid: ["same-camera-plan-as-option-a", "flat-opening", "weak-payoff", "random-camera-combination"],
      directive: "Re-direct the same core idea for substantially stronger visual impact. Change shot strategy, angle/lens logic, reveal timing and visual rhythm from Option A while preserving required identity/product facts.",
    },
    userBased: {
      primary: userPrimary,
      supporting: ["mobile-readability", "ending-framing", "motion-wording"],
      avoid: ["new-story-event", "character-rewrite", "product-fact-change", "world-fact-change"],
      directive: "Keep the user's story, event order and wording as intact as possible. Add production language only: camera, framing, lens, lighting, motion and ending composition.",
    },
  };
}
