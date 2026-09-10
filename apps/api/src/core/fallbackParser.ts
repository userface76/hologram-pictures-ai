import type { VideoIntent } from "./types.js";

export function fallbackParse(text: string): VideoIntent {
  const durationMatch = text.match(/(\d{1,2})\s*초/);
  const duration = Math.min(15, Math.max(4, durationMatch ? Number(durationMatch[1]) : 8));
  const aspectRatio = /세로|릴스|쇼츠|9\s*:\s*16/i.test(text) ? "9:16" : /정사각|1\s*:\s*1/i.test(text) ? "1:1" : "16:9";
  const style = /영화|시네마/i.test(text) ? "cinematic" : /광고/i.test(text) ? "commercial" : "natural";
  return {
    intent: "create_video",
    title: "새 영상 프로젝트",
    userRequest: text,
    refinedPrompt: text,
    model: "minimax-h3",
    duration,
    aspectRatio,
    resolution: "768p",
    audio: !/무음|소리 없이/.test(text),
    style,
    camera: [],
    scenes: [{ index: 1, seconds: duration, description: text }]
  };
}
