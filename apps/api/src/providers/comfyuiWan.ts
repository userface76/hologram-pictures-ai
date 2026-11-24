import { randomUUID } from "node:crypto";
import type { VideoProvider } from "./types.js";
import { ComfyClient } from "./comfyuiClient.js";
import { prepareWorkflow, type WorkflowSpec } from "./comfyuiWorkflow.js";
import { isR2Configured } from "../services/r2Storage.js";
export function comfyConfigured() {
  return process.env.COMFYUI_LIVE_VERIFIED === "true" && Boolean(process.env.COMFYUI_BASE_URL && process.env.COMFYUI_AUTHORIZATION && process.env.COMFYUI_WORKFLOW_JSON && process.env.R2_PUBLIC_BASE_URL) && isR2Configured();
}
function config() {
  if (!comfyConfigured()) throw new Error("ComfyUI workflow is not registered or validated for live use");
  return {client:new ComfyClient(process.env.COMFYUI_BASE_URL!,process.env.COMFYUI_AUTHORIZATION!),spec:JSON.parse(process.env.COMFYUI_WORKFLOW_JSON!) as WorkflowSpec};
}
export const comfyuiWanProvider: VideoProvider = {
  id:"comfyui-wan22", displayName:"ComfyUI Wan 2.2 (experimental)",
  async create(plan) {
    const {client,spec}=config();
    if (plan.firstFrameImageUrl || plan.lastFrameImageUrl || plan.referenceImageUrl || plan.sourceImageUrl || plan.audio) throw new Error("ComfyUI test profile supports silent text-only video");
    const graph=prepareWorkflow(spec,plan.refinedPrompt,plan.duration,await client.schema());
    const providerTaskId=await client.submit(graph);
    return {id:randomUUID(),provider:"comfyui",model:"comfyui-wan22",status:"queued",progress:10,createdAt:new Date().toISOString(),prompt:plan.refinedPrompt,providerTaskId};
  },
  async status(job) {
    const {client,spec}=config();
    if (!job.providerTaskId) return job;
    const history=await client.history(job.providerTaskId);
    const entry=history[job.providerTaskId];
    if (!entry) return {...job,status:"processing",progress:Math.max(job.progress,20)};
    if (entry.status?.status_str==="error") return {...job,status:"failed",error:"ComfyUI execution failed"};
    if (!entry.status?.completed) return {...job,status:"processing",progress:Math.max(job.progress,50)};
    const output=entry.outputs?.[spec.outputNode];
    const files=[...(output?.videos || []),...(output?.gifs || []),...(output?.images || [])];
    const file=files.find((f:any)=>f.type==="output" && typeof f.filename==="string" && /\.mp4$/i.test(f.filename));
    if (!file) return {...job,status:"failed",error:"Approved output node returned no MP4"};
    if (!job.userId) throw new Error("Job owner required for archive");
    const {archiveComfyResponse}=await import("../services/r2Storage.js");
    const archived=await archiveComfyResponse(job.userId,job.id,await client.download(file));
    return {...job,status:"completed",progress:100,storageUrl:archived.url,outputUrl:archived.url,updatedAt:new Date().toISOString()};
  }
};
