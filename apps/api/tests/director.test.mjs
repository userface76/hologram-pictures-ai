import test from "node:test";
import assert from "node:assert/strict";
import { generateDirectorRecommendationsV2 } from "../dist/core/holoDirectorV2.js";
import { sharedSkillContext, modelCapabilityNotes } from "../dist/core/sharedSkills.js";
import { getVideoProvider } from "../dist/services/modelRouter.js";

delete process.env.OPENAI_API_KEY;
delete process.env.HOLO_VIDEO_ENGINE;
const idea = "화장품 제품 광고 10초";
test("existing three options remain available", async () => {
  const result = await generateDirectorRecommendationsV2(idea);
  assert.deepEqual(result.candidates.map(c => c.id), ["stable", "cinematic", "user_based"]);
  assert.equal(result.candidates.filter(c => c.recommended).length, 1);
});
test("opt-in Astra returns fourth option with honest fallback label", async () => {
  const result = await generateDirectorRecommendationsV2(idea, undefined, true);
  assert.deepEqual(result.candidates.map(c => c.id), ["stable", "cinematic", "user_based", "astra"]);
  assert.match(result.candidates[3].label, /대체안/);
  assert.ok(result.candidates[3].prompt.trim());
  assert.equal(result.candidates.filter(c => c.recommended).length, 1);
});
test("shared routing and capability constraints", () => {
  assert.ok(sharedSkillContext(idea).routing.detected.includes("commercial-product"));
  assert.match(modelCapabilityNotes("minimax-h3"), /not both/);
  assert.throws(() => getVideoProvider("comfyui-unregistered"), /not registered/);
  assert.equal(getVideoProvider("minimax-h3").id, "minimax-h3");
});
