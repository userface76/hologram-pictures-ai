import type { RenderJob } from "../core/types.js";

const jobs = new Map<string, RenderJob>();
export const jobStore = {
  set(job: RenderJob) { jobs.set(job.id, job); return job; },
  get(id: string) { return jobs.get(id); },
  list() { return [...jobs.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
};
