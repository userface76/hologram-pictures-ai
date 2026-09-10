import OpenAI from "openai";
import { fallbackParse } from "./fallbackParser.js";
import type { VideoIntent } from "./types.js";

const systemPrompt = `You are HOLOGRAM CORE, the Korean AI film director for HOLOGRAM PICTURES AI.
Interpret the user's natural Korean/English production command and return ONLY valid JSON.
Schema: {intent,title,userRequest,refinedPrompt,negativePrompt,model,duration,aspectRatio,resolution,audio,style,camera,scenes}.
Rules: model defaults to minimax-h3; duration 4-15 seconds for a single H3 generation; aspectRatio defaults to 16:9; resolution defaults to 768p; scenes is an array of objects {index,seconds,description}. Keep userRequest verbatim. refinedPrompt should be concise, production-ready, and preserve user intent. Do not add copyrighted characters/brands unless the user supplied them.`;

function resolveOpenAIModel() {
  const configured = (process.env.OPENAI_MODEL || "").trim();
  if (!configured || configured === "gpt-6-astra") return "gpt-5.6-sol";
  return configured;
}

export async function interpretWithAstra(text: string): Promise<{ plan: VideoIntent; source: "astra" | "fallback" }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { plan: fallbackParse(text), source: "fallback" };

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: resolveOpenAIModel(),
      reasoning: { effort: "low" },
      input: `${systemPrompt}\n\nUSER COMMAND:\n${text}`
    });
    const raw = response.output_text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const parsed = JSON.parse(raw) as VideoIntent;
    return { plan: { ...fallbackParse(text), ...parsed, userRequest: text }, source: "astra" };
  } catch (error) {
    console.error("HOLOGRAM CORE OpenAI interpretation failed; falling back.", error);
    return { plan: fallbackParse(text), source: "fallback" };
  }
}
