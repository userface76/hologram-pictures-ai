export type ImageRole = "first_frame" | "last_frame" | "reference_image";

export type VideoMediaInputs = {
  firstFrameUrl?: string;
  referenceImageUrl?: string;
  lastFrameUrl?: string;
};

export type VideoIntent = {
  intent: "create_video" | "revise_video" | "show_library" | "general";
  title: string;
  userRequest: string;
  refinedPrompt: string;
  negativePrompt?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  audio: boolean;
  style?: string;
  camera?: string[];
  firstFrameImageUrl?: string;
  referenceImageUrl?: string;
  lastFrameImageUrl?: string;
  /** Legacy single-image fields kept for backward compatibility. */
  sourceImageUrl?: string;
  sourceImageRole?: ImageRole;
  scenes: Array<{ index: number; seconds?: number; description: string }>;
};

export type RenderJob = {
  id: string;
  userId?: string;
  projectId?: string;
  provider: string;
  model: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  updatedAt?: string;
  prompt: string;
  outputUrl?: string;
  sourceUrl?: string;
  storageUrl?: string;
  providerTaskId?: string;
  error?: string;
};
