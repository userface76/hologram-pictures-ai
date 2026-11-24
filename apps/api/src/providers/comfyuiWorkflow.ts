import type { Graph } from "./comfyuiClient.js";
export interface WorkflowSpec {
  graph: Graph;
  promptNode: string;
  promptInput: string;
  outputNode: string;
  durationSeconds: number;
}
// Only an operator-approved API-format export may be passed here.
// No guessed model filenames, node IDs or unsupported controls.
export function prepareWorkflow(spec: WorkflowSpec, prompt: string, seconds: number, schema: Record<string, unknown>): Graph {
  if (!prompt.trim() || seconds !== spec.durationSeconds || seconds !== 5) throw new Error("Only the approved five-second test profile is supported");
  const graph = structuredClone(spec.graph);
  for (const node of Object.values(graph)) if (!Object.hasOwn(schema,node.class_type)) throw new Error("Workflow node unavailable: " + node.class_type);
  const node = graph[spec.promptNode];
  if (!node || typeof node.inputs[spec.promptInput] !== "string" || !graph[spec.outputNode]) throw new Error("Invalid workflow mapping");
  node.inputs[spec.promptInput] = prompt;
  return graph;
}
