import type { RenderJob } from "../core/types.js";

const jobs = new Map<string, RenderJob>();

export const jobStore = {
  set(job: RenderJob) {
    jobs.set(job.id, job);
    return job;
  },
  get(id: string, userId?: string) {
    const job = jobs.get(id);
    if (!job) return undefined;
    if (userId && job.userId && job.userId !== userId) return undefined;
    return job;
  },
  list(userId?: string) {
    return [...jobs.values()]
      .filter((job) => !userId || job.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
