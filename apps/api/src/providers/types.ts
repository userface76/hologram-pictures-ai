import type { RenderJob, VideoIntent } from "../core/types.js";

export interface VideoProvider {
  id: string;
  displayName: string;
  create(plan: VideoIntent): Promise<RenderJob>;
  status?(job: RenderJob): Promise<RenderJob>;
}
